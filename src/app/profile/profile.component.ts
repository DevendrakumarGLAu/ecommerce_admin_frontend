import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { AuthService } from '../core/services/auth.service';
import { NotificationService } from '../core/services/notification.service';
import { FormErrorComponent } from '../shared/components/form-error/form-error.component';
import { ImageUploadComponent, UploadedImage } from '../shared/components/image-upload/image-upload.component';
import { PageToolbarComponent } from '../shared/components/page-toolbar/page-toolbar.component';
import { mustMatchValidator } from '../shared/utils/validators.util';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
    FormErrorComponent,
    ImageUploadComponent,
    PageToolbarComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly notifications = inject(NotificationService);

  readonly user = this.authService.currentUser;
  readonly avatar = signal<UploadedImage[]>(
    this.user()?.avatar_url ? [{ id: crypto.randomUUID(), url: this.user()!.avatar_url! }] : []
  );

  readonly savingProfile = signal(false);
  readonly savingPassword = signal(false);
  readonly hideCurrentPassword = signal(true);
  readonly hideNewPassword = signal(true);

  readonly profileForm = this.fb.group({
    first_name: [this.user()?.first_name ?? '', [Validators.required, Validators.maxLength(100)]],
    last_name: [this.user()?.last_name ?? '', [Validators.required, Validators.maxLength(100)]],
    phone: [this.user()?.phone ?? '']
  });

  readonly passwordForm = this.fb.group(
    {
      current_password: ['', Validators.required],
      new_password: ['', [Validators.required, Validators.minLength(8)]],
      confirm_password: ['', Validators.required]
    },
    { validators: mustMatchValidator('new_password', 'confirm_password') }
  );

  saveProfile(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    this.savingProfile.set(true);
    const raw = this.profileForm.getRawValue();
    this.authService
      .updateProfile({
        first_name: raw.first_name!,
        last_name: raw.last_name!,
        phone: raw.phone || null,
        avatar_url: this.avatar().at(0)?.url ?? null
      })
      .subscribe({
        next: () => {
          this.savingProfile.set(false);
          this.notifications.success('Profile updated');
        },
        error: () => this.savingProfile.set(false)
      });
  }

  savePassword(): void {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    this.savingPassword.set(true);
    const raw = this.passwordForm.getRawValue();
    this.authService
      .changePassword({ current_password: raw.current_password!, new_password: raw.new_password! })
      .subscribe({
        next: () => {
          this.savingPassword.set(false);
          this.passwordForm.reset();
          this.notifications.success('Password changed successfully');
        },
        error: () => this.savingPassword.set(false)
      });
  }
}
