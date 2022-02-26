export function clone<T>(o: T) {
  return JSON.parse(JSON.stringify(o)) as T;
}
export const first = (arr: unknown[]) => arr[0];
export const last = (arr: unknown[]) => arr[arr.length - 1];
export const isLast = (arr: unknown[], i: number) => i === arr.length - 1;
