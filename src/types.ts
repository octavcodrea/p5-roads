export type ColorObject = {
    color: string;
    opacity: number;
};

export type ColorSet = Array<ColorObject[]>;

export type PaletteType = {
    background: string;
    accent: string;
    name?: string;
    blendMode?: GlobalCompositeOperation;

    stripLinesColor: string;

    colorsA: ColorObject[];
    colorsB: ColorObject[];
    colorsC: ColorObject[];
    colorsD: ColorObject[];
};
