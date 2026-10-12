"""Extracts the particle centres of models/dna-ldgenx-particles.glb into public/models/dna-particles.bin.

The model ("DNA" by LucasPresoto, CC BY 4.0, recoloured for LDgenX) stores 17,000 particles as tiny
octahedra and icosahedra. The website draws them as soft points, so it only needs each particle's
centre, size and colour: 8 bytes per particle instead of the model's 3.9 MB.

Format, little endian: uint32 count, float32 scale, float32 largest radius, then per particle int16 x, y, z (position /
scale * 32767), uint8 colour (0 ice blue, 1 LDgenX green, 2 pearl), uint8 size (radius / max * 255).
"""
import json, struct, math, pathlib

root = pathlib.Path(__file__).resolve().parent.parent
data = (root / 'models/dna-ldgenx-particles.glb').read_bytes()
json_len, = struct.unpack_from('<I', data, 12)
gltf = json.loads(data[20:20 + json_len])
binary = data[20 + json_len + 8:]

def read(index):
    a = gltf['accessors'][index]
    view = gltf['bufferViews'][a['bufferView']]
    offset = view.get('byteOffset', 0) + a.get('byteOffset', 0)
    fmt = {5126: 'f', 5125: 'I', 5123: 'H'}[a['componentType']]
    width = {'SCALAR': 1, 'VEC3': 3}[a['type']]
    return list(struct.iter_unpack('<' + fmt * width, binary[offset:offset + a['count'] * width * struct.calcsize(fmt)]))

particles = []
for mesh in gltf['meshes']:
    primitive = mesh['primitives'][0]
    colour = primitive['material']
    positions = read(primitive['attributes']['POSITION'])
    indices = [i[0] for i in read(primitive['indices'])]
    parent = list(range(len(positions)))
    def find(a):
        while parent[a] != a:
            parent[a] = parent[parent[a]]
            a = parent[a]
        return a
    for t in range(0, len(indices), 3):
        a, b, c = indices[t:t + 3]
        for x, y in ((a, b), (a, c)):
            ra, rb = find(x), find(y)
            if ra != rb:
                parent[ra] = rb
    groups = {}
    for i in range(len(positions)):
        groups.setdefault(find(i), []).append(positions[i])
    for verts in groups.values():
        cx = sum(v[0] for v in verts) / len(verts)
        cy = sum(v[1] for v in verts) / len(verts)
        cz = sum(v[2] for v in verts) / len(verts)
        r = max(math.dist((cx, cy, cz), v) for v in verts)
        particles.append((cx, cy, cz, colour, r))

scale = max(max(abs(p[0]), abs(p[1]), abs(p[2])) for p in particles) * 1.001
largest = max(p[4] for p in particles)
out = bytearray(struct.pack('<Iff', len(particles), scale, largest))
for x, y, z, colour, r in particles:
    out += struct.pack('<hhhBB', *(round(v / scale * 32767) for v in (x, y, z)), colour, round(r / largest * 255))
target = root / 'public/models/dna-particles.bin'
target.write_bytes(out)
sizes = sorted(p[4] for p in particles)
print(f'{len(particles)} particles, scale {scale:.3f}, radius {sizes[0]:.4f}..{sizes[-1]:.4f}, {len(out)} bytes')
print('per colour', {c: sum(1 for p in particles if p[3] == c) for c in range(3)})
