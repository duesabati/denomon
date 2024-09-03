import { Env } from '../env.ts'

import { Generic } from './concepts.ts'

export type Options = { environment: string; develop: boolean; out: string }

/**
 * The Build capability of a kit.
 *
 * It sets the necessary env vars and runs the build script of the kit.
 */
export class Build extends Generic {
  constructor(private readonly options: Options) {
    super()
  }

  Run(kit: string, app: string): void {
    const script = 'build.ts'

    const env = this.options.environment
    const out = this.options.out

    Env.set('SRC', app)
    Env.set('OUT', out)
    Env.set('ENV', env)

    const cmd = new Deno.Command('deno', {
      args: ['run', '-A', '--unstable-bundle', kit + `/${script}`],
      env: { ...Deno.env.toObject() },
    })

    cmd.spawn().output().catch(console.error)
  }
}
