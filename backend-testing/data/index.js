import { expect } from 'chai'

export const debugRankId = 'ranks/0123456789012345678900'
export const debugRankKey = '0123456789012345678900'

export const debugUserId = 'users/0123456789012345678900'
export const debugUserKey = '0123456789012345678900'

export const authUserName = 'john-doe'
export const authPassword = 'password'

function processStructure(d) {
    const def = d.default
    addDefaults(d.acceptPost, def)
    addDefaults(d.failPost, def)
    addGetFields(d)
}

function addDefaults(cases, def) {
    for (const _case of cases) {
        let data = _case.d
        if ('_CUSTOM' in data) {
            continue
        }
        for (const [k,v] of Object.entries(def)) {
            if (k in data) {
                if (v === undefined) {
                    delete k[v]
                }
                continue
            }
            data[k] = v
        }
        delete data._DEFAULT
    }
}

function addGetFields(d) {
    let gaR = []
    let gaI = []

    let giR = []
    let giI = []

    for (const [k, data] of Object.entries(d.structure)) {
        if (data.hideGetId) {
            giI = giI.concat(k)
        } else if (!data.optional && !data.default) {
            giR = giR.concat(k)
        }
        if (data.hideGetAll) {
            gaI = gaI.concat(k)
        } else if (!data.optional && data.default) {
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
}

// Checks required and invalid fields for the passed object
export function checkFields(schema, obj) {
    expect(obj).an('object')
    expect(obj).include.all.keys(schema.required)
    expect(obj).not.any.keys(schema.invalid)
}

export async function imp(n) {
    let data = (await import(`./${n}.js`)).default
    processStructure(data)
    return data
}
