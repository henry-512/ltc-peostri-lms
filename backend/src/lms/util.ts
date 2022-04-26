import { aql, GeneratedAqlQuery } from 'arangojs/aql'
import { config } from '../config'
import { parse, v4 } from 'uuid'
import { IFileData } from '../api/v1/data/filemeta'
import { APIError, HTTPStatus } from './errors'

// RFC4648 Chapter 5 standard: URL/file-safe base64 encoding lookup string
const b64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_'

/**
 * Generates a v4 (randomly generated) UUID, converted
 * into a 22-character long "base64" format ([A-Z][a-z][0-9]-_)
 */
export function generateBase64UUID(): string {
    // Generate UUID v4
    // bytes is a 16 length byte array
    const bytes = parse(v4())

    // Compress from 36 bytes to 22
    // "base64" "conversion" (doesnt actually convert into base64)
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

export function generateDBID(name: string) {
    return `${name}/${generateBase64UUID()}`
}

/**
 * Converts a key to an id associated with the passed ApiRoute.
 * DOES NOT CHECK IF KEY IS A VALID KEY.
 * @param key The key to convert
 * @return An ID
 */
export function keyToId(key: string, name: string) {
    return `${name}/${key}`
}

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
const idRegex = /^([a-z]|[A-Z])+\/([0-9]|[a-z]|[A-Z]|-|_)+$/
const keyRegex = /^([0-9]|[a-z]|[A-Z]|-|_)+$/

/**
 * Returns true if the passed string looks like a database id.
 * DOES NOT CHECK IF STR IS VALID REFERENCE.
 * @param str A string
 * @return True if str looks like [name/key]
 */
export function isDBId(str: string): boolean {
    return idRegex.test(str)
}

/**
 * Returns true if the passed string looks like a database key.
 * DOES NOT CHECK IF STR IS VALID REFERENCE.
 * @param str A string
 * @return True if str looks like [key]
 */
export function isDBKey(str: string): boolean {
    return keyRegex.test(str)
}

/**
 * Makes an AQL query representing a return field of the form
 * [key1:z.key1,key2:z.key2, ...]
 * and appends it to the passed AQL query.
 * @param q The AQL query to append to
 * @param fields An array of string keys
 * @return A new AQL query
 */
export function appendReturnFields(q: GeneratedAqlQuery, fields: string[]) {
    fields.forEach((s, i) => {
        q = aql`${q}${s}:z.${s},`
    })
    return q
}

/**
 * "Pointer". obj[key]
 */
export interface PTR<T> {
    key: string | number | symbol
    obj: T
}

export const str = (obj: any) =>
    JSON.stringify(obj, function (k, v) {
        return k && v && typeof v !== 'number' ? '' + v : v
    })

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

export function tryGetFile(files: any, fileKey: string): IFileData | undefined {
    return files[fileKey]
}

export function getUrl(path: string) {
    return `http://${config.hostname}:${config.apiPort}/api/v1/${path}`
}

export function concatOrSetMapArray<Key, Value>(
    map: Map<Key, Value[]>,
    key: Key,
    value: Value
) {
    let ar = map.get(key)
    map.set(key, ar ? ar.concat(value) : [value])
}

export function tryParseJSON(json: string): any {
    // If json is already an object, don't convert it
    if (typeof json === 'object') {
        return json
    }

    try {
        let o = JSON.parse(json)
        if (o && typeof o === 'object') {
            return o
        }
    } catch (e) {
        return undefined
    }
}

export function addDays(date: Date, days: number) {
    let d = new Date(date)
    d.setDate(d.getDate() + days)
    return d
}
