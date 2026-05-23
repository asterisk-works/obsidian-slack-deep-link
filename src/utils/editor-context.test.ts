import { describe, it, expect } from 'vitest';
import { isInsideMarkdownLinkUrl } from './editor-context';

describe('isInsideMarkdownLinkUrl', () => {
  it('returns true when cursor is at opening paren of a link', () => {
    expect(isInsideMarkdownLinkUrl('[text](')).toBe(true);
  });

  it('returns true when cursor is after partial URL inside a link', () => {
    expect(isInsideMarkdownLinkUrl('[text](https://example')).toBe(true);
  });

  it('returns true for image links', () => {
    expect(isInsideMarkdownLinkUrl('![alt](')).toBe(true);
  });

  it('returns true when preceded by other text on the line', () => {
    expect(isInsideMarkdownLinkUrl('some text [link](')).toBe(true);
  });

  it('returns true when cursor is in second link on the line', () => {
    expect(isInsideMarkdownLinkUrl('[a](b) and [c](')).toBe(true);
  });

  it('returns false when cursor is after closing paren', () => {
    expect(isInsideMarkdownLinkUrl('[text](https://example.com)')).toBe(false);
  });

  it('returns false for plain text', () => {
    expect(isInsideMarkdownLinkUrl('just some text')).toBe(false);
  });

  it('returns false when cursor is inside link text brackets', () => {
    expect(isInsideMarkdownLinkUrl('[text')).toBe(false);
  });

  it('returns false for empty string', () => {
    expect(isInsideMarkdownLinkUrl('')).toBe(false);
  });
});