import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiService } from '../../core/services/api.service';
import { SiteSettings, SiteSettingsUpdateRequest } from '../models/settings.model';

@Injectable({ providedIn: 'root' })
export class SettingsService {
  private readonly api = inject(ApiService);

  get(): Observable<SiteSettings> {
    return this.api.get<SiteSettings>('/settings');
  }

  update(payload: SiteSettingsUpdateRequest): Observable<SiteSettings> {
    return this.api.put<SiteSettings>('/settings', payload);
  }
}
