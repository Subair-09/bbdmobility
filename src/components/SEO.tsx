import React, { useEffect } from 'react';

export interface SEOProps {
  title: string;
  description: string;
  canonicalPath?: string;
  keywords?: string;
  ogType?: 'website' | 'article';
  image?: string;
  schema?: Record<string, unknown> | Array<Record<string, unknown>>;
}

const DOMAIN = 'https://bbdmobility.com.ng';
const DEFAULT_IMAGE = `${DOMAIN}/assets/highway-rider-sharp.jpg`;

export const SEO: React.FC<SEOProps> = ({
  title,
  description,
  canonicalPath = '',
  keywords,
  ogType = 'website',
  image = DEFAULT_IMAGE,
  schema,
}) => {
  useEffect(() => {
    // 1. Update Title
    document.title = title;

    // Helper to set or create meta tag
    const setMeta = (attrName: string, attrVal: string, contentVal: string) => {
      let tag = document.querySelector(`meta[${attrName}="${attrVal}"]`);
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute(attrName, attrVal);
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', contentVal);
    };

    // Helper to set or create link tag
    const setLink = (rel: string, hrefVal: string) => {
      let tag = document.querySelector(`link[rel="${rel}"]`);
      if (!tag) {
        tag = document.createElement('link');
        tag.setAttribute('rel', rel);
        document.head.appendChild(tag);
      }
      tag.setAttribute('href', hrefVal);
    };

    const canonicalUrl = `${DOMAIN}${canonicalPath.startsWith('/') ? canonicalPath : `/${canonicalPath}`}`;

    // 2. Standard Meta Tags
    setMeta('name', 'description', description);
    if (keywords) {
      setMeta('name', 'keywords', keywords);
    }
    setLink('canonical', canonicalUrl);

    // 3. Open Graph Tags
    setMeta('property', 'og:title', title);
    setMeta('property', 'og:description', description);
    setMeta('property', 'og:url', canonicalUrl);
    setMeta('property', 'og:type', ogType);
    setMeta('property', 'og:image', image.startsWith('http') ? image : `${DOMAIN}${image}`);

    // 4. Twitter Card Tags
    setMeta('name', 'twitter:card', 'summary_large_image');
    setMeta('name', 'twitter:title', title);
    setMeta('name', 'twitter:description', description);
    setMeta('name', 'twitter:image', image.startsWith('http') ? image : `${DOMAIN}${image}`);

    // 5. Page-Specific JSON-LD Schema
    const scriptId = 'bbd-dynamic-jsonld';
    let scriptTag = document.getElementById(scriptId) as HTMLScriptElement | null;

    if (schema) {
      if (!scriptTag) {
        scriptTag = document.createElement('script');
        scriptTag.id = scriptId;
        scriptTag.type = 'application/ld+json';
        document.head.appendChild(scriptTag);
      }
      scriptTag.textContent = JSON.stringify(schema, null, 2);
    } else if (scriptTag) {
      scriptTag.remove();
    }

    return () => {
      // Leave index.html baseline intact when component unmounts
      const dynamicScript = document.getElementById(scriptId);
      if (dynamicScript) {
        dynamicScript.remove();
      }
    };
  }, [title, description, canonicalPath, keywords, ogType, image, schema]);

  return null;
};
