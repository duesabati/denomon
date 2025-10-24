import { makeBuildCSS } from './src/shared/tailwind.ts'
import { buildStatic } from './src/shared/static.ts'
import * as SDK from '@denomon/sdk'

const WORKSPACE_DIR = Deno.env.get('DENOMON_WORKSPACE_DIR') || 'unset'
const TMP_DIR = Deno.env.get('DENOMON_TMP_DIR') || 'unset'

import { default as esbuild } from 'esbuild'
import { denoPlugins } from 'esbuild-deno-plugin'

const PREFIX = Deno.env.get('DENOMON_ENV_VARS_PREFIX') ?? ''

const env = Object.fromEntries(
  Object.entries(Deno.env.toObject()).filter(([k]) => k.startsWith(PREFIX))
    .map(([k, v]) => [k.slice(PREFIX.length), v])
    .map(([k, v]) => [`process.env.${k}`, JSON.stringify(v)]),
)

const buildCSS = makeBuildCSS(TMP_DIR)

async function main(args: string[]): Promise<void> {
  const options = SDK.BuildOptions.Parse(args)

  const js = await esbuild.context({
    entryPoints: [`${options.src}/main.tsx`],
    outdir: options.out,
    bundle: true,
    jsx: 'automatic',
    minify: options.minify,
    keepNames: true,
    sourcemap: options.sourcemap,
    format: 'esm',
    metafile: true,
    plugins: [
      ...denoPlugins({ configPath: `${WORKSPACE_DIR}/deno.jsonc` }),
    ],
    define: {
      'globalThis': 'window',
      'globalThis._IS_PRODUCTION_': options.watch ? 'false' : 'true',
      'process.env.NODE_ENV': options.watch ? '"development"' : '"production"',
      ...env,
    },
  })

  console.log(options.watch ? 'Watching for changes...' : 'Building...')

  console.time('Built in')
  const [build] = await Promise.all([
    await js.rebuild(),
    await buildCSS({ src: options.src, out: options.out, watch: false }),
    await buildStatic({ SRC_DIR: options.src, OUT_DIR: options.out }),
  ])
  console.timeEnd('Built in')

  if (options.watch) {
    const watcher = Deno.watchFs(options.src)
    for await (const event of watcher) {
      if (
        event.kind === 'modify' || event.kind === 'create' ||
        event.kind === 'remove'
      ) {
        console.log('Changes detected. Rebuilding...')
        console.time('Rebuilt in')
        await Promise.all([
          js.rebuild().catch((err) => {
            console.error('Build error:', err.message)
          }),
          buildCSS({ src: options.src, out: options.out, watch: true }),
          buildStatic({ SRC_DIR: options.src, OUT_DIR: options.out }),
        ])
        console.timeEnd('Rebuilt in')
      }
    }
  } else {
    await js.dispose()
  }

  if (build.metafile) {
    await Deno.writeTextFile(
      `${options.out}/.meta.json`,
      JSON.stringify(build.metafile),
    )
  }
}

await main(Deno.args)
