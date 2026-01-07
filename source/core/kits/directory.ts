import * as JSONC from '@std/jsonc'
import { basename } from '@std/path'
import { deepMerge } from '@std/collections'
import type * as Command from './commands/index.ts'

export class Kit {
  constructor(private readonly path: string, private readonly app: string) {}

  Execute(command: Command.Generic): void {
    command.Run(this.path, this.app)
  }
}

export interface ConfigurationSheet {
  Write(c: Record<string, Record<string, string>>): void
  Read(): Record<string, Record<string, string>>
}

export class ConfigurationSheet implements ConfigurationSheet {
  constructor(private readonly path: string) {}

  Read() {
    return JSONC.parse(Deno.readTextFileSync(this.path)) as Record<
      string,
      Record<string, string>
    >
  }

  Write(patch: Record<string, Record<string, string>>): void {
    const prev = deepMerge(this.Read(), patch)
    Deno.writeTextFileSync(this.path, JSON.stringify(prev, null, 2))
  }
}

export class Configurator {
  constructor(private readonly sheet: ConfigurationSheet) {}

  Find(app: string) {
    const { associations } = this.sheet.Read()
    return associations[app]
  }

  Associate(app: string, kit: string) {
    this.sheet.Write({ associations: { [app]: kit } })
  }
}

export class Registry {
  constructor(
    private readonly path: string,
    private readonly config: Configurator,
  ) {}

  For(app: string): Kit {
    const kit = this.config.Find(basename(app))

    if (!kit) throw new Error(`Kit not configured for app: ${app}`)

    return new Kit(this.path + `/${kit}`, app)
  }
}
