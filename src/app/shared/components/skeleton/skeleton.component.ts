import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/** A pulsing placeholder block used while content loads (text line, avatar circle, or block). */
@Component({
  selector: 'app-skeleton',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<span class="app-skeleton" [class.app-skeleton--circle]="shape() === 'circle'"></span>`,
  styles: `
    .app-skeleton {
      display: block;
      width: var(--skeleton-width, 100%);
      height: var(--skeleton-height, 1rem);
      border-radius: var(--skeleton-radius, 6px);
      background: linear-gradient(
        90deg,
        var(--mat-sys-surface-container-high) 25%,
        var(--mat-sys-surface-container-highest) 37%,
        var(--mat-sys-surface-container-high) 63%
      );
      background-size: 400% 100%;
      animation: app-skeleton-shimmer 1.4s ease infinite;
    }

    .app-skeleton--circle {
      border-radius: 50%;
    }

    @keyframes app-skeleton-shimmer {
      0% {
        background-position: 100% 50%;
      }
      100% {
        background-position: 0 50%;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .app-skeleton {
        animation: none;
      }
    }
  `,
  host: {
    '[style.--skeleton-width]': 'width()',
    '[style.--skeleton-height]': 'height()',
    '[style.--skeleton-radius]': "shape() === 'circle' ? '50%' : '6px'"
  }
})
export class SkeletonComponent {
  readonly width = input('100%');
  readonly height = input('1rem');
  readonly shape = input<'block' | 'circle'>('block');
}
