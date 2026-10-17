"""
Gera a montagem de imagem de um COMBO (frascos lado a lado) para a faixa de combos da loja.

Entrada: produto-fotos/final/<sku>.png (1024x1536, fundo preto texturizado identico entre elas).
Saida:   assets/combos/<combo-id>-v1.webp (1000x800, ~60-120 KB). O build.js copia assets/ para dist/.

O front tenta /assets/combos/<id>-v1.webp; se nao existir, monta os frascos em CSS com as fotos dos
produtos (fallback automatico). Para combo novo criado no admin, rode este script com o mesmo id.

Uso:
  python produto-fotos/gerar_combos.py --id bundle-emagre --skus TZ15 TSM5
  python produto-fotos/gerar_combos.py --all        # os 3 combos atuais (lista COMBOS abaixo)
  Dica: o id do combo e o campo `id` em site_config.bundles (admin > Combos); SKUs = SKU dos itens.
  Com 3+ itens: fila centralizada, o item do meio fica na frente.

Dependencias: Python 3 + Pillow + numpy.
"""
import argparse
import os

import numpy as np
from PIL import Image, ImageEnhance, ImageFilter

HERE = os.path.dirname(os.path.abspath(__file__))
FINAL = os.path.join(HERE, "final")
OUT = os.path.join(HERE, "..", "assets", "combos")
VERSION = "v1"
W, H = 1000, 800

COMBOS = {
    "bundle-emagre": ["TZ15", "TSM5"],
    "bundle-beleza": ["CU50", "SNAP10"],
    "bundle-longe": ["EPT10", "SLK5"],
}

# Regiao do frasco na foto 1024x1536 (colunas/linhas) e feather das bordas, em px da foto
CROP_Y0, CROP_Y1 = 140, 1360
HALF_W = 290          # meia largura da faixa copiada (frasco tem ~205 de meia largura)
FEATHER_X, FEATHER_Y = 110, 130
VIAL_CX = 512
FLOOR_Y = 1229        # base do frasco na foto


def smooth(t):
    t = np.clip(t, 0, 1)
    return t * t * (3 - 2 * t)


def feather_mask(w, h, fx, fy):
    x = np.arange(w, dtype=np.float32)
    y = np.arange(h, dtype=np.float32)
    mx = smooth(np.minimum(x, w - 1 - x) / fx)
    my = smooth(np.minimum(y, h - 1 - y) / fy)
    return Image.fromarray((np.outer(my, mx) * 255).astype(np.uint8))


def load(sku):
    p = os.path.join(FINAL, sku.lower() + ".png")
    if not os.path.exists(p):
        raise SystemExit("Falta " + p)
    return Image.open(p).convert("RGB")


def make_bg(src, scale, row_off):
    """Fundo = faixa esquerda da foto (sem frasco) espelhada, na mesma escala/linha do frasco da frente."""
    strip = src.crop((0, 0, 200, src.height))
    tile = Image.new("RGB", (200 * 14, src.height))
    for i in range(14):
        s = strip if i % 2 == 0 else strip.transpose(Image.FLIP_LEFT_RIGHT)
        tile.paste(s, (i * 200, 0))
    tile = tile.resize((int(tile.width * scale), int(tile.height * scale)), Image.LANCZOS)
    bg = Image.new("RGB", (W, H), (5, 7, 9))
    ox, oy = -(tile.width - W) // 2, int(row_off)
    if oy > 0:  # acima do topo da foto: estica a primeira linha (evita faixa/emenda)
        top = tile.crop((0, 0, tile.width, 1)).resize((tile.width, oy + 1))
        bg.paste(top, (ox, 0))
    bg.paste(tile, (ox, oy))
    return bg


def compose(skus, out_path):
    n = len(skus)
    imgs = [load(s) for s in skus]
    front = n // 2  # indice do item da frente (meio; com 2 itens, o ultimo)
    if n == 2:
        front = 1
    s_front = 0.62 if n <= 2 else 0.5
    s_back = s_front * 0.88
    vial_w = 410
    step = vial_w * s_front * 0.92 if n > 2 else vial_w * s_front * 0.9
    cx0 = W / 2 - step * (n - 1) / 2
    floor_front = H - 110
    row_off = floor_front - FLOOR_Y * s_front
    bg = make_bg(imgs[0], s_front, row_off)
    canvas = bg.convert("RGB")
    order = [i for i in range(n) if i != front] + [front]
    for i in order:
        s = s_front if i == front else s_back
        im = imgs[i]
        crop = im.crop((VIAL_CX - HALF_W, CROP_Y0, VIAL_CX + HALF_W, CROP_Y1))
        mask = feather_mask(crop.width, crop.height, FEATHER_X, FEATHER_Y)
        nw, nh = int(crop.width * s), int(crop.height * s)
        crop = crop.resize((nw, nh), Image.LANCZOS)
        mask = mask.resize((nw, nh), Image.LANCZOS)
        if i != front:
            crop = ImageEnhance.Brightness(crop).enhance(0.88)
        floor = floor_front - (0 if i == front else 26)
        x = int(cx0 + step * i - nw / 2)
        y = int(floor - (FLOOR_Y - CROP_Y0) * s)
        canvas.paste(crop, (x, y), mask)
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    canvas.save(out_path, "WEBP", quality=82, method=6)
    print("ok", out_path, os.path.getsize(out_path) // 1024, "KB")


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--id")
    ap.add_argument("--skus", nargs="+")
    ap.add_argument("--all", action="store_true")
    a = ap.parse_args()
    if a.all:
        for cid, sk in COMBOS.items():
            compose(sk, os.path.join(OUT, f"{cid}-{VERSION}.webp"))
    elif a.id and a.skus:
        compose(a.skus, os.path.join(OUT, f"{a.id}-{VERSION}.webp"))
    else:
        ap.error("use --all ou --id e --skus")
