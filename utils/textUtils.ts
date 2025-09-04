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

export const createFilename = (personaName: string, markdownContent: string, extension: string, generationId: string): string => {
  let basename = '';

  if (!markdownContent) {
    basename = 'export';
  } else {
    // 1. Try to find a markdown h1 or h2 as the title
    const headingMatch = markdownContent.match(/^#{1,2}\s+(.*)/m);
    if (headingMatch && headingMatch[1]) {
      basename = headingMatch[1].trim();
    } else {
      // 2. If no heading, take the first few words of the stripped text
      const strippedText = stripMarkdown(markdownContent);
      basename = strippedText.split(/\s+/).slice(0, 6).join(' ');
    }
  }

  // 3. Sanitize the title for a filename
  const sanitizedBasename = basename
    .trim()
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // remove non-word characters except spaces and hyphens
    .replace(/\s+/g, '_') // replace spaces with underscores
    .replace(/_{2,}/g, '_') // replace multiple underscores with one
    .substring(0, 50) // truncate
    .replace(/_$/, ''); // remove trailing underscore

  const finalBasename = sanitizedBasename || 'export';
  // Extracts the last word (the name) and makes it lowercase.
  // This handles "🧠 Mia" -> "mia" and "🌸 Miette" -> "miette".
  const personaSuffix = personaName.split(' ').pop()?.toLowerCase() || personaName.toLowerCase();
  
  const uniqueBasename = generationId ? `${finalBasename}_${generationId}` : finalBasename;

  return `${uniqueBasename}.${personaSuffix}.${extension}`;
};
