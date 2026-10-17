#!/usr/bin/env node
// Gera os icones do PWA a partir de pwa/logo-original.png (simbolo "V" sobre #08080b).
// Uso: node pwa/gen-icons.js  (Windows: usa PowerShell + System.Drawing; PNGs ficam em pwa/ e sao versionados)
const { spawnSync } = require('child_process'), path = require('path');
const r = spawnSync('powershell', ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', path.join(__dirname, 'gen-icons.ps1')], { stdio: 'inherit' });
process.exit(r.status === null ? 1 : r.status);
