export function getInitials(name?: string) {
  if (!name) return '';

  return name
    .trim()
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase();
}
