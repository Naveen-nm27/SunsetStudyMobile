import { reviewGaps } from '../data/reviewSchedule';
export function formatDay(day, options = { month: 'short', day: 'numeric' }) {
  return new Intl.DateTimeFormat(undefined, { ...options, timeZone: 'UTC' }).format(new Date(`${day}T00:00:00Z`));
}

export function topicStatus(topic, today) {
  if (topic.completedAt !== null) return { label: 'Complete', tone: 'green' };
  if (!topic.nextReviewDay) return { label: 'New topic', tone: 'plum' };
  if (topic.nextReviewDay < today) return { label: 'Overdue', tone: 'orange' };
  if (topic.nextReviewDay === today) return { label: 'Due today', tone: 'orange' };
  return { label: `Due ${formatDay(topic.nextReviewDay)}`, tone: 'gold' };
}

export const reviewCount = reviewGaps.length;
export const plural = (count, word) => `${count} ${word}${count === 1 ? '' : 's'}`;
export const sessionTime = new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' });
