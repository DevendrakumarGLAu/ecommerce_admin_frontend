import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/** Renders a Google search-result mockup and a social (Open Graph) card mockup for the given SEO fields. */
@Component({
  selector: 'app-seo-preview',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './seo-preview.component.html',
  styleUrl: './seo-preview.component.scss'
})
export class SeoPreviewComponent {
  readonly title = input('Untitled page');
  readonly description = input('No meta description provided yet.');
  readonly url = input('https://firozabadbangles.com');
  readonly image = input<string | null>(null);
}
