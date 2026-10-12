# LDgenX — 2D interactive atlas assets

Use the image as the world background. Build all labels, sector controls, cards and links as real HTML. Keep the artwork, water mask and turbines inside one common container so they remain aligned during zoom and pan.

## Files

| File | Role |
| --- | --- |
| `assets/landscape-4000.webp` | Clean 4000 × 2251 background for the web |
| `assets/landscape-4000.jpg` | High-quality export of the same background |
| `assets/landscape-native.png` | Original generated master, 1672 × 941 |
| `assets/water-mask.png` | White image with alpha only over water; use as a CSS alpha mask |
| `assets/water-mask-luma.png` | Black land / white water; use with `mask-mode: luminance` |
| `assets/water-only.png` | Background water pixels on transparency |
| `assets/turbine-tower.png` | Fixed transparent tower and nacelle; no blades |
| `assets/turbine-rotor.png` | Separate transparent three-bladed rotor |
| `data/layers.json` | Image dimensions, turbine positions, rotor pivot and timing |
| `data/sectors.json` | Six HTML label locations and draft content |
| `atlas-2d-preview.html` | Offline reference with pan/zoom, sector selection, water shimmer and rotor rotation |

The clean background contains **no text, labels, markers, cards, buttons or turbines**.

## Resolution: do not overlook this

The 4000px files are **Lanczos upscaled exports of a 1672px generated master**. They are not native 4K and do not gain new photographic detail from resizing. Do not promise crisp 2–3× zoom based on their file dimensions. The preview keeps desktop selection zoom at 1.6×. For deeper production zoom, replace the master with an actual high-resolution or quality-enhanced version of this same composition, and assess it at the intended displayed size.

Keep the exact 4000 × 2251 frame and all geometry when replacing it, so the mask and normalized positions still align. If composition changes, regenerate or adjust the mask and anchors. The masks are registered approximations; inspect shorelines at the final zoom.

## Integration

1. Reuse the existing site’s logo, fonts, colors, buttons and animation conventions. This preview is an asset and interaction reference, with a placeholder header.
2. Put the image, water effect and turbine layers in one `world` container. Put the heading and detail panel outside it. Pan and zoom the world with one transform, over roughly 1.2 seconds. Support interruption by a new selection.
3. Place the six sector labels using normalized `backgroundAnchor` coordinates from `data/sectors.json`. Resolve action links against real project routes. Research and marine-energy routes are placeholders; the preview sends those to the applications overview.
4. Use `water-mask.png` with `mask-image` and `-webkit-mask-image`, `mask-mode: alpha`, and `mask-size: 100% 100%`. Keep this mask fixed relative to the landscape. Animate a very faint light gradient inside the masked container. Avoid moving the whole ocean image, which would move boat reflections and shoreline features.
5. Use the fixed tower and independently rotate only the rotor. The rotor pivot is **not the center of its PNG**: use `rotor.hubPx` / `rotationOriginPercent` from the configuration. Do not assume 50% 50%.
6. Put the rotation on an inner rotor element. Put perspective compression on its outer wrapper, around the same hub. This prevents the rotor axis from drifting during rotation. Do not rotate the tower.
7. Use `tower.basePx` and `tower.hubPx` to align the rotor to the spindle. The preview contains the complete placement math. The four suggested turbine locations are editable, not measured geographic coordinates.
8. Pause decorative animations offscreen and when the document is hidden. Respect reduced motion by stopping water and blades and switching sector views immediately.
9. On mobile, show all six sector controls below the scene, preserve normal scrolling and pan to each location when selected. Size the world itself to the full rendered image, rather than clipping an `object-fit: cover` image before applying pan; otherwise edge sectors can become unreachable.
10. Review desktop and mobile in real browsers and run the existing project’s dev / production checks before publishing.

The source landscape and both turbine parts were created with the built-in image generator. The masks are derived from the exact landscape pixels. All geography is illustrative.
