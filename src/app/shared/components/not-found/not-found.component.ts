import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink, MatButtonModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="not-found">
      <span class="not-found__code">404</span>
      <h1>Page not found</h1>
      <p>The page you're looking for doesn't exist or may have been moved.</p>
      <a mat-flat-button color="primary" routerLink="/dashboard">
        <mat-icon>home</mat-icon>
        Back to dashboard
      </a>
    </div>
  `,
  styles: `
    .not-found {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      min-height: 70vh;
      gap: 0.5rem;
      padding: 2rem;
    }

    .not-found__code {
      font-size: 4rem;
      font-weight: 700;
      color: var(--mat-sys-primary);
      line-height: 1;
    }

    .not-found h1 {
      margin: 0.5rem 0 0;
    }

    .not-found p {
      color: var(--mat-sys-on-surface-variant);
      margin: 0 0 1rem;
      max-width: 28rem;
    }
  `
})
export class NotFoundComponent {}
