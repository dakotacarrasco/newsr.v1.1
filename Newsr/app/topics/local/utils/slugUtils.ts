// Function to extract headline from content
export function extractHeadline(content: string): string {
  const headlineMatch = content.match(/^\*\*\[(.*?)\]\*\*/);
  if (headlineMatch && headlineMatch[1]) {
    return headlineMatch[1];
  }
  return '';
}

// Function to create URL-friendly slug from headline
export function createSlugFromHeadline(headline: string): string {
  return headline
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens  
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .trim();
} 