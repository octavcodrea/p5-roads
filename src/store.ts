import create from "zustand/vanilla";

type Store = {
    seed: string;

    canvasWidth: number;
    canvasHeight: number;

    selectedPalette: number;
    devMode: boolean;
};

export const store = create<Store>((set) => ({
    seed: "0123456789012345",

    canvasWidth: 5000,
    canvasHeight: 6000,

    selectedPalette: 0,
    devMode: true,
}));

export const { getState, setState, subscribe, destroy } = store;
