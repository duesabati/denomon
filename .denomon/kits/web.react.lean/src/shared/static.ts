import { copy, ensureDir, exists } from '@std/fs'

const PREFIX = Deno.env.get('DENOMON_ENV_VARS_PREFIX') ?? ''
const BASE_URL = Deno.env.get(`${PREFIX}BASE_URL`) || `http://localhost:8000`
const APP_MAIN = `${BASE_URL}/main.js`

let index_html_check_done = false
let has_index_html = false

export async function buildStatic(config: {
  SRC_DIR: string
  OUT_DIR: string
}) {
  const { SRC_DIR, OUT_DIR } = config
  await ensureDir(`${OUT_DIR}`)

  await copy(`${SRC_DIR}/static`, `${OUT_DIR}`, { overwrite: true })

  if (!index_html_check_done) {
    has_index_html = await exists(`${SRC_DIR}/static/index.html`)
    index_html_check_done = true
  }

  if (has_index_html) {
    const html = await Deno.readTextFile(`${SRC_DIR}/static/index.html`)
    const newHtml = html
      .replace(/__BASE__/g, BASE_URL)
      .replace(/__MAIN__/g, APP_MAIN)

    await Deno.writeTextFile(`${OUT_DIR}/index.html`, newHtml)
  }
}

export async function removeAsset(path: string) {
  await Deno.remove(path, { recursive: true })
}

export async function cleanAssets(dir: string) {
  if (await exists(dir)) await removeAsset(dir)
}
