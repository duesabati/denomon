import { buildJS } from './src/build/esbuild.ts'
// import { buildCSS } from './src/shared/tailwind.ts'
import { buildStatic, cleanAssets } from './src/shared/static.ts'

const OUT_DIR = Deno.env.get('DENOMON_OUT') || 'unset'

async function main(): Promise<void> {
  await cleanAssets()
  console.time('Built in')
  const [build] = await Promise.all([
    buildJS(),
    buildStatic(),
    // buildCSS({ minify: true }),
  ])
  console.timeEnd('Built in')

  // if (build.metafile) {
  //   await Deno.writeTextFile(
  //     `${OUT_DIR}/.meta.json`,
  //     JSON.stringify(build.metafile),
  //   )
  // }

  return
}

await main()
