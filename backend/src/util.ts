import { v4, parse } from 'uuid';

// RFC4648 Chapter 5 standard: URL/file-safe base64 encoding lookup string
const b64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_'

/**
 * Generates a v4 UUID (randomly generated), converted
 * into a 21-character long "b64" format ([A-Z][a-z][0-9]-_)
 */
export function generateDBKey() {
    // Generate UUID v4
    // bytes is a 16 length byte array
    const bytes = parse(v4())

    // Compress from 36 bytes to 21
    // "base64" "conversion" (doesnt actually
    //   convert into base64)
    var key = ''
    for (var it = 0; it < 15; it+=3) {
        var rem = 0
        for (var i = 0; i < 3; i++) {
            var byte = bytes[it+i]
            // Append the lowest 2 bits to rem
            rem = (rem << 2) | (byte & 3)
            // Rightshift byte
            // Range [127,0] -> [63,0]
            var byte = byte >> 2
            // Get "base64" character from lookup string
            key = key.concat(b64.charAt(byte))
        }
        // Append the remaining 6 bits
        key = key.concat(b64.charAt(rem))
    }
    // 1 byte is left remaining
    key = key.concat(b64.charAt(bytes[16] & 63), b64.charAt(bytes[16] >> 6))

    return key
}
