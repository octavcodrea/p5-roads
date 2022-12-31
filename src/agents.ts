import P5 from "p5";
import { u } from "./app";
import Palettes from "./assets/palettes";
import { sr, srn } from "./utils/common";
import {
    angleFromVector,
    brushstrokeLine,
    brushstrokePencil,
    brushstrokeRectangle,
    getVectorIntensity,
    vector_field,
} from "./utils/p5utils";
import { getState } from "./store";

const selectedPalette = getState().selectedPalette;

export class RectangleStripAgent {
    p5: P5;
    x1: number;
    y1: number;

    x2: number;
    y2: number;

    padding: number;
    direction: "horizontal" | "vertical";
    rectangleCount: number;

    rectangleProps: {
        color: P5.Color;
        width: number;
        height: number;

        rectPositionRandomness: number;
        rectSizeRandomness: number;

        brushPositionRandomness: number;
        brushSizeRandomness: number;

        brushScale: number;
        brushStippleSize: number;
        brushStippleRandomness: number;
    };

    rectanglesDrawn: number;
    removeAgent: (agent: RectangleStripAgent) => void;

    constructor(params: {
        p5: P5;
        x1: number;
        y1: number;

        x2: number;
        y2: number;

        padding: number;
        direction: "horizontal" | "vertical";
        rectangleCount: number;

        rectangleProps: {
            color: P5.Color;
            width: number;
            height: number;

            rectPositionRandomness: number;
            rectSizeRandomness: number;

            brushPositionRandomness: number;
            brushSizeRandomness: number;

            brushScale: number;
            brushStippleSize: number;
            brushStippleRandomness: number;
        };

        removeAgent: (agent: RectangleStripAgent) => void;
    }) {
        this.p5 = params.p5;
        this.x1 = params.x1;
        this.y1 = params.y1;

        this.x2 = params.x2;
        this.y2 = params.y2;

        this.padding = params.padding;
        this.direction = params.direction;
        this.rectangleCount = params.rectangleCount;

        this.rectangleProps = params.rectangleProps;

        this.rectanglesDrawn = 0;
        this.removeAgent = params.removeAgent;
    }

    update() {
        const {
            p5,
            x1,
            y1,
            x2,
            y2,
            padding,
            direction,
            rectangleCount,
            rectangleProps,
        } = this;

        const {
            color,
            width,
            height,

            rectPositionRandomness,
            rectSizeRandomness,

            brushPositionRandomness,
            brushSizeRandomness,

            brushScale,
            brushStippleSize,
            brushStippleRandomness,
        } = rectangleProps;

        const yStart = Math.min(y1, y2 ?? 0);
        const yEnd = Math.max(y1, y2 ?? 0);

        const xStart = Math.min(x1, x2 ?? 0);
        const xEnd = Math.max(x1, x2 ?? 0);

        const randSize =
            rectSizeRandomness !== undefined ? srn(x1) * rectSizeRandomness : 0;

        if (x2 !== undefined && y2 !== undefined) {
            const rectHeight =
                direction === "vertical"
                    ? (yEnd - yStart - padding * rectangleCount) /
                      rectangleCount
                    : yEnd - yStart;
            const rectWidth =
                direction === "horizontal"
                    ? (xEnd - xStart - padding * rectangleCount) /
                      rectangleCount
                    : xEnd - xStart;

            if (this.rectanglesDrawn < rectangleCount) {
                const randX =
                    rectPositionRandomness !== undefined
                        ? Math.floor(
                              srn(x1.toString() + this.rectanglesDrawn) *
                                  rectPositionRandomness
                          )
                        : 0;
                const randY =
                    rectPositionRandomness !== undefined
                        ? Math.floor(
                              srn(y1.toString() + this.rectanglesDrawn) *
                                  rectPositionRandomness
                          )
                        : 0;

                const x = x1 + randX;
                const y =
                    p5.map(
                        this.rectanglesDrawn,
                        0,
                        rectangleCount - 1,
                        yStart,
                        yEnd - rectHeight
                    ) + randY;

                p5.fill(color);
                brushstrokeRectangle({
                    p5: p5,
                    color: color,
                    x1: x,
                    y1: y,
                    x2: x + rectWidth,
                    y2: y + rectHeight,
                    brushProps: {
                        brushPositionRandomness: brushPositionRandomness,
                        brushSizeRandomness: brushSizeRandomness,

                        brushSize: brushScale ?? 10,
                        brushStippleSize: brushStippleSize ?? 2,

                        stipplePositionRandomness: brushStippleRandomness,
                        stippleSizeRandomness: brushStippleRandomness,
                    },
                });

                this.rectanglesDrawn++;
            }
        } else {
            if (this.rectanglesDrawn < rectangleCount) {
                const randX =
                    rectPositionRandomness !== undefined
                        ? Math.floor(
                              srn(x1.toString() + this.rectanglesDrawn) *
                                  rectPositionRandomness
                          )
                        : 0;
                const randY =
                    rectPositionRandomness !== undefined
                        ? Math.floor(
                              srn(y1.toString() + this.rectanglesDrawn) *
                                  rectPositionRandomness
                          )
                        : 0;

                const x =
                    x1 +
                    (direction === "horizontal"
                        ? this.rectanglesDrawn * (width + padding)
                        : 0) +
                    randX;
                const y =
                    y1 +
                    (direction === "vertical"
                        ? this.rectanglesDrawn * (height + padding)
                        : 0) +
                    randY;

                brushstrokeRectangle({
                    p5: p5,
                    color: color,
                    x1: x,
                    y1: y,
                    x2: x + width,
                    y2: y + height,
                    brushProps: {
                        brushPositionRandomness: brushPositionRandomness,
                        brushSizeRandomness: brushSizeRandomness,

                        brushSize: brushScale ?? 10,
                        brushStippleSize: brushStippleSize ?? 2,

                        stipplePositionRandomness: brushStippleRandomness,
                        stippleSizeRandomness: brushStippleRandomness,
                    },
                });

                this.rectanglesDrawn++;
            }
        }

        if (this.rectanglesDrawn >= rectangleCount) {
            this.removeAgent(this);
        }
    }
}

export class LineAgent {
    p5: P5;
    agentIndex: number;
    p: P5.Vector;
    direction: number;
    colors: P5.Color[];
    scale: number;
    strokeWidth: number;

    pOld: P5.Vector;
    step: number;
    seed: string;
    colorIndex: number;
    layer: number;
    type: string;

    removeAgent: (agent: LineAgent) => void;

    constructor(params: {
        p5: P5;
        x0: number;
        y0: number;
        seed: string;
        layer?: number;
        direction?: number;
        agentIndex?: number;
        colors?: P5.Color[];
        removeAgent: (agent: LineAgent) => void;
    }) {
        const { p5, x0, y0, seed, direction, agentIndex, colors, layer } =
            params;
        this.p5 = p5;
        this.agentIndex = agentIndex ?? 0;
        this.p = p5.createVector(x0, y0);
        this.direction = direction ?? 1;
        this.colors = colors ?? [p5.color("#000")];
        this.scale = p5.random(1, 10);
        this.strokeWidth = u(13) + u(3) * p5.sin(p5.frameCount);
        this.seed = seed;
        this.colorIndex = 0;
        this.layer = 0;
        this.type = "default";

        this.pOld = p5.createVector(this.p.x, this.p.y);

        this.step = 1;
        this.removeAgent = params.removeAgent;

        if (this.agentIndex % 4 === 0) {
            this.type = "pencil";
            this.layer = +1;
        } else if (this.agentIndex % 15 === 1) {
            this.type = "pen";
        } else if (this.agentIndex % 15 === 2) {
            this.type = "dashed-line";
        } else {
            this.layer = +(this.agentIndex + 3);
        }
    }

    update() {
        const { p5 } = this;
        const vector = vector_field(
            p5,
            this.p.x,
            this.p.y,
            this.scale,
            this.seed
        );

        this.p.x += this.direction * vector.x * this.step;
        this.p.y += this.direction * vector.y * this.step;

        if (
            this.p.x >= p5.width * 1.2 ||
            this.p.x <= -p5.width * 0.2 ||
            this.p.y <= -p5.height * 0.2 ||
            this.p.y >= p5.height * 1.2
        ) {
            this.step = 0;
            //destroy agent
            this.removeAgent(this);
        }

        // if (this.p.y < border || this.p.y > p5.height - border) {
        //     this.direction *= -p5.random(0.9, 1.1);
        // }

        // if (this.colorIndex >= gradient.length) {
        //     this.colorIndex = 0;
        // } else {
        //     this.colorIndex += 0.1;
        // }

        if (this.type === "pencil") {
            //blend mode
            // p5.blendMode(p5.MULTIPLY);
            p5.blendMode(p5.DARKEST);

            brushstrokePencil({
                p5: p5,
                x: this.p.x,
                y: this.p.y,
                brushSize: u(5),
                color: p5.color(p5.random(16, 100)),
                density: 0.8,
                stippleSize: u(1),
                stipplePositionRandomness: u(2),
                stippleSizeRandomness: u(1),
            });
        } else if (this.type === "pen") {
            //blend mode
            p5.blendMode(p5.DARKEST);

            this.strokeWidth = this.strokeWidth * p5.random(0.95, 1.05);
            p5.strokeWeight(this.strokeWidth / 5);

            p5.stroke(Palettes[selectedPalette].accent);
            p5.line(this.pOld.x, this.pOld.y, this.p.x, this.p.y);
        } else if (this.type === "dashed-line") {
            if ((p5.frameCount * 0.6) % 2 === 0) {
                //blend mode
                p5.blendMode(p5.DARKEST);

                this.strokeWidth = this.strokeWidth * p5.random(0.95, 1.05);
                p5.strokeWeight(this.strokeWidth / 5);

                p5.stroke(p5.color("#444"));
                p5.line(this.pOld.x, this.pOld.y, this.p.x, this.p.y);
            }
        } else {
            p5.blendMode(p5.BLEND);
            this.strokeWidth = this.strokeWidth * p5.random(0.97, 1.03);
            p5.strokeWeight(this.strokeWidth);

            brushstrokeLine({
                p5: p5,
                x: this.p.x,
                y: this.p.y,
                brushProps: {
                    brushStrokeWidth: this.strokeWidth,
                    stipplePositionRandomness: u(5),
                },
                brushType: "random",
                colors: this.colors,

                frameCount: p5.frameCount,
                directionAngle: angleFromVector(vector),
                drip: 0.02,
            });
        }

        this.pOld.set(this.p);

        // if (p5.random(0, 1) > 0.99) {
        //     const ellipsePoint = calculatePointFromAngle({
        //         originX: this.p.x,
        //         originY: this.p.y,
        //         angle: angleFromVector(vector) + p5.PI / 2,
        //         distance: this.strokeWidth * 2,
        //         mode: "radians",
        //     });

        //     p5.noFill();
        //     p5.ellipse(
        //         ellipsePoint.x,
        //         ellipsePoint.y,
        //         this.strokeWidth / 2,
        //         this.strokeWidth / 2
        //     );
        // }

        // if (
        //     this.step !== 0 &&
        //     p5.frameCount % Math.floor(200 * seedrandom(this.seed)()) ===
        //         0 &&
        //     p5.random(0, 1) > 0.5 &&
        //     agents.length < 300
        // ) {
        //     this.step = 0;
        //     //destroy agent
        //     agents.splice(agents.indexOf(this), 1);

        //     agents.push(
        //         new Agent(
        //             this.p.x,
        //             this.p.y,
        //             this.p.x.toString() + this.p.y,
        //             this.direction + p5.random(-0.7, 0.7)
        //         )
        //     );
        //     agents.push(
        //         new Agent(
        //             this.p.x,
        //             this.p.y,
        //             this.p.y.toString() + this.p.x,
        //             this.direction + p5.random(-1, 1)
        //         )
        //     );

        //     console.log(
        //         "agents: ",
        //         agents.length,
        //         "framecount: ",
        //         p5.frameCount
        //     );
        // }
    }
}
