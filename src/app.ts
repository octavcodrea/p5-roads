import P5 from "p5";
import seedrandom from "seedrandom";
import {
    calculatePointFromAngle,
    floorCeiling,
    mapGradient,
    sr,
    srExtra,
    srn,
} from "./utils/common";
import {
    angleFromVector,
    brushstrokeLine,
    brushstrokePencil,
    rectangleStrip,
} from "./utils/p5utils";
import Palettes from "./assets/palettes";
import noiseColor from "./assets/images/noise-color.png";

const sketch = (p5: P5) => {
    const canvasWidth = 1000;
    const canvasHeight = 1200;

    const unit = canvasWidth / 1000;

    function u(x: number) {
        if (typeof x === "number") {
            return x * unit;
        } else {
            console.error("Error. u() only accepts numbers");
            return 0;
        }
    }

    const seed = Math.random() * 1000000000000000;

    var colors = [
        "#5949c1",
        "#1593b2",
        "#1cba8d",
        "#feb30f",
        "#fbf26f",
        "#ffffff",
        "#4fd2de",
        "#0aa4f7",
    ].map((c) => p5.color(c));

    const gradient = mapGradient(
        colors.map((c) => {
            return {
                color: c.toString(),
                opacity: 1,
            };
        }),
        20,
        "hex"
    );

    var nAgents = 50;

    let agents: Agent[] = [];
    let selectedPalette = 0;

    let noiseImg: P5.Image;
    p5.preload = () => {
        noiseImg = p5.loadImage(noiseColor);
    };

    p5.setup = () => {
        p5.createCanvas(canvasWidth, canvasHeight);
        p5.colorMode(p5.HSB, 360, 100, 100);
        p5.noStroke();
        p5.strokeCap(p5.ROUND);
        p5.angleMode(p5.RADIANS);

        p5.background(
            p5.color(Palettes[selectedPalette].background).toString()
        );

        for (let i = 0; i < nAgents; i++) {
            agents.push(
                new Agent({
                    x0: p5.width * p5.random(-0.15, 0.3),
                    y0: p5.height * p5.random(-0.15, 0),
                    seed: p5.frameCount.toString() + i.toString(),
                    direction: 1,
                    agentIndex: agents.length,
                    colors: Palettes[selectedPalette].colors[
                        agents.length % 2 === 0 ? 0 : 1
                    ].map((c) => p5.color(c.color)),
                })
            );
        }

        //blend mode
        p5.blendMode(p5.OVERLAY);

        //image opacity
        p5.tint(255, 0.1);

        //image
        p5.image(noiseImg, 0, 0, p5.width, p5.height);
    };

    p5.draw = () => {
        if (p5.frameCount === 1) {
            for (let i = 0; i < 3; i++) {
                const x = p5.width * p5.random(0.2, 0.8);
                const count = Math.floor(p5.random(5, 25));
                const width = u(300) * p5.random(0.2, 1);

                rectangleStrip({
                    p5: p5,
                    x1: x,
                    y1: u(20),

                    x2: x + width,
                    y2: p5.height - u(20),
                    padding: u(20),
                    direction: "vertical",
                    rectangleCount: count,
                    rectangleProps: {
                        color: p5.color("#ccb"),
                        width: u(100),
                        height: u(50),

                        rectPositionRandomness: u(2),
                        rectSizeRandomness: 0,

                        brushPositionRandomness: u(1),
                        brushSizeRandomness: 0,

                        brushScale: u(10),
                        brushStippleSize: u(1),
                        brushStippleRandomness: u(2),
                    },
                });
            }
        }

        if (p5.frameCount > 5000) {
            p5.noLoop();
        }

        const sortedAgents = agents.sort((a, b) => a.layer - b.layer);

        // for (let i = 0; i < sortedAgents.length; i++) {
        //     sortedAgents[i].update();
        // }
    };

    // paintining agent

    class Agent {
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

        constructor(params: {
            x0: number;
            y0: number;
            seed: string;
            layer?: number;
            direction?: number;
            agentIndex?: number;
            colors?: P5.Color[];
        }) {
            const { x0, y0, seed, direction, agentIndex, colors, layer } =
                params;
            this.agentIndex = agentIndex ?? 0;
            this.p = p5.createVector(x0, y0);
            this.direction = direction ?? 1;
            this.colors = colors ?? [p5.color("#000")];
            this.scale = p5.random(1, 10);
            this.strokeWidth = u(13) + u(3) * p5.sin(p5.frameCount);
            this.seed = seed;
            this.colorIndex = Math.floor(sr(this.seed) * gradient.length);
            this.layer = 0;
            this.type = "default";

            this.pOld = p5.createVector(this.p.x, this.p.y);

            this.step = 1;

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
            const vector = vector_field(
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
                agents.splice(agents.indexOf(this), 1);
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
                p5.blendMode(p5.MULTIPLY);

                brushstrokePencil({
                    p5: p5,
                    x: this.p.x,
                    y: this.p.y,
                    brushSize: u(5),
                    color: p5.color("#888"),
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
                if ((p5.frameCount * 0.5) % 2 === 0) {
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

    // vector field function
    // the painting agents follow the flow defined
    // by this function

    function vector_field(
        x: number,
        y: number,
        myScale: number,
        seed?: string
    ) {
        x = p5.map(x, 0, p5.width, -myScale, myScale);
        y = p5.map(y, 0, p5.height, -myScale, myScale);

        const s = seed ?? "seed";

        let k1 = 2;
        let k2 = 3;

        let u =
            0.8 +
            p5.sin(srExtra(1, s) * 100 + p5.frameCount * 0.01 * srExtra(1, s)) *
                2 *
                srExtra(2, s) +
            (p5.noise(x, y) - 0.5) * 4;

        let v =
            1 +
            p5.cos(srExtra(2, s) * 100 + p5.frameCount * 0.04 * srExtra(3, s)) *
                0.8 *
                srExtra(4, s) +
            (p5.noise(x, y) - 0.5) * 4;

        // litle trick to move from left to right

        // if (u <= 0) {
        //     u = -u;
        // }

        return p5.createVector(u, v);
    }
};

new P5(sketch);
