import fs from "fs"
import path from "path"
const env = process.env.NODE_ENV

export const loadJSON = (filePath: string) => {
  const data = fs.readFileSync(filePath, "utf-8")
  return JSON.parse(data)
}

export const fileExists = (filePath: string) => {
  return fs.existsSync(filePath)
}

export const saveJSON = (filePath: string, data: any) => {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8")
}

export const getBasePath = (addtionalPath?: string) => {
  let basePath: string = path.resolve("./")
  if (addtionalPath) basePath = path.join(basePath, addtionalPath)
  return basePath
}
