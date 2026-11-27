function withoutTitle(name: string) {
  return name.replace(/^(dr|mr|mrs|ms|prof)\.?\s+/i, '');
}

export function firstName(name: string): string {
  return withoutTitle(name).split(/\s+/)[0];
}

export function initials(name: string): string {
  const words = withoutTitle(name).split(/\s+/).filter(Boolean);
  return words
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join('');
}
