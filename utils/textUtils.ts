export const stripMarkdown = (markdown: string): string => {
  if (!markdown) return '';
  
  let output = markdown;

  // Remove images
  output = output.replace(/!\[.*?\]\(.*?\)/g, '');
  // Remove links, keeping the text
  output = output.replace(/\[(.*?)\]\(.*?\)/g, '$1');
  // Remove code blocks
  output = output.replace(/```[\s\S]*?```/g, '');
  // Remove inline code
  output = output.replace(/`([^`]+)`/g, '$1');
  // Remove headers
  output = output.replace(/^#{1,6}\s+/gm, '');
  // Remove bold, italic, strikethrough (combined)
  output = output.replace(/(\*\*|__|\*|_|~~)(.*?)\1/g, '$2');
  // Remove blockquotes
  output = output.replace(/^\s*>\s?/gm, '');
  // Remove horizontal rules
  output = output.replace(/^\s*[-*_]{3,}\s*$/gm, '');
  // Remove list markers
  output = output.replace(/^\s*([*+-]|\d+\.)\s+/gm, '');
  // Collapse multiple newlines into a single space for better flow
  output = output.replace(/\n{2,}/g, ' ');
  // Replace single newlines with a space
  output = output.replace(/\n/g, ' ');

  return output.trim();
};
