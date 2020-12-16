#!/usr/bin/env node
import chalk from "chalk"
import clear from "clear"
import inquirer from "inquirer"
import { program } from "commander"
import figlet from "figlet"
import path from "path"
import {
  diffDependencies,
  needsPackageSync,
  syncDependencies,
} from "./packages"
import { diffLocalChanges, syncDiffSetBackToExternal, watch } from "./sync"
import { getBasePath } from "./utils"
import { loadConfig } from "./config"

const log = console.log
const warn = chalk.keyword("orange")
let watchers

clear()
console.log(
  chalk.blueBright(figlet.textSync("local-sync", { horizontalLayout: "full" }))
)

program
  .version("0.0.1")
  .description("A CLI for syncing local code")
  .option("-c, --config", "path to config file")

program.exitOverride()

try {
  program.parse(process.argv)
} catch (err) {
  // custom processing...
  // console.log("program error: ", err)
}

const baseDir = getBasePath()
const configFile = program.config || "./local-sync.json"
const configPath = path.join(baseDir, configFile)

log(`✔ Loading config from... ${configPath}`)
let config: any = loadConfig(configPath)

log(`Syncing to ${config.syncers.length} sources: `)
config.syncers.forEach((sync: any) => log(` - ${sync.name}`))

const checkPackages = async () => {
  const packageDiff: any = diffDependencies(getBasePath(), config.syncers)
  if (needsPackageSync(packageDiff)) {
    log(warn("Your local package.json needs to be updated: "))
    log("---------------------")
    if (packageDiff.additions.length) {
      log("The following dependencies should be added: ")
      packageDiff.additions.forEach((add: any) =>
        log(`- ${add.name}@${add.version}`)
      )
    }
    const upgrades = packageDiff.conflicts.filter((c: any) => c.newer)
    if (upgrades.length) {
      log("The following dependencies should be upgraded: ")
      upgrades.forEach((up: any) => log(`- ${up.name}@${up.version}`))
    }

    const prompt = {
      type: "confirm",
      name: "update",
      message: "Would you like to auto update your local package.json?",
      default: true,
    }
    const answers = await inquirer.prompt([prompt])
    if (answers.update) {
      log("Syncing local package.json...")
      syncDependencies(getBasePath(), config.syncers)
      log(chalk.green(`✔ Local package.json updated`))
    }
    return true
  }
}

const checkLocalChanges = async () => {
  let diffs: any = []

  config.syncers.forEach((syncer: any) => {
    const differences: any = diffLocalChanges(syncer)?.filter(
      (d: any) => d.isStale === false
    )
    if (differences.length > 0) {
      log(warn(`Found newer local changes made to ${syncer.name}`))
      differences.map((dif: any) => {
        const relPath = path.relative(
          getBasePath(),
          `${dif.path1}/${dif.name1}`
        )
        log(`- ${relPath}`)
      })
      diffs.push(differences)
    }
  })

  if (diffs.length) {
    const prompt = {
      type: "list",
      name: "option",
      message: "What do you want to do?",
      choices: [
        { key: "s", name: "Sync local changes back to sources", value: "sync" },
        {
          key: "i",
          name: "Overwrite local changes with source",
          value: "ignore",
        },
      ],
    }
    const answers = await inquirer.prompt([prompt])
    if (answers.option === "sync") {
      log("Syncing back to source...")
      diffs.map(syncDiffSetBackToExternal)
      log(`✔ Files synced`)
    }
    return true
  }

  return false
}

const startSync = () => {
  log("Watcher started")
  log("---------------------")
  return Promise.all(
    config.syncers.map((syncer: any) => {
      log(chalk.blueBright(`👀 watching ${syncer.name} for changes...`))
      return watch(syncer)
    })
  )
}

const run = async () => {
  await checkPackages()
  log(`✔ Local package.json looks good`)
  await checkLocalChanges()
  log(`✔ Local files are synced`)
  watchers = await startSync()
}

const cleanup = () => {
  if (watchers) watchers.forEach((watcher) => watcher.close())
}

const exitSignals = [
  `exit`,
  `SIGINT`,
  `SIGUSR1`,
  `SIGUSR2`,
  `uncaughtException`,
  `SIGTERM`,
]
exitSignals.forEach((eventType) => {
  process.on(eventType, cleanup.bind(null, eventType))
})

run()

// if (!process.argv.slice(2).length) {
//   program.outputHelp()
// }
