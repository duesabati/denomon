import { default as esbuild } from 'esbuild'
import { denoPlugins } from 'esbuild-deno-plugin'

const PREFIX = Deno.env.get('DENOMON_ENV_VARS_PREFIX') ?? ''

const env = Object.fromEntries(
  Object.entries(Deno.env.toObject()).filter(([k]) => k.startsWith(PREFIX))
    .map(([k, v]) => [k.slice(PREFIX.length), v])
    .map(([k, v]) => [`process.env.${k}`, JSON.stringify(v)]),
)

export const buildJS = async (
  config: {
    workspace: string
    src: string
    out: string
    watch: boolean
    minify: boolean
    sourcemap: boolean
  },
) =>
  await esbuild.context({
    entryPoints: [`${config.src}/main.tsx`],
    outdir: config.out,
    bundle: true,
    jsx: 'automatic',
    minify: config.minify,
    keepNames: true,
    sourcemap: config.sourcemap,
    format: 'esm',
    metafile: true,
    plugins: [
      ...denoPlugins({ configPath: `${config.workspace}/deno.jsonc` }),
    ],
    define: {
      'globalThis': 'window',
      'globalThis._IS_PRODUCTION_': config.watch ? 'false' : 'true',
      'process.env.NODE_ENV': config.watch ? '"development"' : '"production"',
      ...env,
    },
  })
