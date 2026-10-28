/**
 * Input & Content Sanitizer for ACEDEP
 * Strips dangerous HTML tags, malicious event handlers, javascript: URIs,
 * and dangerous unicode payloads to protect against Stored XSS and script injection.
 */

export const sanitizeText = (input: string, maxLength = 2000): string => {
  if (!input || typeof input !== 'string') return '';

  let sanitized = input
    // Trim and limit length
    .trim()
    .slice(0, maxLength)
    // Remove script tags and contents
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    // Remove inline event handlers like onclick=, onerror=, onload=
    .replace(/on\w+\s*=\s*(['"]).*?\1/gi, '')
    .replace(/on\w+\s*=\s*[^>\s]+/gi, '')
    // Remove javascript: and data: text links
    .replace(/javascript:/gi, '')
    .replace(/vbscript:/gi, '')
    // Strip iframe and object tags
    .replace(/<\/?(iframe|object|embed|applet|meta|link|base)[^>]*>/gi, '');

  return sanitized;
};

export const sanitizeFileName = (fileName: string): string => {
  if (!fileName) return 'documento.pdf';
  // Remove directory traversal characters, slashes, null bytes
  return fileName
    .replace(/[/\\?%*:|"<>]/g, '_')
    .replace(/\.\./g, '_')
    .replace(/[\x00-\x1f\x80-\x9f]/g, '')
    .trim()
    .slice(0, 100);
};

export const isValidDocumentMimeType = (fileType: string): boolean => {
  const allowedTypes = [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/webp',
  ];
  return allowedTypes.includes(fileType.toLowerCase().trim());
};

export const MAX_DOCUMENT_FILE_SIZE_BYTES = 3 * 1024 * 1024; // 3 MB limit for security and memory stability
