export default {
    structure: {
        title: { type: 'string' },
        tasks: {
            type: 'step',
            instance: 'data',
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
    acceptPost: [
        {
            n: 'Base Case',
            d: {},
        },
        {
            n: 'Time to complete',
            d: {
                ttc: 10,
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
        {
            n: 'Missing tasks',
            d: {
                tasks: undefined,
            },
        },
    ],
}
