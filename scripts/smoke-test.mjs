const baseUrl = process.env.SMOKE_BASE_URL ?? 'http://127.0.0.1:3000'
for (const path of ['/', '/api/live', '/api/health', '/api/version']) {
  const response = await fetch(`${baseUrl}${path}`)
  if (!response.ok)
    throw new Error(`Smoke test failed: ${path} -> ${response.status}`)
}
console.log(`Smoke test passed against ${baseUrl}`)
