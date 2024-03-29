import P5 from "p5";
import seedrandom from "seedrandom";

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

    var colors = ["#ff0000", "#feb30f", "#0aa4f7", "#000000", "#ffffff"];

    // set weights for each color

    // red, blue, and white dominates

    var weights = [1, 2, 2, 2, 2];

    // scale of the vector field
    // smaller values => bigger structures
    // bigger values  ==> smaller structures

    // number of drawing agents

    var nAgents = 10;

    let border = 100;

    let agents: Agent[] = [];

    p5.setup = () => {
        //createCanvas(1080, 608);
        p5.createCanvas(canvasWidth, canvasHeight);
        p5.colorMode(p5.HSB, 360, 100, 100);
        p5.strokeCap(p5.SQUARE);

        p5.background(0, 0, 0);

        for (let i = 0; i < nAgents; i++) {
            agents.push(
                new Agent(
                    p5.width * 0.5,
                    p5.height * 0.5 + p5.random(-1, 1) * p5.height * 0.5,
                    p5.random(0, 100).toString()
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

        p5.stroke(0, 0, 100);

        p5.noFill();
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
        color: P5.Color;
        scale: number;
        strokeWidth: number;

        pOld: P5.Vector;
        step: number;
        seed: string;

        constructor(x0: number, y0: number, seed: string) {
            if (p5.random(0, 1) > 0.5) {
                this.p = p5.createVector(x0, y0);
                this.direction = 1;
                this.color = generateColor(10);
                this.scale = 5;
                this.strokeWidth = 5 + 5 * p5.sin(p5.frameCount);
                this.seed = seed;
            } else {
                this.p = p5.createVector(
                    x0,
                    p5.height * 0.5 + p5.randomGaussian() * 30
                );
                this.direction = -1;
                this.color = generateColor(10);
                this.scale = 5;
                this.seed = seed;
                this.strokeWidth =
                    5 + 5 * p5.sin(p5.frameCount) * seedrandom(this.seed)();
            }

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
                this.p.x >= p5.width ||
                this.p.x <= 0 ||
                this.p.y <= 0 ||
                this.p.y >= p5.height
            ) {
                this.step = 0;
                //destroy agent
                agents.splice(agents.indexOf(this), 1);
            }

            if (this.p.y < border || this.p.y > p5.height - border) {
                this.direction *= -p5.random(0.9, 1.1);
            }

            p5.strokeWeight(this.strokeWidth);
            p5.stroke(this.color);
            p5.line(this.pOld.x, this.pOld.y, this.p.x, this.p.y);

            this.pOld.set(this.p);

            if (
                this.step !== 0 &&
                p5.frameCount % Math.floor(200 * seedrandom(this.seed)()) ===
                    0 &&
                p5.random(0, 1) > 0.5 &&
                agents.length < 300
            ) {
                this.step = 0;
                //destroy agent
                agents.splice(agents.indexOf(this), 1);

                agents.push(
                    new Agent(
                        this.p.x,
                        this.p.y,
                        this.p.x.toString() + this.p.y
                    )
                );
                agents.push(
                    new Agent(
                        this.p.x,
                        this.p.y,
                        this.p.y.toString() + this.p.x
                    )
                );

                console.log(
                    "agents: ",
                    agents.length,
                    "framecount: ",
                    p5.frameCount
                );
            }
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

        let k1 = 5;
        let k2 = 3;

        let u =
            p5.sin(k1 * y * seedrandom(s)()) +
            p5.cos(k2 * y * seedrandom(s)()) +
            p5.map(p5.noise(x, y), 0, 1, -1, 1);
        let v =
            p5.sin(k2 * x * seedrandom(s)()) -
            p5.cos(k1 * x * seedrandom(s)()) +
            p5.map(p5.noise(x, y), 0, 1, -1, 1);

        // litle trick to move from left to right

        if (u <= 0) {
            u = -u;
        }

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
