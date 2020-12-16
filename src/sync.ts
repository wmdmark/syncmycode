import cpx from "cpx"
import fs from "fs"
import { compareSync } from "dir-compare"

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
        console.log(`${e.srcPath} -> ${e.dstPath}`)
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
  const diff = compareSync(local, external, { compareDate: true })
  return diff
}

export const syncDiff = (diffSet: any) => {
  const source = `${diffSet.path1}/${diffSet.name1}`
  const destination = `${diffSet.path2}/${diffSet.name2}`
  fs.copyFileSync(source, destination)
  return { source, destination }
}

export const syncDiffSetBackToExternal = (diff: any) => {
  return diff.diffSet.map(syncDiff)
}
