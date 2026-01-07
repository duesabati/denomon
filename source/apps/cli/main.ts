import { Command } from 'cliffy'

import * as Commands from './commands/index.ts'

await new Command()
  .name('Denomon CLI')
  .description('Manage your Denomon monorepo setup with ease.')
  .version('0.0.1')
  .usage('denomon <command> [options]')
  /** Build */
  .command('build', Commands.build)
  /** Develop */
  .command('develop', Commands.dev)
  /** Kits */
  .command('kits', Commands.kits)
  .parse(Deno.args)
