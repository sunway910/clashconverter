/**
 * Unit tests for JSON-LD structured data generators (lib/seo.ts)
 *
 * Guarantees:
 * 1. Schemas are generated from messages/*.json so JSON-LD always matches
 *    the content visibly rendered on the page (Google guideline).
 * 2. No fabricated data (fake ratings, non-existent search endpoints).
 */

import { describe, it, expect } from 'vitest';
import {
  generateFAQSchema,
  generateHowToSchema,
  generateWebSiteSchema,
  generateOrganizationSchema,
  generateAboutPageSchema,
  generateWebPageSchema,
  generateSoftwareApplicationSchema,
  generateBreadcrumbSchema,
  generateCollectionPageSchema
} from '@/lib/seo';
import messagesEn from '@/messages/en.json';
import messagesZh from '@/messages/zh.json';

const messages: Record<string, typeof messagesEn> = { en: messagesEn, zh: messagesZh };

describe.each(['en', 'zh'])('SEO schema generators (%s)', (locale) => {
  const msgs = messages[locale] as unknown as {
    homeContent: { faq: { items: Array<{ q: string; a: string }> }; steps: { title: string; items: Array<{ title: string; desc: string }> } };
    seoContent: { faq: { items: Array<{ q: string; a: string }> } };
  };

  it('homepage FAQ schema matches the visible FAQ accordion content', () => {
    const schema = generateFAQSchema(locale, 'home');
    expect(schema['@type']).toBe('FAQPage');
    const visible = msgs.homeContent.faq.items;
    expect(schema.mainEntity).toHaveLength(visible.length);
    schema.mainEntity.forEach((question: { name: string; acceptedAnswer: { text: string } }, i: number) => {
      expect(question.name).toBe(visible[i].q);
      expect(question.acceptedAnswer.text).toBe(visible[i].a);
    });
  });

  it('about page FAQ schema matches the visible about FAQ content', () => {
    const schema = generateFAQSchema(locale, 'about');
    expect(schema['@type']).toBe('FAQPage');
    const visible = msgs.seoContent.faq.items;
    expect(schema.mainEntity).toHaveLength(visible.length);
    expect(schema.mainEntity[0].name).toBe(visible[0].q);
  });

  it('HowTo schema matches the visible 3-step guide', () => {
    const schema = generateHowToSchema(locale);
    expect(schema['@type']).toBe('HowTo');
    expect(schema.name).toBe(msgs.homeContent.steps.title);
    const visible = msgs.homeContent.steps.items;
    expect(schema.step).toHaveLength(visible.length);
    schema.step.forEach((step: { name: string; text: string }, i: number) => {
      expect(step.name).toBe(visible[i].title);
      expect(step.text).toBe(visible[i].desc);
    });
  });

  it('has no fabricated aggregateRating', () => {
    const schema = generateSoftwareApplicationSchema(locale) as Record<string, unknown>;
    expect(schema.aggregateRating).toBeUndefined();
  });

  it('WebSite schema has no SearchAction for a non-existent /search page', () => {
    const schema = generateWebSiteSchema() as Record<string, unknown>;
    expect(schema.potentialAction).toBeUndefined();
  });

  it('AboutPage schema uses AboutPage type with Organization mainEntity', () => {
    const schema = generateAboutPageSchema(locale);
    expect(schema['@type']).toBe('AboutPage');
    expect(schema.url).toBe(`https://clashconverter.com${locale === 'zh' ? '/zh' : ''}/about`);
    expect(schema.mainEntity['@type']).toBe('Organization');
  });

  it('CollectionPage schema targets the resources URL', () => {
    const schema = generateCollectionPageSchema(locale);
    expect(schema['@type']).toBe('CollectionPage');
    expect(schema.url).toBe(`https://clashconverter.com${locale === 'zh' ? '/zh' : ''}/resources`);
  });

  it('WebPage schema is locale-aware and fully qualified', () => {
    const schema = generateWebPageSchema(locale, '/privacy', 'Privacy Policy');
    expect(schema['@type']).toBe('WebPage');
    expect(schema.url).toBe(`https://clashconverter.com${locale === 'zh' ? '/zh' : ''}/privacy`);
  });

  it('BreadcrumbList positions are 1-based', () => {
    const schema = generateBreadcrumbSchema([
      { name: 'Home', url: 'https://clashconverter.com' },
      { name: 'About', url: 'https://clashconverter.com/about' }
    ]);
    expect(schema['@type']).toBe('BreadcrumbList');
    expect(schema.itemListElement.map((item: { position: number }) => item.position)).toEqual([1, 2]);
  });

  it('Organization schema has no empty sameAs array', () => {
    const schema = generateOrganizationSchema() as Record<string, unknown>;
    expect(schema.sameAs).toBeUndefined();
  });
});
