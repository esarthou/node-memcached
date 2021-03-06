import Models from './models';

export default class Parser {
    read(message) {
        const [commandLine, dataBlock] = message.toString('utf8').split('\r\n');
        const words = commandLine.trim().split(/\s+/);
        const value = typeof dataBlock !== 'undefined' ? dataBlock.trim() : '';
        const command = words[0];
        const schema = Models.find((model) => model.methods.includes(command));
        if (schema) {
            let request = {};
            switch (schema.group) {
            case 'flush':
                request = { command };
                break;
            case 'retrieval':
            case 'deletion':
            default:
                words.splice(0, 1);
                request = { command, keys: words };
                break;
            case 'storage':
                request = {
                    command, key: words[1], flags: words[2], exptime: words[3], bytes: words[4], uniqueCas: (words[5] ? words[5] : ''), value,
                };
                break;
            case 'statistics':
                request = { command };
            }
            if (this.validate(request, schema)) return request;
        }
        return false;
    }

    validate = (request, schema) => {
        if (schema) {
            const { error } = schema.protocol.validate(request, { abortEarly: false });
            if (error) {
                const errorList = error.details.map((x) => x.message);
                console.error(JSON.stringify({ errors: errorList }));
                return false;
            }
            if (request.value && request.bytes && parseInt(request.value.length) !== parseInt(request.bytes)) {
                console.error(`Bytes parameter passed: ${request.bytes} not compatible with actual value of length: ${request.value.length}`);
                return false;
            }
            return true;
        }
        console.error(`Command not supported: ${request.command}`);
        return false;
    }
}
