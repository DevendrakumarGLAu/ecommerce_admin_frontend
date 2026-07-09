import { NgTemplateOutlet } from '@angular/common';
import { SelectionModel } from '@angular/cdk/collections';
import {
  ChangeDetectionStrategy,
  Component,
  ContentChildren,
  QueryList,
  computed,
  input,
  output,
  signal
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { PageEvent, MatPaginatorModule } from '@angular/material/paginator';
import { Sort, MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';

import { EmptyStateComponent } from '../empty-state/empty-state.component';
import { TableSkeletonComponent } from '../table-skeleton/table-skeleton.component';
import { DataTableCellDirective } from './data-table-cell.directive';
import { exportRowsToCsv } from './data-table-csv.util';

export interface DataTableColumn<T> {
  key: string;
  label: string;
  sortable?: boolean;
  hideable?: boolean;
  align?: 'left' | 'center' | 'right';
  /** Value accessor used for the default text cell AND for CSV export. */
  accessor?: (row: T) => unknown;
}

export interface DataTableBulkAction<T> {
  label: string;
  icon?: string;
  color?: 'primary' | 'warn';
  handler: (selected: T[]) => void;
}

/**
 * Generic, server-driven data table: this component never fetches or sorts
 * data itself — it renders whatever `data`/`total` it's given and emits
 * `pageChange`/`sortChange` so the parent page re-queries the backend. That
 * keeps pagination/sorting/search consistent with the rest of the app's
 * server-side listing endpoints.
 */
@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [
    NgTemplateOutlet,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatCheckboxModule,
    MatMenuModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    EmptyStateComponent,
    TableSkeletonComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './data-table.component.html',
  styleUrl: './data-table.component.scss'
})
export class DataTableComponent<T extends object> {
  readonly columns = input.required<DataTableColumn<T>[]>();
  readonly data = input<T[]>([]);
  readonly total = input(0);
  readonly pageSize = input(20);
  readonly pageIndex = input(0);
  readonly pageSizeOptions = input([10, 20, 50, 100]);
  readonly loading = input(false);
  readonly selectable = input(false);
  readonly trackByKey = input('id');
  readonly bulkActions = input<DataTableBulkAction<T>[]>([]);
  readonly emptyTitle = input('No records found');
  readonly emptyDescription = input<string | null>(null);
  readonly exportFilename = input('export');

  readonly pageChange = output<PageEvent>();
  readonly sortChange = output<Sort>();
  readonly rowClick = output<T>();

  @ContentChildren(DataTableCellDirective)
  cellTemplates!: QueryList<DataTableCellDirective<T>>;

  readonly selection = new SelectionModel<T>(true, []);
  private readonly hiddenColumnKeys = signal<Set<string>>(new Set());

  readonly visibleColumns = computed(() => this.columns().filter((col) => !this.hiddenColumnKeys().has(col.key)));

  readonly displayedColumnKeys = computed(() => {
    const keys = this.visibleColumns().map((col) => col.key);
    return this.selectable() ? ['select', ...keys] : keys;
  });

  templateFor(columnKey: string): DataTableCellDirective<T> | undefined {
    return this.cellTemplates?.find((tpl) => tpl.columnKey() === columnKey);
  }

  cellValue(row: T, column: DataTableColumn<T>): unknown {
    return column.accessor ? column.accessor(row) : (row as Record<string, unknown>)[column.key];
  }

  toggleColumn(key: string, visible: boolean): void {
    const next = new Set(this.hiddenColumnKeys());
    if (visible) {
      next.delete(key);
    } else {
      next.add(key);
    }
    this.hiddenColumnKeys.set(next);
  }

  isColumnVisible(key: string): boolean {
    return !this.hiddenColumnKeys().has(key);
  }

  onSortChange(sort: Sort): void {
    this.sortChange.emit(sort);
  }

  onPageChange(event: PageEvent): void {
    this.pageChange.emit(event);
  }

  toggleAll(): void {
    if (this.isAllSelected()) {
      this.selection.clear();
    } else {
      this.selection.select(...this.data());
    }
  }

  isAllSelected(): boolean {
    return this.data().length > 0 && this.selection.selected.length === this.data().length;
  }

  isIndeterminate(): boolean {
    return this.selection.selected.length > 0 && !this.isAllSelected();
  }

  runBulkAction(action: DataTableBulkAction<T>): void {
    action.handler(this.selection.selected);
  }

  exportCsv(): void {
    exportRowsToCsv(
      this.exportFilename(),
      this.columns(),
      this.selection.selected.length ? this.selection.selected : this.data()
    );
  }
}
