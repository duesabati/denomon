import { parse } from '@std/dotenv'

import { Generic } from './concepts.ts'
import { Env } from '../env.ts'

export type Options = {
  environment?: string
  watch: boolean
  minify: boolean
  sourcemap: boolean
}

export type Configuration = { out: string }

const APPS_DIR = Env.get('APPS_DIR')
const ENVS_DIR = Env.get('ENVS_DIR')

export const ENTRYPOINT = 'build.ts'
export const ENV_PREFIX = 'DENOMON_BUILD_'

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

    const app_name = app.replace(`${APPS_DIR}/`, '')
    const env_name = this.options.environment
      ? this.options.environment.replace(`${ENVS_DIR}/`, '')
      : 'production'

    let env: Record<string, string> = {}
    const envFilePath = `${this.options.environment}/${app_name}.env`

    try {
      const fromFile = parse(Deno.readTextFileSync(envFilePath))

      env = fromFile

      for (const [key, value] of Object.entries(fromFile)) {
        env[ENV_PREFIX + key] = value
      }
    } catch (_) { /* noop */ }

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
      this.options.environment ? `--env-dir=${this.options.environment}` : '',
      app,
    ].filter(Boolean)

    const cmd = new Deno.Command('deno', {
      args,
      env,
      stdout: 'piped',
      stderr: 'piped',
    })

    if (!this.options.environment) {
      console.log('No environment loaded.')
    } else {
      console.log(`Loaded environment «${env_name}»`)
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
