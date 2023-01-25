import P5 from "p5";
import { u } from "./app";
import Palettes from "./assets/palettes";
import { addHSV, sr, srn } from "./utils/common";
import {
    angleFromVector,
    brushstrokeLine,
    brushstrokePencil,
    brushstrokeRectangle,
    getVectorIntensity,
    linesRectangle,
    polygon,
    polygonRough,
    vector_field,
} from "./utils/p5utils";
import { getState } from "./store";

let selectedPalette = 0;
setTimeout(() => {
    selectedPalette = getState().selectedPalette;
}, 500);

export class TriangleStripAgent {
    p5: P5;
    x1: number;
    y1: number;

    x2: number | undefined;
    y2: number | undefined;

    padding: number;
    direction: "horizontal" | "vertical";
    triangleCount: number;

    triangleProps: {
        color: P5.Color;
        rotation: number;
        width: number;

        trigPositionRandomness: number;
        trigSizeRandomness: number;
        trigPointRandomness: number;
    };

    trianglesDrawn: number;
    removeAgent: (agent: TriangleStripAgent) => void;

    constructor(params: {
        p5: P5;
        x1: number;
        y1: number;

        x2?: number | undefined;
        y2?: number | undefined;

        padding: number;
        direction: "horizontal" | "vertical";
        triangleCount: number;

        triangleProps: {
            color: P5.Color;
            rotation: number;
            width: number;

            trigPositionRandomness: number;
            trigSizeRandomness: number;
            trigPointRandomness: number;
        };

        removeAgent: (agent: TriangleStripAgent) => void;
    }) {
        this.p5 = params.p5;
        this.x1 = params.x1;
        this.y1 = params.y1;

        this.x2 = params.x2;
        this.y2 = params.y2;

        this.padding = params.padding;
        this.direction = params.direction;
        this.triangleCount = params.triangleCount;

        this.triangleProps = params.triangleProps;

        this.trianglesDrawn = 0;
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
            triangleCount,
            triangleProps,
        } = this;

        const {
            color,
            width,

            rotation,
            trigPositionRandomness,
            trigSizeRandomness,
        } = triangleProps;

        const yStart = Math.min(y1, y2 ?? 0);
        const yEnd = Math.max(y1, y2 ?? 0);

        const xStart = Math.min(x1, x2 ?? 0);
        const xEnd = Math.max(x1, x2 ?? 0);

        const randSize =
            trigSizeRandomness !== undefined ? srn(x1) * trigSizeRandomness : 0;
        p5.blendMode(p5.DARKEST);

        if (x2 !== undefined && y2 !== undefined) {
            const rectHeight =
                direction === "vertical"
                    ? (yEnd - yStart - padding * triangleCount) / triangleCount
                    : yEnd - yStart;
            const rectWidth =
                direction === "horizontal"
                    ? (xEnd - xStart - padding * triangleCount) / triangleCount
                    : xEnd - xStart;

            if (this.trianglesDrawn < triangleCount) {
                const randX =
                    trigPositionRandomness !== undefined
                        ? Math.floor(
                              srn(x1.toString() + this.trianglesDrawn) *
                                  trigPositionRandomness
                          )
                        : 0;
                const randY =
                    trigPositionRandomness !== undefined
                        ? Math.floor(
                              srn(y1.toString() + this.trianglesDrawn) *
                                  trigPositionRandomness
                          )
                        : 0;

                const x = x1 + randX;
                const y =
                    p5.map(
                        this.trianglesDrawn,
                        0,
                        triangleCount - 1,
                        yStart,
                        yEnd - rectHeight
                    ) + randY;

                p5.fill(color);

                polygonRough({
                    p5: p5,
                    x: x + rectWidth / 2,
                    y: y + rectHeight / 2,
                    radius: width / 2 + randSize,
                    sides: 3,
                    color: color,
                    fill: true,
                    randomness: trigSizeRandomness,
                    rotationInDeg: rotation ?? 0,

                    detailSize: width / 30,
                    strokeWidth: width / 16,
                    strokeWidthRandomness: width / 32,
                });

                this.trianglesDrawn++;
            }
        } else {
            if (this.trianglesDrawn < triangleCount) {
                const randX =
                    trigPositionRandomness !== undefined
                        ? Math.floor(
                              srn(x1.toString() + this.trianglesDrawn) *
                                  trigPositionRandomness
                          )
                        : 0;
                const randY =
                    trigPositionRandomness !== undefined
                        ? Math.floor(
                              srn(y1.toString() + this.trianglesDrawn) *
                                  trigPositionRandomness
                          )
                        : 0;

                const x =
                    x1 +
                    (direction === "horizontal"
                        ? this.trianglesDrawn * (width + padding)
                        : 0) +
                    randX;
                const y =
                    y1 +
                    (direction === "vertical"
                        ? this.trianglesDrawn * (width + padding)
                        : 0) +
                    randY;

                p5.fill(color);

                polygonRough({
                    p5: p5,
                    x: x + width / 2,
                    y: y + width / 2,
                    radius: width + randSize,
                    sides: 3,
                    color: color,
                    fill: true,
                    randomness: this.triangleProps.trigPointRandomness,
                    rotationInDeg: rotation ?? 0,

                    detailSize: width / 30,
                    strokeWidth: width / 16,
                    strokeWidthRandomness: width / 32,
                });

                this.trianglesDrawn++;
            }
        }

        if (this.trianglesDrawn >= triangleCount) {
            this.removeAgent(this);
        }
    }
}

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
                // brushstrokeRectangle({
                //     p5: p5,
                //     color: color,
                //     hueRandomness: 0.02,
                //     valueRandomness: 0.02,
                //     x1: x,
                //     y1: y,
                //     x2: x + rectWidth,
                //     y2: y + rectHeight,

                //     blendMode: p5.BLEND,

                //     brushProps: {
                //         // brushType: "paintDrop",

                //         brushPositionRandomness: brushPositionRandomness,
                //         brushSizeRandomness: brushSizeRandomness,

                //         brushSize: brushScale ?? 10,
                //         brushStippleSize: brushStippleSize ?? 2,

                //         stipplePositionRandomness: brushStippleRandomness,
                //         stippleSizeRandomness: brushStippleRandomness,
                //     },
                // });

                linesRectangle({
                    p5: p5,
                    color: color,
                    hueRandomness: 0.02,
                    valueRandomness: 0.02,
                    x1: x,
                    y1: y,
                    x2: x + rectWidth,
                    y2: y + rectHeight,

                    blendMode: p5.MULTIPLY,

                    lineProps: {
                        density: 0.7,
                        lineWeight: u(0.5),
                        positionRandomness: 0.05,
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

                // brushstrokeRectangle({
                //     p5: p5,
                //     color: color,
                //     x1: x,
                //     y1: y,
                //     x2: x + width,
                //     y2: y + height,

                //     blendMode: p5.BLEND,

                //     brushProps: {
                //         // brushType: "paintDrop",

                //         brushPositionRandomness: brushPositionRandomness,
                //         brushSizeRandomness: brushSizeRandomness,

                //         brushSize: brushScale ?? 10,
                //         brushStippleSize: brushStippleSize ?? 2,

                //         stipplePositionRandomness: brushStippleRandomness,
                //         stippleSizeRandomness: brushStippleRandomness,
                //     },
                // });

                linesRectangle({
                    p5: p5,
                    color: color,
                    hueRandomness: 0.02,
                    valueRandomness: 0.02,
                    x1: x,
                    y1: y,
                    x2: x + width,
                    y2: y + height,
                    blendMode: p5.MULTIPLY,

                    lineProps: {
                        density: 0.7,
                        lineWeight: u(0.5),
                        positionRandomness: 0.05,
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
    linesDirection: "down-right" | "up-right";
    colors: P5.Color[];
    scale: number;
    strokeWidth: number;

    pOld: P5.Vector;
    step: number;
    seed: string;
    colorIndex: number;
    layer: number;
    type: string;

    mode: "straight" | "smooth";
    vector: P5.Vector;
    vectorStep: number;

    removeAgent: (agent: LineAgent) => void;

    constructor(params: {
        p5: P5;
        x0: number;
        y0: number;
        seed: string;
        layer?: number;
        direction?: number;
        linesDirection: "down-right" | "up-right";
        scale: number;
        agentIndex?: number;
        colors?: P5.Color[];
        mode?: "straight" | "smooth";
        removeAgent: (agent: LineAgent) => void;
    }) {
        const {
            p5,
            x0,
            y0,
            seed,
            direction,
            agentIndex,
            colors,
            linesDirection,
            layer,
            scale,
        } = params;

        this.p5 = p5;
        this.agentIndex = agentIndex ?? 0;
        this.p = p5.createVector(x0, y0);
        this.direction = direction ?? 1;
        this.linesDirection = linesDirection;
        this.colors = colors ?? [p5.color("#000")];
        this.scale = p5.random(1, 10);
        this.strokeWidth = (u(16) + u(6) * p5.sin(p5.frameCount)) * scale;
        this.seed = seed;
        this.colorIndex = 0;
        this.layer = 0;
        this.type = "default";

        this.mode = params.mode ?? "smooth";

        this.pOld = p5.createVector(this.p.x, this.p.y);

        this.step = 1;
        this.removeAgent = params.removeAgent;

        if (this.agentIndex % 5 === 0) {
            this.type = "pencil";
            this.layer = +1;
        } else if (this.agentIndex % 15 === 1) {
            this.type = "pen";
        } else if (this.agentIndex % 15 === 2) {
            this.type = "dashed-line";
        } else if (this.agentIndex % 15 === 3) {
            this.type = "circles";
        } else {
            this.layer = +(this.agentIndex + 3);
        }

        this.vector = vector_field(
            p5,
            this.p.x,
            this.p.y,
            this.scale,
            this.linesDirection,
            this.seed
        );
        this.vectorStep = 10;
    }

    update() {
        const { p5 } = this;
        if (this.mode === "smooth") {
            this.vector = vector_field(
                p5,
                this.p.x,
                this.p.y,
                this.scale,
                this.linesDirection,
                this.seed
            );
        } else {
            if (Math.floor(p5.frameCount / this.vectorStep) % 2 === 0) {
                this.vector = vector_field(
                    p5,
                    this.p.x,
                    this.p.y,
                    this.scale,
                    this.linesDirection,
                    this.seed
                );
                this.vectorStep = p5.random(10, 50);
            }
        }

        this.p.x += this.direction * this.vector.x * this.step;
        this.p.y += this.direction * this.vector.y * this.step;

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
            const c = p5.color(
                addHSV(
                    Palettes[selectedPalette].pencilColor,
                    0,
                    0,
                    p5.random(-0.3, 0.3)
                )
            );

            brushstrokePencil({
                p5: p5,
                x: this.p.x,
                y: this.p.y,
                brushSize: u(5),
                color: c,
                density: 0.8,
                stippleSize: u(1),
                stipplePositionRandomness: u(2),
                stippleSizeRandomness: u(1),
            });
        } else if (this.type === "pen") {
            //blend mode
            p5.blendMode(p5.DARKEST);

            this.strokeWidth = this.strokeWidth * p5.random(0.95, 1.05);
            if (this.strokeWidth > u(50)) this.strokeWidth *= 0.9;
            p5.strokeWeight(this.strokeWidth / 5);

            p5.stroke(Palettes[selectedPalette].accent);
            p5.line(this.pOld.x, this.pOld.y, this.p.x, this.p.y);
        } else if (this.type === "dashed-line") {
            if ((p5.frameCount * 0.6) % 2 === 0) {
                //blend mode
                p5.blendMode(p5.DARKEST);

                this.strokeWidth = this.strokeWidth * p5.random(0.95, 1.05);
                p5.strokeWeight(this.strokeWidth / 5);

                p5.stroke(p5.color(Palettes[selectedPalette].pencilColor));
                p5.line(this.pOld.x, this.pOld.y, this.p.x, this.p.y);
            }
        } else if (this.type === "circles") {
            if ((p5.frameCount * 0.1) % 2 === 0) {
                //blend mode
                p5.blendMode(p5.DARKEST);

                this.strokeWidth = this.strokeWidth * p5.random(0.95, 1.05);
                p5.strokeWeight(this.strokeWidth / p5.random(7, 20));

                // p5.stroke(p5.color("#666"));
                p5.stroke(p5.color(Palettes[selectedPalette].pencilColor));
                p5.noFill();

                const thisSize = (this.strokeWidth / 2) * p5.random(0.3, 1.4);

                const xOffset = p5.random(-thisSize, thisSize);
                const yOffset = p5.random(-thisSize, thisSize);

                polygonRough({
                    p5: p5,
                    x: this.p.x + xOffset,
                    y: this.p.y + yOffset,
                    radius: thisSize,
                    sides: 16,
                    color: p5.color(
                        p5.color(Palettes[selectedPalette].pencilColor)
                    ),
                    fill: false,
                    randomness: thisSize / 64,
                    rotationInDeg: sr(this.p.x) * 180,

                    detailSize: thisSize / 10,
                    strokeWidth: thisSize / 8,
                    strokeWidthRandomness: thisSize / 16,
                });
            }
        } else {
            p5.blendMode(p5.BLEND);
            this.strokeWidth = this.strokeWidth * p5.random(0.97, 1.03);
            if (this.strokeWidth > u(50)) this.strokeWidth *= 0.9;
            p5.strokeWeight(this.strokeWidth);

            let colors = p5.shuffle(this.colors);
            if (p5.random() > 0.8) {
                colors = colors.splice(0, 1);
            }

            brushstrokeLine({
                p5: p5,
                x: this.p.x,
                y: this.p.y,
                brushProps: {
                    brushStrokeWidth: this.strokeWidth,
                    stipplePositionRandomness: u(5),
                },
                brushType: "random",
                colors: colors,

                hueRandomness: 0.04,
                valueRandomness: 0.04,
                stippleSizeRandomness: 0.5,

                frameCount: p5.frameCount,
                directionAngle: angleFromVector(this.vector),
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
