import { getBasePath, loadJSON } from "./utils"
const semverSatisfies = require("semver/functions/satisfies")
const semverGt = require("semver/functions/gt")
const coerce = require("semver/functions/coerce")

export const loadPackage = (packagePath: string): any => {
  const data = loadJSON(packagePath)
  return data
}

export const diffPackages = (
  source: string,
  ...externalSources: Array<string>
) => {
  let localPackage = loadPackage(source)
  const localDeps: any = Object.keys(localPackage.dependencies).reduce(
    (deps: any, packageName: string) => {
      deps[packageName] = {
        source: "local",
        version: localPackage.dependencies[packageName],
        name: packageName,
      }
      return deps
    },
    {}
  )
  let conflicts: any = []
  let additions: any = []
  externalSources.forEach((externalSource: string) => {
    const pkg = loadPackage(externalSource)
    const pkgDeps = pkg.dependencies
    Object.keys(pkgDeps).forEach((packageName: string) => {
      const packageVersion: string = pkgDeps[packageName]
      if (!localDeps[packageName]) {
        const pack = {
          source: pkg.name,
          version: packageVersion,
          name: packageName,
        }
        localDeps[packageName] = pack
        additions.push(pack)
      } else {
        const newVersion = coerce(packageVersion).version
        const currentVersion = coerce(localDeps[packageName].version).version
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
            resolution.source = pkg.name
            resolution.name = packageName
          } else {
            resolution = localDeps[packageName]
          }
          conflicts.push({
            source: pkg.name,
            name: packageName,
            version: newVersion,
            resolution,
          })
        }
      }
    })
  })
  return { additions, conflicts, all: localDeps }
}

export const diffDependencies = (syncers: Array<any>) => {
  return diffPackages(
    `${getBasePath()}/package.json`,
    ...syncers.map((syncer: any) => `${syncer.root}/package.json`)
  )
}
