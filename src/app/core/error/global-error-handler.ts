import { ErrorHandler, Injectable, NgZone, inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

import { NotificationService } from '../services/notification.service';

/**
 * Catches uncaught runtime exceptions (template errors, unhandled promise
 * rejections, etc.) that slip past HTTP interceptors and component-level
 * try/catch, logs them, and shows a friendly toast instead of a blank screen.
 *
 * HTTP errors are deliberately ignored here — `error.interceptor.ts` already
 * surfaces those; re-showing them here would double the toasts.
 */
@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  private readonly zone = inject(NgZone);
  private readonly notifications = inject(NotificationService);

  handleError(error: unknown): void {
    if (error instanceof HttpErrorResponse) {
      return;
    }

    console.error('Unhandled application error:', error);

    this.zone.run(() => {
      this.notifications.error('Something went wrong. Please refresh the page and try again.');
    });
  }
}
