import P5 from "p5";
import { LineAgent, RectangleStripAgent } from "./agents";
import noiseColor from "./assets/images/noise-color.png";
import Palettes from "./assets/palettes";
import { mapGradient } from "./utils/common";

const canvasWidth = 1000;
const canvasHeight = 1200;
const unit = canvasWidth / 1000;

export function u(x: number) {
    if (typeof x === "number") {
        return x * unit;
    } else {
        console.error("Error. u() only accepts numbers");
        return 0;
    }
}

const sketch = (p5: P5) => {
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

    let lineAgents: LineAgent[] = [];
    let stripAgents: RectangleStripAgent[] = [];
    let selectedPalette = 0;

    function removeAgent(agent: LineAgent) {
        lineAgents = lineAgents.filter((a) => a !== agent);
    }

    function removeStripAgent(agent: RectangleStripAgent) {
        stripAgents = stripAgents.filter((a) => a !== agent);
    }

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
            lineAgents.push(
                new LineAgent({
                    p5: p5,
                    x0: p5.width * p5.random(-0.15, 0.3),
                    y0: p5.height * p5.random(-0.15, 0),
                    seed: p5.frameCount.toString() + i.toString(),
                    direction: 1,
                    agentIndex: lineAgents.length,
                    colors: Palettes[selectedPalette].colors[
                        lineAgents.length % 2 === 0 ? 0 : 1
                    ].map((c) => p5.color(c.color)),
                    removeAgent: removeAgent,
                })
            );
        }

        for (let i = 0; i < 3; i++) {
            const x = p5.width * p5.random(0.2, 0.8);
            const count = Math.floor(p5.random(9, 25));
            const width = u(300) * p5.random(0.2, 1);

            stripAgents.push(
                new RectangleStripAgent({
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

                    removeAgent: removeStripAgent,
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
        if (p5.frameCount > 5000) {
            p5.noLoop();
        }

        const sortedAgents = lineAgents.sort((a, b) => a.layer - b.layer);

        for (let i = 0; i < stripAgents.length; i++) {
            stripAgents[i].update();
        }

        for (let i = 0; i < sortedAgents.length; i++) {
            sortedAgents[i].update();
        }
    };

    // vector field function
    // the painting agents follow the flow defined
    // by this function
};

new P5(sketch);
