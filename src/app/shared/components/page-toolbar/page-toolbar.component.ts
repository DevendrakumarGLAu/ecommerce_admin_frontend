import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { BreadcrumbComponent, BreadcrumbItem } from '../breadcrumb/breadcrumb.component';

/**
 * Standard header for every list/form page: optional breadcrumb, title,
 * subtitle, and a right-aligned slot for page-level actions (e.g. "New
 * product" button). Keeps every feature page's header markup identical.
 */
@Component({
  selector: 'app-page-toolbar',
  standalone: true,
  imports: [BreadcrumbComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page-toolbar">
      @if (breadcrumbs().length) {
        <app-breadcrumb [items]="breadcrumbs()" />
      }
      <div class="page-toolbar__row">
        <div class="page-toolbar__heading">
          <h1>{{ title() }}</h1>
          @if (subtitle()) {
            <p>{{ subtitle() }}</p>
          }
        </div>
        <div class="page-toolbar__actions">
          <ng-content select="[toolbarActions]" />
        </div>
      </div>
    </div>
  `,
  styles: `
    .page-toolbar {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .page-toolbar__row {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .page-toolbar__heading h1 {
      margin: 0;
      font: var(--mat-sys-headline-small);
    }

    .page-toolbar__heading p {
      margin: 0.25rem 0 0;
      color: var(--mat-sys-on-surface-variant);
    }

    .page-toolbar__actions {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      flex-wrap: wrap;
    }
  `
})
export class PageToolbarComponent {
  readonly title = input.required<string>();
  readonly subtitle = input<string | null>(null);
  readonly breadcrumbs = input<BreadcrumbItem[]>([]);
}
