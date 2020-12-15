import cpx from "cpx"

export const watch = (syncer: any) => {
  // TODO: make this blob configurable
  let initialLoad = false
  const srcBlob = `${syncer.source}/**/*.*`
  console.log("watch: ", srcBlob, syncer.destination)
  const watcher = cpx.watch(
    srcBlob,
    syncer.destination,
    { clean: true, initialCopy: true },
    () => {
      console.log("init watcher")
    }
  )

  watcher.on("copy", (e) => {
    if (initialLoad) {
      console.log(`${e.srcPath} -> ${e.dstPath}`)
    }
  })

  watcher.on("watch-ready", () => {
    console.log("watch ready for " + syncer.name)
    initialLoad = true
  })

  return Promise.resolve(watcher)
}
