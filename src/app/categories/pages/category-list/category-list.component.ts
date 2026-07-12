import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleChange, MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { PageEvent } from '@angular/material/paginator';
import { Sort } from '@angular/material/sort';
import { Router, RouterLink } from '@angular/router';

import { PaginationQuery } from '../../../core/models/api-response.model';
import { NotificationService } from '../../../core/services/notification.service';
import { DataTableCellDirective } from '../../../shared/components/data-table/data-table-cell.directive';
import { DataTableColumn, DataTableComponent } from '../../../shared/components/data-table/data-table.component';
import { PageToolbarComponent } from '../../../shared/components/page-toolbar/page-toolbar.component';
import { SearchBoxComponent } from '../../../shared/components/search-box/search-box.component';
import { DialogService } from '../../../shared/services/dialog.service';
import { Category } from '../../models/category.model';
import { CategoryService } from '../../services/category.service';

@Component({
  selector: 'app-category-list',
  standalone: true,
  imports: [
    RouterLink,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatMenuModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatTooltipModule,
    PageToolbarComponent,
    SearchBoxComponent,
    DataTableComponent,
    DataTableCellDirective
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './category-list.component.html',
  styleUrl: './category-list.component.scss'
})
export class CategoryListComponent {
  private readonly categoryService = inject(CategoryService);
  private readonly dialogService = inject(DialogService);
  private readonly notifications = inject(NotificationService);
  private readonly router = inject(Router);

  readonly columns: DataTableColumn<Category>[] = [
    { key: 'image', label: '', hideable: false },
    { key: 'name', label: 'Name', sortable: true, accessor: (row) => row.name },
    { key: 'slug', label: 'Slug', accessor: (row) => row.slug },
    { key: 'description', label: 'Description', accessor: (row) => row.description ?? '—' },
    { key: 'status', label: 'Status', accessor: (row) => (row.is_active ? 'Active' : 'Paused') },
    { key: 'created_at', label: 'Created', sortable: true, accessor: (row) => new Date(row.created_at).toLocaleDateString() },
    { key: 'actions', label: '', hideable: false }
  ];

  readonly items = signal<Category[]>([]);
  readonly total = signal(0);
  readonly loading = signal(true);
  readonly search = signal<string | undefined>(undefined);
  readonly activeFilter = signal<boolean | undefined>(undefined);
  readonly pagination = signal<PaginationQuery>({ page: 1, limit: 20, sort: 'name', order: 'asc' });

  constructor() {
    this.loadCategories();
  }

  loadCategories(): void {
    this.loading.set(true);
    this.categoryService.list(this.pagination(), this.search(), this.activeFilter()).subscribe({
      next: (result) => {
        this.items.set(result.items);
        this.total.set(result.total);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  onSearch(term: string): void {
    this.search.set(term || undefined);
    this.pagination.update((p) => ({ ...p, page: 1 }));
    this.loadCategories();
  }

  onActiveFilter(isActive: boolean | null): void {
    this.activeFilter.set(isActive ?? undefined);
    this.pagination.update((p) => ({ ...p, page: 1 }));
    this.loadCategories();
  }

  onSortChange(sort: Sort): void {
    this.pagination.update((p) => ({ ...p, sort: sort.direction ? sort.active : 'name', order: sort.direction || 'asc' }));
    this.loadCategories();
  }

  onPageChange(event: PageEvent): void {
    this.pagination.update((p) => ({ ...p, page: event.pageIndex + 1, limit: event.pageSize }));
    this.loadCategories();
  }

  editCategory(category: Category): void {
    void this.router.navigate(['/categories', category.slug, 'edit']);
  }

  onToggleActive(category: Category, event: MatSlideToggleChange): void {
    const confirm$ = category.is_active
      ? this.dialogService.confirm({
          title: `Pause "${category.name}"?`,
          message: 'Products in this category stay untouched, but the category itself can be hidden from the storefront.',
          confirmLabel: 'Pause',
          tone: 'danger'
        })
      : this.dialogService.confirm({
          title: `Activate "${category.name}"?`,
          message: 'The category becomes visible on the storefront again.',
          confirmLabel: 'Activate'
        });

    confirm$.subscribe((confirmed) => {
      if (!confirmed) {
        event.source.checked = category.is_active;
        return;
      }
      this.categoryService.update(category.id, { is_active: !category.is_active }).subscribe({
        next: () => {
          this.notifications.success(category.is_active ? 'Category paused' : 'Category activated');
          this.loadCategories();
        },
        error: () => {
          event.source.checked = category.is_active;
        }
      });
    });
  }

  deleteCategory(category: Category): void {
    this.dialogService.confirmDelete(`"${category.name}"`).subscribe((confirmed) => {
      if (!confirmed) {
        return;
      }
      this.categoryService.delete(category.id).subscribe(() => {
        this.notifications.success('Category deleted');
        this.loadCategories();
      });
    });
  }
}
