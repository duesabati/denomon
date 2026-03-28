import { parse } from '@std/dotenv'

import { Generic } from './concepts.ts'
import { Env } from '../env.ts'

export type Options = {
  watch: boolean
  environment?: string
  out?: string
}

export type Configuration = {
  config?: string
  app: string
}

const ARTIFACTS_DIR = Env.get('ARTIFACTS_DIR')
const PACKAGES_DIR = Env.get('PACKAGES_DIR')
const ENVS_DIR = Env.get('ENVS_DIR')

export const ENTRYPOINT = 'main.ts'
export const ENV_PREFIX = 'RELEASE_ARG_'

/**
 * A ship kit.
 *
 * It sets the necessary env vars and runs the build script of the kit.
 */
export class Command extends Generic {
  constructor(private readonly options: Options & Configuration) {
    super()
  }

  Run(kit: string, app: string): void {
    const out = this.options.out

    const env_name = this.options.environment
      ? this.options.environment.replace(`${ENVS_DIR}/`, '')
      : 'production'

    const env: Record<string, string> = {}
    const envFilePath = `${this.options.environment}/${app}.env`

    try {
      const fromFile = parse(Deno.readTextFileSync(envFilePath))

      const releaseArgs = Object.entries(fromFile).filter(([key]) =>
        key.startsWith(ENV_PREFIX)
      )

      for (const [key, value] of releaseArgs) {
        env[key] = value
      }
    } catch (_) { /* noop */ }

    const args = [
      'run',
      '-A',
      '--quiet',
      '--unstable-bundle',
      kit + `/${ENTRYPOINT}`,
      `--out-dir=${out ?? PACKAGES_DIR + `/${app}`}`,
      this.options.config ? `--config=${this.options.config}` : '',
      this.options.watch ? '--watch' : '',
      this.options.environment ? `--env-dir=${env_name}` : '',
      `--app=${app}`,
      ARTIFACTS_DIR + `/${app}`,
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
