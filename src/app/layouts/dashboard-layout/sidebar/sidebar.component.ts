import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink, RouterLinkActive } from '@angular/router';

import { AuthService } from '../../../core/services/auth.service';
import { SidebarService } from '../../../core/services/sidebar.service';
import { NAV_ITEMS } from '../nav-items';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {
  private readonly authService = inject(AuthService);
  readonly sidebarService = inject(SidebarService);

  readonly appName = 'Firozabad Bangles';

  readonly navItems = computed(() =>
    NAV_ITEMS.filter((item) => !item.adminOnly || this.authService.isAdmin())
  );

  closeMobileDrawer(): void {
    this.sidebarService.close();
  }
}
