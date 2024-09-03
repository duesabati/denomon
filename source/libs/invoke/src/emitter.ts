import type { Action } from './action.ts'

export class Delegate<A extends any[] = []> implements Emitter<A> {
  private actions = new Set<Action<A>>()

  Do(a: Action<A>): void {
    this.actions.add(a)
  }

  DoNotDo(a: Action<A>): void {
    this.actions.delete(a)
  }

  Invoke(...args: A): void {
    for (const action of this.actions) action(...args)
  }
}

export interface Emitter<A extends any[] = []> {
  Do(cb: Action<A>): void
}

export interface Disposable {
  Dispose(): void
}
