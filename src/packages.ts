import { loadJSON } from "./utils"
import fs from "fs"
import semverSatisfies from "semver/functions/satisfies"
import semverGt from "semver/functions/gt"
import coerce from "semver/functions/coerce"
import sortPackageJson from "sort-package-json"

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
  let needsSync: boolean = false
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
          const isExternalNewer = semverGt(newVersion, currentVersion)
          if (isExternalNewer) {
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
            newer: isExternalNewer,
          })

          localDeps[packageName] = resolution
        }
      }
    })
  })
  return { additions, conflicts, resolved: localDeps }
}

export const needsPackageSync = (packageDiff: any) => {
  // Do we need to update the package.json?
  if (packageDiff.additions.length > 0) return true
  if (packageDiff.conflicts.length > 0) {
    const newer = packageDiff.conflicts.filter((con: any) => con.newer === true)
    return newer.length > 0
  }
  return false
}

export const diffDependencies = (sourcePath: string, syncers: Array<any>) => {
  return diffPackages(
    `${sourcePath}/package.json`,
    ...syncers.map((syncer: any) => `${syncer.root}/package.json`)
  )
}

export const syncDependencies = (sourcePath: string, syncers) => {
  const diff = diffDependencies(sourcePath, syncers)
  const packagePath = `${sourcePath}/package.json`
  const pkg: any = loadPackage(packagePath)
  pkg.dependencies = Object.keys(diff.resolved).reduce(
    (deps: any, packageName: string) => {
      deps[packageName] = diff.resolved[packageName].version
      return deps
    },
    {}
  )
  const packageJSON = sortPackageJson(JSON.stringify(pkg, null, 2))
  fs.writeFileSync(packagePath, packageJSON, "utf-8")
}
