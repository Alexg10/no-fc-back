import type { Schema, Struct } from '@strapi/strapi';

export interface ArticleCarousel extends Struct.ComponentSchema {
  collectionName: 'components_article_carousels';
  info: {
    displayName: 'Carousel';
    icon: 'landscape';
  };
  attributes: {
    backgroundColor: Schema.Attribute.Enumeration<
      ['white', 'black', 'lime', 'pink', 'blue']
    >;
    backgroundImage: Schema.Attribute.Media<
      'images' | 'files' | 'videos' | 'audios'
    >;
    images: Schema.Attribute.Media<
      'images' | 'files' | 'videos' | 'audios',
      true
    >;
  };
}

export interface ArticleCreditItem extends Struct.ComponentSchema {
  collectionName: 'components_article_credit_items';
  info: {
    displayName: 'Credit Item';
    icon: 'bulletList';
  };
  attributes: {
    content: Schema.Attribute.Blocks;
    title: Schema.Attribute.String;
  };
}

export interface ArticleCredits extends Struct.ComponentSchema {
  collectionName: 'components_article_credits';
  info: {
    displayName: 'Credits';
    icon: 'user';
  };
  attributes: {
    credit: Schema.Attribute.Component<'article.credit-item', true>;
  };
}

export interface ArticleDescription extends Struct.ComponentSchema {
  collectionName: 'components_article_descriptions';
  info: {
    displayName: 'Intro';
    icon: 'bulletList';
  };
  attributes: {
    description: Schema.Attribute.Blocks;
  };
}

export interface ArticleImageCols extends Struct.ComponentSchema {
  collectionName: 'components_article_image_cols';
  info: {
    displayName: 'ImageCols';
    icon: 'bulletList';
  };
  attributes: {
    content: Schema.Attribute.Blocks;
    image: Schema.Attribute.Media<'images' | 'files' | 'videos' | 'audios'>;
    imageRight: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
  };
}

export interface ArticleImageStack extends Struct.ComponentSchema {
  collectionName: 'components_article_image_stacks';
  info: {
    displayName: 'ImageStack';
    icon: 'picture';
  };
  attributes: {
    images: Schema.Attribute.Media<
      'images' | 'files' | 'videos' | 'audios',
      true
    >;
  };
}

export interface ArticleImages extends Struct.ComponentSchema {
  collectionName: 'components_article_images';
  info: {
    displayName: 'Images';
    icon: 'landscape';
  };
  attributes: {
    images: Schema.Attribute.Media<'images', true> & Schema.Attribute.Required;
  };
}

export interface ArticleProduct extends Struct.ComponentSchema {
  collectionName: 'components_article_products';
  info: {
    displayName: 'Product';
    icon: 'store';
  };
  attributes: {
    backgroundImage: Schema.Attribute.Media<
      'images' | 'files' | 'videos' | 'audios'
    >;
    product: Schema.Attribute.Relation<'oneToOne', 'api::product.product'>;
  };
}

export interface ArticleQuote extends Struct.ComponentSchema {
  collectionName: 'components_article_quotes';
  info: {
    displayName: 'Quote';
    icon: 'quote';
  };
  attributes: {
    description: Schema.Attribute.String;
    name: Schema.Attribute.String;
    quote: Schema.Attribute.Blocks;
  };
}

export interface ArticleTitleContent extends Struct.ComponentSchema {
  collectionName: 'components_article_title_contents';
  info: {
    displayName: 'Title content';
    icon: 'layer';
  };
  attributes: {
    content: Schema.Attribute.Blocks;
    editor: Schema.Attribute.RichText &
      Schema.Attribute.CustomField<
        'plugin::ckeditor5.CKEditor',
        {
          preset: 'defaultHtml';
        }
      >;
    image: Schema.Attribute.Media<'images' | 'files' | 'videos' | 'audios'>;
    title: Schema.Attribute.String;
    twoColumns: Schema.Attribute.Boolean;
  };
}

export interface CommonCenteredText extends Struct.ComponentSchema {
  collectionName: 'components_common_centered_texts';
  info: {
    displayName: 'Centered text';
    icon: 'filter';
  };
  attributes: {
    content: Schema.Attribute.Blocks;
  };
}

export interface CommonLink extends Struct.ComponentSchema {
  collectionName: 'components_common_links';
  info: {
    displayName: 'Link';
    icon: 'apps';
  };
  attributes: {
    label: Schema.Attribute.String;
    link: Schema.Attribute.String;
    target: Schema.Attribute.Enumeration<['_self', '_blank']>;
  };
}

export interface CommonSeo extends Struct.ComponentSchema {
  collectionName: 'components_common_seos';
  info: {
    displayName: 'Seo';
    icon: 'rocket';
  };
  attributes: {
    keywords: Schema.Attribute.String;
    metaDescription: Schema.Attribute.Text;
    metaTitle: Schema.Attribute.String;
  };
}

export interface CommonVideoFullWidth extends Struct.ComponentSchema {
  collectionName: 'components_common_video_full_widths';
  info: {
    displayName: 'Video full width';
    icon: 'play';
  };
  attributes: {
    cover: Schema.Attribute.Media<'images' | 'files' | 'videos' | 'audios'>;
    playerText: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'Play video'>;
    url: Schema.Attribute.String;
  };
}

export interface HomepageHero extends Struct.ComponentSchema {
  collectionName: 'components_homepage_heroes';
  info: {
    displayName: 'Hero';
    icon: 'television';
  };
  attributes: {
    background: Schema.Attribute.Media<
      'images' | 'files' | 'videos' | 'audios'
    >;
    button: Schema.Attribute.Component<'common.link', false>;
    description: Schema.Attribute.Text;
    subtitle: Schema.Attribute.String;
    title: Schema.Attribute.String;
  };
}

export interface HomepageHeroArticle extends Struct.ComponentSchema {
  collectionName: 'components_homepage_hero_articles';
  info: {
    displayName: 'Hero article';
    icon: 'attachment';
  };
  attributes: {
    article: Schema.Attribute.Relation<'oneToOne', 'api::article.article'>;
  };
}

export interface HomepageHomeProducts extends Struct.ComponentSchema {
  collectionName: 'components_homepage_home_products';
  info: {
    displayName: 'Home products';
    icon: 'bulletList';
  };
  attributes: {
    products: Schema.Attribute.Relation<'oneToMany', 'api::product.product'>;
    title: Schema.Attribute.String;
  };
}

export interface HomepageNewestArticles extends Struct.ComponentSchema {
  collectionName: 'components_homepage_newest_articles';
  info: {
    displayName: 'Newest articles';
    icon: 'cast';
  };
  attributes: {
    title: Schema.Attribute.Blocks;
  };
}

export interface ProductsHero extends Struct.ComponentSchema {
  collectionName: 'components_products_heroes';
  info: {
    displayName: 'Hero';
    icon: 'expand';
  };
  attributes: {
    btnLabel: Schema.Attribute.String;
    btnLink: Schema.Attribute.String;
    cover: Schema.Attribute.Media<'images' | 'files' | 'videos' | 'audios'>;
    description: Schema.Attribute.Blocks;
    title: Schema.Attribute.String;
  };
}

export interface SimplePageContent extends Struct.ComponentSchema {
  collectionName: 'components_simple_page_contents';
  info: {
    displayName: 'Content';
    icon: 'layer';
  };
  attributes: {
    content: Schema.Attribute.Blocks;
  };
}

export interface SimplePageFaqSection extends Struct.ComponentSchema {
  collectionName: 'components_simple_page_faq_sections';
  info: {
    displayName: 'Faq section';
  };
  attributes: {
    faqs: Schema.Attribute.Relation<'oneToMany', 'api::faq.faq'>;
    title: Schema.Attribute.String;
  };
}

export interface SimplePageFaqs extends Struct.ComponentSchema {
  collectionName: 'components_simple_page_faqs';
  info: {
    displayName: 'Faqs';
  };
  attributes: {
    faqSections: Schema.Attribute.Component<'simple-page.faq-section', true>;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'article.carousel': ArticleCarousel;
      'article.credit-item': ArticleCreditItem;
      'article.credits': ArticleCredits;
      'article.description': ArticleDescription;
      'article.image-cols': ArticleImageCols;
      'article.image-stack': ArticleImageStack;
      'article.images': ArticleImages;
      'article.product': ArticleProduct;
      'article.quote': ArticleQuote;
      'article.title-content': ArticleTitleContent;
      'common.centered-text': CommonCenteredText;
      'common.link': CommonLink;
      'common.seo': CommonSeo;
      'common.video-full-width': CommonVideoFullWidth;
      'homepage.hero': HomepageHero;
      'homepage.hero-article': HomepageHeroArticle;
      'homepage.home-products': HomepageHomeProducts;
      'homepage.newest-articles': HomepageNewestArticles;
      'products.hero': ProductsHero;
      'simple-page.content': SimplePageContent;
      'simple-page.faq-section': SimplePageFaqSection;
      'simple-page.faqs': SimplePageFaqs;
    }
  }
}
