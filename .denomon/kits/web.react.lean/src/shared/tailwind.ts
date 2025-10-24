const VERSION = 'v4.1.14' // Change this when updating Tailwind version
const BASE_URL =
  `https://github.com/tailwindlabs/tailwindcss/releases/download/${VERSION}`

export class Tailwindcss {
  constructor() {
  }

  async load(where: string): Promise<string> {
    const name = this.binaryName

    const url = `${BASE_URL}/${name}`
    const dir = `${where}/tailwind-bin`
    const path = `${dir}/${name}`

    await Deno.mkdir(dir, { recursive: true })

    try {
      await Deno.stat(path)
    } catch {
      const response = await fetch(url)

      if (!response.ok) {
        throw new Error(`Failed to download: ${response.statusText}`)
      }

      const file = await Deno.open(path, { create: true, write: true })
      await response.body?.pipeTo(file.writable)

      if (Deno.build.os !== 'windows') {
        await Deno.chmod(path, 0o755)
      }
    }

    return path
  }

  private get binaryName(): string {
    const os = Deno.build.os
    const arch = Deno.build.arch

    if (os === 'linux' && arch === 'x86_64') return 'tailwindcss-linux-x64'
    if (os === 'darwin' && arch === 'x86_64') return 'tailwindcss-macos-x64'
    if (os === 'darwin' && arch === 'aarch64') return 'tailwindcss-macos-arm64'
    if (os === 'windows' && arch === 'x86_64') {
      return 'tailwindcss-windows-x64.exe'
    }

    throw new Error(`Unsupported platform: ${os} ${arch}`)
  }
}

export function makeBuildCSS(tmp: string) {
  return function (
    config: { src: string; out: string; watch?: boolean },
  ): Promise<void> {
    const tw = new Tailwindcss()
    const { watch = false } = config

    return tw.load(tmp).then((path) => {
      const cmd = new Deno.Command(path, {
        args: [
          '-i',
          `${config.src}/index.css`,
          '-o',
          `${config.out}/index.css`,
          watch ? '--watch' : '',
        ],
      })

      return cmd.output().then((output) => {
        if (!output.success) {
          const decoder = new TextDecoder()
          console.error(decoder.decode(output.stderr))
          throw new Error('Tailwind CSS build failed')
        }
      })
    })
  }
}
