#!/usr/bin/env node
// Gera os ícones do PWA (sem dependências): fundo #050a0e + "VG" em #00e5c3.
// Uso: node pwa/gen-icons.js  (os PNGs ficam em pwa/ e são versionados)
const zlib = require('zlib'), fs = require('fs'), path = require('path');
const BG = [5, 10, 14], FG = [0, 229, 195];

function crc32(buf) { let c, crc = ~0; for (let i = 0; i < buf.length; i++) { c = (crc ^ buf[i]) & 255; for (let k = 0; k < 8; k++) c = c & 1 ? (c >>> 1) ^ 0xEDB88320 : c >>> 1; crc = (crc >>> 8) ^ c; } return ~crc >>> 0; }
function chunk(type, data) { const len = Buffer.alloc(4); len.writeUInt32BE(data.length); const td = Buffer.concat([Buffer.from(type), data]); const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(td)); return Buffer.concat([len, td, crc]); }
function png(size, rgba) {
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(size, 0); ihdr.writeUInt32BE(size, 4); ihdr[8] = 8; ihdr[9] = 6;
  const raw = Buffer.alloc((size * 4 + 1) * size);
  for (let y = 0; y < size; y++) { raw[y * (size * 4 + 1)] = 0; rgba.copy(raw, y * (size * 4 + 1) + 1, y * size * 4, (y + 1) * size * 4); }
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', zlib.deflateSync(raw, { level: 9 })), chunk('IEND', Buffer.alloc(0))]);
}
// distância de ponto a segmento
function dSeg(px, py, ax, ay, bx, by) { const dx = bx - ax, dy = by - ay; let t = ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy); t = Math.max(0, Math.min(1, t)); return Math.hypot(px - ax - t * dx, py - ay - t * dy); }
// "VG" em coordenadas de 0..1 (centro 0.5,0.5), tamanho total ~1 → depois escalado
function inLetters(x, y) {
  const w = 0.075; // meia espessura do traço
  // V: de (0.08,0.22) a (0.27,0.78) a (0.46,0.22)
  if (dSeg(x, y, 0.09, 0.22, 0.275, 0.78) < w || dSeg(x, y, 0.46, 0.22, 0.275, 0.78) < w) return true;
  // G: arco centrado em (0.72,0.5) raio 0.28 (vertical) — aberto à direita-cima
  const cx = 0.74, cy = 0.5, r = 0.285, dx = x - cx, dy = (y - cy);
  const d = Math.hypot(dx, dy);
  if (Math.abs(d - r) < w) { const ang = Math.atan2(-dy, dx) * 180 / Math.PI; // 0=direita, 90=cima
    if (!(ang > -2 && ang < 48)) return true; }
  // barra do G
  if (dSeg(x, y, cx + 0.005, cy + 0.015, cx + r, cy + 0.015) < w * 0.9) return true;
  // fecho vertical do G (da barra para baixo)
  if (dSeg(x, y, cx + r, cy + 0.015, cx + r, cy + 0.2) < w) return true;
  return false;
}
function render(size, scale, round) {
  const buf = Buffer.alloc(size * size * 4), SS = 3;
  const bboxL = 0.09 - 0.075, bboxR = 0.74 + 0.285 + 0.075, bboxT = 0.22 - 0.075, bboxB = 0.78 + 0.075;
  const cxl = (bboxL + bboxR) / 2, cyl = (bboxT + bboxB) / 2, ext = bboxR - bboxL;
  for (let j = 0; j < size; j++) for (let i = 0; i < size; i++) {
    let cov = 0, inside = 0;
    for (let sj = 0; sj < SS; sj++) for (let si = 0; si < SS; si++) {
      const u = (i + (si + .5) / SS) / size, v = (j + (sj + .5) / SS) / size;
      // máscara de cantos arredondados
      let ok = 1;
      if (round) { const rr = 0.2, qx = Math.max(Math.abs(u - .5) - (.5 - rr), 0), qy = Math.max(Math.abs(v - .5) - (.5 - rr), 0); ok = Math.hypot(qx, qy) <= rr ? 1 : 0; }
      inside += ok;
      if (ok) { const lx = (u - .5) / scale / (1 / ext) * 1 + cxl, ly = (v - .5) / scale / (1 / ext) + cyl; if (inLetters(lx, ly)) cov++; }
    }
    const o = (j * size + i) * 4, a = inside / (SS * SS), t = inside ? cov / inside : 0;
    buf[o] = Math.round(BG[0] + (FG[0] - BG[0]) * t); buf[o + 1] = Math.round(BG[1] + (FG[1] - BG[1]) * t); buf[o + 2] = Math.round(BG[2] + (FG[2] - BG[2]) * t); buf[o + 3] = Math.round(255 * a);
  }
  return png(size, buf);
}
const out = __dirname;
// scale = fração da largura ocupada pelo "VG". Maskable: zona segura (círculo de 40% do lado) → texto bem dentro.
fs.writeFileSync(path.join(out, 'icon-192.png'), render(192, 0.62, true));
fs.writeFileSync(path.join(out, 'icon-512.png'), render(512, 0.62, true));
fs.writeFileSync(path.join(out, 'icon-maskable-512.png'), render(512, 0.5, false));
fs.writeFileSync(path.join(out, 'apple-touch-icon.png'), render(180, 0.62, false)); // iOS aplica o arredondamento
console.log('ícones gerados em', out);
