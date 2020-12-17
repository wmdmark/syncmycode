/*

*/

import { getBasePath, saveJSON } from "./utils"
import path from "path"
import { loadPackage } from "./packages"

export const createVSCodeWorkspace = (
  syncers: Array<any>,
  workspacePath?: string
) => {
  const pkg: any = loadPackage(path.join(getBasePath(), "package.json"))

  let folders: any = [{ name: pkg.name, path: "./" }]

  syncers.forEach((syncer: any) => {
    folders.push({ name: syncer.name, path: syncer.relativeSource })
  })

  let settings: any = {
    "files.exclude": {
      "**/.git": true,
      "**/.svn": true,
      "**/.hg": true,
      "**/CVS": true,
      "**/.DS_Store": true,
    },
  }
  syncers.forEach((syncer: any) => {
    const relDestination = path.relative(getBasePath(), syncer.destination)
    settings["files.exclude"][relDestination] = true
  })
  const workspace = { folders, settings }
  if (workspacePath) saveJSON(workspacePath, workspace)
  return workspace
}
