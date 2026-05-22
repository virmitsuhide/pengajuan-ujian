import { chromium } from 'playwright'

const BASE = 'http://localhost:3000'

const browser = await chromium.launch({ headless: true })
const page = await browser.newPage()
page.setViewportSize({ width: 390, height: 844 }) // iPhone size

const errors = []
page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()) })
page.on('pageerror', err => errors.push(err.message))

// 1. Login
await page.goto(`${BASE}/login`)
await page.fill('#username', 'koorsd')
await page.fill('#password', 'bismillah')
await page.click('button[type="submit"]')
await page.waitForURL('**/dashboard', { timeout: 10000 })
await page.screenshot({ path: 'scripts/ss-dashboard.png' })
console.log('✅ Dashboard')

// 2. Halaman Guru
await page.goto(`${BASE}/dashboard/guru`)
await page.waitForLoadState('networkidle')
await page.screenshot({ path: 'scripts/ss-guru.png' })
console.log('✅ Guru page')

// 3. Halaman Kelola
await page.goto(`${BASE}/dashboard/submissions`)
await page.waitForLoadState('networkidle')
await page.screenshot({ path: 'scripts/ss-kelola.png' })
console.log('✅ Kelola page')

// 4. Console errors
if (errors.length > 0) {
  console.log('\n❌ Console errors:')
  errors.forEach(e => console.log(' -', e))
} else {
  console.log('\n✅ Tidak ada console error')
}

await browser.close()
