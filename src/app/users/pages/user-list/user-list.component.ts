import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { PageEvent } from '@angular/material/paginator';
import { Sort } from '@angular/material/sort';
import { Router } from '@angular/router';

import { PaginationQuery } from '../../../core/models/api-response.model';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { DataTableCellDirective } from '../../../shared/components/data-table/data-table-cell.directive';
import { DataTableColumn, DataTableComponent } from '../../../shared/components/data-table/data-table.component';
import { PageToolbarComponent } from '../../../shared/components/page-toolbar/page-toolbar.component';
import { SearchBoxComponent } from '../../../shared/components/search-box/search-box.component';
import { DialogService } from '../../../shared/services/dialog.service';
import { User, UserFilters, UserRole } from '../../models/user.model';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatSelectModule,
    PageToolbarComponent,
    SearchBoxComponent,
    DataTableComponent,
    DataTableCellDirective
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.scss'
})
export class UserListComponent {
  private readonly userService = inject(UserService);
  private readonly authService = inject(AuthService);
  private readonly dialogService = inject(DialogService);
  private readonly notifications = inject(NotificationService);
  private readonly router = inject(Router);

  readonly roleOptions: UserRole[] = ['admin', 'customer'];

  readonly columns: DataTableColumn<User>[] = [
    { key: 'name', label: 'Name', sortable: true, accessor: (row) => `${row.first_name} ${row.last_name}` },
    { key: 'email', label: 'Email', sortable: true, accessor: (row) => row.email },
    { key: 'phone', label: 'Phone', accessor: (row) => row.phone ?? '—' },
    { key: 'role', label: 'Role', accessor: (row) => row.role },
    { key: 'status', label: 'Status', accessor: (row) => (row.is_active ? 'Active' : 'Inactive') },
    { key: 'created_at', label: 'Joined', sortable: true, accessor: (row) => new Date(row.created_at).toLocaleDateString() },
    { key: 'actions', label: '', hideable: false }
  ];

  readonly items = signal<User[]>([]);
  readonly total = signal(0);
  readonly loading = signal(true);
  readonly filters = signal<UserFilters>({});
  readonly pagination = signal<PaginationQuery>({ page: 1, limit: 20, sort: 'created_at', order: 'desc' });

  constructor() {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading.set(true);
    this.userService.list(this.pagination(), this.filters()).subscribe({
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

  onRoleFilter(role: UserRole | null): void {
    this.filters.update((f) => ({ ...f, role: role ?? undefined }));
    this.resetToFirstPage();
  }

  onActiveFilter(isActive: boolean | null): void {
    this.filters.update((f) => ({ ...f, is_active: isActive ?? undefined }));
    this.resetToFirstPage();
  }

  onSortChange(sort: Sort): void {
    this.pagination.update((p) => ({ ...p, sort: sort.direction ? sort.active : 'created_at', order: sort.direction || 'desc' }));
    this.loadUsers();
  }

  onPageChange(event: PageEvent): void {
    this.pagination.update((p) => ({ ...p, page: event.pageIndex + 1, limit: event.pageSize }));
    this.loadUsers();
  }

  private resetToFirstPage(): void {
    this.pagination.update((p) => ({ ...p, page: 1 }));
    this.loadUsers();
  }

  viewUser(user: User): void {
    void this.router.navigate(['/users', user.id]);
  }

  isSelf(user: User): boolean {
    return this.authService.currentUser()?.id === user.id;
  }

  toggleActive(user: User): void {
    if (this.isSelf(user)) {
      this.notifications.warning('You cannot deactivate your own account.');
      return;
    }

    const action$ = user.is_active ? this.userService.deactivate(user.id) : this.userService.activate(user.id);
    const confirm$ = user.is_active
      ? this.dialogService.confirm({
          title: `Deactivate ${user.first_name} ${user.last_name}?`,
          message: 'They will no longer be able to sign in until reactivated.',
          confirmLabel: 'Deactivate',
          tone: 'danger'
        })
      : this.dialogService.confirm({
          title: `Activate ${user.first_name} ${user.last_name}?`,
          message: 'They will regain the ability to sign in.',
          confirmLabel: 'Activate'
        });

    confirm$.subscribe((confirmed) => {
      if (!confirmed) {
        return;
      }
      action$.subscribe(() => {
        this.notifications.success(user.is_active ? 'User deactivated' : 'User activated');
        this.loadUsers();
      });
    });
  }
}
