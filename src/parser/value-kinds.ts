/**
 * Analyzes a string value to determine its semantic type/kind
 * @param obj - The parent object containing the value
 * @param pathKey - The path to the value in the object
 * @param m - Metadata object for storing analysis results
 * @param v - The string value to analyze
 * @returns A string representing the kind/type of the value
 */
export function analyzeValueKind(obj: any, pathKey: string[], m: Record<string, any>, v: string): string {
    // If it looks like a datetime, return 'datetime'
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})?$/.test(v) ||
        /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}(\.\d+)?$/.test(v)) {
        return 'datetime';
    }

    // If it looks like a date, return 'date'
    if (/^\d{4}-\d{2}-\d{2}$/.test(v) || /^\d{2}\/\d{2}\/\d{4}$/.test(v)) {
        return 'date';
    }

    // If it looks like a time, return 'time'
    if (/^\d{2}:\d{2}:\d{2}(\.\d+)?$/.test(v) || /^\d{2}:\d{2}$/.test(v)) {
        return 'time';
    }

    // If it looks like a currency, return 'currency'
    if (/^\$[\d,]+(\.\d{2})?$/.test(v) || /^[\d,]+(\.\d{2})?\s*USD$/.test(v)) {
        return 'currency';
    }

    // If it looks like a percentage, return 'percentage'
    if (/^\d+(\.\d+)?%$/.test(v)) {
        return 'percentage';
    }

    // If it looks like a phone number, return 'phone'
    if (/^\+?[\d\s\-\(\)]{10,}$/.test(v) && /[\d]{10,}/.test(v.replace(/[\s\-\(\)]/g, ''))) {
        return 'phone';
    }

    // If it looks like an email, return 'email'
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) {
        return 'email';
    }

    // If it looks like a URL, return 'url'
    if (/^https?:\/\/.+/.test(v) || /^www\..+/.test(v)) {
        return 'url';
    }

    // If it looks like an IP address, return 'ip'
    if (/^(\d{1,3}\.){3}\d{1,3}$/.test(v)) {
        return 'ip';
    }

    // If it looks like a MAC address, return 'mac'
    if (/^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/.test(v)) {
        return 'mac';
    }

    // If it looks like a UUID, return 'uuid'
    if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v)) {
        return 'uuid';
    }

    // If it looks like a number, return 'number'
    if (/^\d+(\.\d+)?$/.test(v)) {
        return 'number';
    }

    // If it looks like a boolean, return 'boolean'
    if (/^(true|false|yes|no|1|0)$/i.test(v)) {
        return 'boolean';
    }

    // If it looks like a list (comma-separated), return 'list'
    if (v.includes(',') && v.split(',').length > 1) {
        return 'list';
    }

    // If it looks like a duration, return 'duration'
    if (/^\d+[dhms]$/.test(v) || /^\d+:\d+:\d+$/.test(v)) {
        return 'duration';
    }

    // If it looks like a location (coordinates), return 'location'
    if (/^-?\d+\.\d+,\s*-?\d+\.\d+$/.test(v)) {
        return 'location';
    }

    // If it looks like an employee ID, return 'emp'
    if (/^emp-\d+$/i.test(v) || /^employee-\d+$/i.test(v)) {
        return 'emp';
    }

    // If it looks like an object ID, return 'id'
    if (/^[a-f0-9]{24}$/i.test(v) || /^id-\d+$/i.test(v)) {
        return 'id';
    }

    // If it looks like a string, return 'string'
    if (typeof v === 'string' && v.length > 0) {
        return 'string';
    }

    // Default fallback
    return 'unknown';
}