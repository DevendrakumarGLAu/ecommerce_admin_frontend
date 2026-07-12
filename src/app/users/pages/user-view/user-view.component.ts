import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatSlideToggleChange, MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute } from '@angular/router';

import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { ErrorStateComponent } from '../../../shared/components/error-state/error-state.component';
import { LoaderComponent } from '../../../shared/components/loader/loader.component';
import { PageToolbarComponent } from '../../../shared/components/page-toolbar/page-toolbar.component';
import { DialogService } from '../../../shared/services/dialog.service';
import { User } from '../../models/user.model';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-user-view',
  standalone: true,
  imports: [
    DatePipe,
    MatButtonModule,
    MatSlideToggleModule,
    MatTooltipModule,
    ErrorStateComponent,
    LoaderComponent,
    PageToolbarComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './user-view.component.html',
  styleUrl: './user-view.component.scss'
})
export class UserViewComponent {
  private readonly userService = inject(UserService);
  private readonly authService = inject(AuthService);
  private readonly dialogService = inject(DialogService);
  private readonly notifications = inject(NotificationService);
  private readonly route = inject(ActivatedRoute);

  readonly user = signal<User | null>(null);
  readonly loading = signal(true);
  readonly loadFailed = signal(false);

  constructor() {
    this.load();
  }

  load(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.loadFailed.set(true);
      this.loading.set(false);
      return;
    }

    this.loading.set(true);
    this.loadFailed.set(false);
    this.userService.getById(id).subscribe({
      next: (user) => {
        this.user.set(user);
        this.loading.set(false);
      },
      error: () => {
        this.loadFailed.set(true);
        this.loading.set(false);
      }
    });
  }

  isSelf(): boolean {
    return this.authService.currentUser()?.id === this.user()?.id;
  }

  onToggleActive(event: MatSlideToggleChange): void {
    const user = this.user();
    if (!user) {
      return;
    }
    if (this.isSelf()) {
      event.source.checked = user.is_active;
      this.notifications.warning('You cannot pause your own account.');
      return;
    }

    this.dialogService
      .confirm({
        title: `${user.is_active ? 'Pause' : 'Activate'} ${user.first_name} ${user.last_name}?`,
        message: user.is_active
          ? 'They will no longer be able to sign in until reactivated.'
          : 'They will regain the ability to sign in.',
        confirmLabel: user.is_active ? 'Pause' : 'Activate',
        tone: user.is_active ? 'danger' : 'default'
      })
      .subscribe((confirmed) => {
        if (!confirmed) {
          event.source.checked = user.is_active;
          return;
        }
        const action$ = user.is_active ? this.userService.deactivate(user.id) : this.userService.activate(user.id);
        action$.subscribe({
          next: (updated) => {
            this.user.set(updated);
            this.notifications.success(updated.is_active ? 'User activated' : 'User paused');
          },
          error: () => {
            event.source.checked = user.is_active;
          }
        });
      });
  }
}
