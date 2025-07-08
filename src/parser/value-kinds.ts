interface ValueKind {
    kind: string;
    val_re?: RegExp;
    key_re?: RegExp;
    examples: string[];
    description: string;
    generate?: (obj: any, pathKey: string[], m: Record<string, any>, seed: number) => [boolean, any];
}

let VALUE_KINDS: ValueKind[] = [
    {
        kind: 'datetime',
        val_re: /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})?$|^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}(\.\d+)?$/,
        examples: ['2023-12-25T14:30:00Z', '2023-12-25 14:30:00'],
        description: 'ISO datetime or datetime with space separator',
        generate: (obj: any, pathKey: string[], m: Record<string, any>, seed: number) => {
            return [true, (new Date(seed)).toISOString()];
        }
    },
    {
        kind: 'date',
        val_re: /^\d{4}-\d{2}-\d{2}$|^\d{2}\/\d{2}\/\d{4}$/,
        examples: ['2023-12-25', '12/25/2023'],
        description: 'Date in YYYY-MM-DD or MM/DD/YYYY format',
        generate: (obj: any, pathKey: string[], m: Record<string, any>, seed: number) => {
            return [true, (new Date(seed)).toISOString().slice(0, 10)];
        }
    },
    {
        kind: 'time',
        val_re: /^\d{2}:\d{2}:\d{2}(\.\d+)?$|^\d{2}:\d{2}$/,
        examples: ['14:30:00', '14:30'],
        description: 'Time in HH:MM:SS or HH:MM format',
        generate: (obj: any, pathKey: string[], m: Record<string, any>, seed: number) => {
            return [true, (new Date(seed)).toISOString().slice(11, 16)];
        }
    },
    {
        kind: 'monetary',
        val_re: /^\$[\d,]+(\.\d{2})?$|^[\d,]+(\.\d{2})?\s*USD$/,
        examples: ['$1,234.56', '1234.56 USD'],
        description: 'Currency amounts with dollar sign or USD suffix',
        generate: (obj: any, pathKey: string[], m: Record<string, any>, seed: number) => {
            return [true, `$${seed.toFixed(2)}`];
        }
    },
    {
        kind: 'pct',
        val_re: /^\d+(\.\d+)?%$/,
        examples: ['25%', '12.5%'],
        description: 'Percentage values with % symbol',
        generate: (obj: any, pathKey: string[], m: Record<string, any>, seed: number) => {
            return [true, `${seed.toFixed(2)}%`];
        }
    },
    {
        kind: 'phone',
        val_re: /^\+?[\d\s\-\(\)]{10,}$/,
        examples: ['+1-555-123-4567', '(555) 123-4567'],
        description: 'Phone numbers with various formatting',
        generate: (obj: any, pathKey: string[], m: Record<string, any>, seed: number) => {
            return [true, `+1-555-123-${seed.toString().padStart(3, '0')}`];
        }
    },
    {
        kind: 'email',
        val_re: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        examples: ['user@example.com', 'john.doe@company.org'],
        description: 'Email addresses',
        generate: (obj: any, pathKey: string[], m: Record<string, any>, seed: number) => {
            return [true, `user${seed}@example.com`];
        }
    },
    {
        kind: 'url',
        val_re: /^https?:\/\/.+|^www\..+/,
        examples: ['https://example.com', 'www.google.com'],
        description: 'URLs starting with http/https or www',
        generate: (obj: any, pathKey: string[], m: Record<string, any>, seed: number) => {
            return [true, `https://example.com/${seed}`];
        }
    },
    {
        kind: 'ip',
        val_re: /^(\d{1,3}\.){3}\d{1,3}$/,
        examples: ['192.168.1.1', '10.0.0.1'],
        description: 'IPv4 addresses',
        generate: (obj: any, pathKey: string[], m: Record<string, any>, seed: number) => {
            return [true, `192.168.1.${seed}`];
        }
    },
    {
        kind: 'mac',
        val_re: /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/,
        examples: ['00:1B:44:11:3A:B7', '00-1B-44-11-3A-B7'],
        description: 'MAC addresses with colon or dash separators',
        generate: (obj: any, pathKey: string[], m: Record<string, any>, seed: number) => {
            return [true, `00:1B:44:11:3A:B${seed.toString().padStart(2, '0')}`];
        }
    },
    {
        kind: 'uuid',
        val_re: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
        examples: ['550e8400-e29b-41d4-a716-446655440000'],
        description: 'UUID/GUID format',
        generate: (obj: any, pathKey: string[], m: Record<string, any>, seed: number) => {
            return [true, `550e8400-e29b-41d4-a716-446655${seed.toString().padStart(6, '0')}`];
        }
    },
    {
        kind: 'id',
        key_re: /^id$/,
        examples: ['emp-12345'],
        description: 'Primary key IDs based on key name',
        generate: (obj: any, pathKey: string[], m: Record<string, any>, seed: number) => {
            return [true, `id-${seed}`];
        }
    },
    {
        kind: 'secondary-id',
        key_re: /^(.+)Id$|^(.+)-id$/,
        examples: ['emp-12345'],
        description: 'Foreign key IDs based on key name',
        generate: (obj: any, pathKey: string[], m: Record<string, any>, seed: number) => {
            return [true, `emp-${seed}`];
        }
    },
    {
        kind: 'duration',
        val_re: /^\d+[dhms]$|^\d+:\d+:\d+$/,
        examples: ['2h30m', '1:30:45'],
        description: 'Duration in hours/minutes/seconds or time format',
        generate: (obj: any, pathKey: string[], m: Record<string, any>, seed: number) => {
            seed = Math.max(0, Math.min(seed, 24));
            return [true, `${seed}h${seed}m${seed}s`];
        }
    },
    {
        kind: 'latlon',
        val_re: /^-?\d+\.\d+,\s*-?\d+\.\d+$/,
        examples: ['40.7128, -74.0060', '51.5074, -0.1278'],
        description: 'Geographic coordinates (latitude, longitude)',
        generate: (obj: any, pathKey: string[], m: Record<string, any>, seed: number) => {
            seed = Math.max(-90, Math.min(seed, 90));
            return [true, `${seed}, ${seed}`];
        }
    },
    {
        kind: 'number',
        val_re: /^\d+(\.\d+)?$/,
        examples: ['123', '3.14159'],
        description: 'Numeric values (integers and decimals)',
        generate: (obj: any, pathKey: string[], m: Record<string, any>, seed: number) => {
            return [true, seed];
        }
    },
    {
        kind: 'boolean',
        val_re: /^(true|false|yes|no|1|0)$/i,
        examples: ['true', 'false', 'yes', 'no', '1', '0', 't', 'f', 'y', 'n'],
        description: 'Boolean values (true/false, yes/no, 1/0)',
        generate: (obj: any, pathKey: string[], m: Record<string, any>, seed: number) => {
            return [true, seed === 1];
        }
    },
    {
        kind: 'list',
        val_re: /^.*,.*$/,
        examples: ['apple,banana,orange', 'red,green,blue'],
        description: 'Comma-separated lists',
        generate: (obj: any, pathKey: string[], m: Record<string, any>, seed: number) => {
            return [true, `apple,banana,orange`];
        }
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

    const pathKeyStr = pathKey.join('.');

    // Check each kind in priority order
    for (const x of valueKinds) {
        const mv = x.val_re && x.val_re.exec(v)
        if (mv) {
            return x.kind;
        }

        const mk = x.key_re && x.key_re.exec(pathKeyStr)
        if (mk) {
            return x.kind;
        }
    }

    return typeof v;
}

/**
 * Returns the target field name for a secondary key, e.g. 'reportToEmpId' -> 'emp'
 */
export function secondaryKeyTarget(fieldName: string): string | null {
    let a = splitSnakeCase(fieldName);
    if (a.length > 1) {
        return a[a.length - 2];
    }

    a = splitCamelCase(fieldName);
    if (a.length > 1) {
        return a[a.length - 2];
    }

    return null;
}

/**
 * Splits a snake case string into an array of words
 * @param s - The snake case string to split, e.g. 'emp_id' -> ['emp', 'id']
 * @returns An array of words
 */
export function splitSnakeCase(s: string): string[] {
    return s.split('_');
}

/**
 * Splits a camel case string into an array of words
 * @param s - The camel case string to split, e.g. 'empId' -> ['emp', 'id']
 * @returns An array of words
 */
export function splitCamelCase(s: string): string[] {
    return s.split(/(?=[A-Z])/).map(x => x.toLowerCase());
}

// Export the kind definitions for potential use elsewhere
export { VALUE_KINDS };
