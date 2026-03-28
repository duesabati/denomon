import { Command } from 'cliffy/command'

const REPO = Deno.env.get('DENOMON_REPO_DIR')
const PATH = Deno.env.get('DENOMON_PATH')

/**
 * Recompilation is done by sideloading a script that performs the recompilation.
 */
export const cli = new Command()
  .action(async () => {
    console.log('Recompiling the CLI tool...')

    if (!REPO) {
      throw new Error('DENOMON_REPO_DIR environment variable is not set.')
    }

    if (!PATH) {
      throw new Error('DENOMON_PATH environment variable is not set.')
    }

    console.log(`Source Directory: ${REPO}`)

    const ship = `${REPO}/source/ship/cli/main.ts`

    // Check if Deno is installed and get its path
    const check = new Deno.Command('deno', {
      args: ['info'],
      stdout: 'piped',
      stderr: 'piped',
    })

    const result = await check.output()

    if (result.code !== 0) {
      const errorOutput = new TextDecoder().decode(result.stderr)
      throw new Error(
        `Deno is not installed or not found in PATH.\n${errorOutput}`,
      )
    }

    const cmd = new Deno.Command('deno', {
      args: [
        'run',
        '--allow-read',
        '--allow-write',
        '--allow-env',
        '--allow-run',
        ship,
      ],
      stdout: 'piped',
      stderr: 'piped',
      env: {
        DENOMON_SOURCE: REPO + '/source/apps/cli/main.ts',
        DENOMON_PATH: PATH,
      },
    })

    const process = cmd.spawn()

    process.stdout.pipeTo(Deno.stdout.writable)
    process.stderr.pipeTo(Deno.stderr.writable)

    const { code } = await process.status

    Deno.exit(code)
  })
