import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';

import { ApiErrorResponse } from '../models/api-response.model';
import { NotificationService } from '../services/notification.service';

// 401s are handled by authInterceptor (refresh-or-redirect); showing a toast
// here too would be noisy and often fire before the redirect completes.
const SILENT_STATUS_CODES = [401];

/** Surfaces every other HTTP error as a friendly toast, then rethrows for callers that need it. */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const notifications = inject(NotificationService);

  return next(req).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse && !SILENT_STATUS_CODES.includes(error.status)) {
        notifications.error(extractMessage(error));
      }
      return throwError(() => error);
    })
  );
};

function extractMessage(error: HttpErrorResponse): string {
  const body = error.error as Partial<ApiErrorResponse> | undefined;
  if (body?.message) {
    return body.message;
  }
  if (error.status === 0) {
    return 'Network error — please check your connection and try again.';
  }
  return `Something went wrong (${error.status}). Please try again.`;
}
