// Dictionary text is per locale, the numbers and kinds that go with it are
// constants of the code. These two helpers pair the halves by key or by a length
// the compiler can check, instead of by array index, which it cannot.

/** `Object.entries` that keeps the key type. */
export function entriesOf<K extends string, V>(record: Partial<Record<K, V>>): [K, V][] {
  return Object.entries(record) as [K, V][]
}

/** Keeps the length in the type (`[string, string]`, not `string[]`). */
export function texts<T extends readonly string[]>(...list: T): { [K in keyof T]: string } {
  return list as { [K in keyof T]: string }
}
