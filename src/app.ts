import P5 from "p5";
import { LineAgent, RectangleStripAgent } from "./agents";
import noiseColor from "./assets/images/noise-color.png";
import noiseMono from "./assets/images/noise-mono.png";
import Palettes from "./assets/palettes";
import { mapGradient, srExtra } from "./utils/common";
import { brushstrokePencil, brushstrokeRectangle } from "./utils/p5utils";
//import vanilla zustand store
import { store } from "./store";

const { canvasWidth, canvasHeight } = store.getState();

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
    const seed = Math.floor(Math.random() * 1000000000000000).toString();
    const htmlseed = document.getElementById("seed");
    if (htmlseed) {
        htmlseed.innerHTML = seed;
    }

    //set seed in store
    store.setState({ seed: seed });

    const charA = parseInt(seed[0] + seed[1]);
    const charB = parseInt(seed[2] + seed[3]);
    const charC = parseInt(seed[4] + seed[5]);
    const charD = parseInt(seed[6] + seed[7]);
    const charE = parseInt(seed[8] + seed[9]);
    const charF = parseInt(seed[10] + seed[11]);
    const charG = parseInt(seed[12] + seed[13]);
    const charH = parseInt(seed[14] + seed[15]);

    const linesDirection = charA > 50 ? "down-right" : "up-right";
    const selectedPalette = Math.floor(Palettes.length * (charD / 100));

    store.setState({ selectedPalette: selectedPalette });

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

    console.log("colors", colors);
    console.log("color1 ", colors[0].toString());

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

    var nLineAgents = 50 + Math.floor(charB / 2);
    var nStripAgents = 9;

    let lineAgents: LineAgent[] = [];
    let stripAgents: RectangleStripAgent[] = [];

    let rectanglesDrawn = false;

    function removeAgent(agent: LineAgent) {
        lineAgents = lineAgents.filter((a) => a !== agent);
    }

    function removeStripAgent(agent: RectangleStripAgent) {
        stripAgents = stripAgents.filter((a) => a !== agent);
    }

    let noiseImgColor: P5.Image;
    let noiseImgMono: P5.Image;
    p5.preload = () => {
        noiseImgColor = p5.loadImage(noiseColor);
        noiseImgMono = p5.loadImage(noiseMono);

        store.setState({ selectedPalette: selectedPalette });
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

        //blend mode
        p5.blendMode(p5.OVERLAY);

        //image opacity
        p5.tint(255, 0.2);

        //image
        for (let i = 0; i < p5.width; i += noiseImgMono.width) {
            for (let j = 0; j < p5.height; j += noiseImgMono.height) {
                p5.image(noiseImgMono, i, j);
            }
        }

        console.log("added noise setup");

        for (let i = 0; i < nLineAgents; i++) {
            let colors = (
                lineAgents.length % 4 === 0
                    ? Palettes[selectedPalette].colorsA
                    : lineAgents.length % 4 === 1
                    ? Palettes[selectedPalette].colorsB
                    : lineAgents.length % 4 === 2
                    ? Palettes[selectedPalette].colorsC
                    : Palettes[selectedPalette].colorsD
            ).map((c) => p5.color(c.color));

            // const x0 = p5.width * p5.random(-0.15, 0.3);
            const x0 =
                p5.width *
                (0.3 -
                    0.45 * srExtra(i, p5.frameCount.toString() + i.toString()));
            const y0 =
                linesDirection === "down-right"
                    ? p5.height * p5.random(-0.15, 0)
                    : p5.height * p5.random(1, 1.15);

            lineAgents.push(
                new LineAgent({
                    p5: p5,
                    x0: x0,
                    y0: y0,
                    seed: srExtra(
                        2 * i,
                        p5.frameCount.toString() + i.toString()
                    ).toString(),
                    direction: 1,
                    linesDirection: linesDirection,
                    agentIndex: lineAgents.length,
                    colors: colors,
                    removeAgent: removeAgent,
                    mode: charC % 3 === 0 ? "straight" : "smooth",
                })
            );
        }

        for (let i = 0; i < nStripAgents; i++) {
            const x = p5.width * p5.random(0.05, 0.8);
            const count = Math.floor(p5.random(15, 60));
            const width = u(70) * p5.random(0.05, 1);

            stripAgents.push(
                new RectangleStripAgent({
                    p5: p5,
                    x1: x,
                    y1: u(20),

                    x2: x + width,
                    y2: p5.height - u(20),
                    padding: u(17),
                    direction: "vertical",
                    rectangleCount: count,
                    rectangleProps: {
                        // color: p5.color("#ccb"),
                        color: p5.color(
                            Palettes[selectedPalette].stripLinesColor
                        ),
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
    };

    p5.draw = () => {
        if (
            p5.frameCount > 5000 ||
            (stripAgents.length === 0 && lineAgents.length === 0)
        ) {
            //blend mode
            p5.blendMode(p5.OVERLAY);

            //image opacity
            p5.tint(255, 0.12);

            //image
            for (let i = 0; i < p5.width; i += noiseImgMono.width) {
                for (let j = 0; j < p5.height; j += noiseImgMono.height) {
                    p5.image(noiseImgColor, i, j);
                }
            }

            console.log("added noise");

            p5.noLoop();
        }

        const sortedLineAgents = lineAgents.sort((a, b) => a.layer - b.layer);

        for (let i = 0; i < stripAgents.length; i++) {
            stripAgents[i].update();
        }

        if (stripAgents.length === 0) {
            for (let i = 0; i < sortedLineAgents.length; i++) {
                sortedLineAgents[i].update();
            }
        }

        if (stripAgents.length === 0 && rectanglesDrawn === false) {
            for (let i = 0; i < 50; i++) {
                const x1 = p5.random(0.02, 0.98) * p5.width;
                const y1 = p5.random(0.02, 0.98) * p5.height;

                brushstrokeRectangle({
                    p5: p5,
                    color: p5.color(
                        Palettes[selectedPalette].colorsB[
                            Math.floor(
                                p5.random(
                                    0,
                                    Palettes[selectedPalette].colorsB.length
                                )
                            )
                        ].color
                    ),
                    hueRandomness: 0.1,
                    valueRandomness: 0.1,
                    x1: x1,
                    y1: y1,
                    x2: x1 + p5.random(u(3), u(10)),
                    y2: y1 + p5.random(u(3), u(10)),
                    brushProps: {
                        brushType: "paintDrop",
                        brushPositionRandomness: u(1),
                        brushSizeRandomness: 0,

                        brushSize: u(3),
                        brushStippleSize: u(1),
                        stipplePositionRandomness: u(2),
                        stippleSizeRandomness: u(1),
                    },
                });
            }

            for (let i = 0; i < 10; i++) {
                const x1 = p5.random(0.02, 0.98) * p5.width;
                const y1 = p5.random(0.02, 0.98) * p5.height;

                brushstrokeRectangle({
                    p5: p5,
                    color: p5.color("#777777"),
                    x1: x1,
                    y1: y1,
                    x2: x1 + p5.random(u(10), u(45)),
                    y2: y1 + p5.random(u(1), u(3)),
                    brushProps: {
                        brushPositionRandomness: u(1),
                        brushSizeRandomness: 0,

                        brushSize: u(2),
                        brushStippleSize: u(0.5),
                        stipplePositionRandomness: u(6),
                        stippleSizeRandomness: u(1),
                    },
                });
            }

            for (let i = 0; i < 200; i++) {
                const x1 = p5.noise(i) * p5.width;
                const y1 = p5.noise(3 * i) * p5.height;

                brushstrokePencil({
                    p5: p5,
                    color: p5.color("#222222"),
                    x: x1,
                    y: y1,

                    brushSize: u(p5.random(0.1, 3)),
                    density: p5.random(0.4, 0.9),
                    stippleSize: u(0.4),
                    stipplePositionRandomness: u(8),
                    stippleSizeRandomness: 0,
                });
            }

            rectanglesDrawn = true;
        }
    };

    // vector field function
    // the painting agents follow the flow defined
    // by this function
};

new P5(sketch);
