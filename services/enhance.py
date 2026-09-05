import sys
import os
import cv2
import numpy as np

def enhance_image(input_path, output_png_path, output_pdf_path=None, scale=3):
    img = cv2.imread(input_path)
    if img is None:
        raise ValueError(f"Could not open image at {input_path}")

    h, w, _ = img.shape

    # 1. High-order Lanczos interpolation
    target_w = w * scale
    target_h = h * scale
    img_up = cv2.resize(img, (target_w, target_h), interpolation=cv2.INTER_LANCZOS4)

    # 2. Bilateral edge-preserving denoising
    denoised = cv2.bilateralFilter(img_up, d=5, sigmaColor=24, sigmaSpace=6)

    # 3. Tone curve: dark blacks, preserve midtones/watermark, clean highlights to 255
    x = np.linspace(0, 1, 256)
    y = np.zeros_like(x)
    for i, v in enumerate(x):
        if v < 0.48:
            y[i] = v * 0.74
        elif v < 0.82:
            t = (v - 0.48) / (0.82 - 0.48)
            y[i] = (0.48 * 0.74) + t * (0.80 - (0.48 * 0.74))
        elif v < 0.965:
            t = (v - 0.82) / (0.965 - 0.82)
            y[i] = 0.80 + t * (0.985 - 0.80)
        else:
            t = (v - 0.965) / (1.0 - 0.965)
            s = t * t * (3 - 2 * t)
            y[i] = 0.985 + s * (1.0 - 0.985)

    lut = np.clip(y * 255.0, 0, 255).astype(np.uint8)
    mapped = cv2.LUT(denoised, lut)

    # 4. Sharpening pass
    blur = cv2.GaussianBlur(mapped, (0, 0), 1.1)
    sharp = cv2.addWeighted(mapped, 1.35, blur, -0.35, 0)

    # 5. Save PNG
    cv2.imwrite(output_png_path, sharp, [cv2.IMWRITE_PNG_COMPRESSION, 4])
    print(f"Enhanced PNG saved to {output_png_path}")

    # 6. Optional PDF
    if output_pdf_path:
        import subprocess
        subprocess.run(['convert', output_png_path, '-density', '300', '-page', 'A4', output_pdf_path], check=True)
        print(f"Enhanced PDF saved to {output_pdf_path}")

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python3 enhance.py <input> <output_png> [output_pdf] [scale]")
        sys.exit(1)
    inp = sys.argv[1]
    out_png = sys.argv[2]
    out_pdf = sys.argv[3] if len(sys.argv) > 3 and sys.argv[3] != "none" else None
    scale = int(sys.argv[4]) if len(sys.argv) > 4 else 3
    enhance_image(inp, out_png, out_pdf, scale)
