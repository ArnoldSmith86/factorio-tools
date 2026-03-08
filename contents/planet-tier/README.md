# Planet tier list

UI for ranking planets; state is encoded (gzip + base64) in the text box for manual save/restore. Vanilla/Space Age planets (nauvis, vulcanus, gleba, fulgora, aquilo, solar-system-edge, shattered-planet) use icons from `data/icons.webp`; mod planets use `data/planets/<id>.png`.

**extract_planet_icons.py** — Not included in the app index. Run manually to refresh `data/planets/` from `mods/*.zip`. Writes readable icons to `data/planets/`, per-mod output to `icon-test/`. Requires Python 3.10+ and optionally Pillow for wide-icon cropping. See repo root `icon-test/README.md` and `data/README.md`.
