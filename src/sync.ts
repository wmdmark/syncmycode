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

const isEmptyDir = (path: string) => {
  const files = fs.readdirSync(path)
  return files.length === 0
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
    .filter((d: any) => {
      // filter out external empty dirs
      if (d.type1 === "missing") {
        if (d.type2 === "directory") {
          const dirPath = `${d.path2}/${d.name2}`
          return !isEmptyDir(dirPath)
        }
      }
      // filter out internal empty dirs
      if (d.type2 === "missing") {
        if (d.type1 === "directory") {
          const dirPath = `${d.path1}/${d.name1}`
          return !isEmptyDir(dirPath)
        }
      }
      return true
    })
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
