"""
Banner informativo de produto (Vanguard Labs) - metodo hibrido.

  1. ARTE (ComfyUI, modelo Z-Image Turbo local): fundo neon com DNA/figuras e as 4 imagens dos cards.
     Nenhum texto passa pela IA.
  2. TEXTO, caixas, icones, logo e foto real do vial: desenhados por codigo (Pillow), a partir de
     dados/<sku>.json. O texto sai exatamente como esta no JSON (acentos incluidos).

Uso:
  python banner.py dados/tsm5.json                 # gera (ou reaproveita) a arte e monta o banner
  python banner.py dados/tsm5.json --nova-arte     # forca gerar arte nova no ComfyUI
  python banner.py dados/tsm5.json --seed 123      # outra variacao de arte
  python banner.py dados/tsm5.json --sem-comfy     # nao chama o ComfyUI (usa arte salva ou fundo liso)
  python banner.py --exportar-workflow             # regrava workflow_arte_api.json / workflow_arte_ui.json

Saida: saida/<sku>_banner.png (2048x3072) e saida/<sku>_banner.webp (1024x1536).
ComfyUI: http://127.0.0.1:8188 (mude com a variavel COMFYUI_URL). Dependencias: Python 3 + Pillow + numpy.
"""
import argparse
import copy
import json
import os
import re
import sys
import time
import urllib.parse
import urllib.request
import uuid

import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, "..", ".."))
FOTOS = os.path.join(ROOT, "assets", "produtos")
LOGO_IMG = os.path.join(ROOT, "pwa", "logo-original.png")
ARTE_DIR = os.path.join(HERE, "arte")
SAIDA_DIR = os.path.join(HERE, "saida")
WF_API = os.path.join(HERE, "workflow_arte_api.json")
WF_UI = os.path.join(HERE, "workflow_arte_ui.json")
COMFY = os.environ.get("COMFYUI_URL", "http://127.0.0.1:8188").rstrip("/")

S = 2                    # escala: layout pensado em 1024x1536, renderizado em 2048x3072
W, H = 1024, 1536
FONT_DIRS = [r"C:\Windows\Fonts", os.path.expandvars(r"%LOCALAPPDATA%\Microsoft\Windows\Fonts")]
ICON_FONT = r"C:\Windows\Fonts\SegoeIcons.ttf"

TEAL = (64, 224, 214)
TEAL_L = (150, 240, 232)
WHITE = (240, 244, 246)
GREY = (196, 204, 210)
PANEL = (3, 12, 16, 205)

ICONES = {  # Segoe Fluent Icons (vem com o Windows 11)
    "engrenagem": "\uE713", "relogio": "\uE823", "calendario": "\uE787", "aviso": "\uE7BA",
    "coracao": "\uE95E", "pulso": "\uE9D9", "lua": "\uE708", "raio": "\uE945", "escudo": "\uEA18",
    "check": "\uE73E", "alvo": "\uE81D", "grafico": "\uE9D2", "termometro": "\uE9CA",
    "historico": "\uE81C", "folha": "\uE8BE", "brilho": "\uE794", "lampada": "\uE82F",
    "molecula": "\uEBD2", "cubo": "\uF158", "prancheta": "\uF0E3", "documento": "\uE9F9",
    "capelo": "\uE7BE", "pessoas": "\uE716",
}

SEM_TEXTO = (", no text, no letters, no words, no captions, no logo, no watermark, no typography")

PROBLEMAS = []           # tudo que nao coube ou nao tem glifo vai para ca (e o script avisa no final)


# ----------------------------------------------------------------------------------------------
# Workflow do ComfyUI
# ----------------------------------------------------------------------------------------------
IMAGENS = [  # (id base, chave no JSON, largura, altura, prefixo)
    (10, "arte_fundo", 1024, 1536, "fundo"),
    (20, "card1", 640, 640, "card1"),
    (30, "card2", 640, 640, "card2"),
    (40, "card3", 640, 640, "card3"),
    (50, "card4", 640, 640, "card4"),
]


def workflow_template():
    """Workflow em formato API com marcadores {{...}} que o script troca pelos dados do produto."""
    wf = {
        "1": {"class_type": "UNETLoader", "inputs": {"unet_name": "z_image_turbo_bf16.safetensors", "weight_dtype": "default"}},
        "2": {"class_type": "CLIPLoader", "inputs": {"clip_name": "qwen_3_4b.safetensors", "type": "lumina2", "device": "default"}},
        "3": {"class_type": "VAELoader", "inputs": {"vae_name": "ae.safetensors"}},
        "4": {"class_type": "ModelSamplingAuraFlow", "inputs": {"model": ["1", 0], "shift": 3}},
        "5": {"class_type": "CLIPTextEncode", "inputs": {"clip": ["2", 0], "text": ""}},
        "6": {"class_type": "ConditioningZeroOut", "inputs": {"conditioning": ["5", 0]}},
    }
    for i, (b, chave, w, h, pref) in enumerate(IMAGENS):
        n = lambda k: str(b + k)
        wf[n(0)] = {"class_type": "CLIPTextEncode", "inputs": {"clip": ["2", 0], "text": "{{%s}}" % chave.upper()}}
        wf[n(1)] = {"class_type": "EmptySD3LatentImage", "inputs": {"width": w, "height": h, "batch_size": 1}}
        wf[n(2)] = {"class_type": "KSampler", "inputs": {
            "model": ["4", 0], "positive": [n(0), 0], "negative": ["6", 0], "latent_image": [n(1), 0],
            "seed": "{{SEED+%d}}" % i, "steps": 8, "cfg": 1.0, "sampler_name": "res_multistep",
            "scheduler": "simple", "denoise": 1.0}}
        wf[n(3)] = {"class_type": "VAEDecode", "inputs": {"samples": [n(2), 0], "vae": ["3", 0]}}
        wf[n(4)] = {"class_type": "SaveImage", "inputs": {"images": [n(3), 0], "filename_prefix": "vg_banner/{{SKU}}_%s" % pref}}
    return wf


def prompts_do_produto(d):
    p = {"ARTE_FUNDO": d["arte_fundo"] + SEM_TEXTO}
    for i, ap in enumerate(d["aplicacoes"][:4]):
        p["CARD%d" % (i + 1)] = ap["arte"] + ", square composition, photorealistic" + SEM_TEXTO
    return p


def preencher(wf, d, seed):
    wf = copy.deepcopy(wf)
    subs = prompts_do_produto(d)
    subs["SKU"] = d["sku"].lower()
    for node in wf.values():
        for k, v in node["inputs"].items():
            if not isinstance(v, str):
                continue
            m = re.fullmatch(r"\{\{SEED\+(\d+)\}\}", v)
            if m:
                node["inputs"][k] = seed + int(m.group(1))
                continue
            node["inputs"][k] = re.sub(r"\{\{(\w+)\}\}", lambda mm: subs[mm.group(1)], v)
    return wf


def api_para_ui(wf):
    """Converte o workflow API em formato de interface (arrastar para o ComfyUI)."""
    widgets = {
        "UNETLoader": lambda i: [i["unet_name"], i["weight_dtype"]],
        "CLIPLoader": lambda i: [i["clip_name"], i["type"], i["device"]],
        "VAELoader": lambda i: [i["vae_name"]],
        "ModelSamplingAuraFlow": lambda i: [i["shift"]],
        "CLIPTextEncode": lambda i: [i["text"]],
        "ConditioningZeroOut": lambda i: [],
        "EmptySD3LatentImage": lambda i: [i["width"], i["height"], i["batch_size"]],
        "KSampler": lambda i: [i["seed"], "fixed", i["steps"], i["cfg"], i["sampler_name"], i["scheduler"], i["denoise"]],
        "VAEDecode": lambda i: [],
        "SaveImage": lambda i: [i["filename_prefix"]],
    }
    out_type = {"UNETLoader": "MODEL", "CLIPLoader": "CLIP", "VAELoader": "VAE", "ModelSamplingAuraFlow": "MODEL",
                "CLIPTextEncode": "CONDITIONING", "ConditioningZeroOut": "CONDITIONING", "EmptySD3LatentImage": "LATENT",
                "KSampler": "LATENT", "VAEDecode": "IMAGE", "SaveImage": None}
    in_type = {"model": "MODEL", "clip": "CLIP", "vae": "VAE", "conditioning": "CONDITIONING", "positive": "CONDITIONING",
               "negative": "CONDITIONING", "latent_image": "LATENT", "samples": "LATENT", "images": "IMAGE"}
    nodes, links, lid = {}, [], 0
    for nid, nd in wf.items():
        k = int(nid)
        col, row = (k % 10, k // 10) if k >= 10 else (k, 0)
        pos = [col * 380, row * 330] if k >= 10 else [0, (k - 1) * 150]
        if k >= 10:
            pos = [400 + col * 380, (row - 1) * 330]
        ot = out_type[nd["class_type"]]
        nodes[nid] = {"id": k, "type": nd["class_type"], "pos": pos, "size": [340, 120], "flags": {}, "order": 0,
                      "mode": 0, "inputs": [], "outputs": ([{"name": ot, "type": ot, "links": []}] if ot else []),
                      "properties": {"Node name for S&R": nd["class_type"]},
                      "widgets_values": widgets[nd["class_type"]](nd["inputs"])}
    for nid, nd in wf.items():
        for name, v in nd["inputs"].items():
            if isinstance(v, list):
                lid += 1
                src, slot = v
                t = in_type[name]
                links.append([lid, int(src), slot, int(nid), len(nodes[nid]["inputs"]), t])
                nodes[nid]["inputs"].append({"name": name, "type": t, "link": lid})
                nodes[src]["outputs"][slot]["links"].append(lid)
    return {"last_node_id": max(int(k) for k in wf), "last_link_id": lid, "nodes": list(nodes.values()),
            "links": links, "groups": [], "config": {}, "extra": {}, "version": 0.4}


def exportar_workflows(d_exemplo=None):
    tpl = workflow_template()
    with open(WF_API, "w", encoding="utf-8") as f:
        json.dump(tpl, f, ensure_ascii=False, indent=2)
    if d_exemplo:
        ui = api_para_ui(preencher(tpl, d_exemplo, d_exemplo.get("seed", 1)))
        with open(WF_UI, "w", encoding="utf-8") as f:
            json.dump(ui, f, ensure_ascii=False, indent=2)


# ----------------------------------------------------------------------------------------------
# Cliente HTTP do ComfyUI
# ----------------------------------------------------------------------------------------------
def http(path, data=None, timeout=30):
    req = urllib.request.Request(COMFY + path, data=None if data is None else json.dumps(data).encode(),
                                 headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return r.read()


def comfy_online():
    try:
        http("/system_stats", timeout=5)
        return True
    except Exception:
        return False


def gerar_arte(d, seed):
    with open(WF_API, encoding="utf-8") as f:
        tpl = json.load(f)
    wf = preencher(tpl, d, seed)
    r = json.loads(http("/prompt", {"prompt": wf, "client_id": str(uuid.uuid4())}))
    if r.get("node_errors"):
        raise SystemExit("ComfyUI recusou o workflow: %s" % r["node_errors"])
    pid = r["prompt_id"]
    print("ComfyUI: gerando arte (prompt %s)..." % pid, flush=True)
    t0 = time.time()
    while True:
        h = json.loads(http("/history/" + pid))
        if pid in h:
            h = h[pid]
            break
        if time.time() - t0 > 1800:
            raise SystemExit("ComfyUI demorou mais de 30 min; veja a fila na interface.")
        time.sleep(3)
    st = h.get("status", {})
    if st.get("status_str") != "success":
        raise SystemExit("ComfyUI terminou com erro: %s" % json.dumps(st.get("messages", []))[:2000])
    os.makedirs(ARTE_DIR, exist_ok=True)
    for b, chave, w, hh, pref in IMAGENS:
        img = h["outputs"][str(b + 4)]["images"][0]
        q = urllib.parse.urlencode({"filename": img["filename"], "subfolder": img["subfolder"], "type": img["type"]})
        with open(arte_path(d, pref), "wb") as f:
            f.write(http("/view?" + q, timeout=120))
    print("ComfyUI: arte pronta em %.0fs" % (time.time() - t0), flush=True)


def arte_path(d, pref):
    return os.path.join(ARTE_DIR, "%s_%s.png" % (d["sku"].lower(), pref))


# ----------------------------------------------------------------------------------------------
# Tipografia
# ----------------------------------------------------------------------------------------------
_fc = {}


def F(family, weight, size):
    key = (family, weight, round(size * S))
    if key not in _fc:
        fname = "%s-%s.ttf" % (family, weight)
        for d in FONT_DIRS:
            p = os.path.join(d, fname)
            if os.path.exists(p):
                _fc[key] = ImageFont.truetype(p, round(size * S))
                break
        else:
            raise SystemExit("Fonte %s nao encontrada." % fname)
    return _fc[key]


def ICON(size):
    return ImageFont.truetype(ICON_FONT, round(size * S))


_notdef = {}


def checar_glifos(texto, font, onde):
    """Detecta caractere sem desenho na fonte (sairia como quadradinho)."""
    k = font.path

    def assinatura(ch):
        im = Image.new("L", (int(font.size * 2), int(font.size * 2)), 0)
        ImageDraw.Draw(im).text((2, 2), ch, font=font, fill=255)
        return im.tobytes()

    if (k, font.size) not in _notdef:
        _notdef[(k, font.size)] = assinatura("\U000F0000")
    for ch in set(texto):
        if ch.isspace():
            continue
        if assinatura(ch) == _notdef[(k, font.size)]:
            PROBLEMAS.append("%s: caractere %r sem glifo em %s" % (onde, ch, os.path.basename(k)))


def parse_rich(texto, base, destaque):
    """'**trecho**' vira destaque. base/destaque = (family, weight, color)."""
    segs = []
    for i, parte in enumerate(re.split(r"\*\*", texto)):
        if parte:
            segs.append((parte, destaque if i % 2 else base))
    return segs


def layout_rich(segs, size, maxw):
    """Quebra linhas com fontes misturadas. Retorna lista de linhas [(x, palavra, font, cor)]."""
    linhas, atual, x = [], [], 0
    sp = None
    for texto, (fam, wt, cor) in segs:
        f = F(fam, wt, size)
        sp = f.getlength(" ")
        tokens = re.split(r"(\s+)", texto)
        for tok in tokens:
            if tok == "":
                continue
            if tok.isspace():
                if atual:
                    x += sp
                continue
            lw = f.getlength(tok)
            if atual and x + lw > maxw * S:
                linhas.append(atual)
                atual, x = [], 0
            atual.append((x, tok, f, cor))
            x += lw
    if atual:
        linhas.append(atual)
    return linhas


def fit_rich(segs, size, min_size, maxw, maxh, lh=1.25, max_linhas=99):
    s = size
    while True:
        linhas = layout_rich(segs, s, maxw)
        alt = len(linhas) * s * lh
        larg = max((l[-1][0] + l[-1][2].getlength(l[-1][1])) for l in linhas) / S if linhas else 0
        if (alt <= maxh and len(linhas) <= max_linhas and larg <= maxw + 0.5) or s <= min_size:
            ok = alt <= maxh and len(linhas) <= max_linhas and larg <= maxw + 0.5
            return linhas, s, ok
        s -= 0.5


class Canvas:
    def __init__(self, base):
        self.base = base.convert("RGBA")
        self.panel = Image.new("RGBA", self.base.size, (0, 0, 0, 0))
        self.glow = Image.new("RGBA", self.base.size, (0, 0, 0, 0))
        self.text = Image.new("RGBA", self.base.size, (0, 0, 0, 0))
        self.dp = ImageDraw.Draw(self.panel)
        self.dg = ImageDraw.Draw(self.glow)
        self.dt = ImageDraw.Draw(self.text)
        self.caixas_texto = []   # (nome, x0, y0, x1, y1) para checar sobreposicao

    # --- primitivas em coordenadas 1024x1536 ---
    def box(self, x0, y0, x1, y1, r=14, fill=PANEL, borda=TEAL, w=2, glow=True):
        b = [x0 * S, y0 * S, x1 * S, y1 * S]
        self.dp.rounded_rectangle(b, r * S, fill=fill)
        if borda:
            self.dp.rounded_rectangle(b, r * S, outline=borda + (255,), width=round(w * S))
            if glow:
                self.dg.rounded_rectangle(b, r * S, outline=borda + (200,), width=round(w * S * 3))

    def linha(self, x0, y0, x1, y1, cor=(64, 224, 214, 90), w=1):
        self.dp.line([x0 * S, y0 * S, x1 * S, y1 * S], fill=cor, width=max(1, round(w * S)))

    def icone(self, nome, cx, cy, size, cor=TEAL, glow=True):
        f = ICON(size)
        self.dt.text((cx * S, cy * S), ICONES[nome], font=f, fill=cor + (255,), anchor="mm")
        if glow:
            self.dg.text((cx * S, cy * S), ICONES[nome], font=f, fill=cor + (160,), anchor="mm")

    def icone_circulo(self, nome, cx, cy, r, size):
        self.dp.ellipse([(cx - r) * S, (cy - r) * S, (cx + r) * S, (cy + r) * S], fill=(0, 20, 24, 255),
                        outline=TEAL + (255,), width=2 * S)
        self.dg.ellipse([(cx - r) * S, (cy - r) * S, (cx + r) * S, (cy + r) * S], outline=TEAL + (200,), width=5 * S)
        self.icone(nome, cx, cy, size, glow=False)

    def texto(self, nome, x, y, segs, size, min_size, maxw, maxh, lh=1.25, align="left", max_linhas=99, vcenter=False):
        """Bloco de texto que cabe em (maxw x maxh). Registra problema se nao couber."""
        linhas, s, ok = fit_rich(segs, size, min_size, maxw, maxh, lh, max_linhas)
        if not ok:
            PROBLEMAS.append("%s: texto nao coube (%d linhas em %.0fx%.0f, fonte %.1f)" % (nome, len(linhas), maxw, maxh, s))
        for t, (fam, wt, _c) in segs:
            checar_glifos(t, F(fam, wt, s), nome)
        alt = len(linhas) * s * lh
        y0 = y + (maxh - alt) / 2 if vcenter else y
        for i, ln in enumerate(linhas):
            lw = (ln[-1][0] + ln[-1][2].getlength(ln[-1][1])) / S
            dx = {"left": 0, "center": (maxw - lw) / 2, "right": maxw - lw}[align]
            yy = (y0 + i * s * lh + (s * lh - s) / 2) * S
            for (px, tok, f, cor) in ln:
                self.dt.text(((x + dx) * S + px, yy), tok, font=f, fill=cor + (255,), anchor="la")
        self.caixas_texto.append((nome, x, y0, x + maxw, y0 + alt))
        return y0 + alt

    def simples(self, nome, x, y, txt, fam, wt, size, cor, maxw, align="left", min_size=None, tracking=0):
        """Uma linha so; reduz a fonte se passar da largura."""
        s = size
        while True:
            f = F(fam, wt, s)
            lw = (f.getlength(txt) + tracking * S * (len(txt) - 1)) / S
            if lw <= maxw or s <= (min_size or size * 0.6):
                break
            s -= 0.5
        if lw > maxw:
            PROBLEMAS.append("%s: '%s' passou da largura (%.0f > %.0f)" % (nome, txt, lw, maxw))
        checar_glifos(txt, f, nome)
        dx = {"left": 0, "center": (maxw - lw) / 2, "right": maxw - lw}[align]
        cx = (x + dx) * S
        for ch in txt:
            self.dt.text((cx, y * S), ch, font=f, fill=cor + (255,), anchor="la")
            cx += f.getlength(ch) + tracking * S
        self.caixas_texto.append((nome, x + dx, y, x + dx + lw, y + s * 1.2))
        return lw, s

    def finalizar(self):
        out = self.base
        g = self.glow.filter(ImageFilter.GaussianBlur(6 * S))
        out = Image.alpha_composite(out, g)
        out = Image.alpha_composite(out, self.panel)
        a = self.text.split()[3].filter(ImageFilter.GaussianBlur(3 * S))
        sombra = Image.new("RGBA", out.size, (0, 0, 0, 0))
        sombra.putalpha(a.point(lambda v: min(255, int(v * 1.6))))
        out = Image.alpha_composite(out, sombra)
        out = Image.alpha_composite(out, self.glow.filter(ImageFilter.GaussianBlur(2 * S)).point(lambda v: v // 3))
        out = Image.alpha_composite(out, self.text)
        return out.convert("RGB")


# ----------------------------------------------------------------------------------------------
# Imagens auxiliares
# ----------------------------------------------------------------------------------------------
def logo_v():
    src = np.asarray(Image.open(LOGO_IMG).convert("RGB")).astype(np.float32)
    crop = src[234:359, 65:215]
    m = np.maximum(crop[..., 1], crop[..., 2])
    a = np.clip((m - 40) / 110.0, 0, 1)
    im = Image.fromarray(np.dstack([crop, a * 255]).astype(np.uint8), "RGBA")
    return im.crop(im.getbbox())


def vial_recorte(foto, altura):
    """Recorta o frasco da foto padronizada (fundo escuro) com bordas suaves."""
    im = Image.open(os.path.join(FOTOS, foto)).convert("RGB")
    im = im.crop((195, 170, 605, 1010))                 # vial dentro da foto 800x1200
    k = altura * S / im.height
    im = im.resize((round(im.width * k), round(altura * S)), Image.LANCZOS)
    mask = Image.new("L", im.size, 0)
    md = ImageDraw.Draw(mask)
    pad = im.width * 0.10
    md.rounded_rectangle([pad, im.height * 0.03, im.width - pad, im.height * 0.985], radius=im.width * 0.2, fill=255)
    mask = mask.filter(ImageFilter.GaussianBlur(im.width * 0.05))
    # o preto do fundo da foto vira transparente (o vidro e o rotulo ficam)
    lum = np.asarray(im.convert("L")).astype(np.float32)
    lm = np.clip((lum - 8) / 30.0, 0, 1)
    a = (np.asarray(mask).astype(np.float32) / 255.0) * np.maximum(lm, 0.0)
    a = Image.fromarray((a * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.2 * S))
    im = im.convert("RGBA")
    im.putalpha(a)
    return im


def brilho_radial(size, cor, alpha):
    w, h = size
    y, x = np.mgrid[0:h, 0:w]
    r = np.sqrt(((x - w / 2) / (w / 2)) ** 2 + ((y - h / 2) / (h / 2)) ** 2)
    a = np.clip(1 - r, 0, 1) ** 2 * alpha
    arr = np.zeros((h, w, 4), np.uint8)
    arr[..., 0], arr[..., 1], arr[..., 2] = cor
    arr[..., 3] = (a * 255).astype(np.uint8)
    return Image.fromarray(arr, "RGBA")


def cover(im, w, h):
    k = max(w / im.width, h / im.height)
    im = im.resize((round(im.width * k), round(im.height * k)), Image.LANCZOS)
    x, y = (im.width - w) // 2, (im.height - h) // 2
    return im.crop((x, y, x + w, y + h))


def titulo_metalico(cv, txt, cx, y, maxw, maxh):
    s = 120
    while True:
        f = F("Montserrat", "BlackItalic", s)
        bb = f.getbbox(txt, anchor="ls")
        tw, th = (bb[2] - bb[0]) / S, (bb[3] - bb[1]) / S
        if (tw <= maxw and th <= maxh) or s < 40:
            break
        s -= 1
    checar_glifos(txt, f, "titulo")
    if tw > maxw:
        PROBLEMAS.append("titulo nao coube")
    mask = Image.new("L", cv.base.size, 0)
    x = (cx - tw / 2) * S - bb[0]
    base_y = (y + maxh / 2 + th / 2) * S
    ImageDraw.Draw(mask).text((x, base_y), txt, font=f, anchor="ls", fill=255)
    top, bot = base_y - (bb[3] - bb[1]) + bb[3], base_y + bb[3]
    top = base_y + bb[1]
    grad = np.zeros((cv.base.size[1], cv.base.size[0], 3), np.float32)
    ys = np.arange(cv.base.size[1], dtype=np.float32)
    t = np.clip((ys - top) / max(1, (bot - top)), 0, 1)
    stops = [(0, (255, 255, 255)), (0.45, (214, 220, 226)), (0.55, (128, 138, 148)), (0.75, (196, 204, 212)), (1, (250, 252, 252))]
    for c in range(3):
        grad[..., c] = np.interp(t, [p for p, _ in stops], [v[c] for _, v in stops])[:, None]
    metal = Image.fromarray(grad.astype(np.uint8)).convert("RGBA")
    metal.putalpha(mask)
    # contorno escuro + brilho teal
    cont = mask.filter(ImageFilter.MaxFilter(5))
    cv.text.paste((5, 12, 16, 255), (0, 0), cont)
    cv.glow.paste(TEAL + (150,), (0, 0), mask.filter(ImageFilter.MaxFilter(9)))
    cv.text = Image.alpha_composite(cv.text, metal)
    cv.dt = ImageDraw.Draw(cv.text)
    cv.caixas_texto.append(("titulo", cx - tw / 2, y, cx + tw / 2, y + maxh))


# ----------------------------------------------------------------------------------------------
# Composicao
# ----------------------------------------------------------------------------------------------
def montar(d):
    PROBLEMAS.clear()
    sku = d["sku"].lower()
    fundo_p = arte_path(d, "fundo")
    if os.path.exists(fundo_p):
        base = cover(Image.open(fundo_p).convert("RGB"), W * S, H * S)
    else:
        print("Aviso: sem arte de fundo (%s); usando fundo liso." % fundo_p)
        base = Image.new("RGB", (W * S, H * S), (2, 8, 10))
    # escurece o miolo (onde ficam as caixas) mantendo as figuras do topo
    arr = np.asarray(base).astype(np.float32)
    yy = np.linspace(0, 1, H * S)[:, None, None]
    escurece = np.clip((yy - 0.18) / 0.25, 0, 1) * 0.45
    arr *= (1 - escurece)
    base = Image.fromarray(arr.clip(0, 255).astype(np.uint8))
    cv = Canvas(base)
    # faixa escura atras do texto central do topo (legibilidade)
    sombra_topo = brilho_radial((620 * S, 420 * S), (0, 0, 0), 0.75)
    cv.base.alpha_composite(sombra_topo, (275 * S, 40 * S))
    veu = Image.new("L", (W * S, H * S), 0)
    ImageDraw.Draw(veu).rounded_rectangle([395 * S, 272 * S, 775 * S, 412 * S], 30 * S, fill=150)
    veu = veu.filter(ImageFilter.GaussianBlur(18 * S))
    cv.base.paste((0, 0, 0, 255), (0, 0), veu)

    # ---------------- topo ----------------
    lv = logo_v()
    lh_ = 54
    lvr = lv.resize((round(lv.width * lh_ * S / lv.height), lh_ * S), Image.LANCZOS)
    cv.text.alpha_composite(lvr, (round((95 - lvr.width / S / 2) * S), 22 * S))
    cv.simples("logo", 20, 84, "VANGUARD", "Montserrat", "SemiBold", 21, WHITE, 150, "center", tracking=1)
    cv.simples("logo", 20, 110, "LABS", "Montserrat", "Medium", 13, TEAL_L, 150, "center", tracking=4)
    cv.linha(40, 118, 68, 118, TEAL + (255,), 1)
    cv.linha(122, 118, 150, 118, TEAL + (255,), 1)
    cv.linha(26, 144, 26, 212, TEAL + (255,), 2)
    for i, t in enumerate(d.get("lema", ["CIÊNCIA", "DISCIPLINA", "RESULTADOS"])):
        cv.simples("lema", 36, 144 + i * 24, t, "BarlowCondensed", "Medium", 19, WHITE, 120)

    cx = 585
    sel = d["selo"]
    f = F("Montserrat", "Bold", 16)
    sw = f.getlength(sel) / S + 44
    cv.box(cx - sw / 2, 84, cx + sw / 2, 118, r=17, fill=(0, 18, 22, 210), w=2)
    cv.simples("selo", cx - sw / 2, 92, sel, "Montserrat", "Bold", 16, TEAL_L, sw, "center")
    titulo_metalico(cv, d["titulo"], cx, 128, 600, 92)
    cv.simples("subtitulo", cx - 300, 238, d["subtitulo"], "Montserrat", "Medium", 23, WHITE, 600, "center", tracking=3)
    cv.linha(412, 284, 412, 400, TEAL + (255,), 3)
    cv.texto("descricao", 424, 282, [(d["descricao"], ("Montserrat", "Regular", WHITE))], 17, 13, 330, 122, lh=1.32)

    # ---------------- vial ----------------
    gl = brilho_radial((360 * S, 520 * S), TEAL, 0.35)
    cv.base.alpha_composite(gl, (-30 * S, 390 * S))
    vial = vial_recorte(d["foto"], 560)
    cv.text.alpha_composite(vial, (round((150 - vial.width / S / 2) * S), 372 * S))

    # ---------------- mecanismo ----------------
    X0, X1 = 292, 652
    cv.box(X0, 425, X1, 640)
    cv.icone_circulo("engrenagem", X0 + 34, 456, 20, 22)
    cv.simples("mecanismo-h", X0 + 66, 444, "MECANISMO DE AÇÃO", "Montserrat", "ExtraBold", 20, WHITE, X1 - X0 - 80)
    cv.linha(X0 + 14, 486, X1 - 14, 486)
    y = 498
    itens = d["mecanismo"]
    alt_item = (632 - y) / len(itens)
    for i, t in enumerate(itens):
        cv.icone("check", X0 + 26, y + 11, 15)
        cv.texto("mecanismo-%d" % (i + 1), X0 + 44, y, [(t, ("Montserrat", "Regular", WHITE))], 15, 12, X1 - X0 - 58, alt_item - 4, lh=1.22)
        y += alt_item

    # ---------------- dosagem ----------------
    cv.box(X0, 655, X1, 900)
    cv.icone_circulo("prancheta", X0 + 34, 686, 20, 21)
    lw, _ = cv.simples("dosagem-h", X0 + 66, 674, "DOSAGEM", "Montserrat", "ExtraBold", 20, WHITE, 140)
    cv.simples("dosagem-h2", X0 + 72 + lw, 681, "(REFERÊNCIA DA COMUNIDADE)", "Montserrat", "Medium", 10.5, GREY, X1 - X0 - 90 - lw)
    cv.linha(X0 + 14, 716, X1 - 14, 716)
    y = 722
    alt = (894 - y) / len(d["dosagem"])
    for i, it in enumerate(d["dosagem"]):
        cv.icone(it["icone"], X0 + 30, y + alt / 2, 21)
        segs = [(it["rotulo"] + " ", ("Montserrat", "Bold", WHITE)), (it["texto"], ("Montserrat", "Regular", WHITE))]
        cv.texto("dosagem-%d" % (i + 1), X0 + 56, y + 3, segs, 15, 12, X1 - X0 - 70, alt - 6, lh=1.2, vcenter=True)
        if i < len(d["dosagem"]) - 1:
            cv.linha(X0 + 50, y + alt, X1 - 14, y + alt, (64, 224, 214, 50))
        y += alt

    # ---------------- beneficios ----------------
    B0, B1 = 664, 1012
    cv.box(B0, 425, B1, 900)
    cv.icone("grafico", B0 + 32, 458, 30)
    cv.texto("beneficios-h", B0 + 60, 436, [("BENEFÍCIOS CITADOS NA COMUNIDADE*", ("Montserrat", "ExtraBold", WHITE))],
             18, 14, B1 - B0 - 72, 46, lh=1.15, max_linhas=2)
    cv.linha(B0 + 14, 490, B1 - 14, 490)
    y = 494
    alt = (896 - y) / len(d["beneficios"])
    for i, it in enumerate(d["beneficios"]):
        cv.icone(it["icone"], B0 + 32, y + alt / 2, 24)
        cv.texto("beneficio-%d" % (i + 1), B0 + 62, y + 2, [(it["texto"], ("Montserrat", "Regular", WHITE))],
                 15, 12, B1 - B0 - 76, alt - 4, lh=1.2, vcenter=True, max_linhas=2)
        if i < len(d["beneficios"]) - 1:
            cv.linha(B0 + 56, y + alt, B1 - 14, y + alt, (64, 224, 214, 50))
        y += alt

    # ---------------- aplicacoes ----------------
    A0, A1 = 12, 652
    cv.box(A0, 935, A1, 1290)
    cv.box(A0 + 6, 912, 400, 958, r=23, fill=(0, 16, 20, 245))
    cv.icone_circulo("alvo", A0 + 30, 935, 18, 20)
    cv.simples("aplicacoes-h", A0 + 58, 924, "PRINCIPAIS APLICAÇÕES", "Montserrat", "ExtraBold", 20, WHITE, 400 - A0 - 70)
    n = len(d["aplicacoes"][:4])
    gap = 8
    cw = (A1 - A0 - 16 - gap * (n - 1)) / n
    for i, ap in enumerate(d["aplicacoes"][:4]):
        x = A0 + 8 + i * (cw + gap)
        p = arte_path(d, "card%d" % (i + 1))
        if os.path.exists(p):
            im = cover(Image.open(p).convert("RGB"), round(cw * S), 156 * S)
            # funde a base da imagem com o painel
            g = np.linspace(1, 0, 156 * S)[:, None]
            a = np.clip(g * 2.2, 0, 1) * 255
            im = im.convert("RGBA")
            im.putalpha(Image.fromarray(np.repeat(a, round(cw * S), 1).astype(np.uint8)))
            cv.panel.alpha_composite(im, (round(x * S), 966 * S))
        if i:
            cv.linha(x - gap / 2, 972, x - gap / 2, 1280, (64, 224, 214, 70))
        cv.texto("aplicacao-%d-titulo" % (i + 1), x + 4, 1118, [(ap["titulo"], ("BarlowCondensed", "Bold", WHITE))],
                 21, 16, cw - 8, 48, lh=1.05, align="center", max_linhas=2, vcenter=True)
        cv.texto("aplicacao-%d-texto" % (i + 1), x + 6, 1172, [(ap["texto"], ("Montserrat", "Regular", GREY))],
                 14, 11, cw - 12, 108, lh=1.28, align="center")

    # ---------------- stacks ----------------
    cv.box(B0, 915, B1, 1290)
    cv.icone("molecula", B0 + 32, 948, 26)
    cv.simples("stacks-h", B0 + 58, 937, "STACKS MAIS UTILIZADOS", "Montserrat", "ExtraBold", 18, WHITE, B1 - B0 - 70)
    cv.linha(B0 + 14, 978, B1 - 14, 978)
    st = d["stacks"][:3]
    colw = (B1 - B0 - 20) / len(st)
    for i, s_ in enumerate(st):
        ccx = B0 + 10 + colw * (i + 0.5)
        v = vial_recorte(s_["foto"], 150)
        cv.text.alpha_composite(v, (round((ccx - v.width / S / 2) * S), 986 * S))
        cv.texto("stack-%d" % (i + 1), ccx - colw / 2 + 4, 1140, [(s_["nome"], ("BarlowCondensed", "SemiBold", WHITE))],
                 16, 12.5, colw - 8, 40, lh=1.08, align="center", max_linhas=2)
        if i:
            cv.simples("stack-mais", B0 + 10 + colw * i - 12, 1035, "+", "Montserrat", "Black", 34, TEAL, 24, "center")
    cv.linha(B0 + 20, 1190, B1 - 20, 1190)
    cv.texto("stacks-texto", B0 + 20, 1200, [(d["stacks_texto"], ("Montserrat", "Regular", GREY))], 14, 11, B1 - B0 - 40, 80, lh=1.3, align="center")

    # ---------------- aviso ----------------
    cv.box(56, 1304, 968, 1390, r=20, fill=(0, 14, 18, 225))
    cv.icone("aviso", 100, 1347, 40)
    aviso = d["aviso"]
    if "**" not in aviso and "Research Use Only" in aviso:
        aviso = aviso.replace("fins de pesquisa (Research Use Only)", "**fins de pesquisa (Research Use Only)**")
    cv.texto("aviso", 140, 1310, parse_rich(aviso, ("Montserrat", "Regular", WHITE), ("Montserrat", "Bold", TEAL_L)),
             13.5, 10.5, 810, 74, lh=1.3, vcenter=True)

    # ---------------- rodape ----------------
    lv2 = lv.resize((round(lv.width * 48 * S / lv.height), 48 * S), Image.LANCZOS)
    cv.text.alpha_composite(lv2, (round((110 - lv2.width / S / 2) * S), 1408 * S))
    cv.simples("rodape-logo", 30, 1462, "VANGUARD", "Montserrat", "SemiBold", 20, WHITE, 160, "center", tracking=1)
    cv.simples("rodape-logo", 30, 1488, "LABS", "Montserrat", "Medium", 12, TEAL_L, 160, "center", tracking=4)
    cv.linha(48, 1495, 84, 1495, TEAL + (255,), 1)
    cv.linha(136, 1495, 172, 1495, TEAL + (255,), 1)
    pil = d.get("pilares", [["documento", "CIÊNCIA"], ["grafico", "RESULTADOS"], ["escudo", "CONFIANÇA"],
                            ["folha", "BEM-ESTAR"], ["historico", "LONGEVIDADE"]])
    P0, P1 = 214, 832
    pw = (P1 - P0) / len(pil)
    for i, (ic, t) in enumerate(pil):
        pcx = P0 + pw * (i + 0.5)
        cv.linha(P0 + pw * i, 1412, P0 + pw * i, 1515, (64, 224, 214, 110))
        cv.icone(ic, pcx, 1440, 34)
        cv.simples("pilar-%d" % (i + 1), pcx - pw / 2 + 2, 1474, t, "BarlowCondensed", "SemiBold", 18, WHITE, pw - 4, "center")
    cv.linha(P1, 1412, P1, 1515, (64, 224, 214, 110))
    fr = d.get("frase", [["PEQUENAS", "ATITUDES"], ["MELHORES", "RESULTADOS"]])
    yy = 1414
    for j, bloco in enumerate(fr):
        for t in bloco:
            cv.simples("frase", 850, yy, t, "BarlowCondensed", "SemiBold" if j == 0 else "Bold", 21, WHITE if j == 0 else TEAL_L, 165)
            yy += 25

    checar_sobreposicao(cv.caixas_texto)
    return cv.finalizar()


def checar_sobreposicao(caixas):
    for i in range(len(caixas)):
        for j in range(i + 1, len(caixas)):
            a, b = caixas[i], caixas[j]
            if a[0].split("-")[0] == b[0].split("-")[0] and a[0] == b[0]:
                continue
            ix = min(a[3], b[3]) - max(a[1], b[1])
            iy = min(a[4], b[4]) - max(a[2], b[2])
            if ix > 1 and iy > 1:
                PROBLEMAS.append("sobreposicao: %s x %s" % (a[0], b[0]))


# ----------------------------------------------------------------------------------------------
def main():
    ap = argparse.ArgumentParser(description="Banner informativo Vanguard Labs")
    ap.add_argument("dados", nargs="?", help="arquivo JSON do produto (ex.: dados/tsm5.json)")
    ap.add_argument("--nova-arte", action="store_true", help="gera arte nova no ComfyUI mesmo se ja existir")
    ap.add_argument("--sem-comfy", action="store_true", help="nao chama o ComfyUI")
    ap.add_argument("--seed", type=int, help="semente da arte (troca a variacao)")
    ap.add_argument("--exportar-workflow", action="store_true")
    a = ap.parse_args()

    if a.exportar_workflow:
        ex = json.load(open(os.path.join(HERE, "dados", "tsm5.json"), encoding="utf-8"))
        exportar_workflows(ex)
        print("Workflows gravados:\n  %s\n  %s" % (WF_API, WF_UI))
        if not a.dados:
            return
    if not a.dados:
        ap.error("informe o arquivo de dados, ex.: python banner.py dados/tsm5.json")

    caminho = a.dados if os.path.isabs(a.dados) else os.path.join(HERE, a.dados) if not os.path.exists(a.dados) else a.dados
    d = json.load(open(caminho, encoding="utf-8"))
    seed = a.seed if a.seed is not None else d.get("seed", 1)
    if not os.path.exists(WF_API):
        exportar_workflows(d)

    falta_arte = not all(os.path.exists(arte_path(d, p)) for *_, p in IMAGENS)
    if not a.sem_comfy and (a.nova_arte or falta_arte or a.seed is not None):
        if comfy_online():
            gerar_arte(d, seed)
        else:
            print("Aviso: ComfyUI fora do ar em %s. Abra o ComfyUI e rode de novo (ou use --sem-comfy)." % COMFY)
            if falta_arte:
                sys.exit(1)

    img = montar(d)
    os.makedirs(SAIDA_DIR, exist_ok=True)
    png = os.path.join(SAIDA_DIR, "%s_banner.png" % d["sku"].lower())
    webp = os.path.join(SAIDA_DIR, "%s_banner.webp" % d["sku"].lower())
    img.save(png, optimize=True)
    img.resize((W, H), Image.LANCZOS).save(webp, "WEBP", quality=90, method=6)
    print("Banner: %s\n        %s" % (png, webp))
    if PROBLEMAS:
        print("\nATENCAO - revise antes de usar:")
        for p in PROBLEMAS:
            print("  - " + p)
        sys.exit(2)
    print("Checagem automatica: todo o texto coube, sem sobreposicao e sem caractere faltando.")


if __name__ == "__main__":
    main()
