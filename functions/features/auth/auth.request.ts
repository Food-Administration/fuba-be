import { Role } from "../user/user.model";

export interface SignupRequest {
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  password: string;
  role: Role;
}

export  interface LoginRequest {
  email: string;
  password: string;
}

export  interface GoogleAuthRequest {
  idToken: string;
}

export  interface OTPRequest {
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