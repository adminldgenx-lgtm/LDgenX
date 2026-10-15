"""Builds src/lib/study-geo.ts, the geography of the Artois-Picardie study journey on the homepage.

Sources, all saved in data/geo:
- osm-coastline-opale.json: OpenStreetMap natural=coastline ways (© OpenStreetMap contributors,
  ODbL), from the Seine-Maritime coast to the Belgian coast, with the Kent coast across the strait.
- osm-rivers-opale.json: OpenStreetMap waterway=river ways, by name.
- osm-borders-opale.json: OpenStreetMap administrative boundaries, levels 2 (countries) and 6
  (départements), land only.
- natural-earth-europe.json: Natural Earth 1:50m countries (public domain), for the wide views.
Sites: the eight places named on the sampling map published with the study; positions are
indicative (town, port or river mouth). Towns: their usual coordinates.

World units: an equirectangular projection true at 50.6° N; 1000 units span 1.30° E to 2.46° E.
"""
import json, math, pathlib

root = pathlib.Path(__file__).resolve().parent.parent
geo = root / 'data/geo'
LON0, LAT1 = 1.30, 51.12
COS = math.cos(math.radians(50.6))
K = 1000 / ((2.46 - LON0) * COS)  # units per degree of latitude
W, S, E, N = -1.80, 49.30, 3.60, 51.65  # the detailed frame
CORE = (0.60, 49.85, 3.10, 51.40)  # drawn finest: the study coast and the strait

def project(lon, lat):
    return ((lon - LON0) * COS * K, (LAT1 - lat) * K)

def simplify(pts, tol, far=None):
    """Douglas-Peucker; points outside the core keep the coarser tolerance `far`."""
    if len(pts) < 3:
        return pts
    if pts[0] == pts[-1]:
        half = len(pts) // 2
        return simplify(pts[: half + 1], tol, far)[:-1] + simplify(pts[half:], tol, far)
    cx0, cy0 = project(CORE[0], CORE[3]); cx1, cy1 = project(CORE[2], CORE[1])
    limit = lambda p: tol if far is None or (cx0 <= p[0] <= cx1 and cy0 <= p[1] <= cy1) else far
    keep = [False] * len(pts); keep[0] = keep[-1] = True
    stack = [(0, len(pts) - 1)]
    while stack:
        a, b = stack.pop()
        ax, ay = pts[a]; bx, by = pts[b]
        dx, dy = bx - ax, by - ay; length = math.hypot(dx, dy) or 1e-9
        best, index = 0, None
        for i in range(a + 1, b):
            px, py = pts[i]
            d = abs(dy * px - dx * py + bx * ay - by * ax) / length
            if d > best: best, index = d, i
        if index is not None and best > limit(pts[index]):
            keep[index] = True; stack += [(a, index), (index, b)]
    return [p for p, k in zip(pts, keep) if k]

def path(pts, close=False):
    return 'M' + 'L'.join(f'{x:.1f} {y:.1f}' for x, y in pts) + ('Z' if close else '')

def inside(p):
    return W <= p[0] <= E and S <= p[1] <= N

def crossing(a, b):
    """Where the segment from a (inside) to b (outside) leaves the frame."""
    best = 1.0
    for value, axis in ((W, 0), (E, 0), (S, 1), (N, 1)):
        d = b[axis] - a[axis]
        if d:
            t = (value - a[axis]) / d
            if 0 <= t < best:
                other = a[1 - axis] + t * (b[1 - axis] - a[1 - axis])
                lo, hi = (S, N) if axis == 0 else (W, E)
                if lo - 1e-9 <= other <= hi + 1e-9: best = t
    return (a[0] + best * (b[0] - a[0]), a[1] + best * (b[1] - a[1]))

def clip(line):
    """Splits a polyline into its runs inside the frame, ends placed on the frame."""
    runs, run = [], []
    for i, p in enumerate(line):
        if inside(p):
            if not run and i > 0: run.append(crossing(p, line[i - 1]))
            run.append(p)
        elif run:
            run.append(crossing(line[i - 1], p)); runs.append(run); run = []
    if run: runs.append(run)
    return runs

# The frame's edge, counter-clockwise (y up): south W→E, east S→N, north E→W, west N→S.
PW, PH = E - W, N - S
PERIMETER = 2 * (PW + PH)
def along(p):
    x, y = p
    if abs(y - S) < 1e-7: return x - W
    if abs(x - E) < 1e-7: return PW + (y - S)
    if abs(y - N) < 1e-7: return PW + PH + (E - x)
    return 2 * PW + PH + (N - y)
CORNERS = [(PW, (E, S)), (PW + PH, (E, N)), (2 * PW + PH, (W, N)), (PERIMETER, (W, S))]
def walk(t0, t1):
    """Corners met walking counter-clockwise from t0 to t1."""
    span = (t1 - t0) % PERIMETER
    out = []
    for t, corner in sorted(((t - t0) % PERIMETER, c) for t, c in CORNERS):
        if 0 < t < span: out.append(corner)
    return out

# Coastline: chain the ways, clip them, close the land along the frame (land lies on the left).
ways = [e for e in json.load(open(geo / 'osm-coastline-opale.json'))['elements'] if e['type'] == 'way']
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
chains += [follow(w) for w in ways if w['id'] not in used]

pieces, rings = [], []
for chain in chains:
    closed = chain[0] == chain[-1]
    if closed and all(inside(p) for p in chain):
        if len(chain) > 3: rings.append(chain)
        continue
    for run in clip(chain):
        if len(run) < 2: continue
        on_edge = lambda p: min(abs(p[0] - W), abs(p[0] - E), abs(p[1] - S), abs(p[1] - N)) < 1e-7
        if on_edge(run[0]) and on_edge(run[-1]): pieces.append(run)

polygons, open_pieces = [], list(pieces)
while open_pieces:
    first = open_pieces.pop(0); ring = list(first); current = first
    while True:
        t_end = along(current[-1])
        candidates = open_pieces + [first]
        nxt = min(candidates, key=lambda q: (along(q[0]) - t_end) % PERIMETER)
        ring += walk(t_end, along(nxt[0]))
        if nxt is first: break
        open_pieces.remove(nxt); ring += nxt; current = nxt
    polygons.append(ring)

LAND_TOL, COAST_TOL = 0.45, 0.45
FAR_TOL = 2.4
land = [path(simplify([project(*p) for p in poly + [poly[0]]], LAND_TOL, FAR_TOL), True) for poly in polygons]
# Islands and jetties: all of them on the study coast, only sizeable ones further out.
def in_core(ring):
    return any(CORE[0] <= lon <= CORE[2] and CORE[1] <= lat <= CORE[3] for lon, lat in ring)
rings = [r for r in rings if (len(r) > 6 if in_core(r) else len(r) > 60)]
land += [path(simplify([project(*p) for p in ring], LAND_TOL, FAR_TOL), True) for ring in rings]
coast_lines = [simplify([project(*p) for p in piece], COAST_TOL, FAR_TOL) for piece in pieces]
coast_lines += [simplify([project(*p) for p in ring], COAST_TOL, FAR_TOL) for ring in rings if len(ring) > 12]
coast = [path(line) for line in coast_lines if len(line) > 1]
# A thinned copy of the coast for the water's flow field.
flow_points = []
for line in coast_lines:
    thinned = [v for x, y in line[::3] for v in (round(x), round(y))]
    if len(thinned) >= 8: flow_points.append(thinned)

# Rivers: the coastal rivers drawn stronger than the inland ones.
MAJOR = {'La Somme', 'La Somme Canalisée', "L'Authie", 'La Canche', 'La Liane', 'La Slack', "L'Aa", 'La Bresle'}
rivers_major, rivers_minor = [], []
for way in json.load(open(geo / 'osm-rivers-opale.json'))['ways']:
    for run in clip([tuple(p) for p in way['geometry']]):
        pts = simplify([project(*p) for p in run], 1.0)
        if len(pts) > 1:
            (rivers_major if way['name'] in MAJOR else rivers_minor).append(path(pts))

borders = {'2': [], '6': []}
for way in json.load(open(geo / 'osm-borders-opale.json'))['ways']:
    for run in clip([tuple(p) for p in way['geometry']]):
        pts = simplify([project(*p) for p in run], 1.4 if way['level'] == '2' else 2.6)
        if len(pts) > 1: borders[way['level']].append(path(pts))

# The wide views: France and its neighbours, coarse.
europe = {'france': [], 'others': []}
for feature in json.load(open(geo / 'natural-earth-europe.json'))['features']:
    g = feature['geometry']
    polys = g['coordinates'] if g['type'] == 'MultiPolygon' else [g['coordinates']]
    for poly in polys:
        outer = poly[0]
        if not any(-12 < lon < 16 and 40 < lat < 59 for lon, lat in outer): continue
        france = feature['properties']['iso'] == 'FRA'
        pts = simplify([project(lon, lat) for lon, lat in outer], 5 if france else 12)
        if len(pts) > (3 if france else 8):
            europe['france' if feature['properties']['iso'] == 'FRA' else 'others'].append(path(pts, True))

# Each site at the mean of its stations' coordinates, from the field sheet of the final report
# (annex 2); table 1 of the report repeats the Canche values for Dunkerque Ouest.
sites = [
    ('dunkerque-est', 'Dunkerque Est', 'port', 'Nord', 2.30866, 51.04358),
    ('dunkerque-ouest', 'Dunkerque Ouest', 'port', 'Nord', 2.180814, 51.016688),
    ('calais', 'Calais', 'port', 'Pas-de-Calais', 1.838927, 50.96344),
    ('slack', 'Slack', 'estuaire', 'Pas-de-Calais', 1.603178, 50.806017),
    ('boulogne', 'Boulogne', 'port', 'Pas-de-Calais', 1.57949, 50.729363),
    ('canche', 'Baie de la Canche', 'baie', 'Pas-de-Calais', 1.6082365, 50.534075),
    ('authie', 'Baie de l’Authie', 'baie', 'Pas-de-Calais et Somme', 1.5934795, 50.375561),
    ('somme', 'Estuaire de la Somme', 'estuaire', 'Somme', 1.6207445, 50.198145),
]
# Towns named on the chart: rank 1 shows from the regional view, rank 2 only up close.
towns = [
    ('Dunkerque', 2.377, 51.035, 1), ('Calais', 1.859, 50.951, 1), ('Boulogne-sur-Mer', 1.615, 50.726, 1),
    ('Le Touquet', 1.586, 50.521, 2), ('Berck', 1.593, 50.408, 2), ('Saint-Valery-sur-Somme', 1.633, 50.186, 2),
    ('Abbeville', 1.833, 50.105, 1), ('Montreuil', 1.764, 50.464, 2), ('Saint-Omer', 2.252, 50.750, 1),
    ('Gravelines', 2.128, 50.986, 2), ('Douvres', 1.313, 51.128, 1), ('Folkestone', 1.170, 51.081, 2),
    ('La Panne', 2.593, 51.099, 2),
]

def box(lon0, lat0, lon1, lat1):
    x0, y0 = project(lon0, lat1); x1, y1 = project(lon1, lat0)
    return {'x0': round(x0, 1), 'y0': round(y0, 1), 'x1': round(x1, 1), 'y1': round(y1, 1)}

data = {
    'unitsPerKm': round(K / 111.32, 4),
    'frame': box(W, S, E, N),
    'study': box(1.30, 50.10, 2.46, 51.12),
    'land': ' '.join(land),
    'coast': ' '.join(coast),
    'flow': flow_points,
    'riversMajor': ' '.join(rivers_major),
    'riversMinor': ' '.join(rivers_minor),
    'countryBorders': ' '.join(borders['2']),
    'departementBorders': ' '.join(borders['6']),
    'france': ' '.join(europe['france']),
    'neighbours': ' '.join(europe['others']),
    'sites': [{'id': i, 'name': n, 'setting': s, 'area': a, 'x': round(project(lo, la)[0], 1), 'y': round(project(lo, la)[1], 1)} for i, n, s, a, lo, la in sites],
    'towns': [{'name': n, 'x': round(project(lo, la)[0], 1), 'y': round(project(lo, la)[1], 1), 'rank': r} for n, lo, la, r in towns],
    'labels': [
        {'name': 'Manche', 'kind': 'sea', **dict(zip(('x', 'y'), (round(v, 1) for v in project(1.05, 50.45))))},
        {'name': 'Mer du Nord', 'kind': 'sea', **dict(zip(('x', 'y'), (round(v, 1) for v in project(2.25, 51.27))))},
        {'name': 'Royaume-Uni', 'kind': 'country', **dict(zip(('x', 'y'), (round(v, 1) for v in project(0.95, 51.22))))},
        {'name': 'Belgique', 'kind': 'country', **dict(zip(('x', 'y'), (round(v, 1) for v in project(2.9, 50.95))))},
        {'name': 'France', 'kind': 'country', **dict(zip(('x', 'y'), (round(v, 1) for v in project(2.35, 50.35))))},
    ],
}
ts = """// Generated by scripts/build-study-geo.py. Do not edit by hand.
// Coastline, rivers and boundaries © OpenStreetMap contributors (ODbL); countries: Natural Earth.

export type StudySite = {
  id: string;
  name: string;
  setting: 'port' | 'baie' | 'estuaire';
  area: string;
  x: number;
  y: number;
};

export const studyGeo = """ + json.dumps(data, ensure_ascii=False, separators=(',', ':')) + """ as {
  unitsPerKm: number;
  frame: { x0: number; y0: number; x1: number; y1: number };
  study: { x0: number; y0: number; x1: number; y1: number };
  land: string;
  coast: string;
  flow: number[][];
  riversMajor: string;
  riversMinor: string;
  countryBorders: string;
  departementBorders: string;
  france: string;
  neighbours: string;
  sites: StudySite[];
  towns: { name: string; x: number; y: number; rank: number }[];
  labels: { name: string; kind: 'sea' | 'country'; x: number; y: number }[];
};
"""
(root / 'src/lib/study-geo.ts').write_text(ts)
print('polygons', len(polygons), 'rings', len(rings), 'pieces', len(pieces), 'land pts', sum(x.count('L') for x in land),
      'coast pts', sum(x.count('L') for x in coast), 'rivers', len(rivers_major), len(rivers_minor),
      'borders', len(borders['2']), len(borders['6']), 'europe', len(europe['france']), len(europe['others']), 'bytes', len(ts))
