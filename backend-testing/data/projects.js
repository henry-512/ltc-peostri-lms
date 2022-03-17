const { debugUserGroupKey, debugUserGroupId, debugUserId } = require('.')

module.exports = {
    structure:{"title":{"type":"string"},"start":{"type":"string"},"end":{"type":"string"},"status":{"type":"string","default":"AWAITING"},"comments":{"type":"fkeyArray","default":[],"freeable":true,"acceptNewDoc":true,"isForeign":true},"modules":{"type":"fkeyStep","freeable":true,"acceptNewDoc":true,"isForeign":true},"users":{"type":"fkeyArray","default":[],"getIdKeepAsRef":true,"isForeign":true},"createdAt":{"type":"string"},"updatedAt":{"type":"string"}},
    acceptPost: [
        {
            n: 'Base Case',
            d: {
                title: 'Project',
                users: [ debugUserId ],
                start:'2022-11-11',
                end:'2022-11-11',
                modules: {
                    'key-0': [
                        {
                            title:'Module 0-0',
                            'waive_module':false,
                            tasks:{
                                'key-0': [
                                    {
                                        title:'Task 0-0-0-0',
                                        type: 'DOCUMENT_REVIEW'
                                    }
                                ]
                            },
                        },
                    ],
                }
            },
        }, {
            n: 'Text comment on project',
            d: {
                title: 'Project',
                users: [ debugUserId ],
                start:'2022-11-11',
                end:'2022-11-11',
                comments: 'Some comment',
                modules: {
                    'key-0': [
                        {
                            title:'Module 0-0',
                            'waive_module':false,
                            tasks:{
                                'key-0': [
                                    {
                                        title:'Task 0-0-0-0',
                                        type: 'DOCUMENT_REVIEW'
                                    }
                                ]
                            },
                        },
                    ],
                }
            }
        }, {
            n: 'Text comment on module',
            d: {
                title: 'Project',
                users: [ debugUserId ],
                start:'2022-11-11',
                end:'2022-11-11',
                modules: {
                    'key-0': [
                        {
                            title:'Module 0-0',
                            'waive_module':false,
                            comments: 'Hello o/',
                            tasks:{
                                'key-0': [
                                    {
                                        title:'Task 0-0-0-0',
                                        type: 'DOCUMENT_REVIEW'
                                    }
                                ]
                            },
                        },
                    ],
                }
            }
        }, {
            n: 'Large project',
            d: {
                title: 'Project',
                users: [ debugUserId ],
                start:'2022-11-11',
                end:'2022-11-11',
                modules: {
                    'key-0': [
                        {
                            title:'Module 0-0',
                            'waive_module':false,
                            tasks:{
                                'key-0': [
                                    {
                                        title:'Task 0-0-0-0',
                                        type: 'DOCUMENT_REVIEW'
                                    }
                                ]
                            },
                        }, {
                            title:'Module 0-1',
                            'waive_module':false,
                            tasks:{
                                'key-0': [
                                    {
                                        title:'Task 0-1-0-0',
                                        type: 'DOCUMENT_REVIEW'
                                    }, {
                                        title:'Task 0-1-0-1',
                                        type: 'DOCUMENT_REVIEW'
                                    }, {
                                        title:'Task 0-1-0-2',
                                        type: 'DOCUMENT_REVIEW'
                                    }
                                ]
                            },
                        }, {
                            title:'Module 0-2',
                            'waive_module':false,
                            tasks:{
                                'key-0': [
                                    {
                                        title:'Task 0-2-0-0',
                                        type: 'DOCUMENT_REVIEW'
                                    }
                                ],
                                'key-1': [
                                    {
                                        title:'Task 0-2-1-0',
                                        type: 'DOCUMENT_REVIEW'
                                    }
                                ],
                                'key-2': [
                                    {
                                        title:'Task 0-2-2-0',
                                        type: 'DOCUMENT_REVIEW'
                                    }, {
                                        title:'Task 0-2-2-1',
                                        type: 'DOCUMENT_REVIEW'
                                    }
                                ]
                            },
                        },
                    ],
                    'key-1': [
                        {
                            title:'Module 1-0',
                            'waive_module':false,
                            tasks:{
                                'key-0': [
                                    {
                                        title:'Task 1-0-0-0',
                                        type: 'DOCUMENT_REVIEW'
                                    }, {
                                        title:'Task 1-0-0-1',
                                        type: 'DOCUMENT_REVIEW'
                                    }
                                ]
                            },
                        },
                        {
                            title:'Module 1-1',
                            'waive_module':false,
                            tasks:{
                                'key-0': [
                                    {
                                        title:'Task 1-1-0-0',
                                        type: 'DOCUMENT_REVIEW'
                                    }
                                ]
                            },
                        },
                    ]
                }
            }
        }
    ],
    failPost: [
        {
            n: 'Missing field',
            d: {
                users: [ debugUserId ],
                start:'2022-11-11',
                end:'2022-11-11',
                modules: {
                    'key-0': [
                        {
                            title:'Module 0-0',
                            'waive_module':false,
                            tasks:{
                                'key-0': [
                                    {
                                        title:'Task 0-0-0-0',
                                        type: 'DOCUMENT_REVIEW'
                                    }
                                ]
                            },
                        },
                    ],
                }
            }
        }, {
            n: 'Missing modules',
            d: {
                title: 'Project',
                users: [ debugUserId ],
                start:'2022-11-11',
                end:'2022-11-11',
            }
        }, {
            n: 'Defined module, not step object',
            d: {
                title: 'Project',
                users: [ debugUserId ],
                start:'2022-11-11',
                end:'2022-11-11',
                modules: {
                    title:'Module 0-0',
                    'waive_module':false,
                    tasks:{
                        'key-0': [
                            {
                                title:'Task 0-0-0-0',
                                type: 'DOCUMENT_REVIEW'
                            }
                        ]
                    },
                },
            }
        }, {
            n: 'Module array, not step object',
            d: {
                title: 'Project',
                users: [ debugUserId ],
                start:'2022-11-11',
                end:'2022-11-11',
                modules: [
                    {
                        title:'Module 0-0',
                        'waive_module':false,
                        tasks:{
                            'key-0': [
                                {
                                    title:'Task 0-0-0-0',
                                    type: 'DOCUMENT_REVIEW'
                                }
                            ]
                        },
                    },
                ],
            }
        }, {
            n: 'Missing field on module',
            d: {
                title: 'Project',
                users: [ debugUserId ],
                start:'2022-11-11',
                end:'2022-11-11',
                modules: {
                    'key-0': [
                        {
                            'waive_module':false,
                            tasks:{
                                'key-0': [
                                    {
                                        title:'Task 0-0-0-0',
                                        type: 'DOCUMENT_REVIEW'
                                    }
                                ]
                            },
                        },
                    ],
                }
            }
        }, {
            n: 'Missing field on task',
            d: {
                title: 'Project',
                users: [ debugUserId ],
                start:'2022-11-11',
                end:'2022-11-11',
                modules: {
                    'key-0': [
                        {
                            title:'Module 0-0',
                            'waive_module':false,
                            tasks:{
                                'key-0': [
                                    {
                                        type: 'DOCUMENT_REVIEW'
                                    }
                                ]
                            },
                        },
                    ],
                }
            }
        }, {
            n: 'Invalid user key',
            d: {
                title: 'Project',
                users: [ ':)' ],
                start:'2022-11-11',
                end:'2022-11-11',
                modules: {
                    'key-0': [
                        {
                            title:'Module 0-0',
                            'waive_module':false,
                            tasks:{
                                'key-0': [
                                    {
                                        title:'Task 0-0-0-0',
                                        type: 'DOCUMENT_REVIEW'
                                    }
                                ]
                            },
                        },
                    ],
                }
            }
        }
    ]
}