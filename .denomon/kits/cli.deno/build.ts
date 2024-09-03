import { basename } from '@std/path'

const SRC_DIR = Deno.env.get('DENOMON_SRC') || 'unset'
const OUT_DIR = Deno.env.get('DENOMON_OUT') || 'unset'

/**
 * Compile the main.ts file in the src directory, with all permissions.
 */
async function main() {
  const cmd = new Deno.Command(Deno.execPath(), {
    args: [
      'compile',
      '--allow-all',
      '--output',
      OUT_DIR + '/' + basename(SRC_DIR),
      `${SRC_DIR}/main.ts`,
    ],
    stdout: 'piped',
    stderr: 'piped',
  })

  console.log(`Compiling ${SRC_DIR}...`)
  const proc = cmd.spawn()

  const { success, signal } = await proc.output()

  if (signal === 'SIGINT') {
    Deno.env.set(
      'PATH',
      Deno.env.get('PATH')!.replace(`${OUT_DIR}:`, ''),
    )
  }

  if (success) {
    Deno.env.set('PATH', `${OUT_DIR}:${Deno.env.get('PATH')}`)
    return
  }

  Deno.env.set('PATH', Deno.env.get('PATH')!.replace(`${OUT_DIR}`, ''))
}

main()
