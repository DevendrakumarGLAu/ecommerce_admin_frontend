import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <footer class="app-footer">
      <span>&copy; {{ year }} Firozabad Bangles. All rights reserved.</span>
      <span class="app-footer__version">Admin Panel v1.0.0</span>
    </footer>
  `,
  styles: `
    :host {
      display: contents;
    }

    .app-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.6rem 1rem;
      font-size: 0.8rem;
    }
  `
})
export class FooterComponent {
  readonly year = new Date().getFullYear();
}
