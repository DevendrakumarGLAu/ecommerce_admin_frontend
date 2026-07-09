import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { NotificationService } from '../../../core/services/notification.service';
import { FormErrorComponent } from '../../../shared/components/form-error/form-error.component';
import { ImageUploadComponent, UploadedImage } from '../../../shared/components/image-upload/image-upload.component';
import { PageToolbarComponent } from '../../../shared/components/page-toolbar/page-toolbar.component';
import { SeoFormFieldsComponent } from '../../../shared/components/seo-form-fields/seo-form-fields.component';
import { CategoryCreateRequest } from '../../models/category.model';
import { CategoryService } from '../../services/category.service';

@Component({
  selector: 'app-category-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatTabsModule,
    FormErrorComponent,
    ImageUploadComponent,
    PageToolbarComponent,
    SeoFormFieldsComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './category-form.component.html',
  styleUrl: './category-form.component.scss'
})
export class CategoryFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly categoryService = inject(CategoryService);
  private readonly notifications = inject(NotificationService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  private readonly editingSlug = this.route.snapshot.paramMap.get('slug');
  readonly isEditMode = signal(!!this.editingSlug);
  private categoryId: string | null = null;

  readonly loading = signal(false);
  readonly submitting = signal(false);
  readonly image = signal<UploadedImage[]>([]);

  readonly form = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(150)]],
    description: [''],
    seo_title: [''],
    meta_description: [''],
    meta_keywords: ['']
  });

  constructor() {
    if (this.editingSlug) {
      this.loadCategory(this.editingSlug);
    }
  }

  private loadCategory(slug: string): void {
    this.loading.set(true);
    this.categoryService.getBySlug(slug).subscribe({
      next: (category) => {
        this.categoryId = category.id;
        if (category.image) {
          this.image.set([{ id: crypto.randomUUID(), url: category.image }]);
        }
        this.form.patchValue({
          name: category.name,
          description: category.description,
          seo_title: category.seo_title,
          meta_description: category.meta_description,
          meta_keywords: category.meta_keywords
        });
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
    const raw = this.form.getRawValue();
    const payload: CategoryCreateRequest = {
      name: raw.name!,
      description: raw.description || null,
      image: this.image().at(0)?.url ?? null,
      seo_title: raw.seo_title || null,
      meta_description: raw.meta_description || null,
      meta_keywords: raw.meta_keywords || null
    };

    const save$ = this.isEditMode() && this.categoryId
      ? this.categoryService.update(this.categoryId, payload)
      : this.categoryService.create(payload);

    save$.subscribe({
      next: () => {
        this.submitting.set(false);
        this.notifications.success(this.isEditMode() ? 'Category updated' : 'Category created');
        void this.router.navigate(['/categories']);
      },
      error: () => this.submitting.set(false)
    });
  }
}
