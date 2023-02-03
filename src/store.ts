import create from "zustand/vanilla";

type Store = {
    seed: string;

    canvasWidth: number;
    canvasHeight: number;

    selectedPalette: number;
};

export const store = create<Store>((set) => ({
    seed: "0123456789012345",

    canvasWidth: 800,
    canvasHeight: 1000,

    selectedPalette: 0,
}));

export const { getState, setState, subscribe, destroy } = store;
