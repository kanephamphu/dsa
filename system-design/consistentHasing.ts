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
    totalAnglesNumber: number = 1200;
    databases: Map<string, Map<string, Data>> = new Map();
    removedDatabases: Map<string, Map<string, Data>> = new Map();

    addNode(nodeId: string): void {
        for (let i = 0; i < this.totalAnglesNumber; ++i) {
            let replica_key = this.hash(`${nodeId}${this.SEPERATOR}${i.toString()}`);
            this.ring.set(replica_key, nodeId);
        }

        this.databases.set(nodeId, new Map());
        this.keys = Array.from(this.ring.keys()).sort((a, b) => a - b);
    }

    removeNode(nodeId: string) {
        for (let i = 0; i < this.totalAnglesNumber; ++i) {
            let replica_key = this.hash(`${nodeId}${this.SEPERATOR}${i.toString()}`);
            this.ring.delete(replica_key);
        }

        const removedDatabase: Map<string, Data> = this.databases.get(nodeId);
        this.databases.delete(nodeId);
        this.removedDatabases.set(nodeId, removedDatabase);

        this.keys = Array.from(this.ring.keys()).sort((a, b) => a - b);
    }

    getData(keyOfData: string): Data {
        console.log(this.ring);
        const databaseId: string = this.getNode(keyOfData);
        const database = this.databases?.get(databaseId);
        const record = database?.get(keyOfData);

        return record;
    }

    addData(record: Data) {
        const nodeId = this.getNode(record.id);
        const database: Map<string, Data> = this.databases.get(nodeId);

        database.set(record.id, record);
        this.databases.set(nodeId, database);
    }

    getNode(keyOfData: string): string {
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

        for (let [nodeId, database] of this.databases) {
            for (let [recordId,] of database) {
                const newNodeId = this.getNode(recordId);

                if (nodeId !== newNodeId) {
                    migratedRecords.push({
                        id: recordId,
                        currentNodeId: nodeId,
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

consistentHash.addNode("Node 1");
consistentHash.addNode("Node 2");
consistentHash.addNode("Node 3");

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

console.log(consistentHash.getData("Test 2"));

consistentHash.removeNode("Node 3");

console.log(consistentHash.getData("Test 2"));

consistentHash.migrateDatabase();

console.log(consistentHash.getData("Test 2"));


