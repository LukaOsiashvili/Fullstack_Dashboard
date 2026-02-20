// src/utils/dateUtils.js

import dayjs from './dayjs';

/**
 * Get compact relative time string
 * "just now", "5m ago", "3h ago", "2d ago", "1mo ago", "1y ago"
 */
export const getRelativeTime = (date) => {
    if (!date) return 'Never';
    return dayjs(date).fromNow();
};

/**
 * Get smart relative time with more context
 * Shows "just now" / "5m ago" for today
 * Shows "Yesterday at 3:45 PM" for yesterday
 * Shows "Mon at 2:30 PM" for this week
 * Shows "Jan 15 at 2:30 PM" for older
 */
export const getSmartTime = (date) => {
    if (!date) return 'Never';

    const d = dayjs(date);
    const now = dayjs();
    const diffMinutes = now.diff(d, 'minute');
    const diffHours = now.diff(d, 'hour');

    // Less than 1 minute
    if (diffMinutes < 1) return 'Just now';

    // Less than 1 hour — show minutes
    if (diffMinutes < 60) return `${diffMinutes}m ago`;

    // Less than 24 hours — show hours
    if (diffHours < 24) return `${diffHours}h ago`;

    // Yesterday
    if (d.isYesterday()) return `Yesterday, ${d.format('h:mm A')}`;

    // This week (within 7 days)
    if (now.diff(d, 'day') < 7) return d.format('ddd, h:mm A');

    // This year
    if (d.year() === now.year()) return d.format('MMM D, h:mm A');

    // Older
    return d.format('MMM D, YYYY');
};

/**
 * Format date in standard display format
 * "Jan 15, 2025"
 */
export const formatDate = (date) => {
    if (!date) return '—';
    return dayjs(date).format('MMM D, YYYY');
};

/**
 * Format date with time
 * "Jan 15, 2025 at 3:45 PM"
 */
export const formatDateTime = (date) => {
    if (!date) return '—';
    return dayjs(date).format('MMM D, YYYY [at] h:mm A');
};

/**
 * Format date of birth with full detail
 * "March 15, 1995"
 */
export const formatDob = (date) => {
    if (!date) return '—';
    return dayjs(date).format('MMMM D, YYYY');
};

/**
 * Calculate age from date of birth
 */
export const getAge = (dob) => {
    if (!dob) return '—';
    return dayjs().diff(dayjs(dob), 'year');
};

/**
 * Get account age as a readable duration
 * "2y 3mo", "5mo", "12d"
 */
export const getAccountAge = (createdAt) => {
    if (!createdAt) return '—';

    const created = dayjs(createdAt);
    const now = dayjs();
    const years = now.diff(created, 'year');
    const months = now.diff(created, 'month') % 12;
    const days = now.diff(created, 'day');

    if (years > 0) return `${years}y ${months}mo`;
    if (months > 0) return `${months}mo ${days % 30}d`;
    if (days > 0) return `${days}d`;
    return 'Today';
};

/**
 * Check if a login timestamp is "recent" (within last 24 hours)
 */
export const isRecentLogin = (date) => {
    if (!date) return false;
    return dayjs().diff(dayjs(date), 'hour') < 24;
};

/**
 * Check if a login is "online-ish" (within last 15 minutes)
 */
export const isOnline = (date) => {
    if (!date) return false;
    return dayjs().diff(dayjs(date), 'minute') < 15;
};

/**
 * Check if user was created within the last N days
 */
export const isNewUser = (createdAt, withinDays = 30) => {
    if (!createdAt) return false;
    return dayjs(createdAt).isBetween(dayjs().subtract(withinDays, 'day'), dayjs());
};

/**
 * Get the day of week from a date
 * "Monday"
 */
export const getDayOfWeek = (date) => {
    if (!date) return '—';
    return dayjs(date).format('dddd');
};

/**
 * Format for tooltip — full verbose format
 * "Wednesday, January 15, 2025, at 3:45:30 PM"
 */
export const formatVerbose = (date) => {
    if (!date) return 'No date available';
    return dayjs(date).format('dddd, MMMM D, YYYY [at] h:mm:ss A');
};