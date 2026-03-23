import { format, formatDistanceToNow, isValid } from 'date-fns';

/**
 * Safely parses a potentially naive UTC timestamp string from the backend into a Date object.
 */
const parseUTCDate = (dateString) => {
    if (!dateString) return null;
    let ds = dateString;
    // If it's a naive string from sqlite (no Z and no offset), append Z to force UTC parsing
    if (typeof ds === 'string' && !ds.endsWith('Z') && !ds.includes('+')) {
        ds += 'Z';
    }
    const date = new Date(ds);
    return isValid(date) ? date : null;
};

export const formatDateSafe = (dateString, formatStr) => {
    const date = parseUTCDate(dateString);
    if (!date) return 'N/A';

    // Format the date forcing IST (UTC+5:30) timezone representation if the environment supports it
    // Alternatively, just let the browser handle local time if the user is in India.
    // However, to FORCE Indian time globally:

    const utcTime = date.getTime();
    const istOffset = 5.5 * 60 * 60 * 1000;
    const localOffset = new Date().getTimezoneOffset() * 60 * 1000;

    // Create a counterfeit Date object that, when formatted by date-fns (which uses local time),
    // will output the correct numbers for IST.
    const istDate = new Date(utcTime + localOffset + istOffset);

    return format(istDate, formatStr);
};

export const formatDistanceSafe = (dateString) => {
    const targetDate = parseUTCDate(dateString);
    if (!targetDate) return '';

    // For calculating relative differences (like "in 2 hours"), we don't need to offset 
    // the display time, because a duration in UTC is the exact same duration in IST.
    // We just need to make sure we parse the targetDate as UTC correctly against Date.now()

    return formatDistanceToNow(targetDate, { addSuffix: true });
};
