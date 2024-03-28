export class SelfMap {
    maxSize = 1000;
    hashTables: any[] = [];

    set(key: string, value: any) {
        const hashValue = this.hash(key);

        this.hashTables[hashValue] = value;
    }

    get(key: string) {
        const hashValue = this.hash(key);

        return this.hashTables[hashValue];
    }

    private hash(key: string): number {
        let hash = 0;

        for (let i = 0; i < key.length; i++) {
            const char = key.charCodeAt(i);
            // Left shift the bit number
            // You can use the char.toString(2).padStart(8, '0') to get bit presentation
            // 111000 << 1 = 011100
            hash = ((hash << 5) - hash) + char;
            hash |= 0;
        }

        return hash % this.maxSize;
    }
}

const selfMap: SelfMap = new SelfMap();

selfMap.set("sdfsdf", 123213213);

console.log(selfMap.get("sdfsdf"));