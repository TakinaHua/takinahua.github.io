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
    float scale = 3.24 * clamp(aspect / 1.42, 1.0, 1.17);
    gl_Position = vec4(p.x * scale / aspect, p.y * scale, depth - 0.2, depth);
  }
`

const fragmentSource = `
  precision highp float;

  uniform vec2 lightPosition;

  varying vec3 surfaceNormal;
  varying vec3 surfaceTangent;
  varying vec3 surfacePosition;
  varying vec2 surfaceUv;

  void main() {
    vec3 deepViolet = vec3(0.064, 0.047, 0.112);
    vec3 violet = vec3(0.35, 0.24, 0.54);
    vec3 lavender = vec3(0.74, 0.62, 0.92);
    vec3 view = normalize(vec3(0.0, 0.0, 4.2) - surfacePosition);
    vec3 normal = normalize(surfaceNormal);
    normal *= dot(normal, view) < 0.0 ? -1.0 : 1.0;
    vec3 tangent = normalize(surfaceTangent);
    vec3 key = normalize(vec3(0.66 + lightPosition.x * 0.32, -0.73 + lightPosition.y * 0.29, -0.22));
    vec3 fill = normalize(vec3(0.36, 0.76, -0.29));
    vec3 halfKey = normalize(view + key);
    vec3 halfFill = normalize(view + fill);

    float diffuse = 0.55 * max(dot(normal, key), 0.0) + 0.36 * max(dot(normal, fill), 0.0);
    float satin = pow(max(dot(normal, halfKey), 0.0), 18.0);
    satin *= 0.52 + 0.48 * pow(1.0 - abs(dot(tangent, halfKey)), 2.0);
    satin += 0.42 * pow(max(dot(normal, halfFill), 0.0), 20.0);
    float grazing = pow(1.0 - clamp(dot(normal, view), 0.0, 1.0), 2.5);

    // Parallel fibers run along the strip, with a second, finer band of grain.
    // Mirroring the width coordinate keeps the finish continuous at the twist seam.
    float width = abs(surfaceUv.y);
    float along = surfaceUv.x * 6.2831853;
    float fiber = sin(width * 230.0 + sin(along * 6.0) * 0.78);
    float fineFiber = sin(width * 479.0 - cos(along * 15.0) * 0.86);
    float brushing = 1.0 + fiber * 0.16 + fineFiber * 0.045;
    float edge = smoothstep(0.945, 0.997, width);

    vec3 color = deepViolet;
    color += violet * (diffuse * 0.40 + grazing * 0.23) * brushing;
    color += lavender * satin * 0.83 * brushing;
    color += lavender * edge * (0.26 + diffuse * 0.65 + grazing * 0.21);
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
  const segments = 192
  const across = 24
  const vertices: number[] = []
  const indices: number[] = []

  for (let along = 0; along <= segments; along++) {
    const u = along / segments
    const angle = u * Math.PI * 2
    const cos = Math.cos(angle)
    const sin = Math.sin(angle)
    const halfCos = Math.cos(angle / 2)
    const halfSin = Math.sin(angle / 2)

    for (let column = 0; column <= across; column++) {
      const v = (2 * column) / across - 1
      const offset = v * .37
      const radius = 1 + offset * halfCos
      const radiusDerivative = -.5 * offset * halfSin

      // Analytic derivatives of the strip along its length and across its width.
      const tx = radiusDerivative * cos - radius * sin
      const ty = radiusDerivative * sin + radius * cos
      const tz = .5 * offset * halfCos
      const wx = halfCos * cos
      const wy = halfCos * sin
      const wz = halfSin

      vertices.push(
        radius * cos, radius * sin, offset * halfSin,
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
  const fragment = compile(gl, gl.FRAGMENT_SHADER, fragmentSource)
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
      gl.uniform3f(angles, .98 + y * .21, -.20 + x * .29, .38 + x * .08)
      gl.uniform2f(light, x, -y)
      gl.drawElements(gl.TRIANGLES, mesh.indices.length, gl.UNSIGNED_SHORT, 0)
    },
    dispose,
  }
}
