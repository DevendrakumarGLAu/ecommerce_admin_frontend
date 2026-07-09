import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiService } from '../../core/services/api.service';
import { PaginatedResult, PaginationQuery } from '../../core/models/api-response.model';
import { User, UserFilters } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly api = inject(ApiService);

  list(pagination: PaginationQuery, filters: UserFilters = {}): Observable<PaginatedResult<User>> {
    return this.api.get<PaginatedResult<User>>('/users', { ...pagination, ...filters });
  }

  getById(id: string): Observable<User> {
    return this.api.get<User>(`/users/${id}`);
  }

  activate(id: string): Observable<User> {
    return this.api.patch<User>(`/users/${id}/activate`, {});
  }

  deactivate(id: string): Observable<User> {
    return this.api.patch<User>(`/users/${id}/deactivate`, {});
  }
}
