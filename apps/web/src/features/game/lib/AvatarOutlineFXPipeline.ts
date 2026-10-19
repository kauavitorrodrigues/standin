import Phaser from "phaser";
import { AVATAR_HIGHLIGHT } from "@/features/game/consts/avatar-hover";

const FRAGMENT_SHADER = `
precision mediump float;

uniform sampler2D uMainSampler;
uniform vec2 uStep;
uniform vec3 uColor;
uniform vec2 uInnerStep;
uniform vec3 uInnerColor;
uniform vec3 uBodyColor;
varying vec2 outTexCoord;

float alphaAt(vec2 offset) {
    return texture2D(uMainSampler, outTexCoord + offset).a;
}

float solidAround(vec2 reach) {
    float solid = 0.0;
    for (int i = 0; i < 8; i++) {
        float angle = float(i) * 0.785398;
        vec2 direction = vec2(cos(angle), sin(angle));
        direction /= max(abs(direction.x), abs(direction.y));
        solid = max(solid, step(0.99, alphaAt(direction * reach)));
    }
    return solid;
}

void main() {
    vec4 own = texture2D(uMainSampler, outTexCoord);

    // The translucent pixels of the sprite become opaque: the ones that touch
    // the solid edge are the line inside the white edge and around the eyes,
    // and the others are the body.
    if (own.a > 0.0) {
        bool isInnerLine = own.a < 0.99 && solidAround(uInnerStep) > 0.0;
        vec3 translucent = isInnerLine ? uInnerColor : uBodyColor;
        gl_FragColor = own.a < 0.99 ? vec4(translucent, 1.0) : own;
        return;
    }

    float near = 0.0;
    for (int i = 0; i < 8; i++) {
        float angle = float(i) * 0.785398;
        vec2 direction = vec2(cos(angle), sin(angle));
        direction /= max(abs(direction.x), abs(direction.y));
        near = max(near, alphaAt(direction * uStep));
        near = max(near, alphaAt(direction * uStep * 0.5));
    }

    gl_FragColor = near > 0.0 ? vec4(uColor, 1.0) : own;
}
`;

// Draws a line of one color on the empty pixels that touch the object, along
// its shape, and another on the translucent pixels inside its solid edge.
export class AvatarOutlineFXPipeline
    extends Phaser.Renderer.WebGL.Pipelines.PostFXPipeline
{
    constructor(game: Phaser.Game) {
        super({
            game,
            name: AVATAR_HIGHLIGHT.PIPELINE_KEY,
            fragShader: FRAGMENT_SHADER,
        });
    }

    onPreRender(): void {
        const { zoom } = this.gameObject.scene.cameras.main;
        const { COLOR, INNER_COLOR, BODY_COLOR, WIDTH } = AVATAR_HIGHLIGHT;

        this.set2f(
            "uStep",
            (WIDTH * zoom) / this.renderer.width,
            (WIDTH * zoom) / this.renderer.height
        );
        this.set2f(
            "uInnerStep",
            zoom / this.renderer.width,
            zoom / this.renderer.height
        );
        this.set3f("uColor", COLOR.r, COLOR.g, COLOR.b);
        this.set3f("uBodyColor", BODY_COLOR.r, BODY_COLOR.g, BODY_COLOR.b);
        this.set3f("uInnerColor", INNER_COLOR.r, INNER_COLOR.g, INNER_COLOR.b);
    }
}
