export function isInsideMarkdownLinkUrl(beforeCursor: string): boolean {
  return /!?\[[^\]]*\]\([^)]*$/.test(beforeCursor);
}