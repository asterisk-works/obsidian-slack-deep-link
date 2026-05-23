export function parseMarkdownLink(text: string): { prefix: string; linkText: string; url: string } | null {
  const match = text.match(/^(!?)\[([^\]]*)\]\(([^)]+)\)$/);
  if (!match) return null;
  return { prefix: match[1] || '', linkText: match[2] || '', url: match[3] || '' };
}