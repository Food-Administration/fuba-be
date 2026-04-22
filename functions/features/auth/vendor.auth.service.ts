import User, { Role, ServiceType, UserDocument } from '../user/user.model';
import VendorProfile, { NafdacStatus, VendorOperatingHours, VendorProfileDocument } from '../vendor/vendor.model';
import Waitlist from './waitlist.model';
import EmailService from '../mail/email.service';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import speakeasy from 'speakeasy';
import CustomError from '../../utils/customError';

// States where Fuba is currently available
const AVAILABLE_STATES = [
    'lagos',
    'abuja',
    'rivers',
    'oyo'
];

class VendorAuthService {
    /**
     * Check if Fuba is available in the vendor's area
     */
    static async checkAreaAvailability(
        state: string,
        brand_address: string
    ): Promise<{ available: boolean; message: string }> {
        const normalizedState = state.trim().toLowerCase();
        const available = AVAILABLE_STATES.includes(normalizedState);

        return {
            available,
            message: available
                ? 'Fuba is available in your area! You can proceed with registration.'
                : 'Fuba is not yet available in your area. Join the waitlist to be notified.'
        };
    }

    /**
     * Add vendor to area waitlist for future notification
     */
    static async joinWaitlist(
        email: string,
        phone_number: string | undefined,
        state: string,
        brand_address?: string
    ): Promise<{ message: string }> {
        const existing = await Waitlist.findOne({
            email,
            service_type: ServiceType.FoodVendor
        });

        if (existing) {
            throw new CustomError('You are already on the waitlist for this service.', 400);
        }

        await Waitlist.create({
            email,
            phone_number,
            service_type: ServiceType.FoodVendor,
            state,
            brand_address
        });

        return {
            message: 'You have been added to the waitlist. We will notify you when Fuba is available in your area.'
        };
    }

    /**
     * Initiate vendor email verification (sends 4-digit OTP)
     */
    static async initiateVerification(email: string): Promise<{ message: string }> {
        const existingUser = await User.findOne({ email });
        if (existingUser && existingUser.verified) {
            throw new CustomError('An account already exists with this email.', 400);
        }

        const otp_secret = speakeasy.generateSecret().base32;
        const otp = speakeasy.totp({ secret: otp_secret, digits: 4 });
        const otp_expires = new Date(Date.now() + 10 * 60 * 1000);

        if (existingUser) {
            existingUser.otp = otp;
            existingUser.otp_secret = otp_secret;
            existingUser.otp_expires = otp_expires;
            existingUser.verified = false;
            await existingUser.save();
        } else {
            const tempPassword = await bcrypt.hash(
                require('crypto').randomBytes(16).toString('hex'),
                10
            );
            await User.create({
                email,
                otp,
                otp_secret,
                otp_expires,
                verified: false,
                role: Role.Vendor,
                service_type: ServiceType.FoodVendor,
                first_name: 'Pending',
                last_name: 'Verification',
                phone_number: 'pending',
                password: tempPassword
            });
        }

        await EmailService.sendVerificationEmail(email, otp);

        return {
            message: 'Verification code sent to your email. Please verify to continue registration.'
        };
    }

    /**
     * Verify vendor OTP and return verification token
     */
    static async verifyOtp(
        email: string,
        otp: string
    ): Promise<{ verification_token: string; message: string }> {
        const user = await User.findOne({ email });
        if (!user) {
            throw new CustomError('No verification session found. Please start again.', 400);
        }
        if (user.verified) {
            throw new CustomError('Email is already verified.', 400);
        }
        if (!user.otp || !user.otp_expires) {
            throw new CustomError('No OTP found. Please request a new one.', 400);
        }
        if (user.otp_expires < new Date()) {
            throw new CustomError('OTP has expired. Please request a new one.', 400);
        }
        if (user.otp !== otp) {
            throw new CustomError('Invalid OTP.', 400);
        }

        const verification_token = jwt.sign(
            {
                email,
                verified: true,
                purpose: 'vendor_registration',
                userId: user._id.toString()
            },
            process.env.TOKEN_SECRET_KEY!,
            { expiresIn: '30m' }
        );

        return {
            verification_token,
            message: 'Email verified. You can now complete your vendor registration.'
        };
    }

    /**
     * Complete vendor registration after email verification
     */
    static async completeRegistration(
        verification_token: string,
        first_name: string,
        last_name: string,
        phone_number: string,
        password: string,
        brand_name: string,
        brand_category?: string,
        brand_description?: string,
        state?: string,
        brand_address?: string,
        brand_logo_url?: string,
        brand_cover_url?: string,
        operating_hours?: VendorOperatingHours[],
        delivery_type?: 'pickup' | 'delivery' | 'both',
        brand_registration_number?: string,
        cac_certificate_url?: string
    ): Promise<{ user: UserDocument; token: string; vendor_profile: VendorProfileDocument }> {
        let decoded: any;
        try {
            decoded = jwt.verify(verification_token, process.env.TOKEN_SECRET_KEY!);
        } catch {
            throw new CustomError('Invalid or expired verification token.', 400);
        }

        if (!decoded.verified || !decoded.email || decoded.purpose !== 'vendor_registration') {
            throw new CustomError('Invalid verification token.', 400);
        }

        const { email, userId } = decoded;
        const user = await User.findOne({ _id: userId, email, verified: false });
        if (!user) {
            throw new CustomError('User not found or already verified.', 400, 'USER_NOT_FOUND');
        }

        // Check for duplicate phone number among verified users
        const existingPhone = await User.findOne({ phone_number, verified: true, _id: { $ne: userId } });
        if (existingPhone) {
            throw new CustomError('A verified account already exists with this phone number.', 409, 'DUPLICATE_PHONE_NUMBER');
        }

        // Check for duplicate brand name
        const existingBrand = await VendorProfile.findOne({ brand_name });
        if (existingBrand) {
            throw new CustomError('A vendor with this brand name already exists.', 409, 'DUPLICATE_BRAND_NAME');
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        user.first_name = first_name;
        user.last_name = last_name;
        user.phone_number = phone_number;
        user.password = hashedPassword;
        user.role = Role.Vendor;
        user.service_type = ServiceType.FoodVendor;
        user.verified = true;
        user.otp = undefined;
        user.otp_secret = undefined;
        user.otp_expires = undefined;
        await user.save();

        const vendor_profile = await VendorProfile.create({
            user: user._id,
            brand_name,
            brand_category,
            brand_description,
            state,
            brand_address,
            business_email: email,
            brand_image: brand_logo_url,
            brand_cover_image: brand_cover_url,
            operating_hours,
            delivery_type,
            brand_registration_number,
            cac_certificate: cac_certificate_url
        });

        const token = jwt.sign({ id: user._id }, process.env.TOKEN_SECRET_KEY!, {
            expiresIn: process.env.TOKEN_EXPIRY
        });

        return { user, token, vendor_profile };
    }

    /**
     * Request NAFDAC seal - creates payment intent via Paystack
     */
    static async requestNafdacSeal(
        userId: string,
        brand_name: string,
        business_email: string,
        brand_address: string,
        brand_phone: string
    ): Promise<{ message: string; payment_url?: string; payment_reference?: string }> {
        const vendor = await VendorProfile.findOne({ user: userId });
        if (!vendor) {
            throw new CustomError('Vendor profile not found.', 404);
        }

        vendor.nafdac_brand_name = brand_name;
        vendor.nafdac_business_email = business_email;
        vendor.nafdac_brand_address = brand_address;
        vendor.nafdac_brand_phone = brand_phone;
        vendor.nafdac_status = NafdacStatus.Pending;

        // Initialize Paystack payment
        const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY;
        if (!paystackSecretKey) {
            throw new CustomError('Payment service not configured.', 500);
        }

        const reference = `nafdac_${userId}_${Date.now()}`;
        const amount = 5000 * 100; // Amount in kobo (₦5,000)

        const response = await fetch('https://api.paystack.co/transaction/initialize', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${paystackSecretKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: business_email,
                amount,
                reference,
                callback_url: process.env.PAYSTACK_CALLBACK_URL || 'http://localhost:3000/payment/callback',
                metadata: {
                    purpose: 'nafdac_seal',
                    vendor_id: vendor._id.toString(),
                    user_id: userId
                }
            })
        });

        const data = await response.json() as any;
        if (!data.status) {
            throw new CustomError('Failed to initialize payment.', 500);
        }

        vendor.nafdac_payment_reference = reference;
        await vendor.save();

        return {
            message: 'NAFDAC seal payment initialized.',
            payment_url: data.data.authorization_url,
            payment_reference: reference
        };
    }

    /**
     * Verify NAFDAC seal payment
     */
    static async verifyNafdacPayment(
        userId: string,
        payment_reference: string
    ): Promise<{ message: string; verified: boolean }> {
        const vendor = await VendorProfile.findOne({ user: userId });
        if (!vendor) {
            throw new CustomError('Vendor profile not found.', 404);
        }

        if (vendor.nafdac_payment_reference !== payment_reference) {
            throw new CustomError('Invalid payment reference.', 400);
        }

        const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY;
        if (!paystackSecretKey) {
            throw new CustomError('Payment service not configured.', 500);
        }

        const response = await fetch(
            `https://api.paystack.co/transaction/verify/${encodeURIComponent(payment_reference)}`,
            {
                headers: { 'Authorization': `Bearer ${paystackSecretKey}` }
            }
        );

        const data = await response.json() as any;
        if (!data.status || data.data.status !== 'success') {
            return { message: 'Payment not yet verified.', verified: false };
        }

        vendor.nafdac_status = NafdacStatus.Paid;
        await vendor.save();

        return { message: 'Payment verified successfully.', verified: true };
    }

    /**
     * Upload NAFDAC seal document after payment
     */
    static async uploadNafdacSeal(
        userId: string,
        brand_name: string,
        brand_email: string,
        brand_address: string,
        seal_file_url: string
    ): Promise<{ message: string; vendor_profile: VendorProfileDocument }> {
        const vendor = await VendorProfile.findOne({ user: userId });
        if (!vendor) {
            throw new CustomError('Vendor profile not found.', 404);
        }

        if (vendor.nafdac_status !== NafdacStatus.Paid) {
            throw new CustomError(
                'NAFDAC seal payment must be completed before uploading.',
                400
            );
        }

        vendor.nafdac_brand_name = brand_name;
        vendor.nafdac_business_email = brand_email;
        vendor.nafdac_brand_address = brand_address;
        vendor.nafdac_seal_file = seal_file_url;
        vendor.nafdac_status = NafdacStatus.Uploaded;
        await vendor.save();

        return {
            message: 'NAFDAC seal uploaded successfully and is pending review.',
            vendor_profile: vendor
        };
    }
}

export default VendorAuthService;
