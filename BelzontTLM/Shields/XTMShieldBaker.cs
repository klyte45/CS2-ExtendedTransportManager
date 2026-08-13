using Belzont.Utils;
using System;
using System.Collections.Generic;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Drawing.Imaging;
using System.Drawing.Text;
using System.Globalization;
using System.Runtime.InteropServices;
using System.Security.Cryptography;
using System.Text;
using UnityEngine;
using DrawingFont = System.Drawing.Font;
using DrawingColor = System.Drawing.Color;

namespace BelzontTLM.Shields
{
    public readonly struct XTMShieldBakeRequest
    {
        public string Type { get; init; }
        public bool IsCargo { get; init; }
        public string ColorRgb { get; init; }
        public string Text { get; init; }
        public string Activity { get; init; }
        public float BorderWidthPx { get; init; }
    }

    /// <summary>
    /// Bakes a 256×256 line-format shield PNG (shape + border + fitted text + simple circle badges).
    /// Pixel buffer uses CSS/top-left Y; flipped to Unity/PNG bottom-left before encode.
    /// Text is rasterized with System.Drawing (Unity TextMesh/TMP→RT is unreliable in CS2).
    /// </summary>
    public static class XTMShieldBaker
    {
        public const int Size = 256;
        /// <summary>Bump when bake output changes so in-memory keys invalidate.</summary>
        private const int BakerVersion = 9;
        /// <summary>Logical CSS shield size (rem) used to scale paddings from TLM_FormatContainer.scss.</summary>
        private const float LogicalRem = 60f;

        private static readonly string[] FontFaces = { "Arial", "Segoe UI", "Microsoft Sans Serif", "Tahoma" };

        public static string BuildCacheKey(XTMShieldBakeRequest req)
        {
            var raw = string.Join("|",
                BakerVersion.ToString(CultureInfo.InvariantCulture),
                req.Type ?? "",
                req.IsCargo ? "1" : "0",
                NormalizeColor(req.ColorRgb),
                req.Text ?? "",
                req.Activity ?? "activity-dayNight",
                req.BorderWidthPx.ToString("0.###", CultureInfo.InvariantCulture));
            using var sha = SHA256.Create();
            var hash = sha.ComputeHash(Encoding.UTF8.GetBytes(raw));
            var sb = new StringBuilder(16);
            for (int i = 0; i < 8; i++) sb.Append(hash[i].ToString("x2"));
            return sb.ToString();
        }

        public static string ToUrl(string cacheKey) =>
            $"{Overrides.GameUIResourceHandlerOverrides.ShieldUrlPrefix}{cacheKey}.png";

        public static byte[] Bake(XTMShieldBakeRequest req)
        {
            var fill = ParseColor(req.ColorRgb);
            var contrast32 = (Color32)((UnityEngine.Color)fill).ContrastColor();

            var pixels = new Color32[Size * Size];
            for (int i = 0; i < pixels.Length; i++)
                pixels[i] = new Color32(0, 0, 0, 0);

            var shape = GetShapePoints(req.Type ?? "Subway", req.IsCargo);
            float border = Mathf.Max(0f, req.BorderWidthPx) * (Size / LogicalRem);

            if (border > 0.5f)
            {
                FillPolygon(pixels, Size, shape, contrast32);
                var inner = ScaleFromCenter(shape, Mathf.Max(0.05f, 1f - (2f * border / Size)));
                FillPolygon(pixels, Size, inner, fill);
            }
            else
            {
                FillPolygon(pixels, Size, shape, fill);
            }

            var text = req.Text ?? "";
            if (text.Length > 0)
            {
                var pad = GetTextPadding(req.Type ?? "Subway", req.IsCargo);
                DrawFittedText(pixels, Size, text, contrast32, pad);
            }

            DrawBadges(pixels, Size, req.Activity, req.IsCargo);
            FlipVertical(pixels, Size);

            var tex = KTextureUtils.New(Size, Size, TextureFormat.RGBA32, true);
            try
            {
                tex.SetPixels32(pixels);
                tex.Apply(false, false);
                return tex.EncodeToPNG();
            }
            finally
            {
                UnityEngine.Object.Destroy(tex);
            }
        }

        private static void FlipVertical(Color32[] pixels, int size)
        {
            int row = size;
            var tmp = new Color32[row];
            for (int y = 0; y < size / 2; y++)
            {
                int top = y * row;
                int bot = (size - 1 - y) * row;
                Array.Copy(pixels, top, tmp, 0, row);
                Array.Copy(pixels, bot, pixels, top, row);
                Array.Copy(tmp, 0, pixels, bot, row);
            }
        }

        private static string NormalizeColor(string color)
        {
            if (string.IsNullOrWhiteSpace(color)) return "000000";
            color = color.Trim();
            if (color.StartsWith("#")) color = color[1..];
            if (color.Length == 8) color = color[..6];
            return color.ToUpperInvariant();
        }

        private static Color32 ParseColor(string color)
        {
            try
            {
                return ColorExtensions.FromRGB(NormalizeColor(color));
            }
            catch
            {
                return new Color32(0x80, 0x80, 0x80, 0xFF);
            }
        }

        private static Vector2[] GetShapePoints(string type, bool isCargo)
        {
            float S(float v) => v / 100f * (Size - 1);

            return type switch
            {
                "Bus" when !isCargo => Poly(
                    S(25), S(0), S(75), S(0), S(100), S(50), S(75), S(100), S(25), S(100), S(0), S(50)),
                "Tram" when !isCargo => Poly(
                    S(20), S(0), S(80), S(0), S(100), S(100), S(0), S(100)),
                "Train" => CirclePoints(Size * 0.5f, Size * 0.5f, Size * 0.5f, 48),
                "Airplane" => Poly(
                    S(50), S(0), S(100), S(38), S(82), S(100), S(18), S(100), S(0), S(38)),
                "Ship" => Poly(
                    S(66.6666f), S(16.6666f), S(83.3333f), S(16.6666f), S(83.3333f), S(33.3333f), S(100), S(50),
                    S(83.3333f), S(66.6666f), S(83.3333f), S(83.3333f), S(66.6666f), S(83.3333f), S(50), S(100),
                    S(33.3333f), S(83.3333f), S(16.6666f), S(83.3333f), S(16.6666f), S(66.6666f), S(0), S(50),
                    S(16.6666f), S(33.3333f), S(16.6666f), S(16.6666f), S(33.3333f), S(16.6666f), S(50), S(0)),
                "Ferry" when !isCargo => Poly(
                    S(50), S(0), S(100), S(50), S(50), S(100), S(0), S(50)),
                _ => Poly(0, 0, Size - 1, 0, Size - 1, Size - 1, 0, Size - 1),
            };
        }

        private static Vector2[] Poly(params float[] xy)
        {
            var pts = new Vector2[xy.Length / 2];
            for (int i = 0; i < pts.Length; i++)
                pts[i] = new Vector2(xy[i * 2], xy[i * 2 + 1]);
            return pts;
        }

        private static Vector2[] CirclePoints(float cx, float cy, float r, int segments)
        {
            var pts = new Vector2[segments];
            for (int i = 0; i < segments; i++)
            {
                float a = (i / (float)segments) * Mathf.PI * 2f;
                pts[i] = new Vector2(cx + Mathf.Cos(a) * r, cy + Mathf.Sin(a) * r);
            }
            return pts;
        }

        private static Vector2[] ScaleFromCenter(Vector2[] pts, float scale)
        {
            var c = new Vector2((Size - 1) * 0.5f, (Size - 1) * 0.5f);
            var result = new Vector2[pts.Length];
            for (int i = 0; i < pts.Length; i++)
                result[i] = c + (pts[i] - c) * scale;
            return result;
        }

        private static (float L, float T, float R, float B) GetTextPadding(string type, bool isCargo)
        {
            float P(float rem) => rem / LogicalRem * Size;
            return type switch
            {
                "Bus" when !isCargo => (P(6), P(6), P(6), P(6)),
                "Tram" when !isCargo => (P(8), P(6), P(8), P(6)),
                "Train" => (P(4), P(4), P(4), P(4)),
                "Subway" when !isCargo => (P(4), P(4), P(4), P(4)),
                "Airplane" => (P(7), P(16), P(7), P(10)),
                "Ship" => (P(9), P(15), P(9), P(15)),
                "Ferry" when !isCargo => (P(9), P(15), P(9), P(15)),
                _ => (P(6), P(6), P(6), P(6)),
            };
        }

        private static void FillPolygon(Color32[] pixels, int size, Vector2[] pts, Color32 color)
        {
            if (pts == null || pts.Length < 3) return;

            float minY = float.MaxValue, maxY = float.MinValue;
            for (int i = 0; i < pts.Length; i++)
            {
                minY = Mathf.Min(minY, pts[i].y);
                maxY = Mathf.Max(maxY, pts[i].y);
            }

            int y0 = Mathf.Clamp(Mathf.FloorToInt(minY), 0, size - 1);
            int y1 = Mathf.Clamp(Mathf.CeilToInt(maxY), 0, size - 1);

            var nodes = new List<float>(pts.Length);
            for (int y = y0; y <= y1; y++)
            {
                float fy = y + 0.5f;
                nodes.Clear();
                for (int i = 0, j = pts.Length - 1; i < pts.Length; j = i++)
                {
                    float yi = pts[i].y, yj = pts[j].y;
                    float xi = pts[i].x, xj = pts[j].x;
                    if ((yi < fy && yj >= fy) || (yj < fy && yi >= fy))
                        nodes.Add(xi + (fy - yi) / (yj - yi) * (xj - xi));
                }
                nodes.Sort();
                for (int k = 0; k + 1 < nodes.Count; k += 2)
                {
                    int xStart = Mathf.Clamp(Mathf.CeilToInt(nodes[k]), 0, size - 1);
                    int xEnd = Mathf.Clamp(Mathf.FloorToInt(nodes[k + 1]), 0, size - 1);
                    for (int x = xStart; x <= xEnd; x++)
                        pixels[y * size + x] = color;
                }
            }
        }

        private static void FillCircle(Color32[] pixels, int size, float cx, float cy, float r, Color32 color)
        {
            int x0 = Mathf.Clamp(Mathf.FloorToInt(cx - r), 0, size - 1);
            int x1 = Mathf.Clamp(Mathf.CeilToInt(cx + r), 0, size - 1);
            int y0 = Mathf.Clamp(Mathf.FloorToInt(cy - r), 0, size - 1);
            int y1 = Mathf.Clamp(Mathf.CeilToInt(cy + r), 0, size - 1);
            float r2 = r * r;
            for (int y = y0; y <= y1; y++)
            {
                for (int x = x0; x <= x1; x++)
                {
                    float dx = x + 0.5f - cx;
                    float dy = y + 0.5f - cy;
                    if (dx * dx + dy * dy <= r2)
                        pixels[y * size + x] = color;
                }
            }
        }

        private static void DrawBadges(Color32[] pixels, int size, string activity, bool isCargo)
        {
            if (!string.IsNullOrEmpty(activity) && activity != "activity-dayNight")
            {
                var bg = activity switch
                {
                    "activity-day" => new Color32(252, 243, 125, 255),
                    "activity-night" => new Color32(145, 99, 206, 255),
                    "activity-disabled" => new Color32(200, 50, 50, 255),
                    _ => new Color32(120, 200, 120, 255),
                };
                float r = size / 6f;
                FillCircle(pixels, size, r, size - r, r, bg);
            }

            if (isCargo)
            {
                float r = 13f / LogicalRem * size * 0.5f;
                FillCircle(pixels, size, size - r - 2f, size - r - 2f, r, new Color32(245, 222, 179, 255));
            }
        }

        private static void DrawFittedText(
            Color32[] pixels,
            int size,
            string text,
            Color32 color,
            (float L, float T, float R, float B) pad)
        {
            float maxW = size - pad.L - pad.R;
            float maxH = size - pad.T - pad.B;
            if (maxW < 4 || maxH < 4) return;

            int tw = Mathf.Clamp(Mathf.CeilToInt(maxW), 8, size);
            int th = Mathf.Clamp(Mathf.CeilToInt(maxH), 8, size);

            try
            {
                using var bmp = new Bitmap(tw, th, PixelFormat.Format32bppArgb);
                using (var g = System.Drawing.Graphics.FromImage(bmp))
                {
                    g.Clear(DrawingColor.FromArgb(0, 0, 0, 0));
                    g.TextRenderingHint = TextRenderingHint.AntiAliasGridFit;
                    g.SmoothingMode = SmoothingMode.AntiAlias;
                    g.PixelOffsetMode = PixelOffsetMode.HighQuality;

                    var format = new StringFormat(StringFormat.GenericTypographic)
                    {
                        Alignment = StringAlignment.Center,
                        LineAlignment = StringAlignment.Center,
                        FormatFlags = StringFormatFlags.NoWrap | StringFormatFlags.NoClip,
                    };

                    float fontSizePx = FitFontSize(g, text, tw, th, format);
                    using var font = CreateDrawingFont(fontSizePx);
                    if (font == null)
                    {
                        LogUtils.DoWarnLog("[XTMShieldBaker] No System.Drawing font available");
                        return;
                    }

                    using var brush = new SolidBrush(DrawingColor.White);
                    g.DrawString(text, font, brush, new RectangleF(0, 0, tw, th), format);
                }

                CompositeBitmapAlpha(bmp, pixels, size, color, pad, tw, th, maxW, maxH);
            }
            catch (Exception ex)
            {
                LogUtils.DoWarnLog($"[XTMShieldBaker] Text bake failed: {ex.GetType().Name}: {ex.Message}");
            }
        }

        private static float FitFontSize(
            System.Drawing.Graphics g,
            string text,
            int tw,
            int th,
            StringFormat format)
        {
            float best = 8f;
            for (float fs = th * 0.85f; fs >= 8f; fs -= 1f)
            {
                using var trial = CreateDrawingFont(fs);
                if (trial == null) continue;
                var measured = g.MeasureString(text, trial, new PointF(0, 0), format);
                best = fs;
                if (measured.Width <= tw * 0.92f && measured.Height <= th * 0.92f)
                    break;
            }
            return best;
        }

        private static void CompositeBitmapAlpha(
            Bitmap bmp,
            Color32[] pixels,
            int size,
            Color32 color,
            (float L, float T, float R, float B) pad,
            int tw,
            int th,
            float maxW,
            float maxH)
        {
            var data = bmp.LockBits(new Rectangle(0, 0, tw, th), ImageLockMode.ReadOnly, PixelFormat.Format32bppArgb);
            try
            {
                int stride = data.Stride;
                var buffer = new byte[Math.Abs(stride) * th];
                Marshal.Copy(data.Scan0, buffer, 0, buffer.Length);

                int destX0 = Mathf.RoundToInt(pad.L + (maxW - tw) * 0.5f);
                int destY0 = Mathf.RoundToInt(pad.T + (maxH - th) * 0.5f);

                for (int y = 0; y < th; y++)
                {
                    int row = y * stride;
                    for (int x = 0; x < tw; x++)
                    {
                        int i = row + x * 4;
                        // Format32bppArgb → BGRA in memory
                        byte aByte = buffer[i + 3];
                        if (aByte < 20) continue;
                        float a = aByte / 255f;

                        int dx = destX0 + x;
                        int dy = destY0 + y;
                        if (dx < 0 || dx >= size || dy < 0 || dy >= size) continue;

                        int idx = dy * size + dx;
                        var dst = pixels[idx];
                        pixels[idx] = new Color32(
                            (byte)Mathf.Clamp(Mathf.RoundToInt(color.r * a + dst.r * (1f - a)), 0, 255),
                            (byte)Mathf.Clamp(Mathf.RoundToInt(color.g * a + dst.g * (1f - a)), 0, 255),
                            (byte)Mathf.Clamp(Mathf.RoundToInt(color.b * a + dst.b * (1f - a)), 0, 255),
                            (byte)Mathf.Clamp(Mathf.RoundToInt(Mathf.Max(dst.a, a * 255f)), 0, 255));
                    }
                }
            }
            finally
            {
                bmp.UnlockBits(data);
            }
        }

        private static DrawingFont CreateDrawingFont(float sizePx)
        {
            foreach (var face in FontFaces)
            {
                try
                {
                    return new DrawingFont(face, sizePx, System.Drawing.FontStyle.Bold, GraphicsUnit.Pixel);
                }
                catch
                {
                    // try next
                }
            }
            try
            {
                return new DrawingFont(FontFamily.GenericSansSerif, sizePx, System.Drawing.FontStyle.Bold, GraphicsUnit.Pixel);
            }
            catch
            {
                return null;
            }
        }
    }
}
