import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs';

import { LoadingService } from '../services/loading.service';

/** Increments/decrements the global in-flight-request counter around every HTTP call. */
export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  const loadingService = inject(LoadingService);
  loadingService.start();
  return next(req).pipe(finalize(() => loadingService.stop()));
};
