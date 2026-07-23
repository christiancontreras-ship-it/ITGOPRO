import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'
const ignored = new Set([
  '.git',
  '.next',
  'node_modules',
  'playwright-report',
  'test-results',
])
const findings = []
async function walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (
      ignored.has(entry.name) ||
      entry.name.startsWith('node_modules') ||
      entry.name.startsWith('.next')
    )
      continue
    const path = join(dir, entry.name)
    if (entry.isDirectory()) {
      await walk(path)
      continue
    }
    if (!/\.(?:ts|tsx|js|mjs|json|md|yml|yaml|env|example)$/.test(entry.name))
      continue
    const source = await readFile(path, 'utf8')
    if (/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/.test(source))
      findings.push(`private key: ${path}`)
  }
}
await walk(process.cwd())
if (findings.length) {
  console.error(findings.join('\n'))
  process.exit(1)
}
console.log('Security scan: no embedded private keys found.')
