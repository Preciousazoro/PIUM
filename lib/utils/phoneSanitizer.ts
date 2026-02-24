/**
 * Sanitizes phone number for tel: and wa.me links
 * Removes "+", spaces, and dashes to ensure proper format
 */
export function sanitizePhone(phone?: string): string {
  if (!phone) return '';
  
  return phone
    .replace(/\+/g, '')      // Remove + symbols
    .replace(/\s/g, '')      // Remove spaces
    .replace(/-/g, '')       // Remove dashes
    .replace(/\(/g, '')      // Remove opening parentheses
    .replace(/\)/g, '');     // Remove closing parentheses
}
