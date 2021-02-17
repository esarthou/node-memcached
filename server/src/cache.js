/* eslint-disable guard-for-in */
import Record from './record';

export default class Cache {
    constructor(options = {}) {
        this.records = new Map();
        this.maxMemoryMB = options.maxMemory || 100;
        this.usedMemory = 0;
        this.maxRecords = options.maxRecords || 5000;
        this.totalRecords = 0;
    }

    contains(key) {
        if (!this.records.has(key)) {
            return false;
        }
        const record = this.records.get(key);
        if (!record.isValid()) {
            return false;
        }
        return true;
    }

    get(key) {
        // console.debug('Enter get function');
        if (!this.contains(key)) return 'END';
        const record = this.records.get(key);
        return `VALUE ${key} ${record.flags} ${record.length}\r\n${record.value}`;
    }

    gets(key) {
        // console.debug('Enter get function');
        if (!this.contains(key)) return 'END';
        const record = this.records.get(key);
        return `VALUE ${key} ${record.flags} ${record.length} ${record.uniqueCas}\r\n${record.value}`;
    }

    set(key, value, exptime, flags) {
        // console.debug('Enter set function');
        const record = new Record(value, exptime, flags);
        this.records.set(key, record);
        process.nextTick(() => this.purge());
        return 'STORED';
    }

    add(key, value, exptime, flags) {
        // console.debug('Enter add function');
        if (!this.contains(key)) {
            return this.set(key, value, exptime, flags);
        } return 'NOT_STORED';
    }

    replace(key, value, exptime, flags) {
        // console.debug('Enter replace function');
        if (this.contains(key)) {
            this.records.get(key).uniqueCas++;
            return this.set(key, value, exptime, flags);
        } return 'NOT_STORED';
    }

    append(key, value) {
        // console.debug('Enter append function');
        if (this.contains(key)) {
            const record = this.records.get(key);
            const newValue = `${record.value}${value}`;
            return this.set(key, newValue, record.exptime, record.flags);
        } return 'NOT_STORED';
    }

    prepend(key, value) {
        // console.debug('Enter prepend function');
        if (this.contains(key)) {
            const record = this.records.get(key);
            const newValue = `${value}${record.value}`;
            return this.set(key, newValue, record.exptime, record.flags);
        } return 'NOT_STORED';
    }

    cas(key, value, exptime, flags, uniqueCas) {
        const currentRecord = this.records.get(key);
        if (this.contains(key)) {
            if (currentRecord.uniqueCas === parseInt(uniqueCas)) {
                return this.set(key, value, exptime, flags);
            } return 'EXISTS';
        } return 'NOT_FOUND';
    }

    delete(key) {
        if (!this.contains(key)) {
            return 'NOT_FOUND';
        }
        this.records.delete(key);
        process.nextTick(() => this.purge());
        this.totalRecords = this.records.size;
        return 'DELETED';
    }

    flush() {
        this.records.clear();
        process.nextTick(() => this.purge());
        console.log('All records flushed');
        return 'FLUSH_ALL';
    }

    purge() {
        if (this.maxRecords) {
            this.purgeRecords();
        }
        if (this.maxSizeMb) {
            this.purgeMemory();
        }
    }

    purgeRecords() {
        this.totalRecords = this.records.size;
        if (this.records.size < this.maxRecords) {
            return;
        }
        for (const key in this.records.keys()) {
            this.records.delete(key);
            if (this.records.size < this.maxRecords) return;
        }
    }

    purgeMemory() {
        this.usedMemory = process.memoryUsage().rss / 1024 / 1024;
        if (this.usedMemory < this.maxMemoryMB) {
            return;
        }
        console.info('Memory used %s, max %s: purging', this.usedMemory, this.maxSizeMb);
        for (const key in this.records.keys()) {
            if (!this.records.get(key).isValid()) {
                this.records.delete(key);
            }
        }
        if (this.usedMemory < this.maxMemoryMB) {
            return;
        }
        for (const key in this.records) {
            this.records.delete(key);
            if (this.usedMemory < this.maxMemoryMB) return;
        }
    }

    stats() {
        this.usedMemory = process.memoryUsage().rss / 1024 / 1024;
        return {
            MemoryUsage: this.usedMemory,
            TotalRecords: this.totalRecords,
            MaxMemoryMB: this.maxMemoryMB,
            maxRecords: this.maxRecords,
        };
    }
}
