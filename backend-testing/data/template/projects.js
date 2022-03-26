export default {
    structure: {
        title: { type: 'string' },
        modules: {
            type: 'step',
            instance: 'fkey',
            acceptNewDoc: true,
        },
        status: {
            type: 'string',
            default: 'AWAITING',
        },
        ttc: {
            type: 'number',
            optional: true,
            default: 0,
        },
        createdAt: { type: 'string' },
        updatedAt: { type: 'string' },
    },
    default: {
        title: 'Project template',
        modules: {
            'key-0': [
                {
                    title: 'Test Template',
                    tasks: {
                        'key-0': [
                            {
                                title: 'Some task',
                                type: 'DOCUMENT_UPLOAD',
                            },
                        ],
                    },
                },
            ],
        },
    },
    acceptPost: [
        {
            n: 'Base case',
            d: {},
        },
        {
            n: 'Foreign id in modules',
            d: {
                modules: {
                    'key-0': ['moduleTemplates/AheJiF6_rTXvsAFeGIVWoA'],
                },
            },
        },
        {
            n: 'Foreign key in modules',
            d: {
                modules: {
                    'key-0': ['AheJiF6_rTXvsAFeGIVWoA'],
                },
            },
        },
    ],
    failPost: [
        {
            n: 'Invalid title type',
            d: {
                title: 12345,
            },
        },
    ],
}
