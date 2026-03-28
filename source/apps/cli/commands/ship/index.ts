import { Command } from 'cliffy/command'
import { walkSync } from '@std/fs'

import * as Kits from '@denomon/core-kits'

const KITS_DIR = Kits.Env.get('KITS_DIR')
const KITS_CONFIG = Kits.Env.get('KITS_CONFIG')
const APPS_DIR = Kits.Env.get('APPS_DIR')
const ENVS_DIR = Kits.Env.get('ENVS_DIR')
const SHIP_DIR = Kits.Env.get('SHIP_DIR')

const config = new Kits.Configurator(new Kits.ConfigurationSheet(KITS_CONFIG))
const kits = new Kits.Registry(KITS_DIR, config)

const cmd = (opts: Kits.Ship.Options, app: string | 'all', kit: string) => {
  if (app === 'all') {
    const paths: string[] = []

    // Collect all dir paths that contains a deno.json file
    for (const entry of walkSync(APPS_DIR)) {
      if (entry.isFile && entry.name === 'deno.json') {
        paths.push(entry.path)
      }
    }

    // Get the directory name of each path and build them
    const apps = paths.map(p => p.replace(APPS_DIR, '').replace('/deno.json', ''))

    for (const app of apps) {
      const build = new Kits.Ship.Command({
        out: opts.out,
        environment: ENVS_DIR + `/${opts.environment ?? 'production'}`,
        watch: opts.watch,
        config: SHIP_DIR + `/${app}`,
      })

      kits.Ship(kit, app).Execute(build)
    }

    return
  }

  const build = new Kits.Ship.Command({
    out: opts.out,
    environment: ENVS_DIR + `/${opts.environment ?? 'production'}`,
    watch: opts.watch,
    config: SHIP_DIR + `/${app}`,
  })

  return kits.Ship(kit, app).Execute(build)
}

const configure = (cmd: Command<any, any, any>): void => {
  cmd
    .option(
      '-e, --environment <env:string>',
      'The env directory from which the kit will collect env vars.',
    )
    .option(
      '-w, --watch [watch:boolean]',
      'Whether to run the build in watch mode.',
      { default: false },
    )
    .arguments('<package:string> <kit:string>', [
      'Target package to build. Use "all" to build all packages.',
      'The kit to use for shipping.',
    ])
}

/*************** Ship command ***************/
const ship = new Command<void, void, Kits.Ship.Options, [string, string]>()
  .description('Execute the ship kit associated with the package.')
  .action(cmd)

configure(ship)


export { ship }