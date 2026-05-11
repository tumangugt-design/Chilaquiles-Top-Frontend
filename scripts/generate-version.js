import { writeFileSync, mkdirSync } from 'fs'
import { resolve } from 'path'

const publicDir = resolve(process.cwd(), 'public')
mkdirSync(publicDir, { recursive: true })
writeFileSync(
  resolve(publicDir, 'version.json'),
  JSON.stringify({ buildId: String(Date.now()) }, null, 2)
)
