import { Env } from '../env.ts'

import { Generic } from './concepts.ts'
import { parse } from '@std/dotenv'
import { basename } from '@std/path'

export type Options = {
  environment?: string
  watch: boolean
  minify: boolean
  sourcemap: boolean
}

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
    const out = this.options.out
    const app_name = basename(app).replace(/\.[^/.]+$/, '')
    const ENV_VAR_PREFIX = `APP_${app_name.toUpperCase()}_`

    Env.set('ENV_VARS_PREFIX', ENV_VAR_PREFIX)

    let env: Record<string, string> = {}
    const envFilePath = `${this.options.environment}/${basename(app)}.env`

    try {
      env = parse(Deno.readTextFileSync(envFilePath))
    } catch (_) {
      // noop
    }

    const args = [
      'run',
      '-A',
      '--quiet',
      '--unstable-bundle',
      kit + `/${ENTRYPOINT}`,
      `--out-dir=${out}`,
      this.options.minify ? '--minify' : '',
      this.options.sourcemap ? '--sourcemap' : '',
      this.options.watch ? '--watch' : '',
      app,
    ].filter(Boolean)

    const cmd = new Deno.Command('deno', {
      args,
      env: Object.fromEntries(
        Object.entries(env).map((
          [key, value],
        ) => [ENV_VAR_PREFIX + key, value]),
      ),
      stdout: 'piped',
      stderr: 'piped',
    })

    if (!this.options.environment) {
      console.log('No environment loaded.')
    } else {
      console.log(`Loaded environment «${basename(this.options.environment)}»`)
      console.log(JSON.stringify(env, null, 2))
    }

    const child = cmd.spawn()
    const decoder = new TextDecoder()
    const encoder = new TextEncoder()

    // Pipe stderr but first filter out Deno warnings
    child.stderr.pipeTo(
      new WritableStream({
        write(chunk) {
          const text = decoder.decode(chunk)
          if (!text.includes('Warning')) {
            Deno.stderr.write(encoder.encode(text))
          }
        },
      }),
    )

    child.stdout.pipeTo(
      new WritableStream({
        write(chunk) {
          const text = decoder.decode(chunk)
          if (!text.includes('Warning')) {
            Deno.stdout.write(encoder.encode(text))
          }
        },
      }),
    )
  }
}
