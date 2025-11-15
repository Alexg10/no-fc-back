import type { Schema, Struct } from '@strapi/strapi';

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

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'common.centered-text': CommonCenteredText;
      'common.link': CommonLink;
      'common.seo': CommonSeo;
      'homepage.hero': HomepageHero;
    }
  }
}
