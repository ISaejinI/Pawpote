// Lance les tests d'API (Vitest) depuis le dossier `server/`.
// Sous Windows, un terminal ouvert en « c:\ » (VS Code) au lieu de « C:\ » fait charger Vitest
// deux fois, et aucun test ne se lance : on repart donc du même dossier, lettre en majuscule.
import { spawnSync } from 'node:child_process'
import { join } from 'node:path'

const cwd = process.cwd().replace(/^[a-z]:/, (drive) => drive.toUpperCase())
const vitest = join(cwd, 'node_modules', 'vitest', 'vitest.mjs')
const { status } = spawnSync(process.execPath, [vitest, 'run', ...process.argv.slice(2)], { cwd, stdio: 'inherit' })
process.exit(status ?? 1)
