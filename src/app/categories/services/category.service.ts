import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiService } from '../../core/services/api.service';
import { PaginatedResult, PaginationQuery } from '../../core/models/api-response.model';
import { Category, CategoryCreateRequest, CategoryUpdateRequest } from '../models/category.model';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private readonly api = inject(ApiService);

  list(pagination: PaginationQuery, search?: string, isActive?: boolean): Observable<PaginatedResult<Category>> {
    return this.api.get<PaginatedResult<Category>>('/categories', { ...pagination, search, is_active: isActive });
  }

  /** Fetches every category (single large page) — used to populate select dropdowns. */
  listAll(): Observable<PaginatedResult<Category>> {
    return this.api.get<PaginatedResult<Category>>('/categories', { page: 1, limit: 100, sort: 'name', order: 'asc' });
  }

  getBySlug(slug: string): Observable<Category> {
    return this.api.get<Category>(`/categories/${slug}`);
  }

  create(payload: CategoryCreateRequest): Observable<Category> {
    return this.api.post<Category>('/categories', payload);
  }

  update(id: string, payload: CategoryUpdateRequest): Observable<Category> {
    return this.api.put<Category>(`/categories/${id}`, payload);
  }

  delete(id: string): Observable<void> {
    return this.api.delete<void>(`/categories/${id}`);
  }
}
