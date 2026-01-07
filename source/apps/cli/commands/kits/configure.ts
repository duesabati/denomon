import { Command } from 'cliffy/command'
import { Select } from 'cliffy/prompt'

import * as Kits from '@denomon/core-kits'

const KITS_DIR = Kits.Env.get('KITS_DIR')
const KITS_CONFIG = Kits.Env.get('KITS_CONFIG')
const APPS_DIR = Kits.Env.get('APPS_DIR')

const readDir = (path: string) =>
  Deno.readDirSync(path)
    .filter((d) => d.isDirectory)
    .map((d) => d.name)
    .toArray()

export const configure = new Command()
  .name('configure')
  .description('Configure and assign development kits to your apps.')
  .arguments('<package:string>')
  .action(async (_, app) => {
    const config = new Kits.Configurator(
      new Kits.ConfigurationSheet(KITS_CONFIG),
    )
    const kits = readDir(KITS_DIR)
    const apps = readDir(APPS_DIR)

    if (!apps.includes(app)) {
      throw Error(`There's no app named «${app}» in the apps folder`)
    }

    const kit: string = await Select.prompt({
      message: 'Pick a kit',
      options: kits.map((k) => ({ name: k, value: k })),
    })

    config.Associate(app, kit)
    console.log('Done!')
  })
