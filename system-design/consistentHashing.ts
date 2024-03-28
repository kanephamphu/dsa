interface Data {
    id: string;
    name: string;
    address: string;
}

interface MigratedDataInformation {
    id: string;
    currentNodeId: string;
    newNodeId: string;
}


export class ConsistentHashing {
    ring: Map<number, string> = new Map();
    keys: number[] = [];
    SEPERATOR: string = "-";
    totalAnglesNumber: number = 360;
    databases: Map<string, Map<string, Data>> = new Map();
    removedDatabases: Map<string, Map<string, Data>> = new Map();

    addDatabase(databaseId: string): void {
        for (let i = 0; i < this.totalAnglesNumber; ++i) {
            let nodeId = this.hash(`${databaseId}${this.SEPERATOR}${i.toString()}`);
            this.ring.set(nodeId, databaseId);
        }

        this.databases.set(databaseId, new Map());
        this.keys = Array.from(this.ring.keys()).sort((a, b) => a - b);
    }

    removeDatabase(databaseId: string) {
        for (let i = 0; i < this.totalAnglesNumber; ++i) {
            let nodeId = this.hash(`${databaseId}${this.SEPERATOR}${i.toString()}`);
            this.ring.delete(nodeId);
        }

        const removedDatabase: Map<string, Data> = this.databases.get(databaseId);
        this.databases.delete(databaseId);
        this.removedDatabases.set(databaseId, removedDatabase);

        this.keys = Array.from(this.ring.keys()).sort((a, b) => a - b);
    }

    getData(keyOfData: string): Data {
        const databaseId: string = this.getServer(keyOfData);
        const database = this.databases?.get(databaseId);
        const record = database?.get(keyOfData);

        return record;
    }

    addData(record: Data) {
        const databaseId = this.getServer(record.id);
        const database: Map<string, Data> = this.databases.get(databaseId);

        database.set(record.id, record);
        this.databases.set(databaseId, database);
    }

    getServer(keyOfData: string): string {
        if (!this.ring.size) {
            return null;
        }

        const hashValue = this.hash(keyOfData);

        for (const key of this.keys) {
            if (key > hashValue) {
                return this.ring.get(key);
            }
        }

        return null;
    }

    migrateDatabase() {
        const migratedRecords: MigratedDataInformation[] = [];

        for (const [serverId, database] of this.databases) {
            for (let [recordId,] of database) {
                const newNodeId = this.getServer(recordId);

                if (serverId !== newNodeId) {
                    migratedRecords.push({
                        id: recordId,
                        currentNodeId: serverId,
                        newNodeId: newNodeId
                    });
                }
            }
        }

        for (const [serverId, database] of this.removedDatabases) {
            for (let [recordId,] of database) {
                const newNodeId = this.getServer(recordId);

                if (serverId !== newNodeId) {
                    migratedRecords.push({
                        id: recordId,
                        currentNodeId: serverId,
                        newNodeId: newNodeId
                    });
                }
            }
        }

        for (const migratedRecord of migratedRecords) {
            const isExist = !this.databases.has(migratedRecord.currentNodeId);
            const data = isExist ? this.removedDatabases.get(migratedRecord.currentNodeId)?.get(migratedRecord.id) :
                this.databases.get(migratedRecord.currentNodeId)?.get(migratedRecord.id);
            this.databases.get(migratedRecord.newNodeId)?.set(migratedRecord.id, data);

            if (isExist) {
                this.databases.get(migratedRecord.currentNodeId)?.delete(migratedRecord.id);
            }
        }

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

        return hash % this.totalAnglesNumber;
    }

}

const consistentHash: ConsistentHashing = new ConsistentHashing();

consistentHash.addDatabase("Node 1");
consistentHash.addDatabase("Node 2");
consistentHash.addDatabase("Node 3");

consistentHash.addData({
    id: "Test 1",
    name: "sdflsdf"
} as Data);

consistentHash.addData({
    id: "Test 2",
    name: "gasfsdfTsdfls"
} as Data);

consistentHash.addData({
    id: "Test 3",
    name: "gax,x,x,"
} as Data);

consistentHash.addData({
    id: "Test 4",
    name: "gax,xasd,x,"
} as Data);

// console.log(consistentHash.getData("Test 2"));
// console.log(consistentHash.getData("Test 1"));

consistentHash.removeDatabase("Node 3");

// console.log(consistentHash.getData("Test 2"));

consistentHash.migrateDatabase();

console.log(consistentHash.getData("Test 2"));


