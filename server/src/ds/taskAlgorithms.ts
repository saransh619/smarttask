import { PriorityQueue } from "./PriorityQueue.js";
import { binarySearch } from "./binarySearch.js";
import { mergeSort, quickSort } from "./sorting.js";

export type TaskLike = {
  title: string;
  description?: string;
  dueDate: Date | string;
  priority: "High" | "Medium" | "Low";
  status: "Todo" | "In Progress" | "Done";
  tags?: string[];
  createdAt?: Date | string;
};

type SortBy = "smart" | "dueDate" | "priority" | "status" | "title" | "createdAt";
type SortOrder = "asc" | "desc";
type Algorithm = "quick" | "merge";

const priorityWeight = new Map([
  ["High", 0],
  ["Medium", 1],
  ["Low", 2],
]);

const statusWeight = new Map([
  ["Todo", 0],
  ["In Progress", 1],
  ["Done", 2],
]);

export function prioritizeTasks<T extends TaskLike>(tasks: T[]) {
  const queue = new PriorityQueue<T>(compareSmart);
  tasks.forEach((task) => queue.enqueue(task));

  const prioritized: T[] = [];
  while (queue.size > 0) {
    const task = queue.dequeue();
    if (task) {
      prioritized.push(task);
    }
  }

  return prioritized;
}

export function sortTasks<T extends TaskLike>(
  tasks: T[],
  sortBy: SortBy,
  sortOrder: SortOrder,
  algorithm: Algorithm,
) {
  if (sortBy === "smart") {
    const smart = prioritizeTasks(tasks);
    return sortOrder === "desc" ? smart.reverse() : smart;
  }

  const compare = getComparator<T>(sortBy, sortOrder);
  return algorithm === "quick" ? quickSort(tasks, compare) : mergeSort(tasks, compare);
}

export function filterWithHashMaps<T extends TaskLike>(
  tasks: T[],
  filters: { status?: string; priority?: string; tag?: string },
) {
  const byStatus = new Map<string, T[]>();
  const byPriority = new Map<string, T[]>();
  const byTag = new Map<string, T[]>();

  for (const task of tasks) {
    addToMap(byStatus, task.status, task);
    addToMap(byPriority, task.priority, task);
    for (const tag of task.tags ?? []) {
      addToMap(byTag, tag.toLowerCase(), task);
    }
  }

  let result = tasks;

  if (filters.status) {
    result = intersect(result, byStatus.get(filters.status) ?? []);
  }

  if (filters.priority) {
    result = intersect(result, byPriority.get(filters.priority) ?? []);
  }

  if (filters.tag) {
    result = intersect(result, byTag.get(filters.tag.toLowerCase()) ?? []);
  }

  return result;
}

export function searchTasks<T extends TaskLike>(tasks: T[], search?: string) {
  const query = search?.trim().toLowerCase();

  if (!query) {
    return tasks;
  }

  const sortedByTitle = mergeSort(tasks, (a, b) => a.title.localeCompare(b.title));
  const exactMatch = binarySearch(sortedByTitle, query, (task) => task.title);

  if (exactMatch) {
    return [exactMatch];
  }

  return tasks.filter((task) => {
    const haystack = [
      task.title,
      task.description ?? "",
      ...(task.tags ?? []),
    ].join(" ").toLowerCase();

    return haystack.includes(query);
  });
}

function compareSmart<T extends TaskLike>(a: T, b: T) {
  const dueDiff = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();

  if (dueDiff !== 0) {
    return dueDiff;
  }

  return (priorityWeight.get(a.priority) ?? 99) - (priorityWeight.get(b.priority) ?? 99);
}

function getComparator<T extends TaskLike>(sortBy: Exclude<SortBy, "smart">, sortOrder: SortOrder) {
  const direction = sortOrder === "asc" ? 1 : -1;

  return (a: T, b: T) => {
    let result = 0;

    if (sortBy === "dueDate" || sortBy === "createdAt") {
      result = new Date(a[sortBy] ?? 0).getTime() - new Date(b[sortBy] ?? 0).getTime();
    } else if (sortBy === "priority") {
      result = (priorityWeight.get(a.priority) ?? 99) - (priorityWeight.get(b.priority) ?? 99);
    } else if (sortBy === "status") {
      result = (statusWeight.get(a.status) ?? 99) - (statusWeight.get(b.status) ?? 99);
    } else {
      result = a.title.localeCompare(b.title);
    }

    return result * direction;
  };
}

function addToMap<T>(map: Map<string, T[]>, key: string, item: T) {
  const items = map.get(key) ?? [];
  items.push(item);
  map.set(key, items);
}

function intersect<T>(left: T[], right: T[]) {
  const set = new Set(right);
  return left.filter((item) => set.has(item));
}
