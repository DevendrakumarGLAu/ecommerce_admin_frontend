export interface Category {
  id: string;
  name: string;
  slug: string;
  image: string | null;
  description: string | null;
  is_active: boolean;
  seo_title: string | null;
  meta_description: string | null;
  meta_keywords: string | null;
  created_at: string;
  updated_at: string;
}

export interface CategoryCreateRequest {
  name: string;
  image?: string | null;
  description?: string | null;
  is_active?: boolean;
  seo_title?: string | null;
  meta_description?: string | null;
  meta_keywords?: string | null;
}

export type CategoryUpdateRequest = Partial<CategoryCreateRequest>;
