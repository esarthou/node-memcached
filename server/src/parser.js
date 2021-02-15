import Models from './models';

export default class Parser {
    constructor() {
        this.command = null;
        this.options = null;
        this.data = '';
        this.bytesRemaining = 0;
    }

    translate(message) {
        // console.debug(`DEBUG translate: ${message.toString('utf8')}`);
        const lines = this.parseLines(message);
        const request = this.parse(lines);
        // console.error(JSON.stringify(request));
        if (this.validate(request)) {
            return request;
        }
        return 'ERROR\r\n';
    }

    parse = (lines) => {
        const words = lines.line.trim().split(/\s+/);
        const value = typeof lines.value !== 'undefined' ? lines.value.trim() : '';
        console.log(`Lines: ${JSON.stringify(lines)}`);
        const request = {
            command: words[0],
            key: words[1],
            flags: words[2],
            exptime: words[3],
            bytes: words[4],
            value,
        };
        console.log(`VAlUE ${value}`);
        // console.log(`Parsed request: ${JSON.stringify(request)}`);
        return request;
    }

    validate = (request) => {
        const schema = Models[request.command];
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

    parseLines = (rawData) => {
        const data = rawData.toString('utf8');
        // console.log(`DEBUGGING: ${data}`);
        return {
            line: data.split('|')[0],
            value: data.split('|')[1],
        };
    }
}
