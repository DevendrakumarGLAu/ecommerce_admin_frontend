import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export interface BarChartDatum {
  label: string;
  value: number;
}

/** Minimal dependency-free horizontal bar chart (no charting library needed for this one use case). */
@Component({
  selector: 'app-bar-chart',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="bar-chart" role="img" [attr.aria-label]="ariaLabel()">
      @for (item of data(); track item.label) {
        <div class="bar-chart__row">
          <span class="bar-chart__label u-truncate">{{ item.label }}</span>
          <div class="bar-chart__track">
            <div class="bar-chart__fill" [style.width.%]="percentage(item.value)"></div>
          </div>
          <span class="bar-chart__value">{{ item.value }}</span>
        </div>
      }
    </div>
  `,
  styles: `
    .bar-chart {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .bar-chart__row {
      display: grid;
      grid-template-columns: 8rem 1fr 2.5rem;
      align-items: center;
      gap: 0.75rem;
      font-size: 0.85rem;
    }

    .bar-chart__track {
      height: 8px;
      border-radius: 999px;
      background: var(--mat-sys-surface-container-high);
      overflow: hidden;
    }

    .bar-chart__fill {
      height: 100%;
      border-radius: 999px;
      background: var(--mat-sys-primary);
      transition: width 300ms ease-in-out;
    }

    .bar-chart__value {
      text-align: right;
      color: var(--mat-sys-on-surface-variant);
      font-variant-numeric: tabular-nums;
    }
  `
})
export class BarChartComponent {
  readonly data = input.required<BarChartDatum[]>();
  readonly ariaLabel = input('Bar chart');

  private readonly maxValue = computed(() => Math.max(1, ...this.data().map((d) => d.value)));

  percentage(value: number): number {
    return (value / this.maxValue()) * 100;
  }
}
