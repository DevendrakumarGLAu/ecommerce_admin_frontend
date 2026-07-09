import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';

import { SkeletonComponent } from '../skeleton/skeleton.component';

export type StatTrend = 'up' | 'down' | 'neutral';

/** A single KPI card for the dashboard grid (e.g. "Total Products: 128"). */
@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [MatIconModule, RouterLink, SkeletonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <a class="stat-card" [routerLink]="link()" [class.stat-card--static]="!link()">
      <div class="stat-card__icon" [style.background]="iconBackground()">
        <mat-icon>{{ icon() }}</mat-icon>
      </div>
      <div class="stat-card__body">
        <span class="stat-card__label">{{ label() }}</span>
        @if (loading()) {
          <app-skeleton width="4rem" height="1.75rem" />
        } @else {
          <span class="stat-card__value">{{ value() }}</span>
        }
        @if (trendLabel()) {
          <span class="stat-card__trend" [class]="'stat-card__trend--' + trend()">{{ trendLabel() }}</span>
        }
      </div>
    </a>
  `,
  styles: `
    .stat-card {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1.25rem;
      border-radius: 12px;
      background: var(--mat-sys-surface-container-low);
      border: 1px solid var(--mat-sys-outline-variant);
      color: inherit;
      text-decoration: none;
      transition: box-shadow 150ms ease-in-out, transform 150ms ease-in-out;
    }

    .stat-card:not(.stat-card--static):hover {
      box-shadow: var(--mat-sys-level2);
      transform: translateY(-1px);
      text-decoration: none;
    }

    .stat-card--static {
      cursor: default;
    }

    .stat-card__icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 48px;
      height: 48px;
      border-radius: 12px;
      flex-shrink: 0;

      mat-icon {
        color: #fff;
      }
    }

    .stat-card__body {
      display: flex;
      flex-direction: column;
      gap: 0.15rem;
      min-width: 0;
    }

    .stat-card__label {
      font-size: 0.8rem;
      color: var(--mat-sys-on-surface-variant);
    }

    .stat-card__value {
      font-size: 1.5rem;
      font-weight: 600;
      line-height: 1.2;
    }

    .stat-card__trend {
      font-size: 0.75rem;
      font-weight: 500;
    }

    .stat-card__trend--up {
      color: #2e7d32;
    }

    .stat-card__trend--down {
      color: var(--mat-sys-error);
    }

    .stat-card__trend--neutral {
      color: var(--mat-sys-on-surface-variant);
    }
  `
})
export class StatCardComponent {
  readonly label = input.required<string>();
  readonly value = input<string | number>('0');
  readonly icon = input('insights');
  readonly iconBackground = input('#f97316');
  readonly link = input<string | null>(null);
  readonly loading = input(false);
  readonly trend = input<StatTrend>('neutral');
  readonly trendLabel = input<string | null>(null);
}
