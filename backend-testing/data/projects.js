import { debugUserId } from './index.js'

export default {
    structure: {
        title: { type: 'string' },
        start: { type: 'string' },
        status: {
            type: 'string',
            default: 'AWAITING',
        },
        comments: {
            type: 'array',
            instance: 'fkey',
            default: [],
            freeable: true,
            acceptNewDoc: true,
        },
        suspense: {
            type: 'string',
            optional: true,
        },
        modules: {
            type: 'step',
            instance: 'fkey',
            freeable: true,
            acceptNewDoc: true,
        },
        users: {
            type: 'array',
            instance: 'fkey',
            default: [],
            getIdKeepAsRef: true,
        },
        ttc: {
            type: 'number',
            optional: true,
            hideGetAll: true,
        },
        createdAt: { type: 'string' },
        updatedAt: { type: 'string' },
    },
    default: {
        title: 'Project',
        start: '2022-11-11',
        users: [debugUserId],
        modules: {
            'key-0': [
                {
                    title: 'Module 0-0',
                    tasks: {
                        'key-0': [
                            {
                                title: 'Task 0-0-0-0',
                                type: 'DOCUMENT_REVIEW',
                            },
                        ],
                    },
                },
            ],
        },
    },
    acceptPost: [
        {
            n: 'Base Case',
            d: {},
        },
        {
            n: 'Single text comment on project',
            d: {
                comments: 'Some comment',
            },
        },
        {
            n: 'Multiple text comment on project',
            d: {
                comments: ['Some comment', 'Comment 2'],
            },
        },
        {
            n: 'Text comment on module',
            d: {
                modules: {
                    'key-0': [
                        {
                            title: 'Module 0-0',
                            comments: 'Hello o/',
                            tasks: {
                                'key-0': [
                                    {
                                        title: 'Task 0-0-0-0',
                                        type: 'DOCUMENT_REVIEW',
                                    },
                                ],
                            },
                        },
                    ],
                },
            },
        },
        {
            n: 'Large project',
            d: {
                modules: {
                    'key-0': [
                        {
                            title: 'Module 0-0',
                            tasks: {
                                'key-0': [
                                    {
                                        title: 'Task 0-0-0-0',
                                        type: 'DOCUMENT_REVIEW',
                                    },
                                ],
                            },
                        },
                        {
                            title: 'Module 0-1',
                            tasks: {
                                'key-0': [
                                    {
                                        title: 'Task 0-1-0-0',
                                        type: 'DOCUMENT_REVIEW',
                                    },
                                    {
                                        title: 'Task 0-1-0-1',
                                        type: 'DOCUMENT_REVIEW',
                                    },
                                    {
                                        title: 'Task 0-1-0-2',
                                        type: 'DOCUMENT_REVIEW',
                                    },
                                ],
                            },
                        },
                        {
                            title: 'Module 0-2',
                            tasks: {
                                'key-0': [
                                    {
                                        title: 'Task 0-2-0-0',
                                        type: 'DOCUMENT_REVIEW',
                                    },
                                ],
                                'key-1': [
                                    {
                                        title: 'Task 0-2-1-0',
                                        type: 'DOCUMENT_REVIEW',
                                    },
                                ],
                                'key-2': [
                                    {
                                        title: 'Task 0-2-2-0',
                                        type: 'DOCUMENT_REVIEW',
                                    },
                                    {
                                        title: 'Task 0-2-2-1',
                                        type: 'DOCUMENT_REVIEW',
                                    },
                                ],
                            },
                        },
                    ],
                    'key-1': [
                        {
                            title: 'Module 1-0',
                            tasks: {
                                'key-0': [
                                    {
                                        title: 'Task 1-0-0-0',
                                        type: 'DOCUMENT_REVIEW',
                                    },
                                    {
                                        title: 'Task 1-0-0-1',
                                        type: 'DOCUMENT_REVIEW',
                                    },
                                ],
                            },
                        },
                        {
                            title: 'Module 1-1',
                            tasks: {
                                'key-0': [
                                    {
                                        title: 'Task 1-1-0-0',
                                        type: 'DOCUMENT_REVIEW',
                                    },
                                ],
                            },
                        },
                    ],
                },
            },
        },
        {
            n: 'Waived module base',
            d: {
                modules: {
                    'key-0': [
                        {
                            title: 'Module 0-0',
                            tasks: {
                                'key-0': [
                                    {
                                        title: 'Task 0-0-0-0',
                                        type: 'DOCUMENT_REVIEW',
                                    },
                                ],
                            },
                            waive: {
                                comment: 'Hello :)',
                                author: debugUserId,
                            },
                        },
                    ],
                },
            },
        },
    ],
    failPost: [
        {
            n: 'Defined module, not step object',
            d: {
                modules: {
                    title: 'Module 0-0',
                    tasks: {
                        'key-0': [
                            {
                                title: 'Task 0-0-0-0',
                                type: 'DOCUMENT_REVIEW',
                            },
                        ],
                    },
                },
            },
        },
        {
            n: 'Missing field',
            d: {
                title: undefined,
            },
        },
        {
            n: 'Missing modules',
            d: {
                modules: undefined,
            },
        },
        {
            n: 'Module array, not step object',
            d: {
                modules: [
                    {
                        title: 'Module 0-0',
                        tasks: {
                            'key-0': [
                                {
                                    title: 'Task 0-0-0-0',
                                    type: 'DOCUMENT_REVIEW',
                                },
                            ],
                        },
                    },
                ],
            },
        },
        {
            n: 'Missing field on module',
            d: {
                modules: {
                    'key-0': [
                        {
                            tasks: {
                                'key-0': [
                                    {
                                        title: 'Task 0-0-0-0',
                                        type: 'DOCUMENT_REVIEW',
                                    },
                                ],
                            },
                        },
                    ],
                },
            },
        },
        {
            n: 'Missing field on task',
            d: {
                modules: {
                    'key-0': [
                        {
                            title: 'Module 0-0',
                            tasks: {
                                'key-0': [
                                    {
                                        type: 'DOCUMENT_REVIEW',
                                    },
                                ],
                            },
                        },
                    ],
                },
            },
        },
        {
            n: 'Invalid user key',
            d: {
                users: [':)'],
            },
        },
    ],
}
