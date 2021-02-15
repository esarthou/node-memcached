import Joi from 'joi';

const Models = {
    get: {
        protocol: Joi.object({
            command: Joi.string().required(),
            key: Joi.string().required(),
            flags: Joi.number().allow(''),
            exptime: Joi.number().default(0).allow(''),
            bytes: Joi.number().allow(''),
            value: Joi.string().allow(''),
        }),
        output: {
            null: 'END',
        },
    },
    set: {
        protocol: Joi.object({
            command: Joi.string().required(),
            key: Joi.string().required(),
            flags: Joi.number().required(),
            exptime: Joi.number().required().default(0),
            bytes: Joi.number().required(),
            value: Joi.string().required().allow(''),
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
    delete: {
        protocol: Joi.object({
            key: Joi.string().required(),
        }),
        output: {
            true: 'DELETED',
            false: 'NOT_FOUND',
        },
    },
    stats: {
        protocol: Joi.object({
            command: Joi.string().allow(''),
            key: Joi.string().allow(''),
            flags: Joi.number().allow(''),
            exptime: Joi.number().default(0).allow(''),
            bytes: Joi.number().allow(''),
            value: Joi.string().allow(''),
        }),
        output: {
            null: 'END',
        },
    },
};

export default Models;
