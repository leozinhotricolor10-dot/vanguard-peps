"""
Banner informativo em HTML -> PNG (Vanguard Labs).

O texto e todo HTML (modelo_banner.html + dados/<sku>.json); nada de texto passa por IA.
A arte do ComfyUI (fundo + 4 fotos dos cards) e uma camada OPCIONAL: sem ela o banner usa o
fundo neon desenhado em SVG/CSS e icones nos cards.

Uso:
  python banner_html.py dados/tsm5.json                # usa a arte de arte/ se existir; senao fundo neon
  python banner_html.py dados/tsm5.json --sem-arte     # forca o fundo neon (CSS/SVG)
  python banner_html.py dados/tsm5.json --gerar-arte   # pede arte nova ao ComfyUI antes (se estiver aberto)
  python banner_html.py dados/tsm5.json --seed 123     # idem, com outra variacao de arte

Saida: saida/<sku>_banner.html, saida/<sku>_banner_html.png (2048x3072) e saida/<sku>_banner_html.webp (1024x1536).
Exportacao: Playwright + Google Chrome (ou Edge) ja instalados no PC. Nao baixa nada.
"""
import argparse
import json
import os
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent.parent
FOTOS = ROOT / "assets" / "produtos"
ARTE = HERE / "arte"
SAIDA = HERE / "saida"
MODELO = HERE / "modelo_banner.html"
MODELO_ENXUTO = HERE / "modelo_enxuto.html"
LOGO_V = HERE / "assets" / "logo_v.png"
NAVEGADORES = [r"C:\Program Files\Google\Chrome\Application\chrome.exe",
               r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
               r"C:\Program Files\Microsoft\Edge\Application\msedge.exe"]


def garantir_logo():
    """Recorta o simbolo V da logo oficial (pwa/logo-original.png) uma unica vez."""
    if LOGO_V.exists():
        return
    import numpy as np
    from PIL import Image
    src = np.asarray(Image.open(ROOT / "pwa" / "logo-original.png").convert("RGB")).astype(np.float32)
    crop = src[234:359, 65:215]
    a = np.clip((np.maximum(crop[..., 1], crop[..., 2]) - 40) / 110.0, 0, 1)
    im = Image.fromarray(np.dstack([crop, a * 255]).astype(np.uint8), "RGBA")
    LOGO_V.parent.mkdir(exist_ok=True)
    im.crop(im.getbbox()).save(LOGO_V)


def foto(nome):
    p = FOTOS / nome
    if not p.exists():
        raise SystemExit("Foto nao encontrada: %s (veja os nomes em assets/produtos)" % p)
    return p.as_uri()


def montar_html(d, usar_arte, modelo=MODELO, sufixo="banner"):
    sku = d["sku"].lower()
    assets = {"logo": LOGO_V.as_uri(), "vial": foto(d["foto"]),
              "stacks": [foto(s["foto"]) for s in d["stacks"][:3]], "fundo": None, "cards": []}
    if usar_arte:
        f = ARTE / ("%s_fundo.png" % sku)
        if f.exists():
            assets["fundo"] = f.as_uri()
        assets["cards"] = [(ARTE / ("%s_card%d.png" % (sku, i))).as_uri() if (ARTE / ("%s_card%d.png" % (sku, i))).exists() else None
                           for i in range(1, 5)]
    dados = dict(d, _assets=assets)
    js = "window.DADOS = " + json.dumps(dados, ensure_ascii=True).replace("</", "<\\/") + ";"
    html = modelo.read_text(encoding="utf-8").replace("/*__DADOS__*/", js)
    SAIDA.mkdir(exist_ok=True)
    out = SAIDA / ("%s_%s.html" % (sku, sufixo))
    out.write_text(html, encoding="utf-8")
    return out, assets


def exportar(html_path, png_path, largura=1024, altura=1536, escala=2):
    from playwright.sync_api import sync_playwright
    with sync_playwright() as p:
        exe = next((n for n in NAVEGADORES if os.path.exists(n)), None)
        if not exe:
            raise SystemExit("Nenhum Chrome/Edge encontrado.")
        nav = p.chromium.launch(executable_path=exe, headless=True,
                                args=["--allow-file-access-from-files", "--font-render-hinting=none"])
        pg = nav.new_page(viewport={"width": largura, "height": altura}, device_scale_factor=escala)
        erros = []
        pg.on("pageerror", lambda e: erros.append(str(e)))
        pg.goto(html_path.as_uri())
        try:
            pg.wait_for_function("window.PRONTO === true", timeout=30000)
        except Exception:
            raise SystemExit("A pagina nao terminou de montar. Erros de script: %s" % erros)
        problemas = pg.evaluate("window.PROBLEMAS") + ["erro de script: " + e for e in erros]
        pg.locator("#banner").screenshot(path=str(png_path))
        nav.close()
    return problemas


def main():
    ap = argparse.ArgumentParser(description="Banner HTML Vanguard Labs")
    ap.add_argument("dados")
    ap.add_argument("--sem-arte", action="store_true", help="ignora a arte do ComfyUI (fundo neon em CSS/SVG)")
    ap.add_argument("--gerar-arte", action="store_true", help="gera arte nova no ComfyUI antes (se estiver aberto)")
    ap.add_argument("--seed", type=int)
    ap.add_argument("--enxuto", action="store_true", help="versao stories 1080x1920 com pouco texto e letra grande")
    a = ap.parse_args()

    cam = Path(a.dados)
    if not cam.exists():
        cam = HERE / a.dados
    d = json.loads(cam.read_text(encoding="utf-8"))
    garantir_logo()

    if (a.gerar_arte or a.seed is not None) and not a.sem_arte:
        sys.path.insert(0, str(HERE))
        import banner  # cliente do ComfyUI ja pronto (banner.py)
        if banner.comfy_online():
            if not os.path.exists(banner.WF_API):
                banner.exportar_workflows(d)
            banner.gerar_arte(d, a.seed if a.seed is not None else d.get("seed", 1))
        else:
            print("Aviso: ComfyUI fora do ar em %s; seguindo sem arte nova." % banner.COMFY)

    sku = d["sku"].lower()
    from PIL import Image
    if a.enxuto:   # stories 9:16, letra grande para celular
        html, assets = montar_html(d, not a.sem_arte, MODELO_ENXUTO, "enxuto")
        png = SAIDA / ("%s_enxuto.png" % sku)
        problemas = exportar(html, png, 1080, 1920, 1)
        webp = SAIDA / ("%s_enxuto.webp" % sku)
        Image.open(png).convert("RGB").save(webp, "WEBP", quality=90, method=6)
    else:
        html, assets = montar_html(d, not a.sem_arte)
        png = SAIDA / ("%s_banner_html.png" % sku)
        problemas = exportar(html, png)
        webp = SAIDA / ("%s_banner_html.webp" % sku)
        Image.open(png).convert("RGB").resize((1024, 1536), Image.LANCZOS).save(webp, "WEBP", quality=90, method=6)
    print("Fundo: %s" % ("arte do ComfyUI" if assets["fundo"] else "neon em CSS/SVG (sem arte)"))
    print("Banner: %s\n        %s\n        %s" % (png, webp, html))
    if problemas:
        print("\nATENCAO - revise antes de usar:")
        for p in problemas:
            print("  - " + p)
        sys.exit(2)
    print("Checagem automatica: todo o texto coube, sem sobreposicao, fontes e imagens carregadas.")


if __name__ == "__main__":
    main()
