import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { SkeletonComponent } from '../skeleton/skeleton.component';

/** Placeholder rows/columns shown while a data table's first page is loading. */
@Component({
  selector: 'app-table-skeleton',
  standalone: true,
  imports: [SkeletonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="table-skeleton">
      @for (row of rowsArray(); track $index) {
        <div class="table-skeleton__row">
          @for (col of columnsArray(); track $index) {
            <app-skeleton height="1rem" [width]="$first ? '60%' : '100%'" />
          }
        </div>
      }
    </div>
  `,
  styles: `
    .table-skeleton {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      padding: 1rem;
    }

    .table-skeleton__row {
      display: grid;
      grid-template-columns: repeat(var(--cols, 4), 1fr);
      gap: 1rem;
      align-items: center;
    }
  `,
  host: {
    '[style.--cols]': 'columns()'
  }
})
export class TableSkeletonComponent {
  readonly rows = input(6);
  readonly columns = input(4);

  rowsArray(): number[] {
    return Array.from({ length: this.rows() });
  }

  columnsArray(): number[] {
    return Array.from({ length: this.columns() });
  }
}
