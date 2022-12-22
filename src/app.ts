import P5 from "p5";
import seedrandom from "seedrandom";
import { floorCeiling, mapGradient, sr, srExtra, srn } from "./utils/common";
import { brushstrokePencil } from "./utils/p5utils";

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
    // "paint particles mixing" by garabatospr

    // color palette

    var colors = [
        "#863123",
        "#ff0000",
        "#fe6f10",
        "#feb30f",
        "#fbf26f",
        "#ffffff",
        "#4fd2de",
        "#0aa4f7",
    ];
    const gradient = mapGradient(
        colors.map((c) => {
            return {
                color: c,
                opacity: 1,
            };
        }),
        20,
        "hex"
    );

    // set weights for each color

    // red, blue, and white dominates

    var weights = [1, 2, 2, 2, 2];

    // scale of the vector field
    // smaller values => bigger structures
    // bigger values  ==> smaller structures

    // number of drawing agents

    var nAgents = 50;

    let border = 1;

    let agents: Agent[] = [];

    p5.setup = () => {
        //createCanvas(1080, 608);
        p5.createCanvas(canvasWidth, canvasHeight);
        p5.colorMode(p5.HSB, 360, 100, 100);
        p5.noStroke();
        p5.strokeCap(p5.ROUND);
        p5.angleMode(p5.RADIANS);

        p5.background(0, 0, 0);

        for (let i = 0; i < nAgents; i++) {
            agents.push(
                new Agent(
                    p5.width * p5.random(-0.15, 0.3),
                    p5.height * p5.random(-0.15, 0),
                    p5.random(0, 100).toString(),
                    1
                )
            );
            //agent.push(new Agent(width*0.40));
            //agent.push(new Agent(width*0.3));
        }
    };

    p5.draw = () => {
        if (p5.frameCount > 5000) {
            p5.noLoop();
        }

        for (let i = 0; i < agents.length; i++) {
            agents[i].update();
        }

        // p5.stroke(0, 0, 100);

        // p5.noFill();
    };

    // select random colors with weights from palette

    function myRandom(colors: string[], weights: number[]) {
        let sum = 0;

        for (let i = 0; i < colors.length; i++) {
            sum += weights[i];
        }

        let rr = p5.random(0, sum);

        for (let j = 0; j < weights.length; j++) {
            if (weights[j] >= rr) {
                return colors[j];
            }
            rr -= weights[j];
        }

        return colors[colors.length - 1];
    }

    // paintining agent

    class Agent {
        p: P5.Vector;
        direction: number;
        color: P5.Color | string;
        scale: number;
        strokeWidth: number;

        pOld: P5.Vector;
        step: number;
        seed: string;
        colorIndex: number;

        constructor(x0: number, y0: number, seed: string, direction?: number) {
            this.p = p5.createVector(x0, y0);
            this.direction = direction ?? 1;
            this.color = colors[Math.floor(colors.length * p5.random(0, 1))];
            this.scale = p5.random(1, 10);
            this.strokeWidth = u(10) + u(1) * p5.sin(p5.frameCount);
            this.seed = seed;
            this.colorIndex = Math.floor(sr(this.seed) * gradient.length);

            this.pOld = p5.createVector(this.p.x, this.p.y);

            this.step = 1;
        }

        update() {
            this.p.x +=
                this.direction *
                vector_field(this.p.x, this.p.y, this.scale, this.seed).x *
                this.step;
            this.p.y +=
                this.direction *
                vector_field(this.p.x, this.p.y, this.scale, this.seed).y *
                this.step;

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

            this.strokeWidth = this.strokeWidth * p5.random(0.97, 1.03);
            p5.strokeWeight(this.strokeWidth);
            // p5.stroke(gradient[Math.floor(this.colorIndex)] ?? gradient[0]);
            // p5.stroke(this.color as P5.Color);
            brushstrokePencil({
                p5: p5,
                x: this.p.x,
                y: this.p.y,
                brushSize: this.strokeWidth,
                color: this.color as P5.Color,
                // density: p5.random(0.01, 0.8),
                density: 0.8,
                stippleSize: u(2),
                stipplePositionRandomness: u(1),
                stippleSizeRandomness: u(3),
            });
            p5.line(this.pOld.x, this.pOld.y, this.p.x, this.p.y);

            this.pOld.set(this.p);

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

    function generateColor(scale: number) {
        let temp = myRandom(colors, weights);

        const myColor = p5.color(
            p5.hue(temp) + p5.randomGaussian() * scale,
            p5.saturation(temp) + p5.randomGaussian() * scale,
            p5.brightness(temp) - scale,
            p5.random(1, 100)
        );

        return myColor;
    }
};

new P5(sketch);
