import * as JSONC from '@std/jsonc'
import { basename } from '@std/path'
import type * as Command from './commands/index.ts'

export class Kit {
  constructor(private readonly path: string, private readonly app: string) {}

  Execute(command: Command.Generic): void {
    command.Run(this.path, this.app)
  }
}

export class Config {
  constructor(private readonly associations = new Map<string, string>()) {}

  static Read(path: string): Config {
    const text = Deno.readTextFileSync(path)
    const { associations } = JSONC.parse(text) as Record<string, string>
    return new Config(new Map(Object.entries(associations)))
  }

  Find(app: string) {
    return this.associations.get(app)
  }
}

export class Registry {
  constructor(private readonly path: string, private readonly config: Config) {}

  For(app: string): Kit {
    console.log(`Looking for kit for app: ${app}`)
    const kit = this.config.Find(basename(app))

    if (!kit) throw new Error(`Kit not found for app: ${app}`)

    return new Kit(this.path + `/${kit}`, app)
  }
}
