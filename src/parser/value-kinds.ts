interface ValueKind {
    kind: string;
    pattern: RegExp;
    examples: string[];
    description: string;
}

const VALUE_KINDS: ValueKind[] = [
    {
        kind: 'datetime',
        pattern: /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})?$|^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}(\.\d+)?$/,
        examples: ['2023-12-25T14:30:00Z', '2023-12-25 14:30:00'],
        description: 'ISO datetime or datetime with space separator'
    },
    {
        kind: 'date',
        pattern: /^\d{4}-\d{2}-\d{2}$|^\d{2}\/\d{2}\/\d{4}$/,
        examples: ['2023-12-25', '12/25/2023'],
        description: 'Date in YYYY-MM-DD or MM/DD/YYYY format'
    },
    {
        kind: 'time',
        pattern: /^\d{2}:\d{2}:\d{2}(\.\d+)?$|^\d{2}:\d{2}$/,
        examples: ['14:30:00', '14:30'],
        description: 'Time in HH:MM:SS or HH:MM format'
    },
    {
        kind: 'currency',
        pattern: /^\$[\d,]+(\.\d{2})?$|^[\d,]+(\.\d{2})?\s*USD$/,
        examples: ['$1,234.56', '1234.56 USD'],
        description: 'Currency amounts with dollar sign or USD suffix'
    },
    {
        kind: 'percentage',
        pattern: /^\d+(\.\d+)?%$/,
        examples: ['25%', '12.5%'],
        description: 'Percentage values with % symbol'
    },
    {
        kind: 'phone',
        pattern: /^\+?[\d\s\-\(\)]{10,}$/,
        examples: ['+1-555-123-4567', '(555) 123-4567'],
        description: 'Phone numbers with various formatting'
    },
    {
        kind: 'email',
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        examples: ['user@example.com', 'john.doe@company.org'],
        description: 'Email addresses'
    },
    {
        kind: 'url',
        pattern: /^https?:\/\/.+|^www\..+/,
        examples: ['https://example.com', 'www.google.com'],
        description: 'URLs starting with http/https or www'
    },
    {
        kind: 'ip',
        pattern: /^(\d{1,3}\.){3}\d{1,3}$/,
        examples: ['192.168.1.1', '10.0.0.1'],
        description: 'IPv4 addresses'
    },
    {
        kind: 'mac',
        pattern: /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/,
        examples: ['00:1B:44:11:3A:B7', '00-1B-44-11-3A-B7'],
        description: 'MAC addresses with colon or dash separators'
    },
    {
        kind: 'uuid',
        pattern: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
        examples: ['550e8400-e29b-41d4-a716-446655440000'],
        description: 'UUID/GUID format'
    },
    {
        kind: 'emp',
        pattern: /^emp-\d+$|^employee-\d+$/i,
        examples: ['emp-12345', 'employee-67890'],
        description: 'Employee IDs with emp- or employee- prefix'
    },
    {
        kind: 'id',
        pattern: /^[a-f0-9]{24}$|^id-\d+$/i,
        examples: ['507f1f77bcf86cd799439011', 'id-12345'],
        description: 'Object IDs (MongoDB-style) or generic IDs'
    },
    {
        kind: 'duration',
        pattern: /^\d+[dhms]$|^\d+:\d+:\d+$/,
        examples: ['2h30m', '1:30:45'],
        description: 'Duration in hours/minutes/seconds or time format'
    },
    {
        kind: 'location',
        pattern: /^-?\d+\.\d+,\s*-?\d+\.\d+$/,
        examples: ['40.7128, -74.0060', '51.5074, -0.1278'],
        description: 'Geographic coordinates (latitude, longitude)'
    },
    {
        kind: 'number',
        pattern: /^\d+(\.\d+)?$/,
        examples: ['123', '3.14159'],
        description: 'Numeric values (integers and decimals)'
    },
    {
        kind: 'boolean',
        pattern: /^(true|false|yes|no|1|0)$/i,
        examples: ['true', 'false', 'yes', 'no', '1', '0'],
        description: 'Boolean values (true/false, yes/no, 1/0)'
    },
    {
        kind: 'list',
        pattern: /^.*,.*$/,
        examples: ['apple,banana,orange', 'red,green,blue'],
        description: 'Comma-separated lists'
    }
];

/**
 * Analyzes a string value to determine its semantic type/kind
 * @param obj - The parent object containing the value
 * @param pathKey - The path to the value in the object
 * @param m - Metadata object for storing analysis results
 * @param v - The string value to analyze
 * @returns A string representing the kind/type of the value
 */
export function analyzeValueKind(obj: any, pathKey: string[], m: Record<string, any>, v: string, valueKinds?: ValueKind[]): string {
    valueKinds ||= VALUE_KINDS;

    // Check each kind in priority order
    for (const kindDef of valueKinds) {
        if (kindDef.pattern.test(v)) {
            return kindDef.kind;
        }
    }

    // If it looks like a string, return 'string'
    if (typeof v === 'string' && v.length > 0) {
        return 'string';
    }

    // Default fallback
    return 'unknown';
}

// Export the kind definitions for potential use elsewhere
export { VALUE_KINDS };
