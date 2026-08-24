export type DateFormat = 'YYYY-MM' | 'YYYY-MMM' | 'YYYY-MM-DD' | 'YYYY-Mon-DD';

export const formatDate = (dateString: string | null | undefined, format: DateFormat = 'YYYY-MM'): string => {
    if (!dateString) return '';
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;

    const year = d.getUTCFullYear();
    const month = String(d.getUTCMonth() + 1).padStart(2, '0');
    const day = String(d.getUTCDate()).padStart(2, '0');
    const shortMonth = d.toLocaleString('default', { month: 'short' });

    switch (format) {
        case 'YYYY-MMM':
            return `${year}-${shortMonth}`;
        case 'YYYY-MM-DD':
            return `${year}-${month}-${day}`;
        case 'YYYY-Mon-DD':
            return `${year}-${shortMonth}-${day}`;
        case 'YYYY-MM':
        default:
            return `${year}-${month}`;
    }
};

export const isFutureDate = (dateString: string | null | undefined): boolean => {
    if (!dateString) return false;
    const d = new Date(dateString);
    return !isNaN(d.getTime()) && d > new Date();
};
