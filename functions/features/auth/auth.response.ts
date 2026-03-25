import { UserDocument } from "../user/user.model";
import { VendorProfileDocument } from "../vendor/vendor.model";
import { RestaurantApplicationDocument } from "./restaurant_application.model";

export interface SignupResponse {
  message: string;
  success: boolean;
  userId?: string;
  email?: string;
  otp?: string;
  otpExpires?: Date;
}

export interface LoginResponse {
  error: boolean;
  message: string;
  data: {
    token: string;
    userId: string;
    user: Omit<UserDocument, 'password' | 'otp'>;
  };
  responseCode: number;
}

export interface GoogleAuthResponse {
  token: string;
  user: any;
}

export interface OTPResponse {
  otp: string;
  message: string;
}

export interface MessageResponse {
  message: string;
  success?: boolean;
  token?: string;
  user?: Omit<UserDocument, 'password' | 'otp'>;
}

export interface VendorCheckAreaResponse {
  available: boolean;
  message: string;
}

export interface VendorRegisterResponse {
  message: string;
  success: boolean;
  token: string;
  user: Omit<UserDocument, 'password' | 'otp'>;
  vendor_profile: VendorProfileDocument;
}

export interface NafdacRequestResponse {
  message: string;
  success: boolean;
  payment_url?: string;
  payment_reference?: string;
}

export interface RestaurantRegisterResponse {
  message: string;
  success: boolean;
  token: string;
  user: Omit<UserDocument, 'password' | 'otp'>;
  application: RestaurantApplicationDocument;
}