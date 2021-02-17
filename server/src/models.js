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
            exptime: Joi.number().required().default(60),
            bytes: Joi.number().required(),
            value: Joi.string().required().allow(''),
            uniqueCas: Joi.number().allow(''),
        }),
    },
    {
        group: 'deletion',
        methods: ['delete'],
        protocol: Joi.object({
            command: Joi.string().required(),
            keys: Joi.array().items(Joi.string()).required(),
        }),
    },
    {
        group: 'flush',
        methods: ['flush'],
        protocol: Joi.object({
            command: Joi.string().required(),
        }),
    },
    {
        group: 'statistics',
        methods: ['stats'],
        protocol: Joi.object({
            command: Joi.string().required(),
        }),
    },
];

export default Models;
