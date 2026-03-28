import { Command } from 'cliffy/command'

import { cli } from './cli.ts'
import { image } from './docker.ts'

export const update = new Command()
  .description("Generates or updates Denomon's own tooling and artifacts.")
  .command('cli', cli)
  .description('Generates or updates the Denomon CLI tool.')
  .command('image', image)
  .description('Generates or updates Denomon Docker images.')
