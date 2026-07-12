export type UserRole = 'super_admin' | 'admin' | 'customer';

export interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  avatar_url: string | null;
  role: UserRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProfileUpdateRequest {
  first_name?: string;
  last_name?: string;
  phone?: string | null;
  avatar_url?: string | null;
}

export interface LoginRequest {
  email: string;
  password: string;
  captcha_id: string;
  captcha_text: string;
}

export interface CaptchaResponse {
  captcha_id: string;
  /** Raw SVG markup — render via an <img src="data:image/svg+xml..."> to avoid HTML sanitization concerns. */
  svg: string;
  expires_in_minutes: number;
}

export interface RegisterRequest {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string | null;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface RefreshRequest {
  refresh_token: string;
}

export interface LogoutRequest {
  refresh_token: string;
}

export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ForgotPasswordResponse {
  message: string;
  expires_in_minutes: number;
  /** Only present when the backend's OTP_DEBUG_MODE is on — never rely on this in production. */
  otp: string | null;
}

export interface VerifyOtpRequest {
  email: string;
  otp: string;
}

export interface VerifyOtpResponse {
  reset_token: string;
  expires_in_minutes: number;
}

export interface ResetPasswordWithOtpRequest {
  email: string;
  reset_token: string;
  new_password: string;
}

/** Decoded JWT access-token payload (client-side, informational only). */
export interface AccessTokenClaims {
  sub: string;
  role: UserRole;
  type: 'access';
  iat: number;
  exp: number;
  jti: string;
}
