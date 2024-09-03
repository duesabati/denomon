const WORKSPACE_DIR = Deno.env.get('DENOMON_WORKSPACE_DIR') || 'unset'

const SRC_DIR = Deno.env.get('DENOMON_SRC') || 'unset'
const OUT_DIR = Deno.env.get('DENOMON_OUT') || 'unset'

const env = Object.fromEntries(
  Object.entries(Deno.env.toObject()).filter(([k]) => k.startsWith('WEB_'))
    .map(([k, v]) => [k.slice(4), v])
    .map(([k, v]) => [`process.env.${k}`, JSON.stringify(v)]),
)

export const buildJS = async () =>
  await Deno.bundle({
    entrypoints: [`${SRC_DIR}/main.tsx`],
    outputDir: OUT_DIR,
    packages: 'bundle',
    minify: true,
    sourcemap: 'linked',
    format: 'esm',
    platform: 'browser',
    write: true,
    // define: {
    //   'globalThis': 'window',
    //   'globalThis._IS_PRODUCTION_': 'true',
    //   'process.env.NODE_ENV': '"production"',
    //   ...env,
    // },
  })
