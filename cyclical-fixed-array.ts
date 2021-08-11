export default class CyclicalFixedArray<T> implements Iterable<T> {
  private array: T[];

  constructor(private readonly size: number) {
    this.array = [];
  }

  [Symbol.iterator](): Iterator<T> {
    return this.array[Symbol.iterator]();
  }

  public get length(): number {
    return this.array.length;
  }

  public add(item: T) {
    if (this.array.length === this.size) {
      this.array.shift();
    }

    this.array.push(item);
  }

  public filter(func: (el: T, i: number) => boolean) {
    return this.array.filter(func);
  }

  public slice(start?: number, end?: number) {
    return this.array.slice(start, end);
  }

  public indexOf(searchElement: T, fromIndex?: number): number {
    return this.array.indexOf(searchElement, fromIndex);
  }

  public reset(): void {
    this.array = [];
  }
}