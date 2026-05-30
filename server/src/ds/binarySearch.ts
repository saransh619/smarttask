export function binarySearch<T>(
  items: T[],
  target: string,
  selector: (item: T) => string,
): T | undefined {
  let low = 0;
  let high = items.length - 1;
  const normalizedTarget = target.toLowerCase();

  while (low <= high) {
    const middle = Math.floor((low + high) / 2);
    const value = selector(items[middle]).toLowerCase();

    if (value === normalizedTarget) {
      return items[middle];
    }

    if (value < normalizedTarget) {
      low = middle + 1;
    } else {
      high = middle - 1;
    }
  }

  return undefined;
}
