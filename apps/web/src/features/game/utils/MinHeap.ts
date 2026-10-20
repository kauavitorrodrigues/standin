// A binary heap that hands out the entry with the lowest priority first.
export class MinHeap {
    private readonly priorities: number[] = [];
    private readonly values: number[] = [];

    get size(): number {
        return this.values.length;
    }

    push(value: number, priority: number): void {
        let index = this.values.length;
        this.values.push(value);
        this.priorities.push(priority);

        while (index > 0) {
            const parent = (index - 1) >> 1;
            if (this.priorities[parent]! <= priority) break;

            this.swap(index, parent);
            index = parent;
        }
    }

    pop(): number | undefined {
        const top = this.values[0];
        const lastValue = this.values.pop();
        const lastPriority = this.priorities.pop();
        if (this.values.length === 0 || lastValue === undefined) return top;

        this.values[0] = lastValue;
        this.priorities[0] = lastPriority!;
        let index = 0;
        for (;;) {
            const left = index * 2 + 1;
            const right = left + 1;
            let smallest = index;
            if (
                left < this.values.length &&
                this.priorities[left]! < this.priorities[smallest]!
            ) {
                smallest = left;
            }
            if (
                right < this.values.length &&
                this.priorities[right]! < this.priorities[smallest]!
            ) {
                smallest = right;
            }
            if (smallest === index) break;

            this.swap(index, smallest);
            index = smallest;
        }
        return top;
    }

    private swap(a: number, b: number): void {
        [this.values[a], this.values[b]] = [this.values[b]!, this.values[a]!];
        [this.priorities[a], this.priorities[b]] = [
            this.priorities[b]!,
            this.priorities[a]!,
        ];
    }
}
