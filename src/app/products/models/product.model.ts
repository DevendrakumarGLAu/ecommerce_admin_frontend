import { Category } from '../../categories/models/category.model';

export type StockStatus = 'in_stock' | 'out_of_stock' | 'preorder';
export type ProductStatus = 'draft' | 'published' | 'archived';
export type MarketplacePlatform = 'amazon' | 'flipkart' | 'meesho' | 'myntra' | 'snapdeal' | 'other';

export const MARKETPLACE_PLATFORM_LABELS: Record<MarketplacePlatform, string> = {
  amazon: 'Amazon',
  flipkart: 'Flipkart',
  meesho: 'Meesho',
  myntra: 'Myntra',
  snapdeal: 'Snapdeal',
  other: 'Other'
};

export interface ProductImage {
  id: string;
  image_url: string;
  alt_text: string | null;
  display_order: number;
}

export interface MarketplaceLink {
  id: string;
  platform: MarketplacePlatform;
  custom_label: string | null;
  url: string;
  display_order: number;
}

export interface ProductVideo {
  id: string;
  video_url: string;
  thumbnail_url: string | null;
  caption: string | null;
  display_order: number;
}

export interface ProductSummary {
  id: string;
  title: string;
  slug: string;
  brand: string | null;
  category_name: string;
  category_slug: string;
  price: string;
  sale_price: string | null;
  featured: boolean;
  bestseller: boolean;
  new_arrival: boolean;
  stock_status: StockStatus;
  status: ProductStatus;
  og_image: string | null;
  created_by: string | null;
  creator_name: string | null;
  created_at: string;
}

export interface Product extends ProductSummary {
  category: Category;
  short_description: string | null;
  description: string | null;
  sku: string | null;
  seo_title: string | null;
  meta_title: string | null;
  meta_description: string | null;
  meta_keywords: string | null;
  canonical_url: string | null;
  schema_json: Record<string, unknown> | null;
  images: ProductImage[];
  videos: ProductVideo[];
  marketplace_links: MarketplaceLink[];
  updated_at: string;
}

export interface ProductCreateRequest {
  category_id: string;
  title: string;
  short_description?: string | null;
  description?: string | null;
  sku?: string | null;
  brand?: string | null;
  price: number;
  sale_price?: number | null;
  featured?: boolean;
  bestseller?: boolean;
  new_arrival?: boolean;
  stock_status?: StockStatus;
  status?: ProductStatus;
  seo_title?: string | null;
  meta_title?: string | null;
  meta_description?: string | null;
  meta_keywords?: string | null;
  canonical_url?: string | null;
  schema_json?: Record<string, unknown> | null;
  og_image?: string | null;
}

export type ProductUpdateRequest = Partial<ProductCreateRequest>;

export interface ProductImageCreateRequest {
  image_url: string;
  alt_text?: string | null;
  display_order?: number;
}

export interface MarketplaceLinkCreateRequest {
  platform: MarketplacePlatform;
  custom_label?: string | null;
  url: string;
  display_order?: number;
}

export interface ProductVideoCreateRequest {
  video_url: string;
  thumbnail_url?: string | null;
  caption?: string | null;
  display_order?: number;
}

export interface ProductFilters {
  search?: string;
  category_id?: string;
  category_slug?: string;
  brand?: string;
  featured?: boolean;
  bestseller?: boolean;
  new_arrival?: boolean;
  stock_status?: StockStatus;
  status?: ProductStatus;
  price_min?: number;
  price_max?: number;
}
