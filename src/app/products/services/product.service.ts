import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiService } from '../../core/services/api.service';
import { PaginatedResult, PaginationQuery } from '../../core/models/api-response.model';
import {
  MarketplaceLink,
  MarketplaceLinkCreateRequest,
  Product,
  ProductCreateRequest,
  ProductFilters,
  ProductImage,
  ProductImageCreateRequest,
  ProductSummary,
  ProductUpdateRequest,
  ProductVideo,
  ProductVideoCreateRequest
} from '../models/product.model';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly api = inject(ApiService);

  /**
   * `mine` (default true) scopes results to products the calling admin created —
   * each admin only manages their own catalog. Legacy products with no owner yet
   * are included for everyone until an admin edits (and thereby claims) them.
   */
  list(
    pagination: PaginationQuery,
    filters: ProductFilters = {},
    mine = true
  ): Observable<PaginatedResult<ProductSummary>> {
    return this.api.get<PaginatedResult<ProductSummary>>('/products', { ...pagination, ...filters, mine });
  }

  getBySlug(slug: string): Observable<Product> {
    return this.api.get<Product>(`/products/${slug}`);
  }

  create(payload: ProductCreateRequest): Observable<Product> {
    return this.api.post<Product>('/products', payload);
  }

  update(id: string, payload: ProductUpdateRequest): Observable<Product> {
    return this.api.put<Product>(`/products/${id}`, payload);
  }

  delete(id: string): Observable<void> {
    return this.api.delete<void>(`/products/${id}`);
  }

  /** Creates a draft copy of `source`. Images and marketplace links are not duplicated — only core/SEO fields. */
  duplicate(source: Product): Observable<Product> {
    const payload: ProductCreateRequest = {
      category_id: source.category.id,
      title: `${source.title} (Copy)`,
      short_description: source.short_description,
      description: source.description,
      sku: null,
      brand: source.brand,
      price: Number(source.price),
      sale_price: source.sale_price ? Number(source.sale_price) : null,
      featured: false,
      bestseller: false,
      new_arrival: source.new_arrival,
      stock_status: source.stock_status,
      status: 'draft',
      seo_title: source.seo_title,
      meta_title: source.meta_title,
      meta_description: source.meta_description,
      meta_keywords: source.meta_keywords,
      canonical_url: null,
      schema_json: source.schema_json,
      og_image: source.og_image
    };
    return this.create(payload);
  }

  addImage(productId: string, payload: ProductImageCreateRequest): Observable<ProductImage> {
    return this.api.post<ProductImage>(`/products/${productId}/images`, payload);
  }

  removeImage(productId: string, imageId: string): Observable<void> {
    return this.api.delete<void>(`/products/${productId}/images/${imageId}`);
  }

  addMarketplaceLink(productId: string, payload: MarketplaceLinkCreateRequest): Observable<MarketplaceLink> {
    return this.api.post<MarketplaceLink>(`/products/${productId}/marketplace-links`, payload);
  }

  removeMarketplaceLink(productId: string, linkId: string): Observable<void> {
    return this.api.delete<void>(`/products/${productId}/marketplace-links/${linkId}`);
  }

  addVideo(productId: string, payload: ProductVideoCreateRequest): Observable<ProductVideo> {
    return this.api.post<ProductVideo>(`/products/${productId}/videos`, payload);
  }

  removeVideo(productId: string, videoId: string): Observable<void> {
    return this.api.delete<void>(`/products/${productId}/videos/${videoId}`);
  }
}
