export const clone = (o: any) => JSON.parse(JSON.stringify(o));
export const last = (a: any[]) => a[a.length - 1];
export const isLast = (a: any[], i: number) => i === a.length - 1;
