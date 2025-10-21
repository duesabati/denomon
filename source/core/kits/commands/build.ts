import { Env } from '../env.ts'

import { Generic } from './concepts.ts'

export type Options = { environment: string; watch: boolean }
export type Configuration = { out: string }

export const ENTRYPOINT = 'build.ts'

/**
 * The Build capability of a kit.
 *
 * It sets the necessary env vars and runs the build script of the kit.
 */
export class Command extends Generic {
  constructor(private readonly options: Options & Configuration) {
    super()
  }

  Run(kit: string, app: string): void {
    const env = this.options.environment
    const out = this.options.out

    Env.set('SRC', app)
    Env.set('OUT', out)
    Env.set('ENV', env)

    const cmd = new Deno.Command('deno', {
      args: [
        'run',
        '-A',
        '--quiet',
        '--unstable-bundle',
        kit + `/${ENTRYPOINT}`,
        `--out-dir=${out}`,
        `--env-dir=${env}`,
        this.options.watch ? '--watch' : '',
        app,
      ],
      env: { ...Deno.env.toObject() },
    })

    cmd.spawn().output().catch(console.error)
  }
}
