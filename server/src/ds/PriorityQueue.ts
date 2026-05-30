export type Comparator<T> = (a: T, b: T) => number;

export class PriorityQueue<T> {
  private heap: T[] = [];

  constructor(private readonly compare: Comparator<T>) {}

  get size() {
    return this.heap.length;
  }

  peek() {
    return this.heap[0];
  }

  enqueue(item: T) {
    this.heap.push(item);
    this.bubbleUp(this.heap.length - 1);
  }

  dequeue() {
    if (this.heap.length === 0) {
      return undefined;
    }

    const top = this.heap[0];
    const last = this.heap.pop();

    if (last && this.heap.length > 0) {
      this.heap[0] = last;
      this.bubbleDown(0);
    }

    return top;
  }

  private bubbleUp(index: number) {
    let current = index;

    while (current > 0) {
      const parent = Math.floor((current - 1) / 2);

      if (this.compare(this.heap[current], this.heap[parent]) >= 0) {
        break;
      }

      this.swap(current, parent);
      current = parent;
    }
  }

  private bubbleDown(index: number) {
    let current = index;

    while (true) {
      const left = current * 2 + 1;
      const right = current * 2 + 2;
      let best = current;

      if (left < this.heap.length && this.compare(this.heap[left], this.heap[best]) < 0) {
        best = left;
      }

      if (right < this.heap.length && this.compare(this.heap[right], this.heap[best]) < 0) {
        best = right;
      }

      if (best === current) {
        break;
      }

      this.swap(current, best);
      current = best;
    }
  }

  private swap(a: number, b: number) {
    [this.heap[a], this.heap[b]] = [this.heap[b], this.heap[a]];
  }
}
