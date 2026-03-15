import { Request, Response } from 'express';
import { UserDocument } from '../user/user.model';
import VendorAuthService from './vendor.auth.service';
import asyncHandler from '../../utils/asyncHandler';
import {
    VendorCheckAreaRequest,
    VendorWaitlistRequest,
    VendorRegisterRequest,
    NafdacSealRequest,
    NafdacPaymentVerifyRequest,
    NafdacUploadRequest
} from './auth.request';
import FileService from '../file/file.service';

class VendorAuthController {
    static checkArea = asyncHandler(
        async (req: Request<{}, {}, VendorCheckAreaRequest>, res: Response) => {
            const { state, brand_address } = req.body;
            const result = await VendorAuthService.checkAreaAvailability(state, brand_address);

            res.status(200).json({ success: true, ...result });
        }
    );

    static joinWaitlist = asyncHandler(
        async (req: Request<{}, {}, VendorWaitlistRequest>, res: Response) => {
            const { email, phone_number, state, brand_address } = req.body;
            const result = await VendorAuthService.joinWaitlist(
                email, phone_number, state, brand_address
            );

            res.status(201).json({ success: true, ...result });
        }
    );

    static initiateVerification = asyncHandler(
        async (req: Request<{}, {}, { email: string }>, res: Response) => {
            const { email } = req.body;
            const result = await VendorAuthService.initiateVerification(email);

            res.status(200).json({ success: true, ...result });
        }
    );

    static verifyOtp = asyncHandler(
        async (req: Request<{}, {}, { email: string; otp: string }>, res: Response) => {
            const { email, otp } = req.body;
            const result = await VendorAuthService.verifyOtp(email, otp);

            res.status(200).json({ success: true, ...result });
        }
    );

    static register = asyncHandler(
        async (req: Request<{}, {}, VendorRegisterRequest>, res: Response) => {
            const {
                verification_token, first_name, last_name,
                phone_number, password, brand_name,
                brand_description, state, brand_address
            } = req.body;

            // Handle optional file uploads: brand_logo, brand_cover
            const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
            let brand_logo_url: string | undefined;
            let brand_cover_url: string | undefined;

            if (files) {
                if (files['brand_logo']?.[0]) {
                    const file = files['brand_logo'][0];
                    brand_logo_url = file.path;
                    await FileService.saveFileMetadata(file, {
                        folder: 'vendor-logos',
                        associatedModel: 'VendorProfile'
                    });
                }
                if (files['brand_cover']?.[0]) {
                    const file = files['brand_cover'][0];
                    brand_cover_url = file.path;
                    await FileService.saveFileMetadata(file, {
                        folder: 'vendor-covers',
                        associatedModel: 'VendorProfile'
                    });
                }
            }

            const { user, token, vendor_profile } = await VendorAuthService.completeRegistration(
                verification_token, first_name, last_name,
                phone_number, password, brand_name,
                brand_description, state, brand_address,
                brand_logo_url, brand_cover_url
            );

            res.status(201).json({
                message: 'Vendor registration completed successfully.',
                success: true,
                token,
                user: {
                    _id: user._id,
                    first_name: user.first_name,
                    last_name: user.last_name,
                    email: user.email,
                    phone_number: user.phone_number,
                    role: user.role,
                    service_type: user.service_type,
                    verified: user.verified
                },
                vendor_profile
            });
        }
    );

    static requestNafdacSeal = asyncHandler(
        async (req: Request<{}, {}, NafdacSealRequest>, res: Response) => {
            const user = req.user as unknown as UserDocument;
            const { brand_name, business_email, brand_address, brand_phone } = req.body;

            const result = await VendorAuthService.requestNafdacSeal(
                user._id.toString(),
                brand_name, business_email, brand_address, brand_phone
            );

            res.status(200).json({ success: true, ...result });
        }
    );

    static verifyNafdacPayment = asyncHandler(
        async (req: Request<{}, {}, NafdacPaymentVerifyRequest>, res: Response) => {
            const user = req.user as unknown as UserDocument;
            const { payment_reference } = req.body;

            const result = await VendorAuthService.verifyNafdacPayment(
                user._id.toString(), payment_reference
            );

            res.status(200).json({ success: true, ...result });
        }
    );

    static uploadNafdacSeal = asyncHandler(
        async (req: Request<{}, {}, NafdacUploadRequest>, res: Response) => {
            const user = req.user as unknown as UserDocument;
            const { brand_name, brand_email, brand_address } = req.body;

            const file = req.file;
            if (!file) {
                res.status(400).json({ success: false, message: 'NAFDAC seal file is required.' });
                return;
            }

            // Save file metadata
            await FileService.saveFileMetadata(file, {
                uploadedBy: user._id.toString(),
                folder: 'nafdac-seals',
                associatedModel: 'VendorProfile',
            });

            const result = await VendorAuthService.uploadNafdacSeal(
                user._id.toString(),
                brand_name, brand_email, brand_address, file.path
            );

            res.status(200).json({ success: true, ...result });
        }
    );
}

export default VendorAuthController;
