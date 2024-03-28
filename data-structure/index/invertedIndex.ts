export class InvertedIndex {
    wordsTable: Map<string, Map<number, number>> = new Map();
    records: Map<number, string> = new Map();

    addNewRecord(text: string) {
        const newIndexKey = this.records.size;
        const words = text.split(' ');

        for(const word of words) {
            const wordTable = this.wordsTable.get(word) || new Map();
            const occurTimes = (wordTable.get(newIndexKey) || 0) + 1;
            wordTable.set(newIndexKey, occurTimes);
            
            this.wordsTable.set(word, wordTable);
        }

        this.records.set(newIndexKey, text);
    }

    findFullText(searchText: string) {
        const searchWords = searchText.split(' ');
        const searchedTextScores: Map<number, number> = new Map();

        for(const searchWord of searchWords) {
            const foundTexts = this.wordsTable.get(searchWord);

            if(foundTexts && foundTexts.size) {
                for(const [indexKey, score] of foundTexts) {
                    const newScore = (searchedTextScores.get(indexKey) || 0) + score;

                    searchedTextScores.set(indexKey, newScore);
                }
            }
        }

        return searchedTextScores;
    }
}

const index: InvertedIndex = new InvertedIndex();

index.addNewRecord("Tai Phu Pham Tai Phu Pham");
index.addNewRecord("Pham");

console.log(index.findFullText("Pham"));