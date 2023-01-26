import P5 from "p5";
import { u } from "../app";
import {
    addHSVToRGBACode,
    calculate3DDistance,
    calculatePointFromAngle,
    hexToRgb,
    hsvToRgb,
    rgbToHsv,
    sr,
    srExtra,
    srn,
    srnExtra,
} from "./common";

export const paintDrop = (params: {
    p5: P5;
    x: number;
    y: number;

    color: P5.Color;
    brushSize: number;

    mode?: P5.BLEND_MODE;

    steps?: number;
    sides?: number;
    variance?: number;
    opacity?: number;
}) => {
    const { p5, x, y, brushSize, sides, variance, opacity, mode } = params;
    const sidesToUse = sides || 24;
    const varianceToUse = variance || 0.5;
    const opacityToUse = opacity && opacity >= 0 && opacity <= 1 ? opacity : 1;
    const stepsToUse = params.steps || 24;

    const angleStep = 6.28 / sidesToUse;

    let colorToUse = params.color;
    const opacityStep = opacityToUse * (1 / stepsToUse);
    // console.log("muie:", opacityStep);

    colorToUse.setAlpha(opacityStep);

    // console.log("lalala:", colorToUse);

    for (let j = 0; j < stepsToUse; j++) {
        p5.blendMode(mode || p5.BLEND);
        p5.fill(colorToUse);

        p5.beginShape();
        for (let i = 0; i < sidesToUse; i++) {
            const angle = i * angleStep;
            const rand = srnExtra(x + y, i.toString() + p5.frameCount);
            const distance = brushSize * (1 + rand * varianceToUse);
            const point = calculatePointFromAngle({
                angle: angle,
                distance: distance,
                mode: "radians",
                originX: x,
                originY: y,
            });
            p5.vertex(point.x, point.y);
        }
        p5.endShape(p5.CLOSE);
    }
};

export function brushstrokePencil(params: {
    p5: P5;
    x: number;
    y: number;
    brushSize: number;
    stippleSize: number;
    density: number;
    color: P5.Color;

    hueRandomness?: number;
    valueRandomness?: number;

    stipplePositionRandomness?: number;
    stippleSizeRandomness?: number;
}) {
    const {
        p5,
        x,
        y,
        brushSize,
        stippleSize,
        density,
        color,
        stipplePositionRandomness,
        stippleSizeRandomness,
    } = params;
    const d = Math.min(density, 1);
    const stippleRows = Math.max(2, Math.ceil((brushSize / stippleSize) * d));

    for (let i = 0; i < stippleRows / 2; i++) {
        const stipplesInRow = Math.floor(2 * Math.PI * i);
        const angleStep = 6.28 / stipplesInRow;

        let h =
            params.hueRandomness === 0 || params.hueRandomness === undefined
                ? 0
                : srnExtra(x + y, x.toString() + i) * params.hueRandomness;
        let v =
            params.valueRandomness === 0 || params.valueRandomness === undefined
                ? 0
                : srnExtra(x + y, x.toString() + i) * params.valueRandomness;

        const c =
            h === 0 && v === 0
                ? color
                : p5.color(addHSVToRGBACode(color.toString(), h, 0, v));

        for (let j = 0; j < stipplesInRow; j++) {
            if (sr(i.toString() + j.toString() + p5.frameCount) > density)
                continue;
            const randX =
                stipplePositionRandomness !== undefined
                    ? stipplePositionRandomness *
                      srnExtra(x + j, x.toString() + i + j + p5.frameCount)
                    : 0;

            const randY =
                stipplePositionRandomness !== undefined
                    ? stipplePositionRandomness *
                      srnExtra(y + j, y.toString() + i + j + p5.frameCount)
                    : 0;

            const randSize =
                stippleSizeRandomness !== undefined
                    ? stippleSizeRandomness *
                      srnExtra(x + j, i.toString() + j + p5.frameCount)
                    : 0;

            const stippleX =
                x + i * stippleSize * Math.cos(j * angleStep) + randX;

            const stippleY =
                y + i * stippleSize * Math.sin(j * angleStep) + randY;

            const thisStippleSize = stippleSize + randSize;

            p5.fill(c);
            p5.noStroke();
            // p5.ellipse(stippleX, stippleY, thisStippleSize, thisStippleSize);
            polygon({
                p5: p5,
                x: stippleX,
                y: stippleY,
                radius: thisStippleSize,
                color: c,
                sides: 8,
                fill: true,
                stroke: false,
                randomness: thisStippleSize / 4,
            });
        }
    }

    if (sr(p5.frameCount) > density) {
        let newX = x;
        let newY = y;

        if (stipplePositionRandomness !== undefined) {
            const randX = srnExtra(x, x.toString() + p5.frameCount);
            const randY = srnExtra(y, y.toString() + p5.frameCount);
            newX += stipplePositionRandomness * randX;
            newY += stipplePositionRandomness * randY;
        }

        p5.ellipse(newX, newY, stippleSize, stippleSize);
    }
}

export type BrushProps = {
    brushSize: number;
    brushStippleSize: number;
    stipplePositionRandomness?: number;
    stippleSizeRandomness?: number;
};

export function brushstrokeArea(brushParams: {
    p5: P5;
    x: number;
    y: number;
    brushType: "pencil";
    brushAreaSize: number;
    color: P5.Color;
    frameCount: number;
    directionAngle?: number;
    brushProps: BrushProps;
}) {
    let {
        p5,
        x,
        y,
        brushType,
        brushAreaSize,
        color,
        frameCount,
        directionAngle,
    } = brushParams;
    let {
        brushSize,
        brushStippleSize,
        stipplePositionRandomness,
        stippleSizeRandomness,
    } = brushParams.brushProps;

    let angle = directionAngle || 0;
    let xVel = 0;
    let yVel = 0;

    const xPos = x + Math.sin(frameCount / 10 + angle) * brushAreaSize;
    const yPos = y + Math.cos(frameCount / 10 + angle) * brushAreaSize;

    switch (brushType) {
        case "pencil":
            brushstrokePencil({
                p5: p5,
                x: xPos,
                y: yPos,
                brushSize: brushSize,
                stippleSize: brushStippleSize,
                density: 1,
                color: color,
                stipplePositionRandomness: stipplePositionRandomness,
                stippleSizeRandomness: stippleSizeRandomness,
            });
            break;
    }
}

export function brushstrokeLine(brushParams: {
    p5: P5;
    x: number;
    y: number;
    brushType: "random";
    colors: P5.Color[];

    frameCount: number;
    brushProps: {
        brushStrokeWidth: number;
        stipplePositionRandomness?: number;
        stippleScale?: number;
    };

    hueRandomness?: number;
    valueRandomness?: number;
    stippleSizeRandomness?: number;

    drip?: number;
    directionAngle?: number;
}) {
    let {
        p5,
        x,
        y,
        brushType,
        colors,
        frameCount,
        directionAngle,
        drip,
        hueRandomness,
        valueRandomness,
        stippleSizeRandomness,
    } = brushParams;

    let { brushStrokeWidth, stipplePositionRandomness, stippleScale } =
        brushParams.brushProps;

    let angle = directionAngle ?? 0;
    const steps = Math.min(10, brushStrokeWidth / u(2) / (stippleScale ?? 1));

    const pStart = calculatePointFromAngle({
        originX: x,
        originY: y,
        angle: angle - p5.PI / 2,
        distance: brushStrokeWidth / 2,
        mode: "radians",
    });

    const pEnd = calculatePointFromAngle({
        originX: x,
        originY: y,
        angle: angle + p5.PI / 2,
        distance: brushStrokeWidth / 2,
        mode: "radians",
    });

    switch (brushType) {
        case "random":
            p5.strokeWeight(brushStrokeWidth / steps);
            for (let i = 1; i < steps; i++) {
                const xStart =
                    (pStart.x * (steps - i)) / steps + (pEnd.x * i) / steps;

                const yStart =
                    (pStart.y * (steps - i)) / steps + (pEnd.y * i) / steps;

                const xEnd =
                    (pStart.x * (steps - i - 1)) / steps +
                    (pEnd.x * (i + 1)) / steps;
                const yEnd =
                    (pStart.y * (steps - i - 1)) / steps +
                    (pEnd.y * (i + 1)) / steps;

                let h =
                    hueRandomness === 0 || hueRandomness === undefined
                        ? 0
                        : srnExtra(x + y, x.toString() + i) * hueRandomness;
                let v =
                    valueRandomness === 0 || valueRandomness === undefined
                        ? 0
                        : srnExtra(x + y, x.toString() + i) * valueRandomness;

                let selectedColor =
                    colors[
                        Math.floor(
                            sr(i.toString() + frameCount + i) * colors.length
                        )
                    ];

                let c =
                    h === 0 && v === 0
                        ? selectedColor
                        : p5.color(
                              addHSVToRGBACode(
                                  selectedColor.toString(),
                                  h,
                                  0,
                                  v
                              )
                          );
                p5.blendMode(p5.BLEND);

                p5.stroke(c);

                if (stipplePositionRandomness !== undefined) {
                    const randX = srnExtra(x, x.toString() + p5.frameCount + i);
                    const randY = srnExtra(y, y.toString() + p5.frameCount + i);

                    p5.line(
                        xStart + randX,
                        yStart + randY,
                        xEnd + randX,
                        yEnd + randY
                    );

                    if (drip !== undefined) {
                        if (
                            sr(drip.toString() + randX + randY + frameCount) >
                            0.99
                        ) {
                            const offsetX =
                                srnExtra(x, x.toString() + p5.frameCount + i) *
                                brushStrokeWidth;

                            const offsetY =
                                srnExtra(y, y.toString() + p5.frameCount + i) *
                                brushStrokeWidth;

                            p5.line(
                                xStart + offsetX,
                                yStart + offsetY,
                                xEnd + offsetX,
                                yEnd + offsetY
                            );
                        }
                    } else {
                        p5.line(xStart, yStart, xEnd, yEnd);
                    }

                    if (stippleSizeRandomness !== undefined) {
                        p5.strokeWeight(
                            (brushStrokeWidth / steps) *
                                (1 +
                                    srnExtra(
                                        x,
                                        x.toString() + p5.frameCount + i
                                    ) *
                                        stippleSizeRandomness)
                        );
                    }
                }
            }

            break;
    }
}

export const angleFromVector = (vector: { x: number; y: number }) => {
    return Math.atan2(vector.y, vector.x);
};

export const brushstrokeRectangle = (params: {
    p5: P5;
    x1: number;
    y1: number;
    x2: number;
    y2: number;

    color: P5.Color;
    hueRandomness?: number;
    valueRandomness?: number;

    blendMode?: P5.BLEND_MODE;

    brushProps?: BrushProps & {
        brushType?: "pencil" | "paintDrop";
        brushPositionRandomness?: number;
        brushSizeRandomness?: number;
    };
}) => {
    const {
        p5,
        x1,
        y1,
        x2,
        y2,
        color,
        hueRandomness,
        valueRandomness,
        blendMode,
    } = params;
    const {
        brushSize,
        brushStippleSize,
        stipplePositionRandomness,
        stippleSizeRandomness,
    } = params.brushProps ?? {};

    const xStart = Math.min(x1, x2);
    const xEnd = Math.max(x1, x2);

    const yStart = Math.min(y1, y2);
    const yEnd = Math.max(y1, y2);

    let height = yEnd - yStart;
    let width = xEnd - xStart;

    let brushSizeRandomness =
        params.brushProps?.brushSizeRandomness !== undefined
            ? params.brushProps?.brushSizeRandomness
            : 0;

    let brushPositionRandomness =
        params.brushProps?.brushPositionRandomness !== undefined
            ? params.brushProps?.brushPositionRandomness
            : 0;

    let bSize = brushSize ?? Math.floor(height / 5);

    let bStippleSize = brushStippleSize ?? Math.floor(bSize / 5);

    let bStipplePositionRandomness =
        stipplePositionRandomness !== undefined
            ? stipplePositionRandomness
            : 0.5;
    let bStippleSizeRandomness =
        stippleSizeRandomness !== undefined ? stippleSizeRandomness : 0.5;

    const brushRows = Math.floor(Math.max(height / bSize, 1));
    const brushColumns = Math.floor(Math.max(width / bSize, 1));

    for (let i = 0; i < brushRows * 2; i++) {
        for (let j = 0; j < brushColumns * 2; j++) {
            p5.blendMode(p5.BLEND);
            p5.noStroke();

            const randX =
                brushPositionRandomness !== 0
                    ? srnExtra(x1, x1.toString() + i + j) *
                      brushPositionRandomness
                    : 0;
            const randY =
                brushPositionRandomness !== 0
                    ? srnExtra(y1, y1.toString() + i + j) *
                      brushPositionRandomness
                    : 0;

            switch (params.brushProps?.brushType) {
                case "pencil":
                default:
                    brushstrokePencil({
                        p5: p5,
                        x: xStart + (j * bSize) / 2 + randX,
                        y: yStart + (i * bSize) / 2 + randY,
                        brushSize: bSize,
                        color: color,

                        hueRandomness: hueRandomness,
                        valueRandomness: valueRandomness,

                        stippleSize: bStippleSize,
                        stipplePositionRandomness: bStipplePositionRandomness,
                        stippleSizeRandomness: bStippleSizeRandomness,
                        density: 1,
                    });
                    break;

                case "paintDrop":
                    paintDrop({
                        p5: p5,
                        x: xStart + (j * bSize) / 2 + randX,
                        y: yStart + (i * bSize) / 2 + randY,
                        brushSize: bSize,
                        color: color,

                        mode: blendMode,

                        opacity: 0.2,
                        sides: 24,
                        steps: 24,
                        variance: 0.5,
                    });
                    break;
            }
        }
    }
};

export const linesRectangle = (params: {
    p5: P5;
    x1: number;
    y1: number;
    x2: number;
    y2: number;

    color: P5.Color;
    hueRandomness?: number;
    valueRandomness?: number;

    blendMode?: P5.BLEND_MODE;

    lineProps: {
        lineWeight?: number;
        density?: number;
        positionRandomness?: number;
    };
}) => {
    const {
        p5,
        x1,
        y1,
        x2,
        y2,
        color,
        hueRandomness,
        valueRandomness,
        blendMode,
    } = params;
    const { lineWeight, density, positionRandomness } = params.lineProps ?? {};

    const xStart = Math.min(x1, x2);
    const xEnd = Math.max(x1, x2);

    const yStart = Math.min(y1, y2);
    const yEnd = Math.max(y1, y2);

    let height = yEnd - yStart;
    let width = xEnd - xStart;

    const randHeight = (positionRandomness ?? 0) * height;
    const randWidth = (positionRandomness ?? 0) * width;

    let lWeight = lineWeight ?? Math.round(height / 100);
    let lDensity = density ?? 0.5;

    let lineCount = Math.floor(
        Math.max(((height * width) / 10 / lWeight) * lDensity, 25)
    );

    p5.blendMode(blendMode ?? p5.BLEND);
    p5.strokeWeight(lWeight);
    p5.beginShape();

    for (let i = 0; i < lineCount; i++) {
        const targetSide = Math.floor(4 * srExtra(i, xStart.toString() + i));

        let randX1 =
            srExtra(xStart + i, xStart.toString() + i + yStart) * width;
        let randY1 = srExtra(xEnd + i, xEnd.toString() + i + yEnd) * height;

        let randX2 =
            srExtra(yStart + i + 1, yEnd.toString() + (i + 1) + xStart) * width;
        let randY2 =
            srExtra(yEnd + 1, yStart.toString() + (i + 1) + xEnd) * height;

        const rheight = srnExtra(i, i) * randHeight;
        const rwidth = srnExtra(i, i) * randWidth;

        switch (targetSide) {
            case 0:
            default:
                randX1 = 0 + rwidth;
                break;
            case 1:
                randY1 = 0 + rheight;
                break;
            case 2:
                randX1 = width + rwidth;
                break;
            case 3:
                randY1 = height + rheight;
                break;
        }

        // switch (targetSide) {
        //     case 0:
        //     default:
        //         p5.line(xStart, yStart + randY1, xEnd, yStart + randY2);
        //         break;

        //     case 1:
        //         p5.line(xStart + randX1, yStart, xStart + randX2, yEnd);
        //         break;
        // }

        p5.line(
            xStart + randX1,
            yStart + randY1,
            xStart + randX2,
            yStart + randY2
        );

        p5.stroke(color);
    }

    p5.endShape();
};

export const rectangleStrip = (params: {
    p5: P5;
    x1: number;
    y1: number;
    rectangleCount: number;
    padding: number;
    direction: "horizontal" | "vertical";

    rectangleProps: {
        color: P5.Color;
        width: number;
        height: number;
        rectPositionRandomness?: number;
        rectSizeRandomness?: number;

        brushPositionRandomness?: number;
        brushSizeRandomness?: number;

        brushScale?: number;
        brushStippleSize?: number;
        brushStippleRandomness?: number;
    };

    x2?: number;
    y2?: number;
}) => {
    const {
        p5,
        x1,
        y1,
        rectangleCount,
        padding,
        x2,
        y2,
        direction = "horizontal",
    } = params;
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
    } = params.rectangleProps;

    const yStart = Math.min(y1, y2 ?? 0);
    const yEnd = Math.max(y1, y2 ?? 0);

    const xStart = Math.min(x1, x2 ?? 0);
    const xEnd = Math.max(x1, x2 ?? 0);

    const randSize =
        rectSizeRandomness !== undefined ? srn(x1) * rectSizeRandomness : 0;

    if (x2 !== undefined && y2 !== undefined) {
        const rectHeight =
            direction === "vertical"
                ? (yEnd - yStart - padding * rectangleCount) / rectangleCount
                : yEnd - yStart;
        const rectWidth =
            direction === "horizontal"
                ? (xEnd - xStart - padding * rectangleCount) / rectangleCount
                : xEnd - xStart;

        for (let i = 0; i < rectangleCount; i++) {
            const randX =
                rectPositionRandomness !== undefined
                    ? Math.floor(
                          srn(x1.toString() + i) * rectPositionRandomness
                      )
                    : 0;
            const randY =
                rectPositionRandomness !== undefined
                    ? Math.floor(
                          srn(y1.toString() + i) * rectPositionRandomness
                      )
                    : 0;

            const x = x1 + randX;
            const y =
                p5.map(i, 0, rectangleCount - 1, yStart, yEnd - rectHeight) +
                randY;

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
        }
    } else {
        for (let i = 0; i < rectangleCount; i++) {
            const randX =
                rectPositionRandomness !== undefined
                    ? Math.floor(
                          srn(x1.toString() + i) * rectPositionRandomness
                      )
                    : 0;
            const randY =
                rectPositionRandomness !== undefined
                    ? Math.floor(
                          srn(y1.toString() + i) * rectPositionRandomness
                      )
                    : 0;

            const x =
                x1 +
                (direction === "horizontal" ? i * (width + padding) : 0) +
                randX;
            const y =
                y1 +
                (direction === "vertical" ? i * (height + padding) : 0) +
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
        }
    }
};

// const rectangleStripGrid = (params: {

export function vector_field(
    p5: P5,
    x: number,
    y: number,
    myScale: number,
    direction: "down-right" | "up-right",
    seed?: string,
    frameCount?: number
) {
    x = p5.map(x, 0, p5.width, -myScale, myScale);
    y = p5.map(y, 0, p5.height, -myScale, myScale);

    const unit = u(1);

    const s = seed ?? "seed";
    const fc = frameCount ?? p5.frameCount;

    let k1 = 2;
    let k2 = 3;

    let vectorX =
        0.8 +
        p5.sin(srExtra(1, s) * 100 + fc * 0.01 * srExtra(1, s)) *
            2 *
            srExtra(2, s) +
        (p5.noise(x, y) - 0.5) * 4;

    let vectorY =
        (direction === "down-right" ? 1 : -1) +
        p5.cos(srExtra(2, s) * 100 + fc * 0.04 * srExtra(3, s)) *
            0.8 *
            srExtra(4, s) +
        (p5.noise(x, y) - 0.5) * 4;

    // litle trick to move from left to right

    // if (u <= 0) {
    //     u = -u;
    // }

    return p5.createVector(vectorX * unit, vectorY * unit);
}

export const getVectorIntensity = (vector: P5.Vector) => {
    return Math.sqrt(vector.x ** 2 + vector.y ** 2);
};

// export const polygonFromLine = (params: {
//     p5: P5;
//     x1: number;
//     y1: number;
//     x2: number;
//     y2: number;
//     width: number;
//     color: string;
//     sides?: number;
//     steps?: number;
//     randomness?: number;
// }) => {
//     const {
//         p5,
//         x1,
//         y1,
//         x2,
//         y2,
//         width,
//         color,
//         sides = 3,
//         steps = 10,
//         randomness = 0,
//     } = params;

// }

export const polygon = (params: {
    p5: P5;
    x: number;
    y: number;
    radius: number;
    sides: number;
    color: P5.Color;
    fill: boolean;
    stroke: boolean;
    rotationInDeg?: number;
    randomness?: number;
}) => {
    const { p5, x, y, radius, sides, color, rotationInDeg, randomness } =
        params;

    p5.push();

    p5.translate(x, y);
    p5.angleMode(p5.DEGREES);
    p5.rotate(rotationInDeg ?? 0);
    p5.angleMode(p5.RADIANS);

    if (params.stroke) {
        p5.stroke(color);
    } else {
        p5.noStroke();
    }

    if (params.fill) {
        p5.fill(color);
    } else {
        p5.noFill();
    }

    p5.beginShape();

    for (let i = 0; i < sides; i++) {
        const angle = p5.map(i, 0, sides, 0, p5.TWO_PI);

        const randX =
            randomness !== undefined
                ? srn(x.toString() + i + y) * randomness
                : 0;
        const randY =
            randomness !== undefined
                ? srn(i + y.toString() + x) * randomness
                : 0;

        const sx = Math.floor((radius / 2) * p5.cos(angle) + randX);
        const sy = Math.floor((radius / 2) * p5.sin(angle) + randY);

        p5.vertex(sx, sy);
    }

    p5.endShape(p5.CLOSE);

    p5.pop();
};

export const polygonRough = (params: {
    p5: P5;
    x: number;
    y: number;
    radius: number;
    sides: number;
    color: P5.Color;
    fill: boolean;

    strokeWidth: number;
    strokeWidthRandomness: number;
    detailSize: number;

    rotationInDeg?: number;
    randomness?: number;
}) => {
    const {
        p5,
        x,
        y,
        radius,
        sides,
        color,
        rotationInDeg,
        randomness,
        strokeWidth,
        strokeWidthRandomness,
        detailSize,
    } = params;

    p5.push();

    p5.translate(x, y);
    p5.angleMode(p5.DEGREES);
    p5.rotate(rotationInDeg ?? 0);
    p5.angleMode(p5.RADIANS);

    p5.stroke(color);

    if (params.fill) {
        p5.fill(color);
    } else {
        p5.noFill();
    }

    p5.beginShape();

    for (let i = 0; i < sides; i++) {
        const angle1 = p5.map(i - 1, 0, sides, 0, p5.TWO_PI);
        const angle2 = p5.map(i, 0, sides, 0, p5.TWO_PI);

        const randX1 =
            randomness !== undefined
                ? srn(x.toString() + (i - 1) + y) * randomness
                : 0;
        const randY1 =
            randomness !== undefined
                ? srn(i - 1 + y.toString() + x) * randomness
                : 0;

        const randX2 =
            randomness !== undefined
                ? srn(x.toString() + i + y) * randomness
                : 0;
        const randY2 =
            randomness !== undefined
                ? srn(i + y.toString() + x) * randomness
                : 0;

        const sx1 = Math.floor((radius / 2) * p5.cos(angle1) + randX1);
        const sy1 = Math.floor((radius / 2) * p5.sin(angle1) + randY1);

        const sx2 = Math.floor((radius / 2) * p5.cos(angle2) + randX2);
        const sy2 = Math.floor((radius / 2) * p5.sin(angle2) + randY2);

        p5.vertex(sx2, sy2);

        const numberOfLines = Math.round(
            calculate3DDistance(sx1, sy1, 0, sx2, sy2, 0) / detailSize
        );

        for (let j = 0; j < numberOfLines; j++) {
            const x1 = sx1 + (sx2 - sx1) * (j / numberOfLines);
            const y1 = sy1 + (sy2 - sy1) * (j / numberOfLines);

            const x2 = sx1 + (sx2 - sx1) * ((j + 1) / numberOfLines);
            const y2 = sy1 + (sy2 - sy1) * ((j + 1) / numberOfLines);

            p5.strokeWeight(
                Math.abs(strokeWidth + p5.noise(x1, y1) * strokeWidthRandomness)
            );
            p5.line(x1, y1, x2, y2);
        }
    }

    p5.noStroke();
    p5.endShape(p5.CLOSE);
    p5.pop();
};
