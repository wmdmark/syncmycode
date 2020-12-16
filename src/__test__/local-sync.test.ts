import { loadPackage, diffPackages } from "../packages"
import path from "path"
import fs from "fs"
import { loadConfig } from "../config"
import { watch } from "../sync"

const sleep = (time: number) => new Promise((r) => setTimeout(r, time))

describe("Local Sync", () => {
  const sourcePath: string = path.join(__dirname, "./data/source-project")
  const externalPath: string = path.join(__dirname, "./data/external-project")

  let config: any

  afterAll(() => {
    fs.rmdirSync(`${sourcePath}/lib`, { recursive: true })
  })

  it("should parse config", () => {
    config = loadConfig(`${sourcePath}/local-sync.json`)
    expect(config).toBeDefined()
    expect(config.syncers.length).toEqual(1)
    expect(config.syncers[0].name).toEqual("ui-lib")
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

  it("should sync packages", async () => {
    let watcher: any = await watch(config.syncers[0])
    const expectedPath = `${sourcePath}/lib/ui-lib/Button.js`
    expect(fs.existsSync(expectedPath)).toEqual(true)
    watcher.close()
  })

  it("should detect local changes", () => {
    const buttonPath = `${sourcePath}/lib/ui-lib/Button.js`
    const code = fs.readFileSync(buttonPath, "utf-8")
    const updatedCode = code.replace("// TODO: ", "// DONE: ")
    fs.writeFileSync(buttonPath, updatedCode, "utf-8")
  })
})
