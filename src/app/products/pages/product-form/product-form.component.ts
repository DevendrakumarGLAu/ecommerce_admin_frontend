import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { QuillModule } from 'ngx-quill';
import { Observable, forkJoin, switchMap } from 'rxjs';

import { Category } from '../../../categories/models/category.model';
import { CategoryService } from '../../../categories/services/category.service';
import { NotificationService } from '../../../core/services/notification.service';
import { FormErrorComponent } from '../../../shared/components/form-error/form-error.component';
import { ImageUploadComponent, UploadedImage } from '../../../shared/components/image-upload/image-upload.component';
import {
  MarketplaceLinkEntry,
  MarketplaceLinksComponent
} from '../../../shared/components/marketplace-links/marketplace-links.component';
import { PageToolbarComponent } from '../../../shared/components/page-toolbar/page-toolbar.component';
import { SeoFormFieldsComponent } from '../../../shared/components/seo-form-fields/seo-form-fields.component';
import { UploadedVideo, VideoUploadComponent } from '../../../shared/components/video-upload/video-upload.component';
import { jsonValidator, priceValidator, urlValidator } from '../../../shared/utils/validators.util';
import {
  MarketplaceLink,
  Product,
  ProductCreateRequest,
  ProductImage,
  ProductStatus,
  ProductVideo,
  StockStatus
} from '../../models/product.model';
import { ProductService } from '../../services/product.service';

const QUILL_MODULES = {
  toolbar: [
    ['bold', 'italic', 'underline', 'strike'],
    ['blockquote', 'code-block'],
    [{ header: [1, 2, 3, false] }],
    [{ list: 'ordered' }, { list: 'bullet' }],
    ['link', 'image'],
    [{ align: [] }],
    [{ color: [] }, { background: [] }],
    ['clean']
  ]
};

@Component({
  selector: 'app-product-form',
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
    MatSelectModule,
    MatTabsModule,
    QuillModule,
    FormErrorComponent,
    ImageUploadComponent,
    MarketplaceLinksComponent,
    PageToolbarComponent,
    SeoFormFieldsComponent,
    VideoUploadComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './product-form.component.html',
  styleUrl: './product-form.component.scss'
})
export class ProductFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly productService = inject(ProductService);
  private readonly categoryService = inject(CategoryService);
  private readonly notifications = inject(NotificationService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly quillModules = QUILL_MODULES;
  readonly categories = signal<Category[]>([]);
  readonly submitting = signal(false);
  readonly loading = signal(false);
  readonly images = signal<UploadedImage[]>([]);
  readonly videos = signal<UploadedVideo[]>([]);
  readonly marketplaceLinks = signal<MarketplaceLinkEntry[]>([]);

  private readonly editingSlug = this.route.snapshot.paramMap.get('slug');
  readonly isEditMode = signal(!!this.editingSlug);
  private productId: string | null = null;
  private originalImages: ProductImage[] = [];
  private originalVideos: ProductVideo[] = [];
  private originalMarketplaceLinks: MarketplaceLink[] = [];

  readonly stockOptions: StockStatus[] = ['in_stock', 'out_of_stock', 'preorder'];
  readonly statusOptions: ProductStatus[] = ['draft', 'published', 'archived'];

  readonly form = this.fb.group({
    category_id: ['', Validators.required],
    title: ['', [Validators.required, Validators.maxLength(255)]],
    short_description: ['', Validators.maxLength(500)],
    description: [''],
    sku: [''],
    brand: [''],
    price: [null as number | null, [Validators.required, priceValidator()]],
    sale_price: [null as number | null, [priceValidator()]],
    featured: [false],
    bestseller: [false],
    new_arrival: [false],
    stock_status: ['in_stock' as StockStatus],
    status: ['draft' as ProductStatus],
    seo_title: [''],
    meta_title: [''],
    meta_description: [''],
    meta_keywords: [''],
    canonical_url: ['', urlValidator()],
    og_image: ['', urlValidator()],
    schema_json: ['', jsonValidator()]
  });

  readonly previewImageUrl = computed(() => this.images().at(0)?.url ?? null);

  constructor() {
    this.categoryService.listAll().subscribe((result) => this.categories.set(result.items));

    if (this.editingSlug) {
      this.loadProduct(this.editingSlug);
    }
  }

  // Plain methods (not `computed()`): a FormControl's `.value` mutates in
  // place and isn't a signal, so these re-run on every change-detection pass
  // instead of memoizing on a dependency that would never change.
  previewTitle(): string {
    return this.form.controls.title.value || 'Untitled product';
  }

  previewPrice(): number | null {
    return this.form.controls.price.value;
  }

  previewSalePrice(): number | null {
    return this.form.controls.sale_price.value;
  }

  private loadProduct(slug: string): void {
    this.loading.set(true);
    this.productService.getBySlug(slug).subscribe({
      next: (product) => {
        this.productId = product.id;
        this.originalImages = product.images.slice().sort((a, b) => a.display_order - b.display_order);
        this.images.set(
          this.originalImages.map((image) => ({
            id: crypto.randomUUID(),
            url: image.image_url,
            altText: image.alt_text,
            backendId: image.id
          }))
        );

        this.originalVideos = product.videos.slice().sort((a, b) => a.display_order - b.display_order);
        this.videos.set(
          this.originalVideos.map((video) => ({
            id: crypto.randomUUID(),
            url: video.video_url,
            caption: video.caption,
            backendId: video.id
          }))
        );

        this.originalMarketplaceLinks = product.marketplace_links.slice().sort((a, b) => a.display_order - b.display_order);
        this.marketplaceLinks.set(
          this.originalMarketplaceLinks.map((link) => ({
            id: crypto.randomUUID(),
            platform: link.platform,
            customLabel: link.custom_label,
            url: link.url,
            backendId: link.id
          }))
        );

        this.form.patchValue({
          category_id: product.category.id,
          title: product.title,
          short_description: product.short_description,
          description: product.description,
          sku: product.sku,
          brand: product.brand,
          price: Number(product.price),
          sale_price: product.sale_price ? Number(product.sale_price) : null,
          featured: product.featured,
          bestseller: product.bestseller,
          new_arrival: product.new_arrival,
          stock_status: product.stock_status,
          status: product.status,
          seo_title: product.seo_title,
          meta_title: product.meta_title,
          meta_description: product.meta_description,
          meta_keywords: product.meta_keywords,
          canonical_url: product.canonical_url,
          og_image: product.og_image,
          schema_json: product.schema_json ? JSON.stringify(product.schema_json, null, 2) : ''
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

    const payload: ProductCreateRequest = {
      category_id: raw.category_id!,
      title: raw.title!,
      short_description: raw.short_description || null,
      description: raw.description || null,
      sku: raw.sku || null,
      brand: raw.brand || null,
      price: Number(raw.price),
      sale_price: raw.sale_price !== null && raw.sale_price !== undefined ? Number(raw.sale_price) : null,
      featured: raw.featured ?? false,
      bestseller: raw.bestseller ?? false,
      new_arrival: raw.new_arrival ?? false,
      stock_status: raw.stock_status ?? 'in_stock',
      status: raw.status ?? 'draft',
      seo_title: raw.seo_title || null,
      meta_title: raw.meta_title || null,
      meta_description: raw.meta_description || null,
      meta_keywords: raw.meta_keywords || null,
      canonical_url: raw.canonical_url || null,
      schema_json: raw.schema_json ? JSON.parse(raw.schema_json) : null,
      og_image: raw.og_image || null
    };

    const save$ = this.isEditMode() && this.productId
      ? this.productService.update(this.productId, payload)
      : this.productService.create(payload);

    save$.subscribe({
      next: (product) => this.reconcileRelatedEntities(product),
      error: () => this.submitting.set(false)
    });
  }

  private reconcileRelatedEntities(product: Product): void {
    const operations = [
      ...this.buildImageOperations(product),
      ...this.buildVideoOperations(product),
      ...this.buildMarketplaceLinkOperations(product)
    ];

    if (!operations.length) {
      this.finishSubmit();
      return;
    }

    forkJoin(operations).subscribe({
      next: () => this.finishSubmit(),
      error: () => this.submitting.set(false)
    });
  }

  private buildImageOperations(product: Product): Observable<unknown>[] {
    const currentImages = this.images();
    const originalById = new Map(this.originalImages.map((img, index) => [img.id, index]));
    const stillPresentBackendIds = new Set(currentImages.filter((img) => img.backendId).map((img) => img.backendId!));

    const operations: Observable<unknown>[] = [];

    for (const original of this.originalImages) {
      if (!stillPresentBackendIds.has(original.id)) {
        operations.push(this.productService.removeImage(product.id, original.id));
      }
    }

    currentImages.forEach((image, index) => {
      if (!image.backendId) {
        operations.push(
          this.productService.addImage(product.id, {
            image_url: image.url,
            alt_text: image.altText,
            display_order: index
          })
        );
        return;
      }
      const originalIndex = originalById.get(image.backendId);
      if (originalIndex !== index) {
        operations.push(
          this.productService.removeImage(product.id, image.backendId).pipe(
            switchMap(() =>
              this.productService.addImage(product.id, {
                image_url: image.url,
                alt_text: image.altText,
                display_order: index
              })
            )
          )
        );
      }
    });

    return operations;
  }

  private buildVideoOperations(product: Product): Observable<unknown>[] {
    const currentVideos = this.videos();
    const originalById = new Map(this.originalVideos.map((vid, index) => [vid.id, index]));
    const stillPresentBackendIds = new Set(currentVideos.filter((vid) => vid.backendId).map((vid) => vid.backendId!));

    const operations: Observable<unknown>[] = [];

    for (const original of this.originalVideos) {
      if (!stillPresentBackendIds.has(original.id)) {
        operations.push(this.productService.removeVideo(product.id, original.id));
      }
    }

    currentVideos.forEach((video, index) => {
      if (!video.backendId) {
        operations.push(
          this.productService.addVideo(product.id, {
            video_url: video.url,
            caption: video.caption,
            display_order: index
          })
        );
        return;
      }
      const originalIndex = originalById.get(video.backendId);
      if (originalIndex !== index) {
        operations.push(
          this.productService.removeVideo(product.id, video.backendId).pipe(
            switchMap(() =>
              this.productService.addVideo(product.id, {
                video_url: video.url,
                caption: video.caption,
                display_order: index
              })
            )
          )
        );
      }
    });

    return operations;
  }

  private buildMarketplaceLinkOperations(product: Product): Observable<unknown>[] {
    const current = this.marketplaceLinks();
    const stillPresentBackendIds = new Set(current.filter((link) => link.backendId).map((link) => link.backendId!));

    const operations: Observable<unknown>[] = [];

    for (const original of this.originalMarketplaceLinks) {
      if (!stillPresentBackendIds.has(original.id)) {
        operations.push(this.productService.removeMarketplaceLink(product.id, original.id));
      }
    }

    current.forEach((link, index) => {
      if (!link.backendId) {
        operations.push(
          this.productService.addMarketplaceLink(product.id, {
            platform: link.platform,
            custom_label: link.customLabel,
            url: link.url,
            display_order: index
          })
        );
      }
    });

    return operations;
  }

  private finishSubmit(): void {
    this.submitting.set(false);
    this.notifications.success(this.isEditMode() ? 'Product updated' : 'Product created');
    void this.router.navigate(['/products']);
  }
}
