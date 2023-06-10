export type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends Record<string, unknown>
    ? DeepPartial<T[K]>
    : T[K]
}

export type AtLeastOneTrue<T> = {
  // no use
  [K in keyof T]: Omit<T, K> & { [P in K]: true }
}[keyof T]

export const mergeDeep = <T>(target: T, source: T): T => {
  for (const key in source) {
    if (typeof source[key as keyof T] === 'object') {
      if (typeof target[key as keyof T] !== 'object') {
        target[key as keyof T] = {} as T[Extract<keyof T, string>]
      }
      mergeDeep(
        target[key as keyof T] as T[Extract<keyof T, string>],
        source[key as keyof T] as T[Extract<keyof T, string>]
      )
    } else {
      target[key as keyof T] = source[key as keyof T]
    }
  }
  return target
}
