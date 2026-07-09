import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';

import {
  ChangePasswordRequest,
  LoginRequest,
  ProfileUpdateRequest,
  TokenResponse,
  User
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
  readonly isAdmin = computed(() => this.currentUserSignal()?.role === 'admin');

  login(payload: LoginRequest): Observable<TokenResponse> {
    return this.api.post<TokenResponse>('/auth/login', payload).pipe(
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

  /**
   * Requests a password-reset email.
   *
   * NOTE: the FastAPI backend does not yet implement `POST /auth/forgot-password`
   * or `POST /auth/reset-password` — only register/login/refresh/logout/me/change-password
   * exist today. This call is wired up per the UI spec and will 404 until those
   * two endpoints are added to the backend.
   */
  forgotPassword(email: string): Observable<void> {
    return this.api.post<void>('/auth/forgot-password', { email });
  }

  resetPassword(token: string, newPassword: string): Observable<void> {
    return this.api.post<void>('/auth/reset-password', { token, new_password: newPassword });
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
