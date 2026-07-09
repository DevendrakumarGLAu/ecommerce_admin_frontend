import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';

export interface BreadcrumbItem {
  label: string;
  link?: string | unknown[];
}

/** Simple breadcrumb trail; each page supplies its own items (keeps route config simple). */
@Component({
  selector: 'app-breadcrumb',
  standalone: true,
  imports: [RouterLink, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nav class="breadcrumb" aria-label="Breadcrumb">
      <ol>
        @for (item of items(); track item.label; let last = $last) {
          <li>
            @if (item.link && !last) {
              <a [routerLink]="item.link">{{ item.label }}</a>
            } @else {
              <span aria-current="page">{{ item.label }}</span>
            }
            @if (!last) {
              <mat-icon class="breadcrumb__separator">chevron_right</mat-icon>
            }
          </li>
        }
      </ol>
    </nav>
  `,
  styles: `
    .breadcrumb ol {
      display: flex;
      align-items: center;
      list-style: none;
      margin: 0;
      padding: 0;
      flex-wrap: wrap;
    }

    .breadcrumb li {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      font-size: 0.85rem;
    }

    .breadcrumb a {
      color: var(--mat-sys-on-surface-variant);
    }

    .breadcrumb span[aria-current] {
      color: var(--mat-sys-on-surface);
      font-weight: 500;
    }

    .breadcrumb__separator {
      font-size: 16px;
      width: 16px;
      height: 16px;
      color: var(--mat-sys-outline);
      margin: 0 0.15rem;
    }
  `
})
export class BreadcrumbComponent {
  readonly items = input.required<BreadcrumbItem[]>();
}
