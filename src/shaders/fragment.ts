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

vec2 curveRemapUV(vec2 uv) {
    // Convert UV from [0,1] to [-1,1]
    uv = uv * 2.0 - 1.0;
    
    // Apply barrel distortion
    float barrel = 0.25; // Adjust for more/less curve
    float r2 = uv.x * uv.x + uv.y * uv.y;
    uv *= 1.0 + r2 * barrel;
    
    // Convert back to [0,1]
    return (uv * 0.5 + 0.5);
}

void main() {
    vec2 uv = vUv;
    
    // Apply screen curvature
    vec2 curvedUv = curveRemapUV(uv);
    
    // Check if we're outside the curved screen bounds
    if (curvedUv.x < 0.0 || curvedUv.x > 1.0 || curvedUv.y < 0.0 || curvedUv.y > 1.0) {
        gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
        return;
    }
    
    // Sample the texture with RGB shift
    float shift = 0.002;
    vec4 colorR = texture2D(uTexture, vec2(curvedUv.x + shift, curvedUv.y));
    vec4 colorG = texture2D(uTexture, curvedUv);
    vec4 colorB = texture2D(uTexture, vec2(curvedUv.x - shift, curvedUv.y));
    
    vec4 color = vec4(colorR.r, colorG.g, colorB.b, 1.0);
    
    // Add scanlines
    float scanline = sin(curvedUv.y * 800.0) * 0.04;
    color -= scanline;
    
    // Add vertical sync effect
    float vignette = 1.0 - length(uv - 0.5) * 0.7;
    color *= vignette;
    
    // Add flickering
    float flicker = 0.95 + 0.05 * sin(uTime * 8.0);
    color *= flicker;
    
    gl_FragColor = color;
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
    float pixelSize = 8.0;
    
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

export const shaders = {
  crt: {
    name: "CRT TV (for Bruno)",
    code: crtShader
  },
  waveDistortion: {
    name: "Wave Distortion",
    code: waveDistortionShader
  },
  pixelate: {
    name: "Pixelate",
    code: pixelateShader
  },
  kaleidoscope: {
    name: "Kaleidoscope",
    code: kaleidoscopeShader
  },
  edgeDetection: {
    name: "Edge Detection",
    code: edgeDetectionShader
  },
  dot: {
    name: "Dot Matrix",
    code: dotShader
  }
};