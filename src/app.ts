import P5 from "p5";
import { LineAgent, RectangleStripAgent, TriangleStripAgent } from "./agents";
import noiseColor from "./assets/images/noise-color.png";
import noiseMono from "./assets/images/noise-mono.png";
import Palettes from "./assets/palettes";
import { hexToRgba, mapGradient, sr, sre, srExtra } from "./utils/common";
import { brushstrokePencil, brushstrokeRectangle } from "./utils/p5utils";
//import vanilla zustand store
import { store } from "./store";

const { canvasWidth, canvasHeight } = store.getState();

const unit = canvasWidth / 1000;
let deltaTime = 0;

export function u(x: number) {
    if (typeof x === "number") {
        return x * unit;
    } else {
        console.error("Error. u() only accepts numbers");
        return 0;
    }
}

const sketch = (p5: P5) => {
    let seed = Math.floor(Math.random() * 1000000000000000).toString();
    let newSeed = seed;

    let charA = parseInt(seed[0] + seed[1]);
    let charB = parseInt(seed[2] + seed[3]);
    let charC = parseInt(seed[4] + seed[5]);
    let charD = parseInt(seed[6] + seed[7]);
    let charE = parseInt(seed[8] + seed[9]);
    let charF = parseInt(seed[10] + seed[11]);
    let charG = parseInt(seed[12] + seed[13]);
    let charH = parseInt(seed[14] + seed[15]);

    let seedA = charA.toString();
    let seedB = charB.toString();
    let seedC = charC.toString();
    let seedD = charD.toString();
    let seedE = charE.toString();
    let seedF = charF.toString();
    let seedG = charG.toString();
    let seedH = charH.toString();

    let linesDirection: "down-right" | "up-right" =
        charA > 50 ? "down-right" : "up-right";
    let selectedPalette = Math.floor(Palettes.length * (charD / 100));

    let nLineAgents = 0;
    let nStripAgents = 9;
    let nTriangleAgents = 7;

    let lineAgents: LineAgent[] = [];
    let stripAgents: RectangleStripAgent[] = [];
    let triangleAgents: TriangleStripAgent[] = [];

    let rectanglesDrawn = false;

    function setupFromSeed() {
        charA = parseInt(seed[0] + seed[1]);
        charB = parseInt(seed[2] + seed[3]);
        charC = parseInt(seed[4] + seed[5]);
        charD = parseInt(seed[6] + seed[7]);
        charE = parseInt(seed[8] + seed[9]);
        charF = parseInt(seed[10] + seed[11]);
        charG = parseInt(seed[12] + seed[13]);
        charH = parseInt(seed[14] + seed[15]);

        seedA = charA.toString();
        seedB = charB.toString();
        seedC = charC.toString();
        seedD = charD.toString();
        seedE = charE.toString();
        seedF = charF.toString();
        seedG = charG.toString();
        seedH = charH.toString();

        const htmlseed = document.getElementById("info-seed");
        if (htmlseed) {
            htmlseed.innerHTML = seed;
        }

        const htmlnewseed = document.getElementById("new-seed");
        if (htmlnewseed) {
            if (!document.getElementById("new-seed-input")) {
                const newSeedInput = document.createElement("input");
                newSeedInput.id = "new-seed-input";
                newSeedInput.value = newSeed;

                newSeedInput.addEventListener("change", (e) => {
                    // @ts-ignore
                    if (e.target && e.target.value) {
                        // @ts-ignore
                        newSeed = e.target.value;
                    }
                });

                htmlnewseed.appendChild(newSeedInput);
            }
        }

        const htmlcolor = document.getElementById("info-color");
        if (htmlcolor) {
            const paletteName = Palettes[selectedPalette].name || "Unknown";
            htmlcolor.innerHTML = paletteName;
        }

        const htmlstyle = document.getElementById("info-style");
        if (htmlstyle) {
            const styleName = charC % 3 === 0 ? "straight" : "smooth";
            htmlstyle.innerHTML = styleName;
        }

        nLineAgents = 30 + Math.floor(charB / 1.6);
        console.log("line agents:", nLineAgents);
    }

    setupFromSeed();

    function removeAgent(agent: LineAgent) {
        lineAgents = lineAgents.filter((a) => a !== agent);
    }

    function removeStripAgent(agent: RectangleStripAgent) {
        stripAgents = stripAgents.filter((a) => a !== agent);
    }

    function removeTriangleAgent(agent: TriangleStripAgent) {
        triangleAgents = triangleAgents.filter((a) => a !== agent);
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

        function doSetup() {
            p5.loop();

            lineAgents = [];
            stripAgents = [];
            triangleAgents = [];

            rectanglesDrawn = false;

            p5.blendMode(p5.BLEND);

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

            const scale = 1;

            for (let i = 0; i < nLineAgents; i++) {
                let colors = (
                    i % 4 === 0
                        ? Palettes[selectedPalette].colorsA
                        : i % 4 === 1
                        ? Palettes[selectedPalette].colorsB
                        : i % 4 === 2
                        ? Palettes[selectedPalette].colorsC
                        : Palettes[selectedPalette].colorsD
                ).map((c) => p5.color(c.color));

                const x0 =
                    p5.width *
                    (0.3 -
                        0.45 *
                            srExtra(
                                i,
                                (p5.frameCount - deltaTime).toString() +
                                    i.toString()
                            ));
                const y0 =
                    linesDirection === "down-right"
                        ? p5.height * sre(i, seedE + i, -0.15, 0)
                        : p5.height * sre(i + 2, seedE + i, 1, 1.15);

                lineAgents.push(
                    new LineAgent({
                        p5: p5,
                        x0: x0,
                        y0: y0,
                        seed: (
                            srExtra(
                                2 * i,
                                seedA + (p5.frameCount - deltaTime) + i
                            ) * 10
                        ).toString(),
                        direction: 1,
                        linesDirection: linesDirection,
                        agentIndex: lineAgents.length,
                        colors: colors,
                        removeAgent: removeAgent,
                        mode: charC % 3 === 0 ? "straight" : "smooth",
                        scale: scale,
                        deltaTime: deltaTime,
                    })
                );
            }

            for (let i = 0; i < nStripAgents; i++) {
                const x = p5.width * sre(i, seedF + i, 0.03, 0.83);
                const count = Math.floor(sre(i + 3, seedF + i, 15, 60));
                const width = u(70) * sre(i + 4, seedF + i, 0.05, 1);

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

            for (let i = 0; i < nTriangleAgents; i++) {
                const x = p5.width * sre(i + 1, seedE + i, 0.03, 0.83);
                const count = Math.floor(sre(i + 2, seedE, 4, 14));
                const width = sre(i + 4, i + seedE, u(7), u(40));

                triangleAgents.push(
                    new TriangleStripAgent({
                        p5: p5,
                        x1: x,
                        y1: p5.height * sre(i + 3, seedF + i, -0.5, 0.5),

                        padding: sr(i, u(5), u(25)),
                        direction: "vertical",
                        triangleCount: count,
                        triangleProps: {
                            color: p5.color(
                                Palettes[selectedPalette].trianglesColor
                            ),
                            width: width,
                            rotation: Math.floor(sre(i, seedF + i, 2)) * 180,
                            trigPositionRandomness: u(1),
                            trigSizeRandomness: u(2),
                            trigPointRandomness: 0,
                        },

                        removeAgent: removeTriangleAgent,
                    })
                );
            }
        }

        doSetup();

        //create button to reset
        const resetButton = document.createElement("button");
        resetButton.id = "reset-button";
        resetButton.innerHTML = "Reset";
        resetButton.onclick = () => {
            setupFromSeed();
            doSetup();
        };

        const htmlnewseed = document.getElementById("new-seed");
        if (htmlnewseed) {
            if (!document.getElementById("new-seed-button")) {
                const newSeedButton = document.createElement("button");
                newSeedButton.id = "new-seed-button";
                newSeedButton.innerHTML = "Set seed";
                newSeedButton.addEventListener("click", () => {
                    seed = newSeed;
                    setupFromSeed();
                    doSetup();
                });

                htmlnewseed.appendChild(newSeedButton);
            }

            if (!document.getElementById("reset-button")) {
                htmlnewseed.appendChild(resetButton);
            }
        }
    };

    p5.draw = () => {
        deltaTime++;

        if (stripAgents.length === 0 && lineAgents.length === 0) {
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

            console.log("added noise final");

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
                const x1 =
                    srExtra(i, i.toString() + charE, 0.02, 0.98) * p5.width;
                const y1 =
                    srExtra(i + 1, i.toString() + charF, 0.02, 0.98) *
                    p5.height;

                brushstrokeRectangle({
                    p5: p5,
                    color: p5.color(
                        Palettes[selectedPalette].colorsB[
                            Math.floor(
                                sre(
                                    i + 6,
                                    i.toString() + charF,
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
                    x2: x1 + sre(i, i.toString() + charG, u(3), u(10)),
                    y2: y1 + sre(i + 3, i.toString() + charG, u(3), u(10)),
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
                const x1 = sr(i, 0.02, 0.98) * p5.width;
                const y1 = sr(i, 0.02, 0.98) * p5.height;

                brushstrokeRectangle({
                    p5: p5,
                    color: p5.color(Palettes[selectedPalette].accentDark),
                    x1: x1,
                    y1: y1,

                    x2: x1 + sre(i + 7, i.toString() + charG, u(10), u(45)),
                    y2: y1 + sre(i + 3, i.toString() + charG, u(1), u(3)),
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

                    brushSize: u(sre(charG, i, 0.1, 3)),
                    density: sre(charH, i, 0.4, 0.9),
                    stippleSize: u(0.4),
                    stipplePositionRandomness: u(8),
                    stippleSizeRandomness: 0,
                });
            }

            rectanglesDrawn = true;
        }

        if (rectanglesDrawn === true) {
            for (let i = 0; i < triangleAgents.length; i++) {
                triangleAgents[i].update();
            }
        }
    };

    // vector field function
    // the painting agents follow the flow defined
    // by this function
};

new P5(sketch);
