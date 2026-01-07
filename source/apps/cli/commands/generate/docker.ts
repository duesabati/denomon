import { Command } from 'cliffy/command'

const REPO = Deno.env.get('DENOMON_REPO_DIR')

export const image = new Command()

  .action(async () => {
    console.log('Generating Dockerfile for Denomon...')

    if (!REPO) {
      throw new Error('DENOMON_REPO_DIR environment variable is not set.')
    }

    const ship = `${REPO}/source/ship/docker/Dockerfile`

    const check = new Deno.Command('docker', {
      args: ['info'],
      stdout: 'piped',
      stderr: 'piped',
    })

    const result = await check.output()

    if (result.code !== 0) {
      const errorOutput = new TextDecoder().decode(result.stderr)
      throw new Error(
        `Docker is not installed or not found in PATH.\n${errorOutput}`,
      )
    }

    const cmd = new Deno.Command('docker', {
      args: ['build', '--progress=plain', '-f', ship, '-t', 'denomon', REPO],
      stdin: 'inherit',
      stdout: 'inherit',
      stderr: 'inherit',
    })

    const process = cmd.spawn()

    const { code } = await process.status

    Deno.exit(code)
  })
