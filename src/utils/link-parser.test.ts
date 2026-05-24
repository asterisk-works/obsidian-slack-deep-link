import { describe, it, expect } from 'vitest';
import { parseMarkdownLink } from './link-parser';

describe('parseMarkdownLink', () => {
  it('returns parsed link for standard markdown link', () => {
    expect(parseMarkdownLink('[text](https://example.com)')).toEqual({
      prefix: '',
      linkText: 'text',
      url: 'https://example.com',
    });
  });

  it('returns parsed link for image markdown link', () => {
    expect(parseMarkdownLink('![alt](https://example.com)')).toEqual({
      prefix: '!',
      linkText: 'alt',
      url: 'https://example.com',
    });
  });

  it('returns parsed link for empty link text', () => {
    expect(parseMarkdownLink('[](https://example.com)')).toEqual({
      prefix: '',
      linkText: '',
      url: 'https://example.com',
    });
  });

  it('returns null for plain URL', () => {
    expect(parseMarkdownLink('https://example.com')).toBeNull();
  });

  it('returns null when extra text follows the link', () => {
    expect(parseMarkdownLink('[text](https://example.com) extra')).toBeNull();
  });

  it('returns null when URL part is empty', () => {
    expect(parseMarkdownLink('[text]()')).toBeNull();
  });

  it('returns null for bracket-only text', () => {
    expect(parseMarkdownLink('[text]')).toBeNull();
  });

  it('returns null for empty string', () => {
    expect(parseMarkdownLink('')).toBeNull();
  });

  it('preserves Slack URL with query string', () => {
    const url = 'https://x.slack.com/archives/C1/p123?thread_ts=456&cid=C1';
    expect(parseMarkdownLink(`[msg](${url})`)).toEqual({
      prefix: '',
      linkText: 'msg',
      url,
    });
  });
});