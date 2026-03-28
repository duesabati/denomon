import * as Kits from '@denomon/core-kits'
import { parseArgs } from '@std/cli'

export type Parsed = 
  & Kits.Ship.Options
  & Kits.Ship.Configuration
  & { src: string }

export const Parse = (args: string[]): Parsed => {
  const parsed = parseArgs(args, {
    boolean: ['watch'],
    string: ['env-dir', 'out-dir', 'config'],
    default: { 'env-dir': 'production' },
    stopEarly: true,
  })

  return {
    environment: parsed['env-dir'],
    out: parsed['out-dir'],
    watch: parsed['watch'],
    config: parsed['config'],
    src: String(parsed._[0]),
  }
}

export const Env = (): Record<string, string | undefined> => {
  const current = Deno.env.toObject()

  const envs: Record<string, string | undefined> = {}

  for (const [key, value] of Object.entries(current)) {
    if (key.startsWith(Kits.Ship.ENV_PREFIX)) {
      const envKey = key.substring(Kits.Ship.ENV_PREFIX.length)
      envs[envKey] = value
    }
  }

  return envs
}
