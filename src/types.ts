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
    colorsA: ColorObject[];
    colorsB: ColorObject[];
    colorsC: ColorObject[];
};
