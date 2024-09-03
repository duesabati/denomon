export interface Action<A extends any[] = never, R = void> {
  (...args: A): R
}

export interface Setter<T> extends Action<[T], T> {}

export interface Constructor<T> {
  new (...args: any[]): T
}

export function Noop(): void {}
