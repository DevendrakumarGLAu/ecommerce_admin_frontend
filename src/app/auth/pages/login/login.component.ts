import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { CaptchaResponse } from '../../../core/models/auth.model';
import { FormErrorComponent } from '../../../shared/components/form-error/form-error.component';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatButtonModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    FormErrorComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly notifications = inject(NotificationService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly submitting = signal(false);
  readonly hidePassword = signal(true);
  readonly captchaLoading = signal(false);
  readonly captcha = signal<CaptchaResponse | null>(null);

  readonly captchaImageSrc = computed(() => {
    const svg = this.captcha()?.svg;
    return svg ? `data:image/svg+xml;utf8,${encodeURIComponent(svg)}` : null;
  });

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
    captchaText: ['', [Validators.required]]
  });

  constructor() {
    this.refreshCaptcha();
  }

  /** Every login attempt consumes its challenge (right or wrong), so a fresh one is
   * needed on load and again after any failed attempt. */
  refreshCaptcha(): void {
    this.captchaLoading.set(true);
    this.form.controls.captchaText.reset('');
    this.authService.getCaptcha().subscribe({
      next: (result) => {
        this.captcha.set(result);
        this.captchaLoading.set(false);
      },
      error: () => this.captchaLoading.set(false)
    });
  }

  submit(): void {
    if (this.form.invalid || !this.captcha()) {
      this.form.markAllAsTouched();
      return;
    }

    const { email, password, captchaText } = this.form.getRawValue();

    this.submitting.set(true);
    this.authService
      .login({
        email,
        password,
        captcha_id: this.captcha()!.captcha_id,
        captcha_text: captchaText
      })
      .subscribe({
        next: () => {
          this.authService.loadCurrentUser().subscribe({
            next: (user) => {
              this.submitting.set(false);
              this.notifications.success(`Welcome back, ${user.first_name}!`);
              const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') ?? '/dashboard';
              void this.router.navigateByUrl(returnUrl);
            },
            error: () => this.submitting.set(false)
          });
        },
        error: () => {
          this.submitting.set(false);
          // The captcha challenge was consumed by this attempt (right or wrong) — get a new one.
          this.refreshCaptcha();
        }
      });
  }
}
