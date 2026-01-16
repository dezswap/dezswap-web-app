import { atom } from "jotai";
import React from "react";

const globalElementsAtom = atom<
  {
    id: string;
    element: React.ReactNode;
  }[]
>([]);

export default globalElementsAtom;
