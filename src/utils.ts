import fs from "fs"
import path from "path"
const env = process.env.NODE_ENV

export const loadJSON = (filePath: string) => {
  const data = fs.readFileSync(filePath, "utf-8")
  return JSON.parse(data)
}

export const getBasePath = () => {
  return path.resolve("./")
}
