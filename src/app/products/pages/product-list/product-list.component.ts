import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { PageEvent } from '@angular/material/paginator';
import { Sort } from '@angular/material/sort';
import { Router, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';

import { Category } from '../../../categories/models/category.model';
import { CategoryService } from '../../../categories/services/category.service';
import { PaginationQuery } from '../../../core/models/api-response.model';
import { NotificationService } from '../../../core/services/notification.service';
import {
  DataTableBulkAction,
  DataTableColumn,
  DataTableComponent
} from '../../../shared/components/data-table/data-table.component';
import { DataTableCellDirective } from '../../../shared/components/data-table/data-table-cell.directive';
import { PageToolbarComponent } from '../../../shared/components/page-toolbar/page-toolbar.component';
import { SearchBoxComponent } from '../../../shared/components/search-box/search-box.component';
import { DialogService } from '../../../shared/services/dialog.service';
import { ProductFilters, ProductStatus, ProductSummary, StockStatus } from '../../models/product.model';
import { ProductService } from '../../services/product.service';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [
    RouterLink,
    MatButtonModule,
    MatChipsModule,
    MatFormFieldModule,
    MatIconModule,
    MatMenuModule,
    MatSelectModule,
    MatTooltipModule,
    PageToolbarComponent,
    SearchBoxComponent,
    DataTableComponent,
    DataTableCellDirective
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.scss'
})
export class ProductListComponent {
  private readonly productService = inject(ProductService);
  private readonly categoryService = inject(CategoryService);
  private readonly dialogService = inject(DialogService);
  private readonly notifications = inject(NotificationService);
  private readonly router = inject(Router);

  readonly columns: DataTableColumn<ProductSummary>[] = [
    { key: 'thumbnail', label: '', hideable: false },
    { key: 'title', label: 'Title', sortable: true, accessor: (row) => row.title },
    { key: 'brand', label: 'Brand', sortable: true, accessor: (row) => row.brand ?? '—' },
    { key: 'price', label: 'Price', sortable: true, align: 'right', accessor: (row) => `₹${row.sale_price ?? row.price}` },
    { key: 'stock_status', label: 'Stock', accessor: (row) => row.stock_status },
    { key: 'status', label: 'Status', accessor: (row) => row.status },
    {
      key: 'flags',
      label: 'Flags',
      hideable: true,
      accessor: (row) =>
        [row.featured && 'Featured', row.bestseller && 'Bestseller', row.new_arrival && 'New arrival']
          .filter(Boolean)
          .join(', ')
    },
    { key: 'created_at', label: 'Created', sortable: true, accessor: (row) => new Date(row.created_at).toLocaleDateString() },
    { key: 'actions', label: '', hideable: false }
  ];

  readonly bulkActions: DataTableBulkAction<ProductSummary>[] = [
    {
      label: 'Publish',
      icon: 'visibility',
      handler: (rows) => this.bulkUpdateStatus(rows, 'published')
    },
    {
      label: 'Archive',
      icon: 'archive',
      handler: (rows) => this.bulkUpdateStatus(rows, 'archived')
    },
    {
      label: 'Delete',
      icon: 'delete',
      color: 'warn',
      handler: (rows) => this.bulkDelete(rows)
    }
  ];

  readonly items = signal<ProductSummary[]>([]);
  readonly total = signal(0);
  readonly loading = signal(true);
  readonly categories = signal<Category[]>([]);

  readonly filters = signal<ProductFilters>({});
  readonly pagination = signal<PaginationQuery>({ page: 1, limit: 20, sort: 'created_at', order: 'desc' });

  readonly statusOptions: ProductStatus[] = ['draft', 'published', 'archived'];
  readonly stockOptions: StockStatus[] = ['in_stock', 'out_of_stock', 'preorder'];

  constructor() {
    this.categoryService.listAll().subscribe((result) => this.categories.set(result.items));
    this.loadProducts();
  }

  loadProducts(): void {
    this.loading.set(true);
    this.productService.list(this.pagination(), this.filters()).subscribe({
      next: (result) => {
        this.items.set(result.items);
        this.total.set(result.total);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  onSearch(term: string): void {
    this.filters.update((f) => ({ ...f, search: term || undefined }));
    this.resetToFirstPage();
  }

  onFilterChange<K extends keyof ProductFilters>(key: K, value: ProductFilters[K]): void {
    this.filters.update((f) => ({ ...f, [key]: value || undefined }));
    this.resetToFirstPage();
  }

  onSortChange(sort: Sort): void {
    this.pagination.update((p) => ({ ...p, sort: sort.direction ? sort.active : 'created_at', order: sort.direction || 'desc' }));
    this.loadProducts();
  }

  onPageChange(event: PageEvent): void {
    this.pagination.update((p) => ({ ...p, page: event.pageIndex + 1, limit: event.pageSize }));
    this.loadProducts();
  }

  private resetToFirstPage(): void {
    this.pagination.update((p) => ({ ...p, page: 1 }));
    this.loadProducts();
  }

  viewProduct(product: ProductSummary): void {
    void this.router.navigate(['/products', product.slug]);
  }

  editProduct(product: ProductSummary): void {
    void this.router.navigate(['/products', product.slug, 'edit']);
  }

  duplicateProduct(product: ProductSummary): void {
    this.productService.getBySlug(product.slug).subscribe((full) => {
      this.productService.duplicate(full).subscribe(() => {
        this.notifications.success(`Duplicated "${product.title}"`);
        this.loadProducts();
      });
    });
  }

  deleteProduct(product: ProductSummary): void {
    this.dialogService.confirmDelete(`"${product.title}"`).subscribe((confirmed) => {
      if (!confirmed) {
        return;
      }
      this.productService.delete(product.id).subscribe(() => {
        this.notifications.success('Product deleted');
        this.loadProducts();
      });
    });
  }

  private bulkDelete(rows: ProductSummary[]): void {
    this.dialogService.confirmDelete(`${rows.length} product(s)`).subscribe((confirmed) => {
      if (!confirmed) {
        return;
      }
      forkJoin(rows.map((row) => this.productService.delete(row.id))).subscribe(() => {
        this.notifications.success(`Deleted ${rows.length} product(s)`);
        this.loadProducts();
      });
    });
  }

  private bulkUpdateStatus(rows: ProductSummary[], status: ProductStatus): void {
    forkJoin(rows.map((row) => this.productService.update(row.id, { status }))).subscribe(() => {
      this.notifications.success(`Updated ${rows.length} product(s) to ${status}`);
      this.loadProducts();
    });
  }
}
