import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { catchError, of } from 'rxjs';

import { BarChartComponent, BarChartDatum } from '../shared/components/bar-chart/bar-chart.component';
import { EmptyStateComponent } from '../shared/components/empty-state/empty-state.component';
import { ErrorStateComponent } from '../shared/components/error-state/error-state.component';
import { PageToolbarComponent } from '../shared/components/page-toolbar/page-toolbar.component';
import { StatCardComponent } from '../shared/components/stat-card/stat-card.component';
import { DashboardService, DashboardStats } from './dashboard.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    RouterLink,
    DatePipe,
    MatButtonModule,
    MatIconModule,
    PageToolbarComponent,
    StatCardComponent,
    BarChartComponent,
    EmptyStateComponent,
    ErrorStateComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {
  private readonly dashboardService = inject(DashboardService);

  readonly loading = signal(true);
  readonly loadFailed = signal(false);
  readonly stats = signal<DashboardStats | null>(null);

  readonly chartLoading = signal(true);
  readonly chartData = signal<BarChartDatum[]>([]);

  constructor() {
    this.loadStats();
    this.loadChart();
  }

  loadStats(): void {
    this.loading.set(true);
    this.loadFailed.set(false);

    this.dashboardService
      .getStats()
      .pipe(
        catchError(() => {
          this.loadFailed.set(true);
          return of(null);
        })
      )
      .subscribe((stats) => {
        this.stats.set(stats);
        this.loading.set(false);
      });
  }

  private loadChart(): void {
    this.chartLoading.set(true);
    this.dashboardService
      .getProductsByCategory()
      .pipe(catchError(() => of<BarChartDatum[]>([])))
      .subscribe((data) => {
        this.chartData.set(data);
        this.chartLoading.set(false);
      });
  }
}
