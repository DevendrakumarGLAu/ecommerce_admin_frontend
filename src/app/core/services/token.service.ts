import { Injectable, signal } from '@angular/core';

const ACCESS_TOKEN_KEY = 'fb_admin_access_token';
const REFRESH_TOKEN_KEY = 'fb_admin_refresh_token';

/**
 * Wraps localStorage access for the JWT access/refresh token pair.
 *
 * Tokens are kept in a signal (not just localStorage) so guards/interceptors/UI
 * can react synchronously to login/logout without re-reading storage.
 */
@Injectable({ providedIn: 'root' })
export class TokenService {
  private readonly accessTokenSignal = signal<string | null>(this.readFromStorage(ACCESS_TOKEN_KEY));
  private readonly refreshTokenSignal = signal<string | null>(this.readFromStorage(REFRESH_TOKEN_KEY));

  readonly accessToken = this.accessTokenSignal.asReadonly();
  readonly refreshToken = this.refreshTokenSignal.asReadonly();

  setTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    this.accessTokenSignal.set(accessToken);
    this.refreshTokenSignal.set(refreshToken);
  }

  setAccessToken(accessToken: string): void {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    this.accessTokenSignal.set(accessToken);
  }

  clear(): void {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    this.accessTokenSignal.set(null);
    this.refreshTokenSignal.set(null);
  }

  hasValidRefreshToken(): boolean {
    return !!this.refreshTokenSignal();
  }

  private readFromStorage(key: string): string | null {
    if (typeof localStorage === 'undefined') {
      return null;
    }
    return localStorage.getItem(key);
  }
}
