import { Request, Response } from 'express';
import RestaurantAuthService from './restaurant.auth.service';
import asyncHandler from '../../utils/asyncHandler';
import { RestaurantRegisterRequest } from './auth.request';
import FileService from '../file/file.service';

class RestaurantAuthController {
    static initiateVerification = asyncHandler(
        async (req: Request<{}, {}, { email: string }>, res: Response) => {
            const { email } = req.body;
            const result = await RestaurantAuthService.initiateVerification(email);

            res.status(200).json({ success: true, ...result });
        }
    );

    static verifyOtp = asyncHandler(
        async (req: Request<{}, {}, { email: string; otp: string }>, res: Response) => {
            const { email, otp } = req.body;
            const result = await RestaurantAuthService.verifyOtp(email, otp);

            res.status(200).json({ success: true, ...result });
        }
    );

    static resendOtp = asyncHandler(
        async (req: Request<{}, {}, { email: string }>, res: Response) => {
            const { email } = req.body;
            const result = await RestaurantAuthService.resendOtp(email);

            res.status(200).json({ success: true, ...result });
        }
    );

    static register = asyncHandler(
        async (req: Request, res: Response) => {
            const {
                verification_token, first_name, last_name,
                phone_number, password, brand_name,
                brand_category, brand_address, operating_hours,
                delivery_type, brand_registration_number
            } = req.body as RestaurantRegisterRequest;

            // Handle file uploads (brand_logo, cover_image, cac_certificate)
            const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
            let brand_logo_url: string | undefined;
            let cover_image_url: string | undefined;
            let cac_certificate_url: string | undefined;

            if (files) {
                if (files['brand_logo']?.[0]) {
                    const file = files['brand_logo'][0];
                    brand_logo_url = file.path;
                    await FileService.saveFileMetadata(file, {
                        folder: 'restaurant-logos',
                        associatedModel: 'RestaurantApplication'
                    });
                }
                if (files['cover_image']?.[0]) {
                    const file = files['cover_image'][0];
                    cover_image_url = file.path;
                    await FileService.saveFileMetadata(file, {
                        folder: 'restaurant-covers',
                        associatedModel: 'RestaurantApplication'
                    });
                }
                if (files['cac_certificate']?.[0]) {
                    const file = files['cac_certificate'][0];
                    cac_certificate_url = file.path;
                    await FileService.saveFileMetadata(file, {
                        folder: 'cac-certificates',
                        associatedModel: 'RestaurantApplication'
                    });
                }
            }

            // Parse operating_hours if sent as JSON string
            let parsedOperatingHours = operating_hours;
            if (typeof operating_hours === 'string') {
                parsedOperatingHours = JSON.parse(operating_hours);
            }

            const { user, token, application } = await RestaurantAuthService.completeRegistration({
                verification_token,
                first_name,
                last_name,
                phone_number,
                password,
                brand_name,
                brand_category,
                brand_address,
                operating_hours: parsedOperatingHours,
                delivery_type,
                brand_registration_number,
                brand_logo_url,
                cover_image_url,
                cac_certificate_url
            });

            res.status(201).json({
                message: 'Restaurant registration submitted for review.',
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
                application: {
                    _id: application._id,
                    brand_name: application.brand_name,
                    brand_category: application.brand_category,
                    brand_address: application.brand_address,
                    operating_hours: application.operating_hours,
                    delivery_type: application.delivery_type,
                    brand_logo: application.brand_logo,
                    cover_image: application.cover_image,
                    brand_registration_number: application.brand_registration_number,
                    cac_certificate: application.cac_certificate,
                    status: application.status
                }
            });
        }
    );
}

export default RestaurantAuthController;
