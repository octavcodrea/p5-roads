import P5 from "p5";
import { calculatePointFromAngle, sr, srExtra, srn, srnExtra } from "./common";

export function brushstrokePencil(params: {
    p5: P5;
    x: number;
    y: number;
    brushSize: number;
    stippleSize: number;
    density: number;
    color: P5.Color;
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

            p5.fill(color);
            p5.noStroke();
            p5.ellipse(stippleX, stippleY, thisStippleSize, thisStippleSize);
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
    };
    drip?: number;
    directionAngle?: number;
}) {
    let { p5, x, y, brushType, colors, frameCount, directionAngle, drip } =
        brushParams;

    let { brushStrokeWidth, stipplePositionRandomness } =
        brushParams.brushProps;

    let angle = directionAngle ?? 0;
    const steps = 10;

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

                            p5.stroke(
                                colors[
                                    Math.floor(
                                        sr(i.toString() + frameCount + i) *
                                            colors.length
                                    )
                                ]
                            );
                        }
                    } else {
                        p5.line(xStart, yStart, xEnd, yEnd);
                    }

                    p5.stroke(
                        colors[
                            Math.floor(
                                sr(i.toString() + frameCount + i) *
                                    colors.length
                            )
                        ]
                    );
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

    brushProps?: BrushProps & {
        brushPositionRandomness?: number;
        brushSizeRandomness?: number;
    };
}) => {
    const { p5, x1, y1, x2, y2, color } = params;
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

            brushstrokePencil({
                p5: p5,
                x: xStart + (j * bSize) / 2 + randX,
                y: yStart + (i * bSize) / 2 + randY,
                brushSize: bSize,
                color: color,
                stippleSize: bStippleSize,
                stipplePositionRandomness: bStipplePositionRandomness,
                stippleSizeRandomness: bStippleSizeRandomness,
                density: 1,
            });
        }
    }
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
