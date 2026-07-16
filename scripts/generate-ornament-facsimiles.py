"""Generate one lossless chart-cell image for every source/family pair.

The crop geometry is calibrated to the supplied A3 scan rendered at 400 dpi.
Each output uses the same canvas size so the website can reserve layout space
before lazy-loaded images arrive.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import shutil
import subprocess
import tempfile
from pathlib import Path

from PIL import Image


# Counts are the implementation-oriented variant slots in the inventory audit,
# in the same family order as FAMILY_BOUNDS below. Zero identifies an explicitly
# blank chart cell; it does not claim the source never discussed that ornament.
SOURCE_ROWS = [
    ("santa-maria-1565", (0, 6, 0, 3, 2, 0, 0)),
    ("diruta-1593", (1, 3, 1, 1, 0, 0, 1)),
    ("praetorius-1619", (5, 3, 3, 0, 0, 0, 0)),
    ("playford-1654", (2, 1, 3, 2, 0, 1, 2)),
    ("chambonnieres-1670", (1, 1, 0, 1, 1, 0, 1)),
    ("danglebert-1689", (2, 3, 4, 1, 2, 1, 5)),
    ("purcell-1696", (2, 2, 0, 2, 1, 0, 1)),
    ("hotteterre-1708", (3, 2, 3, 1, 1, 0, 1)),
    ("couperin-1713", (1, 3, 2, 1, 3, 2, 2)),
    ("js-bach-1720", (4, 5, 4, 2, 4, 2, 1)),
    ("muffat-1727", (6, 3, 4, 2, 2, 4, 2)),
    ("rameau-1731", (3, 2, 1, 1, 1, 1, 0)),
    ("quantz-1752", (2, 5, 0, 1, 2, 2, 4)),
    ("cpe-bach-1753", (5, 3, 5, 5, 3, 2, 3)),
    ("marpurg-1750", (8, 3, 7, 4, 4, 1, 6)),
    ("leopold-mozart-1756", (3, 3, 2, 5, 5, 3, 6)),
    ("turk-1789", (8, 4, 5, 5, 2, 4, 4)),
    ("hummel-1828", (8, 3, 0, 5, 0, 3, 3)),
]

FAMILY_BOUNDS = {
    "vorschlag": (1546, 2304),
    "trill": (2304, 3062),
    "trillVariants": (3062, 3815),
    "turn": (3815, 4477),
    "mordent": (4477, 5118),
    "compoundMordent": (5118, 5764),
    "slide": (5764, 6425),
}

ROW_BOUNDS = [
    (494, 716),
    (716, 937),
    (937, 1161),
    (1161, 1384),
    (1384, 1605),
    (1605, 1832),
    (1832, 2056),
    (2056, 2278),
    (2278, 2500),
    (2500, 2722),
    (2722, 2944),
    (2944, 3165),
    (3165, 3389),
    (3389, 3611),
    (3611, 3837),
    (3837, 4059),
    (4059, 4281),
    (4281, 4503),
]

EXPECTED_SIZE = (6614, 4676)
CANVAS_SIZE = (780, 240)
EXPECTED_SOURCE_RASTER_SHA256 = (
    "97a77f06f4d12bca221e393a5334db0429fed863f89a83f4f886ed9c18941ff8"
)
MANIFEST_SCHEMA_VERSION = 1


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as file:
        for chunk in iter(lambda: file.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def render_pdf(pdf: Path, pdftoppm: str) -> tuple[Image.Image, str]:
    with tempfile.TemporaryDirectory(prefix="ornament-chart-") as temp_dir:
        prefix = Path(temp_dir) / "chart"
        subprocess.run(
            [
                pdftoppm,
                "-f",
                "1",
                "-singlefile",
                "-png",
                "-r",
                "400",
                str(pdf),
                str(prefix),
            ],
            check=True,
        )
        raster = prefix.with_suffix(".png")
        raster_sha256 = sha256_file(raster)
        with Image.open(raster) as rendered:
            return rendered.convert("L"), raster_sha256


def load_source(args: argparse.Namespace) -> tuple[Image.Image, str]:
    if args.image:
        with Image.open(args.image) as source:
            image = source.convert("L")
        raster_sha256 = sha256_file(args.image)
    else:
        pdftoppm = args.pdftoppm or shutil.which("pdftoppm")
        if not pdftoppm:
            raise SystemExit("pdftoppm is required when --pdf is used")
        image, raster_sha256 = render_pdf(args.pdf, pdftoppm)

    if image.size != EXPECTED_SIZE:
        raise SystemExit(
            f"Unexpected rendered size {image.size}; expected {EXPECTED_SIZE}. "
            "Render the supplied PDF at exactly 400 dpi."
        )
    if raster_sha256 != EXPECTED_SOURCE_RASTER_SHA256:
        raise SystemExit(
            f"Unexpected source raster SHA-256 {raster_sha256}; expected "
            f"{EXPECTED_SOURCE_RASTER_SHA256}. Refusing to generate crops from "
            "an unreviewed raster."
        )
    return image, raster_sha256


def validate_inventory() -> None:
    if len(SOURCE_ROWS) != len(ROW_BOUNDS):
        raise RuntimeError("Source rows and calibrated row bounds do not match")
    if any(len(counts) != len(FAMILY_BOUNDS) for _, counts in SOURCE_ROWS):
        raise RuntimeError("Every source row needs one count per ornament family")

    counts = [count for _, row in SOURCE_ROWS for count in row]
    if sum(count > 0 for count in counts) != 106 or sum(counts) != 306:
        raise RuntimeError("Inventory must resolve to 106 populated cells and 306 slots")


def crop_bounds(
    family_bounds: tuple[int, int], row_bounds: tuple[int, int]
) -> dict[str, int]:
    left, right = family_bounds
    top, bottom = row_bounds
    left += 7
    right -= 7
    top += 5
    bottom -= 5
    return {
        "left": left,
        "top": top,
        "right": right,
        "bottom": bottom,
        "width": right - left,
        "height": bottom - top,
    }


def generate(source: Image.Image, output: Path) -> list[dict[str, object]]:
    validate_inventory()
    output.mkdir(parents=True, exist_ok=True)
    cells: list[dict[str, object]] = []
    expected_filenames: set[str] = set()

    for source_order, ((source_id, counts), row_bounds) in enumerate(
        zip(SOURCE_ROWS, ROW_BOUNDS, strict=True), start=1
    ):
        for family_order, (family_id, family_bounds) in enumerate(
            FAMILY_BOUNDS.items(), start=1
        ):
            bounds = crop_bounds(family_bounds, row_bounds)
            crop = source.crop(
                (bounds["left"], bounds["top"], bounds["right"], bounds["bottom"])
            )
            if crop.width > CANVAS_SIZE[0] or crop.height > CANVAS_SIZE[1]:
                raise RuntimeError(
                    f"Crop {source_id}:{family_id} is larger than {CANVAS_SIZE}"
                )

            canvas = Image.new("L", CANVAS_SIZE, 255)
            x = (CANVAS_SIZE[0] - crop.width) // 2
            y = (CANVAS_SIZE[1] - crop.height) // 2
            canvas.paste(crop, (x, y))
            filename = f"{source_id}-{family_id}.webp"
            expected_filenames.add(filename)
            destination = output / filename
            canvas.save(destination, "WEBP", lossless=True, method=6)

            audited_variant_count = counts[family_order - 1]
            cells.append(
                {
                    "sourceId": source_id,
                    "sourceOrder": source_order,
                    "familyId": family_id,
                    "familyOrder": family_order,
                    "filename": filename,
                    "cropBounds": bounds,
                    "populated": audited_variant_count > 0,
                    "auditedVariantCount": audited_variant_count,
                    "outputDimensions": {
                        "width": CANVAS_SIZE[0],
                        "height": CANVAS_SIZE[1],
                    },
                    "byteSize": destination.stat().st_size,
                    "sha256": sha256_file(destination),
                }
            )

    unexpected = sorted(
        path.name for path in output.glob("*.webp") if path.name not in expected_filenames
    )
    if unexpected:
        raise RuntimeError(
            "Unexpected WebP assets in output directory: " + ", ".join(unexpected)
        )
    return cells


def write_manifest(
    manifest_path: Path, source_raster_sha256: str, cells: list[dict[str, object]]
) -> None:
    manifest = {
        "schemaVersion": MANIFEST_SCHEMA_VERSION,
        "sourceRaster": {
            "sha256": source_raster_sha256,
            "width": EXPECTED_SIZE[0],
            "height": EXPECTED_SIZE[1],
            "page": 1,
            "dpi": 400,
            "colorMode": "grayscale",
        },
        "output": {
            "format": "webp",
            "lossless": True,
            "width": CANVAS_SIZE[0],
            "height": CANVAS_SIZE[1],
        },
        "summary": {
            "sourceRows": len(SOURCE_ROWS),
            "families": len(FAMILY_BOUNDS),
            "gridCells": len(cells),
            "populatedCells": sum(bool(cell["populated"]) for cell in cells),
            "auditedVariantSlots": sum(
                int(cell["auditedVariantCount"]) for cell in cells
            ),
        },
        "cells": cells,
    }
    manifest_path.parent.mkdir(parents=True, exist_ok=True)
    manifest_path.write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    source = parser.add_mutually_exclusive_group(required=True)
    source.add_argument("--pdf", type=Path)
    source.add_argument("--image", type=Path)
    parser.add_argument("--pdftoppm")
    parser.add_argument(
        "--output",
        type=Path,
        default=Path("public/images/projects/essential-ornaments/chart-cells"),
    )
    parser.add_argument(
        "--manifest",
        type=Path,
        help=(
            "Manifest destination (default: chart-cells.manifest.json beside the "
            "output directory)"
        ),
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    source, source_raster_sha256 = load_source(args)
    cells = generate(source, args.output)
    manifest_path = args.manifest or args.output.with_name(
        f"{args.output.name}.manifest.json"
    )
    write_manifest(manifest_path, source_raster_sha256, cells)
    print(
        f"Generated {len(cells)} chart-cell images in {args.output} and wrote "
        f"{manifest_path}"
    )


if __name__ == "__main__":
    main()
