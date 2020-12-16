import cpx from "cpx"
import fs from "fs"
import path from "path"
import { compareSync } from "dir-compare"
import { getBasePath } from "./utils"

export const watch = (syncer: any) => {
  return new Promise((resolve, reject) => {
    let initialLoad = false
    // TODO: blob should be configurable
    const srcBlob = `${syncer.source}/**/*.*`
    const watcher = cpx.watch(srcBlob, syncer.destination, {
      clean: true,
      initialCopy: true,
    })

    watcher.on("copy", (e) => {
      if (initialLoad) {
        const relPath = path.relative(getBasePath(), e.dstPath)
        console.log(`🔄 ${e.dstPath}`)
      }
    })

    watcher.on("watch-error", (error: any) => {
      reject(error)
    })

    watcher.on("watch-ready", () => {
      initialLoad = true
      return resolve(watcher)
    })
  })
}

export const diffLocalChanges = (syncer: any) => {
  const local = syncer.destination
  const external = syncer.source

  if (!fs.existsSync(local)) return []

  const diff = compareSync(local, external, {
    excludeFilter: ".DS_Store",
    compareContent: true,
    // compareDate: true,
  })
  const differences = diff.diffSet
    ?.filter((d: any) => d.state !== "equal")
    .map((d: any) => {
      d.isStale = new Date(d.date1) < new Date(d.date2)
      return d
    })
  return differences
}

export const syncDiff = (diffSet: any) => {
  const source = `${diffSet.path1}/${diffSet.name1}`
  const destination = `${diffSet.path2}/${diffSet.name2}`
  fs.copyFileSync(source, destination)
  return { source, destination }
}

export const syncDiffSetBackToExternal = (differences: Array<any>) => {
  return differences.map(syncDiff)
}
