/**
 * Count words in a text string
 *
 * @param text - Text to count words in (can be null/undefined)
 * @returns Number of words (0 if text is null/undefined/empty)
 *
 * @example
 * countWords("Hello world") // 2
 * countWords(null) // 0
 * countWords("  multiple   spaces  ") // 2
 */
export function countWords(text: string | null | undefined): number {
  if (!text) return 0;

  // Trim whitespace, split on whitespace, filter out empty strings
  const words = text.trim().split(/\s+/).filter(word => word.length > 0);

  return words.length;
}

/**
 * Check if description meets quality threshold
 *
 * @param description - Provider description text
 * @returns true if >20 words, false otherwise
 */
export function isGoodQuality(description: string | null | undefined): boolean {
  return countWords(description) > 20;
}
