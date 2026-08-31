from pathlib import Path
from typing import Optional, Tuple

from PIL import Image, ImageDraw, ImageFilter


TARGET_SIZE = (2064, 2752)
ROOT = Path(__file__).resolve().parent
FINAL_DIR = ROOT / "app-store-final"
SCREENSHOT_DIR = ROOT / "app-store-screenshots"

SOURCES = [
    (
        FINAL_DIR / "01-full-garden-iphone-1284x2778.png",
        FINAL_DIR / "01-full-garden-ipad-13-2064x2752.png",
        SCREENSHOT_DIR / "bloomwave-preview-ipad-13.png",
    ),
    (
        FINAL_DIR / "02-tap-burst-iphone-1284x2778.png",
        FINAL_DIR / "02-tap-burst-ipad-13-2064x2752.png",
        SCREENSHOT_DIR / "bloomwave-gameplay-ipad-13.png",
    ),
    (
        FINAL_DIR / "03-leaderboard-iphone-1284x2778.png",
        FINAL_DIR / "03-leaderboard-ipad-13-2064x2752.png",
        SCREENSHOT_DIR / "bloomwave-leaderboard-ipad-13.png",
    ),
    (
        FINAL_DIR / "04-nine-backgrounds-iphone-1284x2778.png",
        FINAL_DIR / "04-nine-backgrounds-ipad-13-2064x2752.png",
        SCREENSHOT_DIR / "bloomwave-backgrounds-ipad-13.png",
    ),
]


def make_scaled_variant(source_path: Path, final_output_path: Path, upload_output_path: Path) -> None:
    with Image.open(source_path) as source:
        source = source.convert("RGBA")
        scaled_width = round(source.width * TARGET_SIZE[1] / source.height)
        scaled = source.resize((scaled_width, TARGET_SIZE[1]), Image.Resampling.LANCZOS)

    canvas = Image.new("RGBA", TARGET_SIZE)
    x_offset = (TARGET_SIZE[0] - scaled.width) // 2

    if x_offset > 0:
        left_edge = scaled.crop((0, 0, 2, scaled.height)).resize((x_offset, scaled.height), Image.Resampling.NEAREST)
        right_edge = scaled.crop((scaled.width - 2, 0, scaled.width, scaled.height)).resize(
            (x_offset, scaled.height), Image.Resampling.NEAREST
        )
        canvas.paste(left_edge, (0, 0))
        canvas.paste(right_edge, (TARGET_SIZE[0] - x_offset, 0))

    canvas.paste(scaled, (x_offset, 0), scaled)
    final_output_path.parent.mkdir(parents=True, exist_ok=True)
    upload_output_path.parent.mkdir(parents=True, exist_ok=True)
    canvas.save(final_output_path)
    canvas.save(upload_output_path)


def build_background_patch(base: Image.Image, top: int, bottom: int) -> Image.Image:
    height = bottom - top
    left_strip = base.crop((0, top, 220, bottom)).resize((TARGET_SIZE[0] // 2, height), Image.Resampling.BILINEAR)
    right_strip = base.crop((base.width - 220, top, base.width, bottom)).resize(
        (TARGET_SIZE[0] - (TARGET_SIZE[0] // 2), height), Image.Resampling.BILINEAR
    )
    patch = Image.new("RGBA", (TARGET_SIZE[0], height))
    patch.paste(left_strip, (0, 0))
    patch.paste(right_strip, (TARGET_SIZE[0] // 2, 0))
    return patch


def crop_to_ratio(source: Image.Image, ratio: float, focus_y: float = 0.5) -> Image.Image:
    source_ratio = source.width / source.height
    if source_ratio > ratio:
        crop_height = source.height
        crop_width = round(crop_height * ratio)
        left = (source.width - crop_width) // 2
        return source.crop((left, 0, left + crop_width, crop_height))

    crop_width = source.width
    crop_height = round(crop_width / ratio)
    max_top = max(0, source.height - crop_height)
    top = round(max_top * focus_y)
    return source.crop((0, top, crop_width, top + crop_height))


def paste_rounded_image(base: Image.Image, image: Image.Image, box: tuple[int, int, int, int], radius: int) -> None:
    width = box[2] - box[0]
    height = box[3] - box[1]
    fitted = image.resize((width, height), Image.Resampling.NEAREST)
    mask = Image.new("L", (width, height), 0)
    mask_draw = ImageDraw.Draw(mask)
    mask_draw.rounded_rectangle((0, 0, width, height), radius=radius, fill=255)
    base.paste(fitted, (box[0], box[1]), mask)


def add_ipad_mockup(
    base_path: Path,
    screen_source_path: Path,
    final_output_path: Path,
    upload_output_path: Path,
    focus_y: float,
    source_crop: Optional[Tuple[int, int, int, int]] = None,
) -> None:
    with Image.open(base_path) as base_source:
        base = base_source.convert("RGBA")

    patch_top = 620
    patch_bottom = TARGET_SIZE[1]
    base.alpha_composite(build_background_patch(base, patch_top, patch_bottom), (0, patch_top))

    shadow_layer = Image.new("RGBA", TARGET_SIZE, (0, 0, 0, 0))
    shadow_draw = ImageDraw.Draw(shadow_layer)
    device_box = (280, 930, 1784, 1960)
    shadow_box = (device_box[0] + 14, device_box[1] + 22, device_box[2] + 14, device_box[3] + 38)
    shadow_draw.rounded_rectangle(shadow_box, radius=72, fill=(34, 24, 20, 110))
    shadow_layer = shadow_layer.filter(ImageFilter.GaussianBlur(18))
    base.alpha_composite(shadow_layer)

    draw = ImageDraw.Draw(base)
    draw.rounded_rectangle(device_box, radius=72, fill=(37, 23, 18, 255))

    bezel_box = (318, 968, 1746, 1922)
    draw.rounded_rectangle(bezel_box, radius=58, fill=(42, 57, 66, 255))

    screen_box = (350, 1000, 1714, 1890)
    draw.rounded_rectangle(screen_box, radius=36, fill=(0, 0, 0, 255))

    camera_x = (bezel_box[0] + bezel_box[2]) // 2
    draw.ellipse((camera_x - 9, bezel_box[1] + 14, camera_x + 9, bezel_box[1] + 32), fill=(18, 24, 29, 255))

    with Image.open(screen_source_path) as source:
        source_image = source.convert("RGBA")
        if source_crop:
            source_image = source_image.crop(source_crop)
        screen_source = crop_to_ratio(
            source_image,
            ratio=(screen_box[2] - screen_box[0]) / (screen_box[3] - screen_box[1]),
            focus_y=focus_y,
        )

    paste_rounded_image(base, screen_source, screen_box, radius=28)

    final_output_path.parent.mkdir(parents=True, exist_ok=True)
    upload_output_path.parent.mkdir(parents=True, exist_ok=True)
    base.save(final_output_path)
    base.save(upload_output_path)


def add_ipad_landscape_full_garden(
    base_path: Path,
    screen_source_path: Path,
    final_output_path: Path,
    upload_output_path: Path,
) -> None:
    with Image.open(base_path) as base_source:
        base = base_source.convert("RGBA")

    patch_top = 420
    patch_bottom = TARGET_SIZE[1]
    base.alpha_composite(build_background_patch(base, patch_top, patch_bottom), (0, patch_top))

    shadow_layer = Image.new("RGBA", TARGET_SIZE, (0, 0, 0, 0))
    shadow_draw = ImageDraw.Draw(shadow_layer)
    device_box = (332, 980, 1732, 1938)
    shadow_box = (device_box[0] + 14, device_box[1] + 22, device_box[2] + 14, device_box[3] + 38)
    shadow_draw.rounded_rectangle(shadow_box, radius=72, fill=(34, 24, 20, 110))
    shadow_layer = shadow_layer.filter(ImageFilter.GaussianBlur(18))
    base.alpha_composite(shadow_layer)

    draw = ImageDraw.Draw(base)
    draw.rounded_rectangle(device_box, radius=72, fill=(37, 23, 18, 255))

    bezel_box = (366, 1012, 1698, 1904)
    draw.rounded_rectangle(bezel_box, radius=58, fill=(42, 57, 66, 255))

    screen_box = (398, 1044, 1666, 1872)
    draw.rounded_rectangle(screen_box, radius=36, fill=(0, 0, 0, 255))

    camera_x = (bezel_box[0] + bezel_box[2]) // 2
    draw.ellipse((camera_x - 9, bezel_box[1] + 14, camera_x + 9, bezel_box[1] + 32), fill=(18, 24, 29, 255))

    with Image.open(screen_source_path) as source:
        screen_source = crop_to_ratio(
            source.convert("RGBA"),
            ratio=(screen_box[2] - screen_box[0]) / (screen_box[3] - screen_box[1]),
            focus_y=0.42,
        )

    paste_rounded_image(base, screen_source, screen_box, radius=28)

    final_output_path.parent.mkdir(parents=True, exist_ok=True)
    upload_output_path.parent.mkdir(parents=True, exist_ok=True)
    base.save(final_output_path)
    base.save(upload_output_path)


def main() -> None:
    make_scaled_variant(
        FINAL_DIR / "01-full-garden-iphone-1284x2778.png",
        FINAL_DIR / "01-full-garden-ipad-13-2064x2752.png",
        SCREENSHOT_DIR / "bloomwave-preview-ipad-13.png",
    )
    add_ipad_landscape_full_garden(
        FINAL_DIR / "01-full-garden-ipad-13-2064x2752.png",
        ROOT / "app-store-source" / "raw-full-gameplay-portrait-1284x2778.png",
        FINAL_DIR / "01-full-garden-ipad-13-2064x2752.png",
        SCREENSHOT_DIR / "bloomwave-preview-ipad-13.png",
    )
    print("Generated 01-full-garden-ipad-13-2064x2752.png and bloomwave-preview-ipad-13.png")

    make_scaled_variant(
        FINAL_DIR / "02-tap-burst-iphone-1284x2778.png",
        FINAL_DIR / "02-tap-burst-ipad-13-2064x2752.png",
        SCREENSHOT_DIR / "bloomwave-gameplay-ipad-13.png",
    )
    add_ipad_mockup(
        FINAL_DIR / "02-tap-burst-ipad-13-2064x2752.png",
        ROOT / "app-store-source" / "raw-gameplay-landscape-2778x1284.png",
        FINAL_DIR / "02-tap-burst-ipad-13-2064x2752.png",
        SCREENSHOT_DIR / "bloomwave-gameplay-ipad-13.png",
        focus_y=0.5,
        source_crop=(0, 0, 2778, 1220),
    )
    print("Generated 02-tap-burst-ipad-13-2064x2752.png and bloomwave-gameplay-ipad-13.png")

    for source_path, final_output_path, upload_output_path in SOURCES[2:]:
        make_scaled_variant(source_path, final_output_path, upload_output_path)
        print(f"Generated {final_output_path.name} and {upload_output_path.name}")


if __name__ == "__main__":
    main()
