import { Role } from "../user/user.model";
import { OperatingHours } from "./restaurant_application.model";

export interface SignupRequest {
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  password: string;
  role: Role;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface GoogleAuthRequest {
  idToken: string;
}

export interface OTPRequest {
  email: string;
}

export interface VerifyOTPRequest {
  email: string;
  otp: string;
}

export interface NewPasswordRequest {
  email: string;
  new_password: string;
  confirm_password: string;
  otp: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface ResendVerificationEmailRequest {
  email: string;
}

// --- Vendor Auth Requests ---

export interface VendorCheckAreaRequest {
  state: string;
  brand_address: string;
}

export interface VendorWaitlistRequest {
  email: string;
  phone_number?: string;
  state: string;
  brand_address?: string;
}

export interface VendorRegisterRequest {
  verification_token: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  password: string;
  brand_name: string;
  brand_description?: string;
  state?: string;
  brand_address?: string;
}

export interface NafdacSealRequest {
  brand_name: string;
  business_email: string;
  brand_address: string;
  brand_phone: string;
}

export interface NafdacPaymentVerifyRequest {
  payment_reference: string;
}

export interface NafdacUploadRequest {
  brand_name: string;
  brand_email: string;
  brand_address: string;
}

// --- Restaurant Auth Requests ---

export interface RestaurantRegisterRequest {
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
}