import * as Kits from '@denomon/core-kits'
import { parseArgs } from '@std/cli'

export type Parsed = Kits.Ship.Options & {
  src: string
}

export const Parse = (args: string[]): Parsed => {
  const parsed = parseArgs(args, {
    boolean: ['watch'],
    string: ['env-dir', 'out-dir'],
    default: {
      'env-dir': 'production',
    },
    stopEarly: true,
  })

  return {
    environment: parsed['env-dir'],
    out: parsed['out-dir'],
    watch: parsed['watch'],
    src: String(parsed._[0]),
  }
}

export const Env = (): Record<string, string | undefined> => {
  const current = Deno.env.toObject()

  const build: Record<string, string | undefined> = {}

  for (const [key, value] of Object.entries(current)) {
    if (key.startsWith(Kits.Ship.ENV_PREFIX)) {
      const envKey = key.substring(Kits.Ship.ENV_PREFIX.length)
      build[envKey] = value
    }
  }

  return build
}
