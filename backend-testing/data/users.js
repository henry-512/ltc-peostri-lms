import { debugRankId, debugRankKey, debugUserId } from './index.js'

export default {
    structure: {
        firstName: { type: 'string' },
        lastName: { type: 'string' },
        avatar: { type: 'string' },
        rank: {
            type: 'fkey',
            getIdKeepAsRef: true,
        },
        status: {
            type: 'string',
            default: 'ACTIVE',
        },
        email: {
            type: 'string',
            optional: true,
        },
        // Auth data
        username: {
            type: 'string',
            hideGetRef: true,
        },
        password: {
            type: 'string',
            hideGetAll: true,
            hideGetId: true,
            hideGetRef: true,
        },
        firstVisited: {
            type: 'string',
            optional: true,
        },
        lastVisited: {
            type: 'string',
            optional: true,
        },
    },
    default: {
        firstName: 'John',
        lastName: 'Doe',
        avatar: 'https://pbs.twimg.com/profile_images/1377833767012859906/QxnHcMnA_400x400.png',
        rank: debugRankId,
        username: 'some-username',
        password: 'password',
    },
    acceptPost: [
        {
            n: 'Base case',
            d: {},
        },
        {
            n: 'Passed ID',
            d: {
                id: 'id-insertion',
            },
        },
        {
            n: 'Valid key, not an ID',
            d: {
                rank: debugRankKey,
            },
        },
        {
            n: 'Passed status',
            d: {
                status: 'LOCKED',
            },
        },
    ],
    failPost: [
        {
            n: 'Fully-formed rank',
            d: {
                rank: {
                    name: "Jason's super-cool rank",
                    permissions: {
                        perm1: true,
                        perm2: true,
                        perm3: true,
                    },
                },
            },
        },
        {
            n: 'Missing last name',
            d: {
                lastName: undefined,
            },
        },
        {
            n: 'Additional field',
            d: {
                'super-cool-hackerinos': '; DROP TABLE USERS',
            },
        },
        {
            n: 'Incorrect type',
            d: {
                firstName: { firstName: 'Jackson' },
            },
        },
        {
            n: 'Valid foreign id, but not a rank',
            d: {
                rank: debugUserId,
            },
        },
        {
            n: 'Empty string key',
            d: {
                rank: '',
            },
        },
        {
            n: 'Invalid key',
            d: {
                rank: '//:)',
            },
        },
        {
            n: 'Missing password',
            d: {
                password: undefined,
            },
        },
    ],
}
