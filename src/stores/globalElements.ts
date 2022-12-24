import React from "react";
import { atom } from "jotai";

const globalElementsAtom = atom<
  {
    id: string;
    element: React.ReactNode;
  }[]
>([]);

export default globalElementsAtom;
