export function quickSort<T>(items: T[], compare: (a: T, b: T) => number): T[] {
  if (items.length <= 1) {
    return [...items];
  }

  const [pivot, ...rest] = items;
  const left = rest.filter((item) => compare(item, pivot) < 0);
  const right = rest.filter((item) => compare(item, pivot) >= 0);

  return [...quickSort(left, compare), pivot, ...quickSort(right, compare)];
}

export function mergeSort<T>(items: T[], compare: (a: T, b: T) => number): T[] {
  if (items.length <= 1) {
    return [...items];
  }

  const middle = Math.floor(items.length / 2);
  const left = mergeSort(items.slice(0, middle), compare);
  const right = mergeSort(items.slice(middle), compare);

  return merge(left, right, compare);
}

function merge<T>(left: T[], right: T[], compare: (a: T, b: T) => number): T[] {
  const result: T[] = [];
  let leftIndex = 0;
  let rightIndex = 0;

  while (leftIndex < left.length && rightIndex < right.length) {
    if (compare(left[leftIndex], right[rightIndex]) <= 0) {
      result.push(left[leftIndex]);
      leftIndex += 1;
    } else {
      result.push(right[rightIndex]);
      rightIndex += 1;
    }
  }

  return result.concat(left.slice(leftIndex), right.slice(rightIndex));
}
