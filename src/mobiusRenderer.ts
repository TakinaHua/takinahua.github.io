const vertexSource = `
  attribute vec3 position;
  attribute vec3 normal;
  attribute vec3 tangent;
  attribute vec2 materialPosition;

  uniform vec3 angles;
  uniform float aspect;

  varying vec3 surfaceNormal;
  varying vec3 surfaceTangent;
  varying vec3 surfacePosition;
  varying vec2 surfaceUv;

  vec3 rotate(vec3 p) {
    vec3 s = sin(angles);
    vec3 c = cos(angles);
    p.yz = mat2(c.x, s.x, -s.x, c.x) * p.yz;
    p.xz = mat2(c.y, -s.y, s.y, c.y) * p.xz;
    p.xy = mat2(c.z, s.z, -s.z, c.z) * p.xy;
    return p;
  }

  void main() {
    vec3 p = rotate(position);
    float depth = 4.2 - p.z;
    surfacePosition = p;
    surfaceNormal = rotate(normal);
    surfaceTangent = rotate(tangent);
    surfaceUv = materialPosition;
    float scale = 3.74 * clamp(aspect / 1.34, 1.0, 1.27);
    gl_Position = vec4(p.x * scale / aspect - 0.045 * depth, p.y * scale, depth - 0.2, depth);
  }
`

const fragmentSource = `
  precision highp float;

  uniform vec2 lightPosition;

  varying vec3 surfaceNormal;
  varying vec3 surfaceTangent;
  varying vec3 surfacePosition;
  varying vec2 surfaceUv;

  float fiberNoise(float coordinate) {
    float fiber = floor(coordinate);
    float first = fract(sin(fiber * 127.1) * 43758.5453);
    float next = fract(sin((fiber + 1.0) * 127.1) * 43758.5453);
    float grain = mix(first, next, smoothstep(0.0, 1.0, fract(coordinate))) - 0.5;
    #ifdef FILTER_FIBERS
      grain *= 1.0 - smoothstep(0.35, 1.15, fwidth(coordinate));
    #endif
    return grain;
  }

  float satinReflection(vec3 n, vec3 t, vec3 b, vec3 v, vec3 l) {
    vec3 h = normalize(v + l);
    float facing = max(dot(n, h), 0.0);
    vec2 slope = vec2(dot(t, h) / 0.54, dot(b, h) / 0.26);
    return exp(-dot(slope, slope) / max(facing * facing, 0.02))
      * facing * smoothstep(-0.13, 0.37, dot(n, l));
  }

  void main() {
    vec3 shadow = vec3(0.041, 0.033, 0.072);
    vec3 violet = vec3(0.21, 0.145, 0.33);
    vec3 lavender = vec3(0.79, 0.63, 0.95);
    vec3 view = normalize(vec3(0.0, 0.0, 4.2) - surfacePosition);
    vec3 normal = normalize(surfaceNormal);
    normal *= dot(normal, view) < 0.0 ? -1.0 : 1.0;
    vec3 tangent = normalize(surfaceTangent - normal * dot(normal, surfaceTangent));
    vec3 across = cross(normal, tangent);
    vec3 key = normalize(vec3(0.58 + lightPosition.x * 0.29, -0.86 + lightPosition.y * 0.27, -0.26));
    vec3 bounce = normalize(vec3(-0.36, 0.81, -0.21));
    float diffuse = 0.54 * max(dot(normal, key), 0.0) + 0.31 * max(dot(normal, bounce), 0.0);
    float reflection = 0.91 * satinReflection(normal, tangent, across, view, key)
      + 0.54 * satinReflection(normal, tangent, across, view, bounce);

    // Irregular longitudinal fibers catch the light without moiré bands.
    // The coordinates repeat across the reversed seam of the half-twist.
    float width = abs(surfaceUv.y);
    float along = surfaceUv.x * 6.2831853;
    float fibers = fiberNoise(width * 136.0 + 0.37 * sin(along * 5.0))
      + 0.46 * fiberNoise(width * 52.0 - 0.18 * cos(along * 9.0));
    float brush = 1.0 + 0.18 * fibers;

    float grazing = pow(1.0 - max(dot(normal, view), 0.0), 2.2);
    float edge = smoothstep(0.967, 1.0, width);
    vec3 rim = normalize(vec3(-0.74, -0.57, 0.33));
    float edgeLight = 0.14 + 0.52 * diffuse + 0.45 * reflection
      + 0.24 * max(dot(normal, rim), 0.0);

    vec3 color = shadow + violet * (0.10 + 0.62 * diffuse + 0.16 * grazing);
    color *= 1.0 + 0.055 * fibers;
    color += lavender * reflection * brush;
    color += lavender * edge * edgeLight;
    gl_FragColor = vec4(color, 1.0);
  }
`

function compile(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type)
  if (!shader) return null

  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) return shader

  gl.deleteShader(shader)
  return null
}

function createMesh() {
  const segments = 224
  const across = 28
  const majorRadius = 1.12
  const minorRadius = .82
  const halfWidth = .40
  const twistOffset = .34
  const vertices: number[] = []
  const indices: number[] = []

  for (let along = 0; along <= segments; along++) {
    const u = along / segments
    const angle = along === segments ? 0 : u * Math.PI * 2
    const cos = Math.cos(angle)
    const sin = Math.sin(angle)
    // The last row matches the first row in reverse. Duplicate seam vertices
    // carry the flipped normals required by the non-orientable surface.
    const seamSign = along === segments ? -1 : 1
    const halfCos = seamSign * Math.cos(angle / 2 + twistOffset)
    const halfSin = seamSign * Math.sin(angle / 2 + twistOffset)
    const length = Math.hypot(minorRadius * cos, majorRadius * sin)
    const lengthDerivative = (majorRadius ** 2 - minorRadius ** 2) * sin * cos / length
    const outwardX = minorRadius * cos / length
    const outwardY = majorRadius * sin / length
    const outwardDerivativeX = (-minorRadius * sin - outwardX * lengthDerivative) / length
    const outwardDerivativeY = (majorRadius * cos - outwardY * lengthDerivative) / length

    for (let column = 0; column <= across; column++) {
      const v = (2 * column - across) / across
      const offset = v * halfWidth
      const wx = outwardX * halfCos
      const wy = outwardY * halfCos
      const wz = halfSin
      const tx = -majorRadius * sin + offset * (outwardDerivativeX * halfCos - .5 * outwardX * halfSin)
      const ty = minorRadius * cos + offset * (outwardDerivativeY * halfCos - .5 * outwardY * halfSin)
      const tz = .5 * offset * halfCos

      vertices.push(
        majorRadius * cos + offset * wx,
        minorRadius * sin + offset * wy,
        offset * wz,
        ty * wz - tz * wy, tz * wx - tx * wz, tx * wy - ty * wx,
        tx, ty, tz, u, v,
      )

      if (along === segments || column === across) continue
      const first = along * (across + 1) + column
      const next = first + across + 1
      indices.push(first, next, first + 1, next, next + 1, first + 1)
    }
  }

  return { vertices: new Float32Array(vertices), indices: new Uint16Array(indices) }
}

const mesh = createMesh()

export function createMobiusRenderer(gl: WebGLRenderingContext) {
  const vertex = compile(gl, gl.VERTEX_SHADER, vertexSource)
  const fragmentPrefix = gl.getExtension('OES_standard_derivatives')
    ? '#extension GL_OES_standard_derivatives : enable\n#define FILTER_FIBERS\n'
    : ''
  const fragment = compile(gl, gl.FRAGMENT_SHADER, fragmentPrefix + fragmentSource)
  const program = gl.createProgram()
  const vertices = gl.createBuffer()
  const indices = gl.createBuffer()

  function dispose() {
    gl.deleteShader(vertex)
    gl.deleteShader(fragment)
    gl.deleteProgram(program)
    gl.deleteBuffer(vertices)
    gl.deleteBuffer(indices)
  }

  if (!vertex || !fragment || !program || !vertices || !indices) {
    dispose()
    return null
  }

  gl.attachShader(program, vertex)
  gl.attachShader(program, fragment)
  gl.linkProgram(program)
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    dispose()
    return null
  }

  gl.useProgram(program)
  gl.enable(gl.DEPTH_TEST)
  gl.clearColor(0, 0, 0, 0)

  gl.bindBuffer(gl.ARRAY_BUFFER, vertices)
  gl.bufferData(gl.ARRAY_BUFFER, mesh.vertices, gl.STATIC_DRAW)
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indices)
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, mesh.indices, gl.STATIC_DRAW)

  for (const { name, size, offset } of [
    { name: 'position', size: 3, offset: 0 },
    { name: 'normal', size: 3, offset: 3 },
    { name: 'tangent', size: 3, offset: 6 },
    { name: 'materialPosition', size: 2, offset: 9 },
  ]) {
    const location = gl.getAttribLocation(program, name)
    gl.enableVertexAttribArray(location)
    gl.vertexAttribPointer(location, size, gl.FLOAT, false, 44, 4 * offset)
  }

  const aspect = gl.getUniformLocation(program, 'aspect')
  const angles = gl.getUniformLocation(program, 'angles')
  const light = gl.getUniformLocation(program, 'lightPosition')

  return {
    draw(x: number, y: number) {
      const width = gl.drawingBufferWidth
      const height = gl.drawingBufferHeight
      if (!width || !height || gl.isContextLost()) return

      gl.viewport(0, 0, width, height)
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
      gl.uniform1f(aspect, width / height)
      gl.uniform3f(angles, 1.05 + y * .19, -.29 + x * .25, .51 + x * .065)
      gl.uniform2f(light, x, -y)
      gl.drawElements(gl.TRIANGLES, mesh.indices.length, gl.UNSIGNED_SHORT, 0)
    },
    dispose,
  }
}
