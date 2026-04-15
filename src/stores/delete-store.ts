import {create} from "zustand";

export type DeleteData = {
    id: string;
    title: string;
}

export type DeleteStore = {
    beingDeleted: DeleteData | null;
    setBeingDeleted: (data: DeleteData | null) => void;
}

export const useDeleteStore = create<DeleteStore>((set) => ({
    beingDeleted: null,
    setBeingDeleted: (data) => set({ beingDeleted: data }),
}));