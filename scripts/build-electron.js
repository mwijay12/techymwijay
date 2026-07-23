#!/usr/bin/env node
/**
 * Electron Build Helper
 * Builds the Next.js app and packages it for each platform.
 *
 * Usage:
 *   node scripts/build-electron.js win     # Windows .exe
 *   node scripts/build-electron.js mac     # macOS .dmg
 *   node scripts/build-electron.js linux   # Linux .AppImage
 *   node scripts/build-electron.js all     # All platforms
 */

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

const platform = process.argv[2] || 'current'

console.log('🚀 Mwijay Tech — Electron Build Script')
console.log('======================================')
console.log(`Platform: ${platform}`)
console.log(`Node.js: ${process.version}`)
console.log(`Working dir: ${process.cwd()}`)
console.log('')

function run(cmd, label) {
  console.log(`⏳ ${label}...`)
  try {
    execSync(cmd, { stdio: 'inherit', env: { ...process.env } })
    console.log(`✅ ${label} complete\n`)
  } catch (err) {
    console.error(`❌ ${label} failed:`, err.message)
    process.exit(1)
  }
}

// ─── Step 1: TypeScript check ──────────────────────────────
run('npm run typecheck', 'TypeScript verification')

// ─── Step 2: Build Next.js ─────────────────────────────────
run('npm run build', 'Next.js build')

// ─── Step 3: Verify required files exist ──────────────────
const requiredFiles = [
  'electron/main.js',
  'electron/preload.js',
  'electron/icons/icon.png',
]

console.log('🔍 Checking required files...')
requiredFiles.forEach(file => {
  const fullPath = path.join(process.cwd(), file)
  if (fs.existsSync(fullPath)) {
    console.log(`  ✅ ${file}`)
  } else {
    console.warn(`  ⚠️  ${file} — missing! Build may fail.`)
  }
})
console.log('')

// ─── Step 4: Build Electron for platform ──────────────────
const buildCommands = {
  win:     'npx electron-builder --win',
  mac:     'npx electron-builder --mac',
  linux:   'npx electron-builder --linux',
  all:     'npx electron-builder --win --mac --linux',
  current: 'npx electron-builder',
}

const buildCmd = buildCommands[platform]
if (!buildCmd) {
  console.error(`❌ Unknown platform: ${platform}`)
  console.log('Available: win, mac, linux, all, current')
  process.exit(1)
}

run(buildCmd, `Electron build (${platform})`)

// ─── Step 5: Report output ─────────────────────────────────
const distDir = path.join(process.cwd(), 'dist')
if (fs.existsSync(distDir)) {
  console.log('📦 Build output:')
  const files = fs.readdirSync(distDir)
  files
    .filter(f => !f.startsWith('.'))
    .forEach(file => {
      const fullPath = path.join(distDir, file)
      const stat = fs.statSync(fullPath)
      if (stat.isFile()) {
        const sizeMB = (stat.size / (1024 * 1024)).toFixed(1)
        console.log(`  📄 dist/${file} (${sizeMB} MB)`)
      }
    })
}

console.log('')
console.log('🎉 Mwijay Tech desktop build complete!')
console.log('🇹🇿 Built by Davie Mwijay — Dar es Salaam, Tanzania')
