import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const workerId = process.env.VITEST_POOL_ID || process.env.VITEST_WORKER_ID || '0'
const TEST_DB_PATH = path.resolve(__dirname, `test-${workerId}.sqlite`)

if (fs.existsSync(TEST_DB_PATH)) {
  fs.unlinkSync(TEST_DB_PATH)
}

process.env.DB_PATH = TEST_DB_PATH

export { TEST_DB_PATH }
