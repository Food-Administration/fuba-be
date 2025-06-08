import { UserDocument } from "../user/user.model";

export interface SignupResponse {
  message: string;
  success: boolean;
  userId?: string;
  email?: string;
  otp?: string;
  otpExpires?: Date;
}

export interface LoginResponse {
  token: string;
  userId: string;
  user: Omit<UserDocument, 'password' | 'otp'>;
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