import Joi from 'joi';

const Models = [
    {
        group: 'retrieval',
        methods: [
            'get',
            'gets',
        ],
        protocol: Joi.object({
            command: Joi.string().required(),
            keys: Joi.array().required(),
        }),
        output: {
            null: 'END',
        },
    },
    {
        group: 'storage',
        methods: [
            'set',
            'add',
            'replace',
            'append',
            'prepend',
            'cas',
        ],
        protocol: Joi.object({
            command: Joi.string().required(),
            key: Joi.string().required(),
            flags: Joi.number().required(),
            exptime: Joi.number().required().default(0),
            bytes: Joi.number().required(),
            value: Joi.string().required().allow(''),
            uniqueCas: Joi.number().allow(''),
        }),
        order: {
            key: true,
            value: true,
            exptime: true,
            flags: true,
        },
        output: {
            true: 'STORED',
            false: 'NOT_STORED',
        },
    },
    {
        group: 'deletion',
        methods: ['delete'],
        protocol: Joi.object({
            command: Joi.string().required(),
            keys: Joi.array().items(Joi.string()).required(),
        }),
        output: {
            true: 'DELETED',
            false: 'NOT_FOUND',
        },
    },
    {
        group: 'statistics',
        methods: ['stats'],
        protocol: Joi.object({
            command: Joi.string().required(),
        }),
        output: {
            null: 'END',
        },
    },
];

export default Models;
