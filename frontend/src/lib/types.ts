export type Locale = 'id' | 'en';

export interface Partner {
  id: number;
  name: string;
  logo_url: string;
  website: string;
}

export interface ValueProp {
  id: number;
  icon_url: string;
  title: string;
  desc: string;
}

export interface SolutionFeature {
  id: number;
  label: string;
  title: string;
  desc: string;
  image_url: string;
}

export interface SolutionUseCase {
  id: number;
  title: string;
  desc: string;
}

export interface Solution {
  id: number;
  slug: string;
  name: string;
  eyebrow: string;
  title: string;
  desc: string;
  summary: string;
  icon_url: string;
  card_image_url: string;
  hero_image_url: string;
  cta_label: string;
  cta_href: string;
  feature_title: string;
  capability_title: string;
  capability_image: string;
  cta_title: string;
  cta_banner: string;
  features: SolutionFeature[];
  use_cases: SolutionUseCase[];
}

export interface ProductValue {
  id: number;
  letter: string;
  title: string;
  desc: string;
  image_url: string;
}

export interface ProductFeature {
  id: number;
  title: string;
  desc: string;
  image_url: string;
}

export interface Product {
  id: number;
  slug: string;
  name: string;
  title: string;
  tagline: string;
  logo_url: string;
  hero_image_url: string;
  prompts: string[];
  acronym_title: string;
  cta_title: string;
  cta_label: string;
  cta_href: string;
  values: ProductValue[];
  features: ProductFeature[];
}

export interface ArticleCategory {
  id: number;
  slug: string;
  name: string;
}

export interface Article {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  content?: string;
  image_url: string;
  author: string;
  featured: boolean;
  views: number;
  read_time: string;
  category_slug: string;
  category_name: string;
  published_at: string;
}

export interface ArticleList {
  items: Article[];
  total: number;
  page: number;
  limit: number;
  has_more: boolean;
}

export interface ApproachStep {
  id: number;
  number: string;
  title: string;
  desc: string;
  image_url: string;
}

export interface PageSection {
  key: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  desc: string;
  image_url: string;
  image_mobile_url: string;
  cta_label: string;
  cta_href: string;
}

export type PageSections = Record<string, PageSection | undefined>;

export type SiteSettings = Record<string, string | undefined>;

export interface LegalPage {
  slug: string;
  title: string;
  body: string;
  updated_at: string;
}

export interface ContactPayload {
  name: string;
  email: string;
  company?: string;
  phone?: string;
  solution_interest?: string;
  message: string;
  locale: Locale;
  website?: string;
}
