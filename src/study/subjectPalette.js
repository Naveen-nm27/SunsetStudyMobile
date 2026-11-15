export const subjectSwatches = [
  { name: 'Plum', color: '#7E235D' },
  { name: 'Ember', color: '#AD4C26' },
  { name: 'Violet', color: '#6350A3' },
  { name: 'Sage', color: '#46705F' },
  { name: 'Berry', color: '#A63158' },
  { name: 'Ocean', color: '#2678A0' },
  { name: 'Gold', color: '#B8790D' },
  { name: 'Slate', color: '#52647B' },
];

export function defaultSubjectColor(id) {
  return subjectSwatches[id === undefined ? 0 : id % 5].color;
}
