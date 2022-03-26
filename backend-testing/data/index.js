export const debugRankId = 'ranks/0123456789012345678900'
export const debugRankKey = '0123456789012345678900'

export const debugUserId = 'users/0123456789012345678900'
export const debugUserKey = '0123456789012345678900'

export const authUserName = 'john-doe'
export const authPassword = 'password'

export function processStructure(d) {
    let gaR = []
    let gaI = []

    let giR = []
    let giI = []

    for (const [k, data] of Object.entries(d.structure)) {
        if (data.hideGetId) {
            giI = giI.concat(k)
        } else if (!data.optional) {
            giR = giR.concat(k)
        }
        if (data.hideGetAll) {
            gaI = gaI.concat(k)
        } else if (!data.optional) {
            gaR = gaR.concat(k)
        }
    }

    d.getAll = {
        required: gaR,
        invalid: gaI,
    }

    d.getId = {
        required: giR,
        invalid: giI,
    }

    return d
}
