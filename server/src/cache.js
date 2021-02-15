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
        console.debug('Enter get function');
        if (!this.contains(key)) return null;
        return this.records.get(key).value;
    }

    set(key, value, exptime, flags) {
        console.debug('Enter set function');
        const record = new Record(value, exptime, flags);
        this.records.set(key, record);
        process.nextTick(() => this.purge());
        this.totalRecords = this.records.size;
        return true;
    }

    delete(key) {
        if (!this.contains(key)) {
            return false;
        }
        this.records.delete(key);
        process.nextTick(() => this.purge());
        this.totalRecords = this.records.size;
        return true;
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
