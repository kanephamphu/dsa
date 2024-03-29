
export class PriorityQueue<T> {
    data: [number, T][] = [];

    insert(priority: number, value: T) {
        this.data.push([priority, value]);
    }

    peek(): T {
        if (!this.data.length) {
            return null;
        }

        return this.data.reduce((min, current) => min[0] < current[0] ? current : min)[1];
    }

    pop() {   
        if(!this.data.length) {
            return null;
        }
        
        let min = this.data[0];
        let minIndex = -1;

        this.data.forEach((item, index) => {
            if (item[0] < min[0]) {
                min = item;
                minIndex = index;
            } 
        });
  
        this.data.splice(minIndex, 1);
        
        return min[1]
      }

    size() {
        return this.data.length;
    }
}