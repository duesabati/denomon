import { Command } from 'cliffy/command'
import { configure } from './configure.ts'

export const kits = new Command()
  .name('kits')
  .description('All kits related commands')
  .command('configure', configure)
