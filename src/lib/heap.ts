export class MinHeap<T> {
  private data: { key: number; val: T }[] = [];
  size() { return this.data.length; }
  push(key: number, val: T) { this.data.push({ key, val }); this.up(this.data.length - 1); }
  pop(): T | undefined {
    if (!this.data.length) return undefined;
    const min = this.data[0].val;
    const end = this.data.pop()!;
    if (this.data.length) { this.data[0] = end; this.down(0); }
    return min;
  }
  private up(i: number) {
    while (i > 0) {
      const p = Math.floor((i - 1) / 2);
      if (this.data[p].key <= this.data[i].key) break;
      [this.data[p], this.data[i]] = [this.data[i], this.data[p]];
      i = p;
    }
  }
  private down(i: number) {
    const n = this.data.length;
    while (true) {
      const l = 2 * i + 1, r = 2 * i + 2;
      let m = i;
      if (l < n && this.data[l].key < this.data[m].key) m = l;
      if (r < n && this.data[r].key < this.data[m].key) m = r;
      if (m === i) break;
      [this.data[m], this.data[i]] = [this.data[i], this.data[m]];
      i = m;
    }
  }
}
