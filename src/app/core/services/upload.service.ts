import { HttpClient, HttpEvent } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';

export type UploadFolder = 'products' | 'categories' | 'settings' | 'profile';

/**
 * Uploads images/videos to the FastAPI backend's Supabase Storage endpoints.
 *
 * Uses `HttpClient` directly (not `ApiService`) because progress reporting
 * requires `observe: 'events'`, a different response shape than the rest of
 * the app's request/response calls.
 */
@Injectable({ providedIn: 'root' })
export class UploadService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiBaseUrl;

  uploadImage(file: File, folder: UploadFolder = 'products'): Observable<HttpEvent<ApiResponse<{ url: string }>>> {
    return this.upload('/uploads/image', file, folder);
  }

  uploadVideo(file: File, folder: UploadFolder = 'products'): Observable<HttpEvent<ApiResponse<{ url: string }>>> {
    return this.upload('/uploads/video', file, folder);
  }

  private upload(
    path: string,
    file: File,
    folder: UploadFolder
  ): Observable<HttpEvent<ApiResponse<{ url: string }>>> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<ApiResponse<{ url: string }>>(`${this.baseUrl}${path}`, formData, {
      params: { folder },
      reportProgress: true,
      observe: 'events'
    });
  }
}
