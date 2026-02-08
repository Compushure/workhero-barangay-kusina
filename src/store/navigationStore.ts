import { create } from 'zustand';

interface NavigationState {
  isNavigating: boolean;
  isLoggingOut: boolean;
  startNavigation: () => void;
  stopNavigation: () => void;
  startLogout: () => void;
  stopLogout: () => void;
}

export const useNavigationStore = create<NavigationState>((set) => ({
  isNavigating: false,
  isLoggingOut: false,
  startNavigation: () => set({ isNavigating: true }),
  stopNavigation: () => set({ isNavigating: false }),
  startLogout: () => set({ isLoggingOut: true }),
  stopLogout: () => set({ isLoggingOut: false }),
}));
