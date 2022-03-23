let debugRankId = 'ranks/0123456789012345678900'
let debugRankKey = '0123456789012345678900'

let debugUserId = 'users/0123456789012345678900'
let debugUserKey = '0123456789012345678900'

let authUserName = 'john-doe'
let authPassword = 'password'

function processStructure(d) {
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

// console.log(module.exports.GET_SUCCESS.type)
module.exports = {
    processStructure,

    debugRankId,
    debugRankKey,
    debugUserId,
    debugUserKey,
    authUserName,
    authPassword,
}
