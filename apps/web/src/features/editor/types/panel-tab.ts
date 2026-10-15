import type { PANEL_TABS } from "@/features/editor/consts/panelTabs";

export type PanelTab = (typeof PANEL_TABS)[keyof typeof PANEL_TABS];
