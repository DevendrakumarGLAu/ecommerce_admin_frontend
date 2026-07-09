import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

/**
 * Generic "something went wrong" panel with a retry button. Pass
 * `variant="network"` for the offline/network-error flavor.
 */
@Component({
  selector: 'app-error-state',
  standalone: true,
  imports: [MatButtonModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="error-state">
      <mat-icon class="error-state__icon">{{ variant() === 'network' ? 'wifi_off' : 'error_outline' }}</mat-icon>
      <h3 class="error-state__title">{{ title() }}</h3>
      <p class="error-state__description">{{ description() }}</p>
      <button mat-flat-button color="primary" type="button" (click)="retry.emit()">
        <mat-icon>refresh</mat-icon>
        Retry
      </button>
    </div>
  `,
  styles: `
    .error-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 3rem 1.5rem;
      gap: 0.5rem;
      color: var(--mat-sys-on-surface-variant);
    }

    .error-state__icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      color: var(--mat-sys-error);
      margin-bottom: 0.5rem;
    }

    .error-state__title {
      margin: 0;
      font: var(--mat-sys-title-medium);
      color: var(--mat-sys-on-surface);
    }

    .error-state__description {
      margin: 0 0 0.75rem;
      max-width: 32rem;
    }
  `
})
export class ErrorStateComponent {
  readonly variant = input<'default' | 'network'>('default');
  readonly title = input('Something went wrong');
  readonly description = input('We ran into a problem loading this data. Please try again.');
  readonly retry = output();
}
