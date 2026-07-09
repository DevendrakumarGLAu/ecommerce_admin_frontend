import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { PageToolbarComponent } from '../shared/components/page-toolbar/page-toolbar.component';
import { SeoPreviewComponent } from '../shared/components/seo-preview/seo-preview.component';

/**
 * Standalone SEO scratch pad: paste in a title/description/URL/image and see
 * how it would render in Google search results and social cards, without
 * needing to attach it to a saved product or category. The same
 * `SeoPreviewComponent` is embedded live in the product/category forms.
 */
@Component({
  selector: 'app-seo-tool',
  standalone: true,
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule, PageToolbarComponent, SeoPreviewComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './seo-tool.component.html',
  styleUrl: './seo-tool.component.scss'
})
export class SeoToolComponent {
  private readonly fb = inject(FormBuilder);

  readonly form = this.fb.nonNullable.group({
    title: 'Firozabad Bangles — Handcrafted Glass & Metal Bangles',
    description: 'Shop premium handcrafted bangles from Firozabad, the bangle capital of India.',
    url: 'https://firozabadbangles.com',
    image: ''
  });

  previewTitle(): string {
    return this.form.controls.title.value || 'Untitled page';
  }

  previewDescription(): string {
    return this.form.controls.description.value || 'No meta description provided yet.';
  }

  previewUrl(): string {
    return this.form.controls.url.value || 'https://firozabadbangles.com';
  }

  previewImage(): string | null {
    return this.form.controls.image.value || null;
  }
}
