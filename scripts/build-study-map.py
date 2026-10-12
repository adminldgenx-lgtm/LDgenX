"""Builds src/lib/study-map.ts, the map of the Artois-Picardie study on the homepage.

Coastline: OpenStreetMap natural=coastline ways (© OpenStreetMap contributors, ODbL), saved in
data/geo/osm-coastline-artois-picardie.json. France outline for the inset: Natural Earth 1:50m
(public domain), data/geo/natural-earth-france.json. Sites: the eight places named on the sampling
map published with the study; positions are indicative (town, port or river mouth).
"""
import json, math, pathlib

root = pathlib.Path(__file__).resolve().parent.parent
LON0, LON1, LAT0, LAT1 = 1.30, 2.46, 50.10, 51.12
K = 1000 / ((LON1 - LON0) * math.cos(math.radians(50.6)))  # 1000 units across

def project(lon, lat):
    return ((lon - LON0) * math.cos(math.radians(50.6)) * K, (LAT1 - lat) * K)

def simplify(pts, tol):
    if len(pts) < 3:
        return pts
    if pts[0] == pts[-1]:
        # A closed ring has no baseline: simplify its two halves.
        half = len(pts) // 2
        return simplify(pts[: half + 1], tol)[:-1] + simplify(pts[half:], tol)
    keep = [False] * len(pts); keep[0] = keep[-1] = True
    stack = [(0, len(pts) - 1)]
    while stack:
        a, b = stack.pop()
        ax, ay = pts[a]; bx, by = pts[b]
        dx, dy = bx - ax, by - ay; length = math.hypot(dx, dy) or 1e-9
        best, index = 0, None
        for i in range(a + 1, b):
            px, py = pts[i]
            dist = abs(dy * px - dx * py + bx * ay - by * ax) / length
            if dist > best: best, index = dist, i
        if index is not None and best > tol:
            keep[index] = True; stack += [(a, index), (index, b)]
    return [p for p, k in zip(pts, keep) if k]

def path(pts, close=True):
    out = 'M' + ' L'.join(f'{x:.1f} {y:.1f}' for x, y in pts)
    return out + ('Z' if close else '')

# Chain the coastline ways (OSM convention: land on the left of the way).
ways = [e for e in json.load(open(root / 'data/geo/osm-coastline-artois-picardie.json'))['elements'] if e['type'] == 'way']
starts = {}
for w in ways: starts.setdefault(w['nodes'][0], []).append(w)
ends = {w['nodes'][-1] for w in ways}
used = set()
def follow(w):
    pts = [(p['lon'], p['lat']) for p in w['geometry']]; used.add(w['id']); cur = w
    while True:
        nxt = [x for x in starts.get(cur['nodes'][-1], []) if x['id'] not in used]
        if not nxt: return pts
        cur = nxt[0]; used.add(cur['id']); pts += [(p['lon'], p['lat']) for p in cur['geometry']][1:]
chains = [follow(w) for w in ways if w['nodes'][0] not in ends]
rings = [follow(w) for w in ways if w['id'] not in used]
main = max(chains, key=len)  # Belgium to south of the Somme, heading south-west
# Close the land to the east, beyond the frame.
land = main + [(main[-1][0], 49.8), (3.4, 49.8), (3.4, main[0][1])]
TOL = 0.9
shapes = [path(simplify([project(*p) for p in land], TOL))]
for ring in rings:
    if all(LON0 <= lon <= LON1 and LAT0 <= lat <= LAT1 for lon, lat in ring):
        shapes.append(path(simplify([project(*p) for p in ring], TOL)))
coast = path(simplify([project(*p) for p in main], TOL), close=False)
width, height = project(LON1, LAT0)

# Inset: metropolitan France, with the frame of the study area.
geom = json.load(open(root / 'data/geo/natural-earth-france.json'))
polys = geom['coordinates'] if geom['type'] == 'MultiPolygon' else [geom['coordinates']]
metro = max((p[0] for p in polys if -6 < p[0][0][0] < 10 and 41 < p[0][0][1] < 52), key=len)
FLON0, FLAT1 = -5.3, 51.2
FK = 100 / ((9.7 - FLON0) * math.cos(math.radians(46.5)))
fproj = lambda lon, lat: ((lon - FLON0) * math.cos(math.radians(46.5)) * FK, (FLAT1 - lat) * FK)
france = path(simplify([fproj(*p) for p in metro], 0.35))
fx0, fy0 = fproj(LON0, LAT1); fx1, fy1 = fproj(LON1, LAT0)

# The eight sites of the published sampling map, north to south.
sites = [
    ('dunkerque-est', 'Dunkerque Est', 'port', 'Nord', 2.335, 51.052),
    ('dunkerque-ouest', 'Dunkerque Ouest', 'port', 'Nord', 2.205, 51.032),
    ('calais', 'Calais', 'port', 'Pas-de-Calais', 1.862, 50.968),
    ('slack', 'Slack', 'estuaire', 'Pas-de-Calais', 1.603, 50.810),
    ('boulogne', 'Boulogne', 'port', 'Pas-de-Calais', 1.592, 50.727),
    ('canche', 'Baie de la Canche', 'baie', 'Pas-de-Calais', 1.585, 50.548),
    ('authie', 'Baie de l’Authie', 'baie', 'Pas-de-Calais et Somme', 1.578, 50.373),
    ('somme', 'Estuaire de la Somme', 'estuaire', 'Somme', 1.585, 50.222),
]
site_list = ',\n'.join(
    f"  {{ id: '{i}', name: {json.dumps(n, ensure_ascii=False)}, setting: '{s}', area: {json.dumps(a, ensure_ascii=False)}, x: {project(lon, lat)[0]:.1f}, y: {project(lon, lat)[1]:.1f} }}"
    for i, n, s, a, lon, lat in sites)

# Graticule: meridians every 30′, parallels every 15′.
def dms(value, hemi):
    d = int(value); m = round((value - d) * 60)
    return f"{d}°{f'{m:02d}′' if m else ''} {hemi}"
meridians = [(project(lon, LAT1)[0], dms(lon, 'E')) for lon in (1.5, 2.0)]
parallels = [(project(LON0, lat)[1], dms(lat, 'N')) for lat in (50.25, 50.5, 50.75, 51.0)]
grid = lambda items: '[' + ', '.join(f"{{ at: {v:.1f}, label: {json.dumps(l, ensure_ascii=False)} }}" for v, l in items) + ']'

# The three départements of the coast, named inland.
areas = [('Nord', 2.25, 50.90), ('Pas-de-Calais', 2.13, 50.60), ('Somme', 1.78, 50.18)]
area_list = '[' + ', '.join(f"{{ name: '{n}', x: {project(lon, lat)[0]:.1f}, y: {project(lon, lat)[1]:.1f} }}" for n, lon, lat in areas) + ']'

# A 20 km scale bar.
km = 20 / (111.32 * math.cos(math.radians(50.6)))
scale = project(LON0 + km, LAT1)[0]

ts = f"""// Generated by scripts/build-study-map.py. Do not edit by hand.
// Coastline © OpenStreetMap contributors (ODbL); France outline: Natural Earth (public domain).

export const studyMap = {{
  width: {width:.1f},
  height: {height:.1f},
  land: {json.dumps(shapes)},
  coast: {json.dumps(coast)},
  meridians: {grid(meridians)},
  parallels: {grid(parallels)},
  areas: {area_list},
  scaleKm: 20,
  scaleWidth: {scale:.1f},
  inset: {{
    france: {json.dumps(france)},
    frame: {{ x: {fx0:.1f}, y: {fy0:.1f}, width: {fx1 - fx0:.1f}, height: {fy1 - fy0:.1f} }},
  }},
}};

export type StudySite = {{
  id: string;
  name: string;
  setting: 'port' | 'baie' | 'estuaire';
  area: string;
  x: number;
  y: number;
}};

export const studySites: StudySite[] = [
{site_list},
];
"""
(root / 'src/lib/study-map.ts').write_text(ts)
print('map', round(width), 'x', round(height), 'land points', sum(s.count('L') for s in shapes), 'bytes', len(ts))
