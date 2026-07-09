import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { FooterComponent } from './footer/footer.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { TopbarComponent } from './topbar/topbar.component';

/**
 * Root shell for every authenticated page: AdminLTE-styled sidebar + topbar +
 * footer wrapped around a routed content area. See `SidebarService` for how
 * the collapse/expand/mobile-drawer behavior is implemented without loading
 * AdminLTE's own JS bundle.
 */
@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, TopbarComponent, FooterComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="app-wrapper">
      <app-sidebar />
      <app-topbar />
      <main class="app-main">
        <div class="app-content">
          <router-outlet />
        </div>
      </main>
      <app-footer />
    </div>
  `
})
export class DashboardLayoutComponent {}
