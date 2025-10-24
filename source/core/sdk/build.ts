import type * as Kits from '@denomon/core-kits'
import { parseArgs } from '@std/cli'

const UNSET = 'unset'

export type Parsed = Kits.Build.Options & Kits.Build.Configuration & {
  src: string
}

export const Parse = (args: string[]): Parsed => {
  const parsed = parseArgs(args, {
    boolean: ['watch', 'minify', 'sourcemap'],
    string: ['env-dir', 'out-dir'],
    default: {
      'env-dir': 'production',
      'out-dir': UNSET,
      watch: false,
      minify: false,
      sourcemap: false,
    },
    stopEarly: true,
  })

  if (parsed['out-dir'] === UNSET) {
    throw new Error('--out-dir is required')
  }

  return {
    environment: parsed['env-dir'],
    out: parsed['out-dir'],
    watch: parsed['watch'],
    src: String(parsed._[0]),
    minify: parsed['minify'],
    sourcemap: parsed['sourcemap'],
  }
}
