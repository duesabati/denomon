import { Command } from 'cliffy/command'

import * as Kits from '@denomon/core-kits'

const KITS_DIR = Kits.Env.get('KITS_DIR')
const KITS_CONFIG = Kits.Env.get('KITS_CONFIG')
const APPS_DIR = Kits.Env.get('APPS_DIR')
const ARTIFACTS_DIR = Kits.Env.get('ARTIFACTS_DIR')
const ENVS_DIR = Kits.Env.get('ENVS_DIR')

const config = new Kits.Configurator(new Kits.ConfigurationSheet(KITS_CONFIG))
const kits = new Kits.Registry(KITS_DIR, config)

const cmd = (opts: Kits.Build.Options, app: string) => {
  const build = new Kits.Build.Command({
    out: ARTIFACTS_DIR + `/${app}`,
    environment: ENVS_DIR + `/${opts.environment ?? 'production'}`,
    watch: opts.watch,
    minify: !opts.watch,
    sourcemap: true,
  })

  return kits.For(APPS_DIR + `/${app}`).Execute(build)
}

const configure = (cmd: Command<any, any, any>): void => {
  cmd.option(
    '-e, --environment <env:string>',
    'The env directory from which the kit will collect env vars.',
  )
    .option(
      '-w, --watch [watch:boolean]',
      'Whether to run the build in watch mode.',
      { default: false },
    )
    .arguments('<package:string>')
}

/*************** Build command ***************/
const build = new Command<void, void, Kits.Build.Options, [string]>()
  .name('build')
  .description('Execute build command of the kit associated with the package.')
  .action(cmd)

configure(build)

/*************** Develop command ***************/
const dev = new Command<void, void, Kits.Build.Options, [string]>()
  .name('develop')
  .description(
    'Execute the build command in development mode. Alias for `build --develop`.',
  )
  .alias('dev')
  .action((opts, pkg) =>
    cmd({
      ...opts,
      watch: true,
      environment: opts.environment ?? 'development',
    }, pkg)
  )

configure(dev)

export { build, dev }
