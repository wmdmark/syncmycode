#!/usr/bin/env node
import chalk from "chalk"
import clear from "clear"
import { program } from "commander"
import figlet from "figlet"
import path from "path"
import fs from "fs"
import { diffDependencies } from "./packages"
import { watch } from "./sync"
import { getBasePath } from "./utils"
// import program from "commander"

const env = process.env.NODE_ENV

clear()
console.log(
  chalk.red(figlet.textSync("local-sync", { horizontalLayout: "full" }))
)

program
  .version("0.0.1")
  .description("A CLI for syncing local code")
  .command("start", "start the watcher")
  .option("-c, --config", "path to config file")

program.exitOverride()
try {
  program.parse(process.argv)
} catch (err) {
  // custom processing...
  console.log("program error: ", err)
}

const syncers: any = []

const baseDir = getBasePath()

const config = program.config || "./local-sync.json"
const configPath = path.join(baseDir, config)

const loadConfig = (configPath: string) => {
  const rawData: any = fs.readFileSync(configPath)
  const config: any = JSON.parse(rawData)
  config.syncers.forEach((sync: any) => {
    const name = sync.name
    const root = path.join(baseDir, sync.root)
    const source = path.join(root, sync.source)
    const destination = path.join(baseDir, sync.destination, `./${name}`)
    syncers.push({ name, root, source, destination })
  })
}

clear()
loadConfig(configPath)

const depsDiff = diffDependencies(syncers)

// TODO: if addtions or conflicts show message

const watchSyncers = async () => {
  await Promise.all(syncers.map(watch))
  console.log("init watchers")
}

watchSyncers()

if (!process.argv.slice(2).length) {
  program.outputHelp()
}
