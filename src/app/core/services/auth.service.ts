import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';

import {
  CaptchaResponse,
  ChangePasswordRequest,
  ForgotPasswordResponse,
  LoginRequest,
  ProfileUpdateRequest,
  RegisterRequest,
  TokenResponse,
  User,
  VerifyOtpResponse
} from '../models/auth.model';
import { ApiService } from './api.service';
import { TokenService } from './token.service';

/**
 * Owns the authenticated user's session: login/logout, the current user
 * signal, and password-change/reset flows. Token attachment and automatic
 * refresh-on-401 live in `auth.interceptor.ts`.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = inject(ApiService);
  private readonly tokenService = inject(TokenService);

  private readonly currentUserSignal = signal<User | null>(null);

  readonly currentUser = this.currentUserSignal.asReadonly();
  readonly isAuthenticated = computed(() => !!this.tokenService.accessToken());
  readonly isSuperAdmin = computed(() => this.currentUserSignal()?.role === 'super_admin');
  readonly isAdmin = computed(() => {
    const role = this.currentUserSignal()?.role;
    return role === 'admin' || role === 'super_admin';
  });

  /** A fresh captcha challenge — call this once on page load and again after any failed login. */
  getCaptcha(): Observable<CaptchaResponse> {
    return this.api.get<CaptchaResponse>('/auth/captcha');
  }

  login(payload: LoginRequest): Observable<TokenResponse> {
    return this.api.post<TokenResponse>('/auth/login', payload).pipe(
      tap((tokens) => this.tokenService.setTokens(tokens.access_token, tokens.refresh_token))
    );
  }

  /** Admin-only signup — creates an admin-role account and logs it in immediately. */
  registerAdmin(payload: RegisterRequest): Observable<TokenResponse> {
    return this.api.post<TokenResponse>('/auth/register-admin', payload).pipe(
      tap((tokens) => this.tokenService.setTokens(tokens.access_token, tokens.refresh_token))
    );
  }

  loadCurrentUser(): Observable<User> {
    return this.api.get<User>('/auth/me').pipe(tap((user) => this.currentUserSignal.set(user)));
  }

  changePassword(payload: ChangePasswordRequest): Observable<void> {
    return this.api.post<void>('/auth/change-password', payload);
  }

  updateProfile(payload: ProfileUpdateRequest): Observable<User> {
    return this.api.patch<User>('/auth/me', payload).pipe(tap((user) => this.currentUserSignal.set(user)));
  }

  /** Step 1 of the OTP forgot-password flow — emails a 6-digit code (Gmail SMTP on the backend). */
  forgotPassword(email: string): Observable<ForgotPasswordResponse> {
    return this.api.post<ForgotPasswordResponse>('/auth/forgot-password', { email });
  }

  /** Step 2 — verifies the OTP and returns a short-lived `reset_token` for step 3. */
  verifyOtp(email: string, otp: string): Observable<VerifyOtpResponse> {
    return this.api.post<VerifyOtpResponse>('/auth/verify-otp', { email, otp });
  }

  /** Step 3 — sets the new password using the `reset_token` from `verifyOtp`. */
  resetPasswordWithOtp(email: string, resetToken: string, newPassword: string): Observable<void> {
    return this.api.post<void>('/auth/reset-password', {
      email,
      reset_token: resetToken,
      new_password: newPassword
    });
  }

  logout(): void {
    const refreshToken = this.tokenService.refreshToken();
    this.tokenService.clear();
    this.currentUserSignal.set(null);
    if (refreshToken) {
      // Best-effort server-side revocation; local session is already cleared.
      this.api.post<void>('/auth/logout', { refresh_token: refreshToken }).subscribe({ error: () => void 0 });
    }
  }

  /** Called by the auth interceptor once a token refresh succeeds mid-request. */
  clearLocalSessionOnly(): void {
    this.tokenService.clear();
    this.currentUserSignal.set(null);
  }
}
