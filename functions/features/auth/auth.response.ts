export interface SignupResponse {
  message: string;
  success: boolean;
  userId: string;
  email: string;
}

export interface LoginResponse {
  token: string;
  userId: string;
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
}