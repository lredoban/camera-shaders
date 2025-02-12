// Wave distortion with color shift
const waveDistortionShader = `
precision mediump float;

uniform sampler2D uTexture;
uniform float uTime;
varying vec2 vUv;

void main() {
    vec2 uv = vUv;
    
    // Add a wave distortion effect
    uv.x += sin(uv.y * 10.0 + uTime) * 0.01;
    uv.y += cos(uv.x * 10.0 + uTime) * 0.01;
    
    vec4 texture = texture2D(uTexture, uv);
    
    // Add a subtle color shift
    vec4 shiftedColor = vec4(
        texture.r * (1.0 + sin(uTime * 0.5) * 0.1),
        texture.g * (1.0 + cos(uTime * 0.5) * 0.1),
        texture.b,
        1.0
    );
    
    gl_FragColor = shiftedColor;
}
`;

// Pixelation effect
const pixelateShader = `
precision mediump float;

uniform sampler2D uTexture;
uniform float uTime;
varying vec2 vUv;

void main() {
    float pixels = 100.0;
    vec2 uv = vUv;
    vec2 pixelated = floor(uv * pixels) / pixels;
    
    vec4 color = texture2D(uTexture, pixelated);
    
    gl_FragColor = color;
}
`;

// Kaleidoscope effect
const kaleidoscopeShader = `
precision mediump float;

uniform sampler2D uTexture;
uniform float uTime;
varying vec2 vUv;

void main() {
    vec2 uv = vUv * 2.0 - 1.0;
    float angle = atan(uv.y, uv.x);
    float radius = length(uv);
    
    float segments = 8.0;
    angle = mod(angle + uTime, 2.0 * 3.14159 / segments) - 3.14159 / segments;
    
    vec2 newUv = vec2(cos(angle) * radius, sin(angle) * radius) * 0.5 + 0.5;
    vec4 color = texture2D(uTexture, newUv);
    
    gl_FragColor = color;
}
`;

// Edge detection effect
const edgeDetectionShader = `
precision mediump float;

uniform sampler2D uTexture;
uniform float uTime;
varying vec2 vUv;

void main() {
    vec2 uv = vUv;
    float dx = 1.0 / 1280.0;
    float dy = 1.0 / 720.0;
    
    vec4 color = texture2D(uTexture, uv);
    vec4 colorLeft = texture2D(uTexture, vec2(uv.x - dx, uv.y));
    vec4 colorRight = texture2D(uTexture, vec2(uv.x + dx, uv.y));
    vec4 colorUp = texture2D(uTexture, vec2(uv.x, uv.y - dy));
    vec4 colorDown = texture2D(uTexture, vec2(uv.x, uv.y + dy));
    
    vec4 edges = abs(color - colorLeft) + 
                 abs(color - colorRight) + 
                 abs(color - colorUp) + 
                 abs(color - colorDown);
                 
    gl_FragColor = vec4(edges.rgb * 2.0, 1.0);
}
`;

// CRT effect
const crtShader = `
precision mediump float;

uniform sampler2D uTexture;
uniform float uTime;
varying vec2 vUv;

vec2 CRTCurveUV(vec2 uv) {
    uv = uv * 2.0 - 1.0;
    vec2 offset = abs(uv.yx) / vec2(4.0, 3.0);
    uv = uv + uv * offset * offset;
    uv = uv * 0.5 + 0.5;
    return uv;
}

void DrawVignette(inout vec3 color, vec2 uv) {    
    float vignette = uv.x * uv.y * (1.0 - uv.x) * (1.0 - uv.y);
    vignette = clamp(pow(16.0 * vignette, 0.4), 0.0, 1.0);
    color *= vignette;
}

void DrawScanline(inout vec3 color, vec2 uv) {
    float scanline = clamp(0.85 + 0.15 * cos(3.14 * uv.y * 240.0 * 1.0), 0.0, 1.0);
    float grille = 0.75 + 0.25 * clamp(1.5 * cos(3.14 * uv.x * 640.0 * 1.0), 0.0, 1.0);
    color *= scanline * grille * 1.4;
}

void main() {
    vec3 color = texture2D(uTexture, vUv).rgb;
    vec2 crtUV = CRTCurveUV(vUv);
    
    if (crtUV.x < 0.0 || crtUV.x > 1.0 || crtUV.y < 0.0 || crtUV.y > 1.0) {
        color = vec3(0.0, 0.0, 0.0);
    }
    
    DrawVignette(color, crtUV);
    DrawScanline(color, vUv);
    
    color = color * 1.1;
    
    gl_FragColor = vec4(color, 1.0);
}
`;

// Dot matrix effect
const dotShader = `
precision mediump float;

uniform sampler2D uTexture;
uniform float uTime;
varying vec2 vUv;

void main() {
    vec2 resolution = vec2(1280.0, 720.0);
    float pixelSize = 12.0;
    
    vec2 normalizedPixelSize = vec2(pixelSize) / resolution;
    vec2 uvPixel = normalizedPixelSize * floor(vUv / normalizedPixelSize);
    vec4 color = texture2D(uTexture, uvPixel);
    
    float luma = dot(vec3(0.2126, 0.7152, 0.0722), color.rgb);
    
    vec2 cellUV = fract(vUv / normalizedPixelSize);
    
    float radius = luma > 0.5 ? 0.3 : luma > 0.001 ? 0.12 : 0.075;
    vec2 circleCenter = luma > 0.5 ? vec2(0.5, 0.5) : vec2(0.25, 0.25);
    
    float distanceFromCenter = distance(cellUV, circleCenter);
    
    float circleMask = smoothstep(radius, radius - 0.05, distanceFromCenter);
    color.rgb = vec3(circleMask, circleMask, circleMask) * max(luma, 0.05);
    
    gl_FragColor = color;
}
`;

// Crochet effect
const crochetShader = `
precision mediump float;

uniform sampler2D uTexture;
uniform float uTime;
varying vec2 vUv;

float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
}

vec3 rgbToHsv(vec3 c) {
    vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
    vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
    vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));
    float d = q.x - min(q.w, q.y);
    float e = 1.0e-10;
    return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
}

vec3 hsvToRgb(vec3 c) {
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

float noise(vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);

    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));

    vec2 u = f * f * (3.0 - 2.0 * f);

    return mix(a, b, u.x) +
           (c - a) * u.y * (1.0 - u.x) +
           (d - b) * u.x * u.y;
}

void main() {
    float pixelSize = 16.0;
    vec2 resolution = vec2(1280.0, 720.0);
    vec2 normalizedPixelSize = vec2(pixelSize) / resolution;
    vec2 uvPixel = normalizedPixelSize * floor(vUv / normalizedPixelSize);
    vec4 color = texture2D(uTexture, uvPixel);

    vec2 cellPosition = floor(vUv / normalizedPixelSize);
    vec2 cellUV = fract(vUv / normalizedPixelSize);

    float rowOffset = sin((random(vec2(0.0, uvPixel.y)) - 0.5) * 0.25);
    cellUV.x += rowOffset; 
    vec2 centered = cellUV - 0.5;

    float noiseAmount = 0.18;
    vec2 noisyCenter = centered + (vec2(
        random(cellPosition + centered),
        random(cellPosition + centered)
    ) - 0.5) * noiseAmount;

    float isAlternate = mod(cellPosition.x, 2.0);
    float angle = isAlternate == 0.0 ? -1.134464 : 1.134464; // radians(±65.0)
    
    vec2 rotated = vec2(
        noisyCenter.x * cos(angle) - noisyCenter.y * sin(angle),
        noisyCenter.x * sin(angle) + noisyCenter.y * cos(angle)
    );
    
    float aspectRatio = 1.55;
    float ellipse = length(vec2(rotated.x, rotated.y * aspectRatio - 0.075));
    color.rgb *= smoothstep(0.2, 1.0, 1.0 - ellipse);
    
    float stripeNoise = noise(vec2(centered.x, centered.y * 100.0)); 
    color.rgb *= stripeNoise + 0.4;

    float hueShift = (random(cellPosition) - 0.5) * 0.08;
    vec3 hsv = rgbToHsv(color.rgb);
    hsv.x += hueShift;
    color.rgb = hsvToRgb(hsv);

    color.rgb *= smoothstep(0.2, 1.0, 1.0 - ellipse);
    gl_FragColor = color;
}
`;

export const shaders = {
  crt: {
    name: "CRT TV (for Bruno)",
    code: crtShader,
  },
  waveDistortion: {
    name: "Wave Distortion",
    code: waveDistortionShader,
  },
  pixelate: {
    name: "Pixelate",
    code: pixelateShader,
  },
  kaleidoscope: {
    name: "Kaleidoscope",
    code: kaleidoscopeShader,
  },
  edgeDetection: {
    name: "Edge Detection",
    code: edgeDetectionShader,
  },
  dot: {
    name: "Dot Matrix",
    code: dotShader,
  },
  crochet: {
    name: "Crochet Pattern",
    code: crochetShader,
  },
};
