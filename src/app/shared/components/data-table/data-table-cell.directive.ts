import { Directive, TemplateRef, input } from '@angular/core';

export interface DataTableCellContext<T> {
  $implicit: T;
}

/**
 * Marks an `<ng-template>` as the custom cell renderer for a given column key,
 * e.g. `<ng-template appDataTableCell="thumbnail" let-row>...</ng-template>`.
 * Columns without a matching template fall back to the column's `accessor`.
 */
@Directive({
  selector: '[appDataTableCell]',
  standalone: true
})
export class DataTableCellDirective<T = unknown> {
  readonly columnKey = input.required<string>({ alias: 'appDataTableCell' });

  constructor(public readonly templateRef: TemplateRef<DataTableCellContext<T>>) {}
}
