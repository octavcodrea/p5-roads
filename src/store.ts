import create from "zustand/vanilla";

type Store = {
    canvasWidth: number;
    canvasHeight: number;

    selectedPalette: number;
};

export const store = create<Store>((set) => ({
    canvasWidth: 1000,
    canvasHeight: 1200,

    selectedPalette: 0,
}));

export const { getState, setState, subscribe, destroy } = store;
