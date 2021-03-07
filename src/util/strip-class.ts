export function stripClass(obj: any): any {
  return { ...obj };
}

export function stripClassArr(arr: Array<any>): Array<any> {
  return arr.map(stripClass);
}
