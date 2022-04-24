/**
* @file Unique ID Generator
* @module generateBase64UUID
* @category Utilities
* @author Braden Cariaga
*/

// @ts-ignore
import { v4, parse } from 'uuid';

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
