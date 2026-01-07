const SOURCE = Deno.env.get('DENOMON_SOURCE')
const PATH = Deno.env.get('DENOMON_PATH')

async function main(args: string[]) {
  const [entry = SOURCE, outfile = PATH] = args

  console.log(entry, outfile)

  if (!entry || !outfile) {
    console.error('Usage: deno run --allow-all main.ts <entry> <outfile>')
    console.error(
      'You can also set DENOMON_SOURCE and DENOMON_PATH environment variables.',
    )
    Deno.exit(1)
  }

  const cmd = new Deno.Command(Deno.execPath(), {
    args: [
      'compile',
      '--no-lock',
      '--allow-all',
      '--output',
      outfile,
      entry,
    ],
    stdout: 'inherit',
    stderr: 'inherit',
  })

  const { code } = await cmd.output()

  Deno.exit(code)
}

main(Deno.args)
