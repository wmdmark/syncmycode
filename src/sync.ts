import cpx from "cpx"

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
