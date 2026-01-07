import { Command } from 'cliffy/command'

import { cli } from './cli.ts'
import { image } from './docker.ts'

export const generate = new Command()
  .name('generate')
  .description("Generate or rebuild Denomon's own tooling and artifacts.")
  .command('cli', cli)
  .description('Generate or rebuild the Denomon CLI tool.')
  .command('image', image)
  .description('Generate or rebuild Denomon Docker images.')
