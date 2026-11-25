const vertexSource = `
  attribute vec3 position;
  attribute vec3 normal;
  attribute vec3 tangent;
  attribute vec2 materialPosition;

  uniform vec3 angles;
  uniform float aspect;

  varying vec3 surfaceNormal;
  varying vec3 surfaceTangent;
  varying vec2 surfaceUv;
  varying float surfaceDepth;

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
    surfaceNormal = rotate(normal);
    surfaceTangent = rotate(tangent);
    surfaceUv = materialPosition;
    surfaceDepth = p.z;
    float scale = 0.87 * clamp(aspect / 1.32, 1.0, 1.12);
    gl_Position = vec4(p.x * scale / aspect, p.y * scale, -p.z * 0.5, 1.0);
  }
`

const fragmentSource = `
  precision highp float;

  uniform vec2 lightPosition;

  varying vec3 surfaceNormal;
  varying vec3 surfaceTangent;
  varying vec2 surfaceUv;
  varying float surfaceDepth;

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
    vec3 view = vec3(0.0, 0.0, 1.0);
    vec3 normal = normalize(surfaceNormal);
    vec3 tangent = normalize(surfaceTangent - normal * dot(normal, surfaceTangent));
    vec3 across = cross(normal, tangent);
    vec3 key = normalize(vec3(0.58 + lightPosition.x * 0.22, -0.86 + lightPosition.y * 0.22, -0.26));
    vec3 bounce = normalize(vec3(0.14, 0.80, -0.54));
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
    float edge = smoothstep(0.75, 1.0, width);
    vec3 rim = normalize(vec3(-0.74, -0.57, 0.33));
    float edgeLight = 0.14 + 0.52 * diffuse + 0.45 * reflection
      + 0.24 * max(dot(normal, rim), 0.0);

    vec3 color = shadow + violet * (0.10 + 0.62 * diffuse + 0.16 * grazing);
    color *= 1.0 + 0.055 * fibers;
    color += lavender * reflection * brush;
    // A soft rim on the near side keeps the edge readable through the fold.
    float frontAmount = smoothstep(0.13, 0.69, surfaceDepth);
    color += violet * frontAmount * (0.21 + 0.25 * grazing);
    color += lavender * edge * (edgeLight * 0.62 + 0.29 * frontAmount);
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
  const majorRadius = 1.14
  const minorRadius = 1.02
  const halfWidth = .195
  const halfThickness = .064
  const frontTwistPhase = 1.30
  const frontTwistBias = .28
  const bevel = halfThickness * .78
  const cornerSteps = 9

  // Two rounded corners and their opposites give the section exact half-turn
  // symmetry. The straight spans between corners are the faces of the band.
  const halfSection = Array.from({ length: 2 * (cornerSteps + 1) }, (_, index) => {
    const corner = Math.floor(index / (cornerSteps + 1))
    const position = index % (cornerSteps + 1)
    const angle = (corner + position / cornerSteps) * Math.PI / 2
    return {
      across: (corner === 0 ? 1 : -1) * (halfWidth - bevel) + bevel * Math.cos(angle),
      thickness: halfThickness - bevel + bevel * Math.sin(angle),
      tangentX: -Math.sin(angle),
      tangentY: Math.cos(angle),
    }
  })
  const section = halfSection.concat(halfSection.map(({ across, thickness, tangentX, tangentY }) => ({
    across: -across,
    thickness: -thickness,
    tangentX: -tangentX,
    tangentY: -tangentY,
  })))

  const vertices: number[] = []
  const indices: number[] = []

  for (let along = 0; along <= segments; along++) {
    const u = along / segments
    const angle = along === segments ? 0 : u * Math.PI * 2
    const cos = Math.cos(angle)
    const sin = Math.sin(angle)
    // A half-turn joins opposite points of the bevel at the closed seam.
    // Duplicate render vertices keep the fibers' longitudinal UV continuous.
    const seamSign = along === segments ? -1 : 1
    const twist = angle / 2 + frontTwistPhase + frontTwistBias * cos
    const twistDerivative = .5 - frontTwistBias * sin
    const twistCos = seamSign * Math.cos(twist)
    const twistSin = seamSign * Math.sin(twist)
    const length = Math.hypot(minorRadius * cos, majorRadius * sin)
    const lengthDerivative = (majorRadius ** 2 - minorRadius ** 2) * sin * cos / length
    const outwardX = minorRadius * cos / length
    const outwardY = majorRadius * sin / length
    const outwardDerivativeX = (-minorRadius * sin - outwardX * lengthDerivative) / length
    const outwardDerivativeY = (majorRadius * cos - outwardY * lengthDerivative) / length

    for (let column = 0; column < section.length; column++) {
      const { across, thickness, tangentX, tangentY } = section[column]
      const radial = across * twistCos - thickness * twistSin
      const height = across * twistSin + thickness * twistCos
      const radialDerivative = -height * twistDerivative
      const tx = -majorRadius * sin + outwardDerivativeX * radial + outwardX * radialDerivative
      const ty = minorRadius * cos + outwardDerivativeY * radial + outwardY * radialDerivative
      const tz = radial * twistDerivative
      const sectionRadial = tangentX * twistCos - tangentY * twistSin
      const sectionX = outwardX * sectionRadial
      const sectionY = outwardY * sectionRadial
      const sectionZ = tangentX * twistSin + tangentY * twistCos

      vertices.push(
        majorRadius * cos + radial * outwardX,
        minorRadius * sin + radial * outwardY,
        height,
        ty * sectionZ - tz * sectionY,
        tz * sectionX - tx * sectionZ,
        tx * sectionY - ty * sectionX,
        tx, ty, tz, u, across / halfWidth,
      )

      if (along === segments) continue
      const first = along * section.length + column
      const adjacent = along * section.length + (column + 1) % section.length
      indices.push(first, first + section.length, adjacent, first + section.length, adjacent + section.length, adjacent)
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
      // Look onto the near half-turn, with the crossover below the opening.
      gl.uniform3f(angles, -.94 + y * .095, -.14 + x * .14, .66)
      gl.uniform2f(light, x, -y)
      gl.drawElements(gl.TRIANGLES, mesh.indices.length, gl.UNSIGNED_SHORT, 0)
    },
    dispose,
  }
}
