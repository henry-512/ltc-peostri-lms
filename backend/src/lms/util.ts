import { aql, GeneratedAqlQuery } from 'arangojs/aql'
import { parse, v4 } from 'uuid'
import { IFileData } from '../api/v1/data/filemeta'
import { config } from '../config'
import { APIError, HTTPStatus } from './errors'

// RFC4648 Chapter 5 standard: URL/file-safe base64 encoding lookup string
const b64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_'

/**
 * Generates a v4 (randomly generated) UUID, converted into a 22-character long
 * "base64" format ([A-Z][a-z][0-9]-_).
 *
 * @returns A string that passes the regex /^[A-D][\w\-]{21}$/
 */
export function generateBase64UUID(): string {
    // Generate UUID v4
    // `bytes` is a 16 length byte array
    const bytes = parse(v4())

    // Compress from 36 bytes to 22 characters "base64" "conversion" (doesn't
    // actually convert into base64)
    let key = ''
    for (let it = 0; it < 15; it += 3) {
        let rem = 0
        for (let i = 0; i < 3; i++) {
            let byte = bytes[it + i]
            // Append the lowest 2 bits to rem
            rem = (rem << 2) | (byte & 3)
            // Rightshift byte
            // Range [127,0] -> [63,0]
            byte = byte >> 2
            // Get "base64" character from lookup string
            key = key.concat(b64.charAt(byte))
        }
        // Append the remaining 6 bits
        key = key.concat(b64.charAt(rem))
    }
    // move last character to start, so index 0 can only be A-D
    // 1 byte is left remaining
    return b64.charAt(bytes[15] >> 6).concat(key, b64.charAt(bytes[15] & 63))
}

/**
 * Uses the `generateBase64UUID` function generate an `ID` for the passed
 * collection name.
 *
 * @param name The collection name
 * @return An unique UUID-based `ID` associated the collection
 */
export function generateDBID(name: string) {
    return `${name}/${generateBase64UUID()}`
}

/**
 * Converts a key to an id associated with the passed name DOES NOT CHECK IF
 * `key` IS VALID.
 *
 * @param key The key to convert
 * @param name The collection name
 * @return An ID
 */
export function keyToId(key: string, name: string) {
    return `${name}/${key}`
}

/**
 * Converts a passed string to a `key`
 *
 * @param str a string
 * @returns A `key` representation of the string
 * @throws INTERNAL if the string is not an `ID` or `KEY`
 */
export function convertToKey(str: string) {
    if (isDBKey(str)) {
        return str
    } else if (isDBId(str)) {
        return splitId(str).key
    } else {
        throw new APIError(
            'util',
            'convertToKey',
            HTTPStatus.INTERNAL_SERVER_ERROR,
            'Invalid system status',
            `${str} is not a valid key or id`
        )
    }
}

/**
 * Strips the key and collection from the passed id.
 *
 * @param id A valid database id
 * @return col: The collection name, key: the key
 */
export function splitId(id: string) {
    let splice = id.split('/')
    return {
        col: splice[0],
        key: splice[1],
    }
}

// Collection names are alphabetic character names
// DB keys are url/filename-safe base64, alphanumeric with - and _
const idRegex = /^([a-z]|[A-Z])+\/[\w\-]+$/
const keyRegex = /^[\w\-]+$/

/**
 * Returns true if the passed string looks like a database id. DOES NOT CHECK IF
 * STR IS VALID REFERENCE.
 *
 * @param str A string
 * @return True if str looks like [name/key]
 */
export function isDBId(str: string): boolean {
    return idRegex.test(str)
}

/**
 * Returns true if the passed string looks like a database key. DOES NOT CHECK
 * IF STR IS VALID REFERENCE.
 *
 * @param str A string
 * @return True if str looks like [key]
 */
export function isDBKey(str: string): boolean {
    return keyRegex.test(str)
}

/**
 * Makes an AQL query representing a return field of the form
 * [key1:z.key1,key2:z.key2, ...] and appends it to the passed AQL query.
 *
 * @param q The AQL query to append to
 * @param fields An array of string keys
 * @return A new AQL query
 */
export function appendReturnFields(q: GeneratedAqlQuery, fields: string[]) {
    fields.forEach((s) => {
        q = aql`${q}${s}:z.${s},`
    })
    return q
}

/**
 * "Pointer". obj[key]
 *
 * @typeParam T The value of T
 */
export interface PTR<T> {
    /** The valid key of the object */
    key: string | number | symbol
    /** An object */
    obj: T
}

/**
 * JSON.stringify wrapper that doesn't stringify classes. Primarily used to
 * print IFieldData.
 *
 * @param obj An object to stringify
 * @return A string representation of the object
 */
export function str(obj: any) {
    return JSON.stringify(obj, (k, v) =>
        k && v && typeof v === 'number' ? v : v.className ?? v + ''
    )
}

/**
 * Returns a file from the passed file array from it's key.
 *
 * @param files An object of file data
 * @param fileKey The key into `files` to return
 * @returns The file referenced by the `fileKey`
 * @throws BAD_REQUEST if `fileKey` does not exist in `files`
 */
export function getFile(files: any, fileKey: string): IFileData {
    let file: IFileData = files[fileKey]
    if (file) {
        return file
    }
    throw new APIError(
        'util',
        'getFile',
        HTTPStatus.BAD_REQUEST,
        'File missing.',
        `File with id ${fileKey} is missing in files.`
    )
}

/**
 * Returns a file from the passed array. Does not throw errors.
 *
 * @param files An object of file data
 * @param fileKey The key into `files` to return
 * @returns The file referenced by the `fileKey` or `undefined` if the key does
 * not exist
 */
export function tryGetFile(files: any, fileKey: string): IFileData | undefined {
    return files[fileKey]
}

/**
 * Appends `path` to the base API url. Used for generating specific resource
 * URLs.
 *
 * @param path The url path to append to the base API url
 * @return A backend URL
 */
export function getUrl(path: string) {
    return `http://${config.hostname}/api/v1/${path}`
}

/**
 * Given a map of arrays, either concats the passed value or sets a new array
 * for the passed key.
 *
 * @typeParam K The type of `key`
 * @typeParam V The type of `value`
 * @param map A map of arrays
 * @param key The map key
 * @param value The value to append to the mapped array
 */
export function concatOrSetMapArray<K, V>(map: Map<K, V[]>, key: K, value: V) {
    let ar = map.get(key)
    map.set(key, ar ? ar.concat(value) : [value])
}

/**
 * Wraps JSON.parse to return `undefined` instead of throwing an error.
 *
 * @param str A string to parse
 * @return An object representation of the string or `undefined` if the string
 * could not be parsed.
 */
export function tryParseJSON(str: string): any {
    // If json is already an object, don't convert it
    if (typeof str === 'object') {
        return str
    }

    try {
        let obj = JSON.parse(str)
        if (obj && typeof obj === 'object') {
            return obj
        }
    } catch (e) {
        return undefined
    }
}

/**
 * Create a new Date incremented by a certain number of days.
 *
 * @param date The base date
 * @param days The number of days to add
 * @return A new date object
 */
export function addDays(date: Date, days: number) {
    let d = new Date(date)
    d.setDate(d.getDate() + days)
    return d
}
