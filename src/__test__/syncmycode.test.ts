import {
  loadPackage,
  diffPackages,
  syncDependencies,
  needsPackageSync,
} from "../packages"
import path from "path"
import fs from "fs"
import { loadConfig } from "../config"
import { diffLocalChanges, syncDiffSetBackToExternal, watch } from "../sync"

const sleep = (time: number) => new Promise((r) => setTimeout(r, time))

describe("Local Sync", () => {
  const sourcePath: string = path.join(__dirname, "./data/source-project")
  const externalPath: string = path.join(__dirname, "./data/external-project")
  const currentPackageJSON = fs.readFileSync(
    `${sourcePath}/package.json`,
    "utf-8"
  )
  const buttonSourcePath = `${externalPath}/src/Button.js`
  const buttonSourceCode = fs.readFileSync(buttonSourcePath, "utf-8")
  let config: any

  afterAll((done) => {
    fs.rmdirSync(`${sourcePath}/lib`, { recursive: true })
    fs.writeFileSync(`${sourcePath}/package.json`, currentPackageJSON, "utf-8")
    fs.writeFileSync(buttonSourcePath, buttonSourceCode, "utf-8")
    done()
  })

  it("should parse config", () => {
    config = loadConfig(`${sourcePath}/sync.json`)
    expect(config).toBeDefined()
    expect(config.syncers.length).toEqual(1)
    expect(config.syncers[0].name).toEqual("some-ui-library")
  })

  it("should load a package", () => {
    const pkg: any = loadPackage(`${sourcePath}/package.json`)
    expect(pkg).toBeDefined()
    expect(pkg.name).toEqual("some-website")
  })

  it("should diff packages", () => {
    const remotePackagePath = `${externalPath}/package.json`
    const diff = diffPackages(`${sourcePath}/package.json`, remotePackagePath)
    expect(diff).toBeDefined()
    expect(diff.conflicts.length).toEqual(3)
    expect(diff.additions.length).toEqual(1)
    // the local version has newest copy
    expect(diff.conflicts[0].resolution.source).toEqual("local")
  })

  it("should sync package.json", () => {
    const sourcePackagePath = `${sourcePath}/package.json`
    const remotePackagePath = `${externalPath}/package.json`
    syncDependencies(sourcePath, config.syncers)
    const diff = diffPackages(sourcePackagePath, remotePackagePath)
    // 2 here because the react versions still don't match (the ones from UI are older)
    // TODO: figure out how this should work?
    expect(diff.conflicts.length).toEqual(2)
    expect(diff.additions.length).toEqual(0)
    expect(needsPackageSync(diff)).toEqual(false)
  })

  const buttonLocalPath = `${sourcePath}/lib/some-ui-library/Button.js`
  it("should sync external files", async (done) => {
    let watcher: any = await watch(config.syncers[0])
    expect(fs.existsSync(buttonLocalPath)).toEqual(true)
    watcher.close()
    done()
  })

  it("should detect source changes", () => {
    const code = fs.readFileSync(buttonLocalPath, "utf-8")
    const updatedCode = code.replace("// TODO: ", "// DONE: ")
    fs.writeFileSync(buttonLocalPath, updatedCode, "utf-8")
    const diffs: any = diffLocalChanges(config.syncers[0])
    expect(diffs.length).toEqual(1)
    expect(diffs[0].isStale).toEqual(false)
  })

  it("should copy source changes back to external", () => {
    let diffs: any = diffLocalChanges(config.syncers[0])
    const results = syncDiffSetBackToExternal(diffs)
    expect(results.length).toEqual(1)
    diffs = diffLocalChanges(config.syncers[0])
    expect(diffs.length).toEqual(0)
  })

  it("should detect stale changes", () => {
    const code = fs.readFileSync(buttonSourcePath, "utf-8")
    const updatedCode = code.replace("// DONE: ", "// FINSIHED: ")
    fs.writeFileSync(buttonSourcePath, updatedCode, "utf-8")
    const diffs: any = diffLocalChanges(config.syncers[0])
    expect(diffs.length).toEqual(1)
    expect(diffs[0].isStale).toEqual(true)
  })
})
