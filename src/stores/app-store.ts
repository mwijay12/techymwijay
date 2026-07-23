/**
 * Global App Store State
 * Full implementation: Prompt 4
 */

export interface AppStoreState {
  activeTab: string
  isSidebarOpen: boolean
}

export const initialAppStoreState: AppStoreState = {
  activeTab: 'home',
  isSidebarOpen: false,
}
