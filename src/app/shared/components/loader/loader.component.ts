import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

/** Centered spinner, either inline or as a full-panel overlay (`overlay` input). */
@Component({
  selector: 'app-loader',
  standalone: true,
  imports: [MatProgressSpinnerModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="app-loader" [class.app-loader--overlay]="overlay()">
      <mat-progress-spinner mode="indeterminate" [diameter]="diameter()" />
      @if (label()) {
        <span class="app-loader__label">{{ label() }}</span>
      }
    </div>
  `,
  styles: `
    .app-loader {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 0.75rem;
      padding: 2rem;
      color: var(--mat-sys-on-surface-variant);
    }

    .app-loader--overlay {
      position: absolute;
      inset: 0;
      background: color-mix(in srgb, var(--mat-sys-surface) 80%, transparent);
      z-index: 10;
    }
  `
})
export class LoaderComponent {
  readonly diameter = input(40);
  readonly label = input<string | null>(null);
  readonly overlay = input(false);
}
