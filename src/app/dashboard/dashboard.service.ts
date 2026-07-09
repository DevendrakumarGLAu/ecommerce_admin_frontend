import { Injectable, inject } from '@angular/core';
import { Observable, forkJoin, map, of, switchMap } from 'rxjs';

import { ApiService } from '../core/services/api.service';
import { CategoryService } from '../categories/services/category.service';
import { BarChartDatum } from '../shared/components/bar-chart/bar-chart.component';
import { ProductService } from '../products/services/product.service';
import { ProductSummary } from '../products/models/product.model';

export interface DashboardStats {
  total_products: number;
  total_categories: number;
  total_users: number;
  featured_products: ProductSummary[];
  recent_products: ProductSummary[];
}

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly api = inject(ApiService);
  private readonly categoryService = inject(CategoryService);
  private readonly productService = inject(ProductService);

  getStats(): Observable<DashboardStats> {
    return this.api.get<DashboardStats>('/admin/dashboard');
  }

  /**
   * Builds a "products per category" chart from data the backend already
   * exposes: one lightweight `limit=1` products request per category, reading
   * only the `total` field of each paginated response. There is no dedicated
   * aggregation endpoint for this, so it costs one request per category —
   * fine for a dashboard that loads once, but wouldn't scale to hundreds of
   * categories without a backend aggregate endpoint.
   */
  getProductsByCategory(): Observable<BarChartDatum[]> {
    return this.categoryService.listAll().pipe(
      map((result) => result.items),
      switchMap((categories) => {
        if (!categories.length) {
          return of<BarChartDatum[]>([]);
        }
        const counts$ = categories.map((category) =>
          this.productService
            .list({ page: 1, limit: 1 }, { category_id: category.id })
            .pipe(map((result) => ({ label: category.name, value: result.total })))
        );
        return forkJoin(counts$);
      })
    );
  }
}
