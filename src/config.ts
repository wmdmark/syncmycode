import { getBasePath, loadJSON } from "./utils"
import path from "path"
import { loadPackage } from "./packages"

export const loadConfig = (configPath: string) => {
  const config: any = loadJSON(configPath)
  let syncers: any = []
  const baseDir = getBasePath()
  config.syncers.forEach((sync: any) => {
    const root = path.join(baseDir, sync.root)
    const pkg = loadPackage(path.normalize(`${root}/package.json`))
    const name = sync.name || pkg.name
    const source = path.join(root, sync.source)
    const destination = path.join(baseDir, sync.destination, `./${name}`)
    syncers.push({ name, root, source, destination })
  })
  return { syncers }
}
