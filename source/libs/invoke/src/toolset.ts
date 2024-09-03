import type { Action } from './action.ts';

export class Toolset<T> {

  private tools = new Map<string, T>();

  Hang(tool: T, id: string): void {
    this.tools.set(id, tool);
  }

  Use<A extends any[], R>(id: string, action: Action<[T, ...A], R>, args: A): R {
    const tool = this.tools.get(id);
    if (!tool) throw new Error(`Tool ${id} was not found in this toolset.`);
    return action(tool, ...args); 
  }
}