import { ApplicationConfig, ErrorHandler, inject, provideZoneChangeDetection, provideAppInitializer } from '@angular/core';
import { provideRouter, withComponentInputBinding, withInMemoryScrolling } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { catchError, firstValueFrom, of } from 'rxjs';

import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { errorInterceptor } from './core/interceptors/error.interceptor';
import { loadingInterceptor } from './core/interceptors/loading.interceptor';
import { GlobalErrorHandler } from './core/error/global-error-handler';
import { AuthService } from './core/services/auth.service';
import { TokenService } from './core/services/token.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(
      routes,
      withComponentInputBinding(),
      withInMemoryScrolling({ scrollPositionRestoration: 'enabled', anchorScrolling: 'enabled' })
    ),
    provideAnimationsAsync(),
    provideHttpClient(withInterceptors([authInterceptor, loadingInterceptor, errorInterceptor])),
    { provide: ErrorHandler, useClass: GlobalErrorHandler },
    // Restore the session on a full page reload: if a token is already in
    // storage, fetch the profile before the app renders so route guards and
    // the topbar see the correct user/role immediately.
    provideAppInitializer(() => {
      const tokenService = inject(TokenService);
      const authService = inject(AuthService);
      if (!tokenService.accessToken()) {
        return Promise.resolve();
      }
      return firstValueFrom(authService.loadCurrentUser().pipe(catchError(() => of(undefined))));
    })
  ]
};
