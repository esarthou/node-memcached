import { MD5 } from 'crypto-js';

const MAX_EXPIRATION_OFFSET = 60 * 60 * 24 * 30;

export default class Record {
    constructor(value, expiration, flags) {
        if (expiration > 0 && expiration < MAX_EXPIRATION_OFFSET) {
            this.expiration = Date.now() + (expiration * 1000);
        } else {
            this.expiration = expiration;
        }
        this.uniqueCas = MD5(`${Date.now()}-${value}`).toString();
        this.value = value;
        this.length = value.length;
        this.flags = flags;
    }

    /**
     * Determines a records validity based on expiration date.
     * If 0 is passed as expiration, the record doesn't expire.
     * Nonetheless it could be evicted if the memory is full.
     * @returns Boolean
     */
    isValid() {
        if (!this.expiration) {
            return true;
        }
        console.debug('Now: %s, expiration: %s', Date.now(), this.expiration);
        return (Date.now() < this.expiration);
    }
}
