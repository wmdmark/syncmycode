import { getBasePath, loadJSON } from "./utils"
const semverSatisfies = require("semver/functions/satisfies")
const semverGt = require("semver/functions/gt")
const coerce = require("semver/functions/coerce")

const loadDeps = (packagePath: string) => {
  const data = loadJSON(packagePath)
  return data.dependencies
}

export const diffDependencies = (syncers: Array<any>) => {
  let localDeps = loadDeps(`${getBasePath()}/package.json`)
  let conflicts: any = []
  let additions: any = []
  const deps: any = Object.keys(localDeps).reduce(
    (deps: any, packageName: string) => {
      deps[packageName] = {
        source: "local",
        version: localDeps[packageName],
        name: packageName,
      }
      return deps
    },
    {}
  )
  syncers.forEach((syncer: any) => {
    const packagePath: string = `${syncer.root}/package.json`
    const pkgDeps = loadDeps(packagePath)
    Object.keys(pkgDeps).forEach((packageName: string) => {
      const packageVersion: string = pkgDeps[packageName]
      if (!deps[packageName]) {
        const pkg = {
          source: syncer.name,
          version: packageVersion,
          name: packageName,
        }
        deps[packageName] = pkg
        additions.push(pkg)
      } else {
        const newVersion = coerce(packageVersion).version
        const currentVersion = coerce(deps[packageName].version).version
        const hasSatisfactoryVersion = semverSatisfies(
          newVersion,
          currentVersion
        )
        if (!hasSatisfactoryVersion) {
          let resolution: any = {}
          // assume that the latetst version is best
          if (semverGt(newVersion, currentVersion)) {
            // The current version is gra
            resolution.version = newVersion
            resolution.source = syncer.name
            resolution.name = packageName
          } else {
            resolution = deps[packageName]
          }
          conflicts.push({
            source: syncer.name,
            name: packageName,
            version: newVersion,
            resolution,
          })
        }
      }
    })
  })
  return { conflicts, additions, deps }
}
