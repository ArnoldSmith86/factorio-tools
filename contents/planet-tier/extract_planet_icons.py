#!/usr/bin/env python3
"""
Extract planet (and space-location) icons from Factorio mod zips.
Readable one-per-planet icons go to data/planets/; per-mod output to icon-test/.
Not included in the app index; run manually to refresh data/planets.
"""
from __future__ import annotations

import io
import json
import re
import zipfile
from pathlib import Path

try:
    from PIL import Image
    HAS_PIL = True
except ImportError:
    HAS_PIL = False

SCRIPT_DIR = Path(__file__).resolve().parent
ROOT = SCRIPT_DIR.parent.parent
MODS_DIR = ROOT / "mods"
OUT_DIR = ROOT / "icon-test"
READABLE_DIR = ROOT / "data" / "planets"
RELEVANT_TYPES = ("planet", "space-location")

ICON_PATH_RE = re.compile(
    r"(?:icon|starmap_icon)\s*=\s*[\"'](__[^\"']+__/[^\"']+\.(?:png|jpg))[\"']",
    re.IGNORECASE,
)
ICON_CONCAT_RE = re.compile(
    r"(?:icon|starmap_icon)\s*=\s*(\w+)\.graphics\s*\.\.\s*[\"']([^\"']+\.(?:png|jpg))[\"']",
    re.IGNORECASE,
)
ASSETS_RE = re.compile(r"(\w+)\.assets\s*=\s*[\"'](__[^\"']+__)/?[\"']", re.IGNORECASE)
NAME_RE = re.compile(r"\bname\s*=\s*[\"']([^\"']+)[\"']", re.IGNORECASE)

def find_table_span(content: str, start: int) -> tuple[int, int] | None:
    """Find the innermost Lua table containing `start` (the one with type = planet)."""
    depth = 0
    i = start - 1
    while i >= 0:
        c = content[i]
        if c == "}":
            depth += 1
        elif c == "{":
            depth -= 1
            if depth == -1:
                table_start = i
                break
        i -= 1
    else:
        return None
    depth = 0
    i = table_start
    while i < len(content):
        c = content[i]
        if c == '"' or c == "'":
            end = i + 1
            q = c
            while end < len(content) and content[end] != q:
                if content[end] == "\\":
                    end += 1
                end += 1
            if end < len(content):
                i = end
        elif c == "{":
            depth += 1
        elif c == "}":
            depth -= 1
            if depth == 0:
                return (table_start, i + 1)
        i += 1
    return None

def build_graphics_prefix_map(content: str) -> dict[str, str]:
    """Resolve Var.assets = \"__mod__/\" (or Var = { assets = \"__mod__/\" }) -> Var -> __mod__/graphics/."""
    assets: dict[str, str] = {}
    for m in ASSETS_RE.finditer(content):
        prefix = m.group(2).rstrip("/") + "/"
        assets[m.group(1)] = prefix
    for m in re.finditer(r"\bassets\s*=\s*[\"'](__[^\"']+__)/?[\"']", content, re.IGNORECASE):
        pos = m.start()
        depth = 0
        i = pos - 1
        table_start = -1
        while i >= 0:
            c = content[i]
            if c == "}":
                depth += 1
            elif c == "{":
                depth -= 1
                if depth == -1:
                    table_start = i
                    break
            i -= 1
        if table_start < 0:
            continue
        frag = content[max(0, table_start - 80) : table_start + 1]
        name_match = re.search(r"(\w+)\s*=\s*\{", frag)
        if name_match:
            var_name = name_match.group(1)
            prefix = m.group(1).rstrip("/") + "/"
            if var_name not in assets:
                assets[var_name] = prefix
    graphics = {var: base + "graphics/" for var, base in assets.items()}
    return graphics

def collect_icon_paths(
    block: str, block_start: int, full_content: str, graphics_prefix: dict[str, str]
) -> list[str]:
    """Top-level icon/starmap_icon: literal __mod__/ path or Var.graphics .. \"path\"."""
    paths = []
    for m in ICON_PATH_RE.finditer(block):
        pos = block_start + m.start()
        depth = sum(1 for i in range(block_start, pos) if full_content[i] == "{") - sum(
            1 for i in range(block_start, pos) if full_content[i] == "}"
        )
        if depth == 1:
            paths.append(m.group(1))
    for m in ICON_CONCAT_RE.finditer(block):
        pos = block_start + m.start()
        depth = sum(1 for i in range(block_start, pos) if full_content[i] == "{") - sum(
            1 for i in range(block_start, pos) if full_content[i] == "}"
        )
        if depth == 1 and m.group(1) in graphics_prefix:
            paths.append(graphics_prefix[m.group(1)] + m.group(2))
    return list(dict.fromkeys(paths))

def get_name_from_block(block: str) -> str | None:
    m = NAME_RE.search(block)
    return m.group(1) if m else None

MERGE_PLANET_RE = re.compile(
    r"merge\s*\(\s*data\.raw\.planet\.\w+\s*,\s*\{",
    re.IGNORECASE,
)

def find_planet_icons_in_lua(
    content: str, graphics_prefix: dict[str, str] | None = None
) -> list[tuple[str | None, list[str]]]:
    """Returns list of (location_name, [icon_paths]). Includes type=\"planet\" and merge(data.raw.planet.X, {...})."""
    graphics_prefix = graphics_prefix or {}
    results = []
    pattern = re.compile(
        r"\btype\s*=\s*[\"'](?:planet|space-location)[\"']",
        re.IGNORECASE,
    )
    for m in pattern.finditer(content):
        span = find_table_span(content, m.start())
        if not span:
            continue
        block = content[span[0] : span[1]]
        paths = collect_icon_paths(block, span[0], content, graphics_prefix)
        if not paths:
            continue
        name = get_name_from_block(block)
        results.append((name, paths))
    for m in MERGE_PLANET_RE.finditer(content):
        span = find_table_span(content, m.end())
        if not span:
            continue
        block = content[span[0] : span[1]]
        paths = collect_icon_paths(block, span[0], content, graphics_prefix)
        if not paths:
            continue
        name = get_name_from_block(block)
        results.append((name, paths))
    return results

def mod_name_from_zip(zip_path: Path) -> str | None:
    with zipfile.ZipFile(zip_path, "r") as zf:
        candidates = [n for n in zf.namelist() if n.endswith("info.json")]
        if not candidates:
            return None
        info_path = candidates[0]
        try:
            data = json.loads(zf.read(info_path).decode("utf-8"))
            return data.get("name") or Path(info_path).parts[0].split("_")[0]
        except (json.JSONDecodeError, KeyError):
            pass
        prefix = info_path.split("/")[0]
        return prefix.rsplit("_", 1)[0] if "_" in prefix else prefix
    return None

def zip_root_folder(zip_path: Path) -> str | None:
    with zipfile.ZipFile(zip_path, "r") as zf:
        names = zf.namelist()
        if not names:
            return None
        return names[0].split("/")[0]
    return None

def crop_readable_64(data: bytes) -> bytes:
    """Only crop when image is wide (e.g. 120x64): take left 64x64. Square/tall leave as-is."""
    if not HAS_PIL:
        return data
    try:
        img = Image.open(io.BytesIO(data)).convert("RGBA")
        w, h = img.size
        if w > h and h >= 64 and w >= 64:
            img = img.crop((0, 0, 64, 64))
            out = io.BytesIO()
            img.save(out, format="PNG")
            return out.getvalue()
    except Exception:
        pass
    return data

def build_mod_map(mod_zips: list[Path]) -> dict[str, tuple[Path, str]]:
    """Map mod internal name (lower) -> (zip_path, zip_root). Resolves assets from other zips in the same folder."""
    out: dict[str, tuple[Path, str]] = {}
    for zip_path in mod_zips:
        name = mod_name_from_zip(zip_path)
        root = zip_root_folder(zip_path)
        if name and root:
            out[name.lower()] = (zip_path, root)
    return out

def main() -> None:
    mods_glob = MODS_DIR.glob("*.zip")
    mod_zips = list(mods_glob)
    if not mod_zips:
        print(f"No *.zip found in {MODS_DIR}")
        return
    mod_map = build_mod_map(mod_zips)
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    READABLE_DIR.mkdir(parents=True, exist_ok=True)
    total = 0
    for zip_path in sorted(mod_zips):
        mod_name = mod_name_from_zip(zip_path)
        zip_root = zip_root_folder(zip_path)
        if not zip_root:
            continue
        with zipfile.ZipFile(zip_path, "r") as zf:
            lua_files = [n for n in zf.namelist() if n.endswith(".lua")]
            all_lua = ""
            for lua_path in lua_files:
                try:
                    all_lua += zf.read(lua_path).decode("utf-8", errors="replace") + "\n"
                except Exception:
                    continue
        graphics_prefix = build_graphics_prefix_map(all_lua)
        entries = find_planet_icons_in_lua(all_lua, graphics_prefix)
        if not entries:
            continue
        mod_out = OUT_DIR / zip_path.stem
        mod_out.mkdir(parents=True, exist_ok=True)
        for location_name, paths in entries:
            safe_name = (location_name or "unknown").replace("/", "-").replace("\\", "-")
            readable_written = False
            for path in paths:
                if "__/" not in path:
                    continue
                prefix, _, rest = path.partition("__/")
                mod_ref = prefix.strip("_").lower()
                if not mod_ref:
                    continue
                if mod_ref in mod_map:
                    source_zip_path, source_root = mod_map[mod_ref]
                elif mod_name and mod_ref == mod_name.lower():
                    source_zip_path, source_root = zip_path, zip_root
                else:
                    continue
                in_zip = f"{source_root}/{rest}"
                try:
                    with zipfile.ZipFile(source_zip_path, "r") as zf:
                        data = zf.read(in_zip)
                except KeyError:
                    continue
                out_name = Path(rest).name
                out_sub = mod_out / safe_name
                out_sub.mkdir(parents=True, exist_ok=True)
                out_file = out_sub / out_name
                out_file.write_bytes(data)
                total += 1
                if not readable_written:
                    rname = f"{safe_name}.png"
                    rpath = READABLE_DIR / rname
                    if rpath.exists():
                        rname = f"{safe_name}__{zip_path.stem}.png"
                        rpath = READABLE_DIR / rname
                    rpath.write_bytes(crop_readable_64(data))
                    readable_written = True
                src = source_zip_path.name if source_zip_path != zip_path else zip_path.name
                print(f"  {zip_path.name} / {safe_name} / {out_name}" + (f" (from {src})" if source_zip_path != zip_path else ""))
        if entries:
            print(f"{zip_path.name}: {len(entries)} planet/space-location(s)")
    print(f"Extracted {total} icon(s); readable in {READABLE_DIR}")

if __name__ == "__main__":
    main()
