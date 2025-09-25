/**
 * Truncate text to a specified character limit while preserving whole words
 */
export function truncateText(text: string, maxLength: number = 160): string {
  if (text.length <= maxLength) return text;
  
  const truncated = text.slice(0, maxLength);
  const lastSpaceIndex = truncated.lastIndexOf(' ');
  
  // If we found a space within the last 20 characters, cut there
  if (lastSpaceIndex > maxLength - 20) {
    return truncated.slice(0, lastSpaceIndex) + '...';
  }
  
  // Otherwise, just truncate at the limit
  return truncated + '...';
}
