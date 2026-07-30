import { randomBytes, scrypt as scryptCallback } from 'node:crypto'
import { promisify } from 'node:util'
const scrypt = promisify(scryptCallback)
const samples = Number(process.env.PASSWORD_BENCHMARK_SAMPLES || 10)
const start = performance.now()
for (let i = 0; i < samples; i++) await scrypt('benchmark passphrase', randomBytes(16), 64, { N: 16384, r: 8, p: 1, maxmem: 64 * 1024 * 1024 })
console.log(JSON.stringify({ algorithm: 'scrypt', N: 16384, r: 8, p: 1, keyLength: 64, samples, averageMilliseconds: Number(((performance.now() - start) / samples).toFixed(2)) }))
