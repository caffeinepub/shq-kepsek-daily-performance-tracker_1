import type { Time } from '../backend';

export function formatDate(time: Time): string {
  const date = new Date(Number(time) / 1_000_000);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatTime(time: Time): string {
  const date = new Date(Number(time) / 1_000_000);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function timeToNanoseconds(timeString: string): Time {
  const [hours, minutes] = timeString.split(':').map(Number);
  const now = new Date();
  now.setHours(hours, minutes, 0, 0);
  return BigInt(now.getTime() * 1_000_000);
}
