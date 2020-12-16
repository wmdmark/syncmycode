import { getBasePath, loadJSON } from "./utils"
import path from "path"

export const loadConfig = (configPath: string) => {
  const config: any = loadJSON(configPath)
  let syncers: any = []
  const baseDir = getBasePath()
  config.syncers.forEach((sync: any) => {
    const name = sync.name
    const root = path.join(baseDir, sync.root)
    const source = path.join(root, sync.source)
    const destination = path.join(baseDir, sync.destination, `./${name}`)
    syncers.push({ name, root, source, destination })
  })
  return { syncers }
}
