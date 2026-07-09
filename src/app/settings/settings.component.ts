import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';

import { NotificationService } from '../core/services/notification.service';
import { FormErrorComponent } from '../shared/components/form-error/form-error.component';
import { ImageUploadComponent, UploadedImage } from '../shared/components/image-upload/image-upload.component';
import { PageToolbarComponent } from '../shared/components/page-toolbar/page-toolbar.component';
import { urlValidator } from '../shared/utils/validators.util';
import { SettingsService } from './services/settings.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatTabsModule,
    FormErrorComponent,
    ImageUploadComponent,
    PageToolbarComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss'
})
export class SettingsComponent {
  private readonly fb = inject(FormBuilder);
  private readonly settingsService = inject(SettingsService);
  private readonly notifications = inject(NotificationService);

  readonly loading = signal(true);
  readonly submitting = signal(false);
  readonly logo = signal<UploadedImage[]>([]);
  readonly favicon = signal<UploadedImage[]>([]);

  readonly form = this.fb.group({
    site_name: ['', Validators.maxLength(150)],
    support_email: ['', Validators.email],
    support_phone: [''],
    facebook: ['', urlValidator()],
    instagram: ['', urlValidator()],
    youtube: ['', urlValidator()],
    twitter: ['', urlValidator()],
    google_analytics: [''],
    facebook_pixel: ['']
  });

  constructor() {
    this.load();
  }

  private load(): void {
    this.loading.set(true);
    this.settingsService.get().subscribe({
      next: (settings) => {
        if (settings.logo) {
          this.logo.set([{ id: crypto.randomUUID(), url: settings.logo }]);
        }
        if (settings.favicon) {
          this.favicon.set([{ id: crypto.randomUUID(), url: settings.favicon }]);
        }
        this.form.patchValue(settings);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.notifications.warning('Please fix the highlighted fields before saving.');
      return;
    }

    this.submitting.set(true);
    this.settingsService
      .update({
        ...this.form.getRawValue(),
        logo: this.logo().at(0)?.url ?? null,
        favicon: this.favicon().at(0)?.url ?? null
      })
      .subscribe({
        next: () => {
          this.submitting.set(false);
          this.notifications.success('Settings updated');
        },
        error: () => this.submitting.set(false)
      });
  }
}
