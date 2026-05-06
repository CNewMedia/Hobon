"use client";

import { createContext, useContext } from "react";
import type { UILabels } from "@/types/uiLabels";
import { defaultUILabels } from "@/types/uiLabels";

const UILabelsContext = createContext<UILabels>(defaultUILabels);

export function UILabelsProvider({
  value,
  children,
}: {
  value: UILabels;
  children: React.ReactNode;
}) {
  return <UILabelsContext.Provider value={value}>{children}</UILabelsContext.Provider>;
}

export function useUILabels() {
  return useContext(UILabelsContext);
}
