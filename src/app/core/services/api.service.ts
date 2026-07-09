import { HttpClient, HttpContext, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map, retry, timer } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';

/** Query params as a flat object; `undefined`/`null`/`''` values are omitted. */
export type QueryParams = Record<string, string | number | boolean | null | undefined>;

/**
 * Centralized HTTP client wrapper.
 *
 * - Prefixes every request with `environment.apiBaseUrl`.
 * - Unwraps the backend's `{ success, message, data }` envelope, so callers
 *   just get `data` typed as `T`.
 * - Retries idempotent GET requests twice on transient network failures.
 *
 * Auth headers, error notifications, and the loading indicator are handled
 * by HTTP interceptors, not here — this service only owns the request/response
 * shape.
 */
@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiBaseUrl;

  get<T>(path: string, params?: QueryParams, context?: HttpContext): Observable<T> {
    return this.http
      .get<ApiResponse<T>>(this.url(path), { params: this.buildParams(params), context })
      .pipe(retry({ count: 2, delay: (_, attempt) => timer(attempt * 300) }), map((res) => res.data));
  }

  post<T>(path: string, body: unknown, context?: HttpContext): Observable<T> {
    return this.http.post<ApiResponse<T>>(this.url(path), body, { context }).pipe(map((res) => res.data));
  }

  put<T>(path: string, body: unknown, context?: HttpContext): Observable<T> {
    return this.http.put<ApiResponse<T>>(this.url(path), body, { context }).pipe(map((res) => res.data));
  }

  patch<T>(path: string, body: unknown, context?: HttpContext): Observable<T> {
    return this.http.patch<ApiResponse<T>>(this.url(path), body, { context }).pipe(map((res) => res.data));
  }

  delete<T>(path: string, context?: HttpContext): Observable<T> {
    return this.http.delete<ApiResponse<T>>(this.url(path), { context }).pipe(map((res) => res.data));
  }

  /** Multipart file upload (used by UploadService). Angular sets the boundary header automatically. */
  postFormData<T>(path: string, formData: FormData, params?: QueryParams): Observable<T> {
    return this.http
      .post<ApiResponse<T>>(this.url(path), formData, { params: this.buildParams(params) })
      .pipe(map((res) => res.data));
  }

  private url(path: string): string {
    return `${this.baseUrl}${path.startsWith('/') ? path : `/${path}`}`;
  }

  private buildParams(params?: QueryParams): HttpParams {
    let httpParams = new HttpParams();
    if (!params) {
      return httpParams;
    }
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null && value !== '') {
        httpParams = httpParams.set(key, String(value));
      }
    }
    return httpParams;
  }
}
