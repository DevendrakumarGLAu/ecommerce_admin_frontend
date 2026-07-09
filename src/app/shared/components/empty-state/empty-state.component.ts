import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

/** Shown in place of a table/list/grid when there is no data to display. */
@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [MatButtonModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="empty-state">
      <mat-icon class="empty-state__icon">{{ icon() }}</mat-icon>
      <h3 class="empty-state__title">{{ title() }}</h3>
      @if (description()) {
        <p class="empty-state__description">{{ description() }}</p>
      }
      @if (actionLabel()) {
        <button mat-flat-button color="primary" type="button" (click)="action.emit()">
          {{ actionLabel() }}
        </button>
      }
    </div>
  `,
  styles: `
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 3rem 1.5rem;
      gap: 0.5rem;
      color: var(--mat-sys-on-surface-variant);
    }

    .empty-state__icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      opacity: 0.5;
      margin-bottom: 0.5rem;
    }

    .empty-state__title {
      margin: 0;
      font: var(--mat-sys-title-medium);
      color: var(--mat-sys-on-surface);
    }

    .empty-state__description {
      margin: 0 0 0.75rem;
      max-width: 32rem;
    }
  `
})
export class EmptyStateComponent {
  readonly icon = input('inbox');
  readonly title = input('No data found');
  readonly description = input<string | null>(null);
  readonly actionLabel = input<string | null>(null);
  readonly action = output();
}
