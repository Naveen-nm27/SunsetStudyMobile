export function normalizeSubjectColor(value) {
  const hex = value.trim().replace(/^#/, '').toUpperCase();
  if (/^[0-9A-F]{6}$/.test(hex)) return `#${hex}`;
  if (/^[0-9A-F]{3}$/.test(hex)) return `#${[...hex].map((digit) => digit.repeat(2)).join('')}`;
  return null;
}
