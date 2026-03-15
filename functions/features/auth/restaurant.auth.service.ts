import User, { Role, ServiceType, UserDocument } from '../user/user.model';
import RestaurantApplication, {
    RestaurantApplicationStatus,
    RestaurantApplicationDocument,
    OperatingHours
} from './restaurant_application.model';
import EmailService from '../mail/email.service';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import speakeasy from 'speakeasy';
import CustomError from '../../utils/customError';

class RestaurantAuthService {
    /**
     * Initiate luxury restaurant email verification (sends 4-digit OTP)
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
                role: Role.LuxuryRestaurant,
                service_type: ServiceType.LuxuryRestaurant,
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
     * Verify restaurant OTP and return verification token
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
                purpose: 'restaurant_registration',
                userId: user._id.toString()
            },
            process.env.TOKEN_SECRET_KEY!,
            { expiresIn: '30m' }
        );

        return {
            verification_token,
            message: 'Email verified. You can now complete your restaurant registration.'
        };
    }

    /**
     * Resend OTP for restaurant verification
     */
    static async resendOtp(email: string): Promise<{ message: string }> {
        const user = await User.findOne({ email });
        if (!user) {
            throw new CustomError('No user found with this email. Please start verification first.', 404);
        }
        if (user.verified) {
            throw new CustomError('Email is already verified.', 400);
        }

        const otp_secret = user.otp_secret || speakeasy.generateSecret().base32;
        const otp = speakeasy.totp({ secret: otp_secret, digits: 4 });
        const otp_expires = new Date(Date.now() + 10 * 60 * 1000);

        user.otp = otp;
        user.otp_secret = otp_secret;
        user.otp_expires = otp_expires;
        await user.save();

        await EmailService.sendVerificationEmail(email, otp);

        return { message: 'Verification code resent to your email.' };
    }

    /**
     * Complete luxury restaurant registration - submitted for review
     */
    static async completeRegistration(params: {
        verification_token: string;
        first_name: string;
        last_name: string;
        phone_number: string;
        password: string;
        brand_name: string;
        brand_category: string;
        brand_address: string;
        operating_hours: OperatingHours[];
        delivery_type: 'pickup' | 'delivery' | 'both';
        brand_registration_number: string;
        brand_logo_url?: string;
        cover_image_url?: string;
        cac_certificate_url?: string;
    }): Promise<{ user: UserDocument; token: string; application: RestaurantApplicationDocument }> {
        let decoded: any;
        try {
            decoded = jwt.verify(params.verification_token, process.env.TOKEN_SECRET_KEY!);
        } catch {
            throw new CustomError('Invalid or expired verification token.', 400);
        }

        if (!decoded.verified || !decoded.email || decoded.purpose !== 'restaurant_registration') {
            throw new CustomError('Invalid verification token.', 400);
        }

        const { email, userId } = decoded;
        const user = await User.findOne({ _id: userId, email, verified: false });
        if (!user) {
            throw new CustomError('User not found or already verified.', 400);
        }

        // Check for existing application
        const existingApp = await RestaurantApplication.findOne({ user: userId });
        if (existingApp) {
            throw new CustomError('A restaurant application already exists for this user.', 400);
        }

        const hashedPassword = await bcrypt.hash(params.password, 10);

        user.first_name = params.first_name;
        user.last_name = params.last_name;
        user.phone_number = params.phone_number;
        user.password = hashedPassword;
        user.role = Role.LuxuryRestaurant;
        user.service_type = ServiceType.LuxuryRestaurant;
        user.verified = true;
        user.otp = undefined;
        user.otp_secret = undefined;
        user.otp_expires = undefined;
        await user.save();

        const application = await RestaurantApplication.create({
            user: user._id,
            brand_name: params.brand_name,
            brand_category: params.brand_category,
            brand_address: params.brand_address,
            operating_hours: params.operating_hours,
            delivery_type: params.delivery_type,
            brand_logo: params.brand_logo_url,
            cover_image: params.cover_image_url,
            brand_registration_number: params.brand_registration_number,
            cac_certificate: params.cac_certificate_url,
            status: RestaurantApplicationStatus.PendingReview
        });

        const token = jwt.sign({ id: user._id }, process.env.TOKEN_SECRET_KEY!, {
            expiresIn: '360h'
        });

        return { user, token, application };
    }
}

export default RestaurantAuthService;
