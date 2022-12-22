import P5 from "p5";
import { sr, srExtra, srnExtra } from "./common";

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
                      srnExtra(
                          (x + j) % 10,
                          x.toString() + i + j + p5.frameCount
                      )
                    : 0;

            const randY =
                stipplePositionRandomness !== undefined
                    ? stipplePositionRandomness *
                      srnExtra(
                          (y + j) % 10,
                          y.toString() + i + j + p5.frameCount
                      )
                    : 0;

            const randSize =
                stippleSizeRandomness !== undefined
                    ? stippleSizeRandomness *
                      srnExtra((x + j) % 10, i.toString() + j + p5.frameCount)
                    : 0;

            const stippleX =
                x + i * stippleSize * Math.cos(j * angleStep) + randX;

            const stippleY =
                y + i * stippleSize * Math.sin(j * angleStep) + randY;

            const thisStippleSize = stippleSize + randSize;

            p5.fill(color);
            p5.ellipse(stippleX, stippleY, thisStippleSize, thisStippleSize);
        }
    }

    if (sr(p5.frameCount) > density) {
        let newX = x;
        let newY = y;

        if (stipplePositionRandomness !== undefined) {
            const randX = srnExtra(x % 10, x.toString() + p5.frameCount);
            const randY = srnExtra(y % 10, y.toString() + p5.frameCount);
            newX += stipplePositionRandomness * randX;
            newY += stipplePositionRandomness * randY;
        }

        p5.ellipse(newX, newY, stippleSize, stippleSize);
    }
}

export function brushstrokeArea(brushParams: {
    p5: P5;
    x: number;
    y: number;
    brushType: "pencil";
    brushAreaSize: number;
    color: P5.Color;
    frameCount: number;
    directionAngle?: number;
    brushProps: {
        brushSize: number;
        brushStippleSize: number;
        stipplePositionRandomness?: number;
        stippleSizeRandomness?: number;
    };
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
