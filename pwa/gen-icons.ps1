# Gera os icones do PWA a partir de pwa/logo-original.png (sem dependencias: System.Drawing).
# Uso: node pwa/gen-icons.js   (ou: powershell -File pwa/gen-icons.ps1)
Add-Type -AssemblyName System.Drawing
$dir = $PSScriptRoot
$src = [System.Drawing.Bitmap]::FromFile((Join-Path $dir 'logo-original.png'))
# Simbolo "V" (bbox medido na imagem de 640px: x 68-212, y 237-355) + 3px de folga.
$cx0 = 65; $cy0 = 234; $cw = 150; $ch = 125
$bgR = 8; $bgG = 8; $bgB = 11   # preto da logo (#08080b)
# Recorta o V com alfa derivado do brilho teal (descarta a textura do fundo da logo).
$v = New-Object System.Drawing.Bitmap $cw, $ch, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
for ($y = 0; $y -lt $ch; $y++) { for ($x = 0; $x -lt $cw; $x++) {
  $p = $src.GetPixel($cx0 + $x, $cy0 + $y)
  $m = [Math]::Max($p.G, $p.B)
  $a = [Math]::Min(1.0, [Math]::Max(0.0, ($m - 40) / 110.0))
  $v.SetPixel($x, $y, [System.Drawing.Color]::FromArgb([int][Math]::Round(255 * $a), $p.R, $p.G, $p.B))
} }
$src.Dispose()
function Make($size, $frac, $round, $name) {
  $bmp = New-Object System.Drawing.Bitmap $size, $size, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = 'AntiAlias'; $g.InterpolationMode = 'HighQualityBicubic'; $g.PixelOffsetMode = 'HighQuality'
  $g.Clear([System.Drawing.Color]::Transparent)
  $brush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, $bgR, $bgG, $bgB))
  if ($round) {
    $r = $size * 0.2; $d = $r * 2; $path = New-Object System.Drawing.Drawing2D.GraphicsPath
    $path.AddArc(0, 0, $d, $d, 180, 90); $path.AddArc($size - $d, 0, $d, $d, 270, 90)
    $path.AddArc($size - $d, $size - $d, $d, $d, 0, 90); $path.AddArc(0, $size - $d, $d, $d, 90, 90); $path.CloseFigure()
    $g.FillPath($brush, $path)
  } else { $g.FillRectangle($brush, 0, 0, $size, $size) }
  $w = $size * $frac; $h = $w * $ch / $cw
  $ia = New-Object System.Drawing.Imaging.ImageAttributes; $ia.SetWrapMode('TileFlipXY')
  $dest = New-Object System.Drawing.Rectangle ([int][Math]::Round(($size - $w) / 2)), ([int][Math]::Round(($size - $h) / 2)), ([int][Math]::Round($w)), ([int][Math]::Round($h))
  $g.DrawImage($v, $dest, 0, 0, $cw, $ch, 'Pixel', $ia)
  $g.Dispose()
  $bmp.Save((Join-Path $dir $name), [System.Drawing.Imaging.ImageFormat]::Png); $bmp.Dispose()
}
Make 192 0.60 $true  'icon-192.png'
Make 512 0.60 $true  'icon-512.png'
Make 512 0.48 $false 'icon-maskable-512.png'   # V dentro da zona segura (80% central)
Make 180 0.60 $false 'apple-touch-icon.png'     # iOS aplica o arredondamento; sem transparencia
Make 48  0.66 $true  'favicon-48.png'
$v.Dispose()
Write-Host "icones gerados em $dir"
