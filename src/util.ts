export function clone<T>(o: T) {
  return JSON.parse(JSON.stringify(o)) as T;
}
export const last = (a: any[]) => a[a.length - 1];
export const isLast = (a: any[], i: number) => i === a.length - 1;
