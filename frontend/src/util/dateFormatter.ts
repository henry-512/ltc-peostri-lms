/**
* @file Date formatting methods.
* @module DateFormatter
* @category Utilities
* @author Braden Cariaga
*/

/**
 * It takes a date string or date object and returns a formatted date string.
 * @param {string | Date} dateString - string | Date - The date you want to format
 * @param {boolean} [words] - boolean - If true, the date will be returned in words, e.g. "1st January
 * 2020 at 12:00"
 * @returns A string
 */
export const dateFormatToString = (dateString: string | Date, words?: boolean) => {
    const date = new Date(dateString);

    const dateOptions: Intl.DateTimeFormatOptions = { hour12: false, weekday: undefined, year: 'numeric', month: 'numeric', day: 'numeric', hour: undefined, minute: undefined, second: undefined  };

    if (words) return `${date.toLocaleDateString('en-GB', dateOptions)} at ${date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: undefined })}`;

    return `${date.toLocaleDateString('en-GB', dateOptions)}`
}

/* A constant that is used to format the date. */
export const dateOptions = { hour12: false, weekday: undefined, year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', second: undefined  }

const dateFormatRegex = /^\d{4}-\d{2}-\d{2}$/;
const dateParseRegex = /(\d{4})-(\d{2})-(\d{2})/;

export const convertDateToString = (value: Date) => {
    // value is a `Date` object
    if (!(value instanceof Date) || isNaN(value.getDate())) return '';
    const pad = '00';
    const yyyy = value.getFullYear().toString();
    const MM = (value.getMonth() + 1).toString();
    const dd = value.getDate().toString();
    return `${yyyy}-${(pad + MM).slice(-2)}-${(pad + dd).slice(-2)}`;
};

export const dateFormatter = (value: string | Date | null) => {
    // null, undefined and empty string values should not go through dateFormatter
    // otherwise, it returns undefined and will make the input an uncontrolled one.
    if (value == null || value === '') return '';
    if (value instanceof Date) return convertDateToString(value);
    // Valid dates should not be converted
    if (dateFormatRegex.test(value)) return value;

    return convertDateToString(new Date(value));
};

export const dateParser = (value: string) => {
    //value is a string of "YYYY-MM-DD" format
    const match = dateParseRegex.exec(value);
    if (match === null) return;
    const d = new Date(parseInt(match[1]), parseInt(match[2], 10) - 1, parseInt(match[3]));
    if (isNaN(d.getDate())) return;
    return d;
};