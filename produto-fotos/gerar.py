"""
Gera fotos padronizadas de produto (vial) da Vanguard Labs.

Metodo hibrido:
  1. Base fotografica fixa: assets/vial_base.png (o frasco gerado por IA que ja esta no site, 1024x1536).
     A faixa do rotulo dessa foto (x 307-718, y 620-1078) e totalmente substituida.
  2. Rotulo renderizado por codigo (PIL), seguindo o layout do adesivo real impresso:
     simbolo V (recorte da logo oficial pwa/logo-original.png) + VANGUARD LABS, nome do peptideo,
     dosagem em ciano caixa alta, linha fina, 99% Purity, Research Use Only, linha tracejada,
     SKU e barra de acento teal no canto inferior direito.
  3. Composicao: curvatura cilindrica (compressao nas bordas), mapa de luz extraido da propria foto base
     (sombreado e reflexos do vidro continuam iguais), granulacao leve.

Texto 100% exato (nada passa por IA). Fonte: Montserrat (instalada no Windows).

Uso:
  python gerar.py --name "Tesamorelin" --dose "5MG" --sku TSM5 --out teste/tsm5.png
  python gerar.py --name "Tesamorelin" --dose "5MG" --sku TSM5 --tall --out teste/tsm5_grande.png
  python gerar.py --batch                 # gera os 19 do CATALOGO em saida/<sku>.png
  python gerar.py --batch --labels-only   # so os rotulos planos (conferencia de layout)

Dependencias: Python 3 + Pillow + numpy.
"""
import argparse
import math
import os

import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
BASE_IMG = os.path.join(HERE, "assets", "vial_base.png")
LOGO_IMG = os.path.join(HERE, "..", "pwa", "logo-original.png")
FONT_DIRS = [r"C:\Windows\Fonts", os.path.expandvars(r"%LOCALAPPDATA%\Microsoft\Windows\Fonts")]

# Catalogo (sku, nome no rotulo, dosagem no rotulo). Itens com "?" precisam de confirmacao do dono.
# Opcional 4o campo: texto que substitui "99% Purity" (usado na agua bacteriostatica).
CATALOGO = [
    ("2S50", "SS-31", "50MG"),
    # BA03 (Bac Water) retirado do site: nao gerar. Se voltar: ("BA03", "Bac Water", "3ML", "0.9% Benzyl Alcohol")
    ("BB20", "BPC-157 + TB-500", "20MG"),                  # sistema: "BPC 10mg+TB 10mg", spec 20mg
    ("BBG70", "GLOW Blend", "70MG"),
    ("CP10", "CJC-1295 + Ipamorelin", "NO DAC · 10MG"),   # sistema: "CJC-1295 no DAC+Ipa", spec 10mg
    ("CU50", "GHK-Cu", "50MG"),
    ("CU100", "GHK-Cu", "100MG"),
    ("DS10", "DSIP", "10MG"),
    ("EPT10", "Epithalon", "10MG"),
    ("KL80", "BPC + GHK + TB500 + KPV Blend", "80MG"),
    ("KP30", "KPV", "30MG"),
    ("MS40", "MOTS-c", "40MG"),
    ("P41", "PT-141", "10MG"),
    ("RT15", "Retatrutide", "15MG"),
    ("RT20", "Retatrutide", "20MG"),
    ("RT30", "Retatrutide", "30MG"),
    ("RT50", "Retatrutide", "50MG"),
    ("SLK5", "Selank", "5MG"),
    ("SNAP10", "SNAP-8", "10MG"),
    ("TR60", "Tirzepatide", "60MG"),
    ("TSM5", "Tesamorelin", "5MG"),
    ("TZ15", "Tirzepatide", "15MG"),
    ("TZ40", "Tirzepatide", "40MG"),
]

# Geometria da faixa do rotulo na foto base (medida em pixels).
BAND = (307, 620, 718, 1078)          # x0, y0, x1 (exclusivo), y1 (exclusivo)
THETA_MAX = math.radians(52)          # meia-abertura angular "vista" do cilindro (curvatura suave)
SS = 3                                # supersampling do rotulo

# Cores (tiradas do adesivo real)
BG = (27, 28, 32)
NAME_C = (222, 224, 228)
DOSE_C = (118, 200, 222)
TEXT_C = (200, 203, 208)
BRAND_C = (214, 216, 220)
LINE_C = (120, 124, 130)
ACCENT_A = (70, 170, 165)
ACCENT_B = (140, 222, 214)


def font(weight, size):
    fname = f"Montserrat-{weight}.ttf"
    for d in FONT_DIRS:
        p = os.path.join(d, fname)
        if os.path.exists(p):
            return ImageFont.truetype(p, size)
    raise SystemExit(f"Fonte {fname} nao encontrada (instale Montserrat).")


def logo_v():
    """Recorta o simbolo V da logo oficial com alfa derivado do brilho teal (mesma logica do pwa/gen-icons.ps1)."""
    src = np.asarray(Image.open(LOGO_IMG).convert("RGB")).astype(np.float32)
    crop = src[234:359, 65:215]
    m = np.maximum(crop[..., 1], crop[..., 2])
    a = np.clip((m - 40) / 110.0, 0, 1)
    rgba = np.dstack([crop, a * 255]).astype(np.uint8)
    im = Image.fromarray(rgba, "RGBA")
    return im.crop(im.getbbox())


def text_w(draw, s, f, tracking=0):
    w = draw.textlength(s, font=f)
    return w + tracking * max(0, len(s) - 1)


def draw_text(draw, xy, s, f, fill, tracking=0):
    """Desenha texto com o topo das maiusculas em y (alinhamento por cap-height) e tracking opcional."""
    x, y = xy
    cap_top = f.getbbox("H")[1]
    y -= cap_top
    if tracking == 0:
        draw.text((x, y), s, font=f, fill=fill)
        return
    for ch in s:
        draw.text((x, y), ch, font=f, fill=fill)
        x += draw.textlength(ch, font=f) + tracking


def cap_h(f):
    b = f.getbbox("H")
    return b[3] - b[1]


def split_name(name):
    """Melhores pontos de quebra em 2 linhas (prioriza espacos ao redor de '+', depois espacos)."""
    words = name.split(" ")
    cands = []
    for i in range(1, len(words)):
        a, b = " ".join(words[:i]), " ".join(words[i:])
        if b.startswith("+"):
            continue  # nunca comecar a 2a linha com "+"
        cands.append((not a.endswith("+"), max(len(a), len(b)), a, b))
    cands.sort()
    return [(a, b) for _, _, a, b in cands]


def render_flat_label(name, dose, sku, band_w, band_h, purity="99% Purity"):
    """Rotulo plano (desenrolado) em SS x resolucao. Largura = arco correspondente a faixa visivel."""
    flat_w = band_w * THETA_MAX / math.sin(THETA_MAX)
    W, H = int(round(flat_w * SS)), band_h * SS
    img = Image.new("RGB", (W, H), BG)
    d = ImageDraw.Draw(img)

    def fx(u):
        """Posicao horizontal na faixa visivel (u em -1..1) -> x no rotulo plano."""
        th = math.asin(max(-1, min(1, u * math.sin(THETA_MAX))))
        return (th / THETA_MAX + 1) / 2 * W

    left = fx(-0.80)
    right = fx(0.84)
    avail = right - left
    S = SS * band_h / 458.0          # escala relativa ao layout de referencia (faixa de 458 px)

    # --- marca (V + VANGUARD LABS)
    y = 44 * S
    brand_f = font("Medium", int(25 * S))
    v = logo_v()
    vh = int(40 * S)
    vw = int(v.width * vh / v.height)
    v = v.resize((vw, vh), Image.LANCZOS)
    bch = cap_h(brand_f)
    img.paste(v, (int(left), int(y)), v)
    draw_text(d, (left + vw + 14 * S, y + (vh - bch) / 2), "VANGUARD LABS", brand_f, BRAND_C, tracking=0.6 * S)

    # --- nome (1 linha; se nao couber, reduz ate 75%; depois 2 linhas)
    base_size = 60 * S
    lines, nf = None, None
    for scale in [1.0 - i * 0.025 for i in range(11)]:
        f = font("SemiBold", int(base_size * scale))
        if text_w(d, name, f) <= avail:
            lines, nf = [name], f
            break
    if lines is None:
        # escolhe a quebra que permite a MAIOR fonte (empate: a que termina a 1a linha com "+")
        best = None
        for rank, (a, b) in enumerate(split_name(name)):
            for scale in [0.82 - i * 0.03 for i in range(12)]:
                f = font("SemiBold", int(base_size * scale))
                if max(text_w(d, a, f), text_w(d, b, f)) <= avail:
                    if best is None or scale > best[0] + 1e-6:
                        best = (scale, [a, b], f)
                    break
        if best:
            lines, nf = best[1], best[2]
    if lines is None:  # ultimo recurso
        lines, nf = [name], font("SemiBold", int(base_size * 0.5))

    nch = cap_h(nf)
    y_name = 128 * S if len(lines) == 1 else 112 * S
    gap = nch * 0.55
    for i, ln in enumerate(lines):
        draw_text(d, (left - 2 * S, y_name + i * (nch + gap)), ln, nf, NAME_C)
    y = y_name + len(lines) * nch + (len(lines) - 1) * gap

    # --- dosagem
    dose_f = font("SemiBold", int(30 * S))
    y += 26 * S if len(lines) == 1 else 20 * S
    draw_text(d, (left, y), dose.upper(), dose_f, DOSE_C, tracking=1.2 * S)
    y += cap_h(dose_f)

    # --- linha fina
    y += 24 * S
    d.line([(left, y), (left + avail * 0.52, y)], fill=LINE_C, width=max(1, int(1.6 * S)))

    # --- 99% Purity / Research Use Only (ancorados embaixo para caber nomes de 2 linhas)
    small_f = font("Medium", int(26 * S))
    sch = cap_h(small_f)
    y_pur = max(y + 26 * S, 268 * S)
    draw_text(d, (left, y_pur), purity, small_f, TEXT_C)
    y_ruo = y_pur + sch + 22 * S
    draw_text(d, (left, y_ruo), "Research Use Only", small_f, TEXT_C)

    # --- linha tracejada
    y_dash = y_ruo + sch + 26 * S
    dash, gapd = 7 * S, 5 * S
    x = left
    while x < right:
        d.line([(x, y_dash), (min(x + dash, right), y_dash)], fill=LINE_C, width=max(1, int(1.6 * S)))
        x += dash + gapd

    # --- SKU + barra de acento
    sku_f = font("Medium", int(25 * S))
    y_sku = y_dash + 26 * S
    draw_text(d, (left, y_sku), f"SKU: {sku}", sku_f, TEXT_C, tracking=0.5 * S)
    kch = cap_h(sku_f)
    yb = y_sku + kch * 0.55
    bar_w = avail * 0.30
    bar_h = 9 * S
    bx1 = right
    bx0 = bx1 - bar_w
    grad = np.linspace(0, 1, int(bar_w))[None, :, None]
    ga = np.array(ACCENT_A)[None, None, :]
    gb = np.array(ACCENT_B)[None, None, :]
    bar = (ga * (1 - grad) + gb * grad).repeat(int(bar_h), axis=0).astype(np.uint8)
    img.paste(Image.fromarray(bar, "RGB"), (int(bx0), int(yb - bar_h)))
    sku_end = left + text_w(d, f"SKU: {sku}", sku_f, 0.5 * S)
    thin_x0 = max(bx0 - avail * 0.17, sku_end + 30 * S)  # nao encosta no texto do SKU
    d.line([(thin_x0, yb - 1 * S), (bx0, yb - 1 * S)], fill=ACCENT_A, width=max(1, int(1.6 * S)))
    for k in range(2):
        sx = thin_x0 - (k + 1) * 6 * S
        d.rectangle([sx, yb - 3 * S, sx + 3 * S, yb], fill=ACCENT_A)
    return img


def cylinder_warp(flat, band_w, band_h):
    """Projeta o rotulo plano no cilindro (visao frontal): x_tela = sin(theta)."""
    Wf, Hf = flat.size
    out_w = band_w * SS
    a = np.asarray(flat).astype(np.float32)
    u = (np.arange(out_w) + 0.5) / out_w * 2 - 1
    th = np.arcsin(np.clip(u * math.sin(THETA_MAX), -1, 1))
    src_x = (th / THETA_MAX + 1) / 2 * Wf - 0.5
    x0 = np.clip(np.floor(src_x).astype(int), 0, Wf - 1)
    x1 = np.clip(x0 + 1, 0, Wf - 1)
    t = (src_x - np.floor(src_x))[None, :, None]
    warped = a[:, x0] * (1 - t) + a[:, x1] * t
    im = Image.fromarray(np.clip(warped, 0, 255).astype(np.uint8), "RGB")
    return im.resize((band_w, band_h), Image.LANCZOS)


def light_map(base, band):
    """Mapa de luz da faixa original: perfil por coluna x perfil por linha (mediana ignora o texto antigo)."""
    x0, y0, x1, y1 = band
    a = np.asarray(base).astype(np.float32)[y0:y1, x0:x1]
    lum = a.mean(axis=2)
    # abertura morfologica (min -> max) remove o texto antigo (tracos finos e claros); blur = so a luz
    im = Image.fromarray(np.clip(lum, 0, 255).astype(np.uint8))
    im = im.filter(ImageFilter.MinFilter(17)).filter(ImageFilter.MinFilter(9)).filter(ImageFilter.MaxFilter(17))
    im = im.filter(ImageFilter.GaussianBlur(10))
    bgl = np.asarray(im).astype(np.float32)
    L = bgl / np.median(bgl)
    return np.clip(L, 0.6, 1.6)


def compose(base, label, band, seed=7):
    x0, y0, x1, y1 = band
    bw, bh = x1 - x0, y1 - y0
    L = light_map(base, band)
    lab = np.asarray(label).astype(np.float32)
    # luz: escurece/clareia o rotulo como a faixa original (texto claro recebe menos ganho nos realces)
    # a variacao da faixa original e quase toda brilho especular/rebatido: aplica de forma aditiva,
    # proporcional ao fundo (o fundo do rotulo acompanha a luz e o texto nao fica manchado)
    gain = L[..., None]
    bg_l = float(np.mean(BG))
    lab = lab * (1 + (gain - 1) * 0.12) + (gain - 1) * bg_l
    # granulacao: papel (grao medio) + ruido fino
    rng = np.random.default_rng(seed)
    paper = rng.normal(0, 1, (bh, bw)).astype(np.float32)
    paper = np.asarray(Image.fromarray(((paper * 40) + 128).clip(0, 255).astype(np.uint8)).filter(
        ImageFilter.GaussianBlur(1.2))).astype(np.float32) - 128
    fine = rng.normal(0, 2.2, (bh, bw, 1)).astype(np.float32)
    lab = lab + paper[..., None] * 0.18 + fine
    # leve suavizacao (foco da lente) para nao ficar "vetorial" demais
    lab_im = Image.fromarray(np.clip(lab, 0, 255).astype(np.uint8), "RGB").filter(ImageFilter.GaussianBlur(0.35))
    # mascara com bordas suaves
    mask = Image.new("L", (bw + 2, bh + 2), 0)
    ImageDraw.Draw(mask).rectangle([1, 1, bw, bh], fill=255)
    mask = mask.filter(ImageFilter.GaussianBlur(0.8))
    out = base.copy()
    canvas = Image.new("RGB", (bw + 2, bh + 2))
    canvas.paste(base.crop((x0 - 1, y0 - 1, x1 + 1, y1 + 1)), (0, 0))
    canvas.paste(lab_im, (1, 1))
    out.paste(canvas, (x0 - 1, y0 - 1), mask)
    return out


def make_tall(base, extra=170):
    """Vial mais alto: mantem o fundo do vial no chao, sobe tampa+rotulo 'extra' px e estica o vidro abaixo do rotulo."""
    x0, y0, x1, y1 = BAND
    a = np.asarray(base).astype(np.float32)
    H, W, _ = a.shape
    sx0, sx1 = 280, 745                       # faixa vertical que contem o vial
    g_lo, g_hi = y1 + 2, 1128                 # vidro reto abaixo do rotulo (esticado)
    # placa limpa do fundo (interpola linha a linha entre as laterais do vial)
    clean = a.copy()
    lft = a[:, sx0 - 22:sx0 - 2].mean(axis=1)
    rgt = a[:, sx1 + 2:sx1 + 22].mean(axis=1)
    t = np.linspace(0, 1, sx1 - sx0)[None, :, None]
    clean[:, sx0:sx1] = lft[:, None, :] * (1 - t) + rgt[:, None, :] * t
    clean[:, sx0:sx1] += np.random.default_rng(3).normal(0, 1.5, (H, sx1 - sx0, 1))
    # mascara do vial (tudo que nao e fundo escuro), sem a regiao do chao
    lum = a.mean(axis=2)
    vm = (lum > 14).astype(np.float32)
    vm[:, :sx0] = 0
    vm[:, sx1:] = 0
    vm[g_hi:] = 0
    vm_im = Image.fromarray((vm * 255).astype(np.uint8)).filter(ImageFilter.MaxFilter(5)).filter(ImageFilter.GaussianBlur(1.5))
    vm = np.asarray(vm_im).astype(np.float32)[..., None] / 255
    out = a.copy()
    out[:g_hi] = clean[:g_hi]
    # parte superior (tampa..rotulo) deslocada para cima
    top = a[:g_lo]
    tm = vm[:g_lo]
    dst = out[:g_lo - extra]
    out[:g_lo - extra] = top[extra:] * tm[extra:] + dst * (1 - tm[extra:])
    # vidro reto esticado
    seg = Image.fromarray(np.clip(a[g_lo:g_hi], 0, 255).astype(np.uint8))
    seg = np.asarray(seg.resize((W, g_hi - g_lo + extra), Image.BICUBIC)).astype(np.float32)
    segm = Image.fromarray((vm[g_lo:g_hi, :, 0] * 255).astype(np.uint8)).resize((W, g_hi - g_lo + extra), Image.BILINEAR)
    segm = np.asarray(segm).astype(np.float32)[..., None] / 255
    r0 = g_lo - extra
    out[r0:g_hi] = seg * segm + out[r0:g_hi] * (1 - segm)
    # costura suave na transicao com o fundo original do vial (linha g_hi)
    img = Image.fromarray(np.clip(out, 0, 255).astype(np.uint8), "RGB")
    band = (x0, y0 - extra, x1, y1 - extra)
    return img, band


def build(name, dose, sku, tall=False, purity="99% Purity"):
    base = Image.open(BASE_IMG).convert("RGB")
    band = BAND
    light_src = base
    if tall:
        base, band = make_tall(base)
        light_src = Image.open(BASE_IMG).convert("RGB")
    bw, bh = band[2] - band[0], band[3] - band[1]
    flat = render_flat_label(name, dose, sku, bw, bh, purity)
    label = cylinder_warp(flat, bw, bh)
    # mapa de luz sempre medido na faixa original
    L_base = light_src
    out = compose_with_light(base, label, band, L_base)
    return out, flat


def compose_with_light(base, label, band, light_src):
    if light_src is base:
        return compose(base, label, band)
    # copia a faixa original para o lugar novo apenas para medir a luz
    tmp = base.copy()
    tmp.paste(light_src.crop(BAND), (band[0], band[1]))
    lit = compose(tmp, label, band)
    # compose usa tmp como fundo nas bordas (1px); como o rotulo cobre a faixa inteira o resultado e o mesmo
    return lit


def save_webp(img, path, lo=110_000, hi=150_000):
    """Versao leve para o site: 800x1200, qualidade ajustada para ficar ~110-150 KB."""
    small = img.resize((800, 1200), Image.LANCZOS)
    best = None
    for q in range(90, 40, -4):
        small.save(path, "WEBP", quality=q, method=6)
        size = os.path.getsize(path)
        best = (q, size)
        if size <= hi:
            break
    return best


def contact_sheet(items, path, cols=6, thumb=(300, 450)):
    """Folha de contato com legenda (SKU - nome dosagem)."""
    cap_f = font("SemiBold", 22)
    sub_f = font("Medium", 15)
    rows = (len(items) + cols - 1) // cols
    pad, cap = 14, 56
    W = cols * (thumb[0] + pad) + pad
    H = rows * (thumb[1] + cap + pad) + pad
    sheet = Image.new("RGB", (W, H), (16, 17, 20))
    d = ImageDraw.Draw(sheet)
    for i, (sku, name, dose, img) in enumerate(items):
        x = pad + (i % cols) * (thumb[0] + pad)
        y = pad + (i // cols) * (thumb[1] + cap + pad)
        sheet.paste(img.resize(thumb, Image.LANCZOS), (x, y))
        d.text((x + 4, y + thumb[1] + 6), sku, font=cap_f, fill=(140, 222, 214))
        d.text((x + 4, y + thumb[1] + 33), f"{name} {dose}"[:40], font=sub_f, fill=(200, 203, 208))
    sheet.save(path)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--name")
    ap.add_argument("--dose")
    ap.add_argument("--sku")
    ap.add_argument("--purity", default="99% Purity")
    ap.add_argument("--out")
    ap.add_argument("--tall", action="store_true", help="EXPERIMENTAL (artefatos no vidro esticado; nao usar em producao)")
    ap.add_argument("--batch", action="store_true", help="gera todo o CATALOGO em final/ + final/web/*.webp + contact-sheet.png")
    ap.add_argument("--only", help="lista de SKUs separados por virgula (com --batch)")
    ap.add_argument("--labels-only", action="store_true")
    ap.add_argument("--outdir", default=os.path.join(HERE, "final"))
    args = ap.parse_args()

    if args.batch:
        import time
        t0 = time.time()
        os.makedirs(os.path.join(args.outdir, "web"), exist_ok=True)
        only = {s.strip().upper() for s in args.only.split(",")} if args.only else None
        items = []
        for entry in CATALOGO:
            sku, name, dose = entry[:3]
            purity = entry[3] if len(entry) > 3 else "99% Purity"
            if only and sku.upper() not in only:
                continue
            img, flat = build(name, dose, sku, purity=purity)
            png = os.path.join(args.outdir, f"{sku.lower()}.png")
            if args.labels_only:
                flat.resize((flat.width // SS, flat.height // SS), Image.LANCZOS).save(png.replace(".png", "_rotulo.png"))
                continue
            img.save(png, optimize=True)
            q, size = save_webp(img, os.path.join(args.outdir, "web", f"{sku.lower()}.webp"))
            items.append((sku, name, dose, img))
            print(f"ok {sku:7s} png + webp q{q} {size // 1024} KB")
        if items and not only:
            contact_sheet(items, os.path.join(args.outdir, "contact-sheet.png"))
            print("ok contact-sheet.png")
        print(f"tempo total: {time.time() - t0:.1f}s")
        return

    if not (args.name and args.dose and args.sku):
        ap.error("informe --name, --dose e --sku (ou --batch)")
    out = args.out or os.path.join(HERE, "final", f"{args.sku.lower()}.png")
    out = out if os.path.isabs(out) else os.path.join(HERE, out)
    os.makedirs(os.path.dirname(out), exist_ok=True)
    img, flat = build(args.name, args.dose, args.sku, tall=args.tall, purity=args.purity)
    if args.labels_only:
        flat.resize((flat.width // SS, flat.height // SS), Image.LANCZOS).save(out.replace(".png", "_rotulo.png"))
    else:
        img.save(out)
    print("ok", out)


if __name__ == "__main__":
    main()
