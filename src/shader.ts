
// We are trying to render a video looking like an old V1 GameBoy.
//
// We therefore need to draw quads in only 4 colors:
//  1. We first find the closest tile we are in:
//          const float screenSize = 512.;
//          vec2 tileUV = floor(gl_FragCoord.xy / gridSize) * gridSize / screenSize;
//  2. Then extract the luminance of the current video texel:
//          vec4 tileColor = texture2D(textureSampler, tileUV);
//          float tileLuminance = getLuminance(tileColor.rgb);
//  3. And finally match the luminance with our color palette of 4 colors:
//          vec4 finalColor = palette[int(tileLuminance * 3. + lumaOffset)];
//
// And draw a grid on top of it to simulate the old pixel spaces:
//  1. We check horizontally or vertically if we are on the grid
//          onGridline(gl_FragCoord.x, gridSize)
//  2. By using a simple modulo operation
//          return mod(floor(distFrom), spacing) == 0.0;
//  3. And if we are we use the gridColor:
//          gl_FragColor = gridLineColor;
//          return;

const fragmentShader = `
varying vec2 vUV;

// Default Sampler
uniform sampler2D textureSampler;

// Transform color to luminance.
float getLuminance(vec3 color)
{
    return clamp(dot(color, vec3(0.2126, 0.7152, 0.0722)), 0., 1.);
}

// Returns whether the given fragment position lies on a grid line.
bool onGridline(float distFrom, float spacing)
{
    return mod(floor(distFrom), spacing) == 0.0;
}

void main(void) 
{
    // Color Palette
    vec4 palette[4];
    palette[0] = vec4( 22, 30, 87, 255.)  / 255.;
    palette[1] = vec4( 78, 109, 90, 255.) / 255.;
    palette[2] = vec4(106, 149, 50, 255.) / 255.;
    palette[3] = vec4(115, 161, 43, 255.) / 255.;

    // Luminance adaptation
    const float lumaOffset = 0.2;

    // Grid lines
    const vec4 gridLineColor = vec4(vec3(120, 168, 51) / 255. , 1.0);
    const float gridSize = 8.;

    // Screen Definition
    const float screenSize = 512.;
    vec2 tileUV = floor(gl_FragCoord.xy / gridSize) * gridSize / screenSize;

    // Square fetch of luminance
    vec4 tileColor = texture2D(textureSampler, tileUV);
    float tileLuminance = getLuminance(tileColor.rgb);

    // Adapt luma to effect and pick from the palette
    vec4 finalColor = palette[int(tileLuminance * 3. + lumaOffset)];

    // Are we on a line.
    if (onGridline(gl_FragCoord.x, gridSize) || onGridline(gl_FragCoord.y, gridSize))
    {
        gl_FragColor = gridLineColor;
        return;
    }

    gl_FragColor = finalColor;
}`;

export const ShaderConfiguration = {
    name: "GameBoy",
    fragmentShader,
    samplerNames: ["textureSampler"],
}