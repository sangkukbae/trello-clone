import { create } from 'zustand';

type SidebarStoreState = {
	isSidebarExpanded: boolean;
	toggleSidebar: (val: boolean) => void;
};

const useSidebarStore = create<SidebarStoreState>(set => ({
	isSidebarExpanded: true,
	toggleSidebar: val => set(state => ({ isSidebarExpanded: val })),
}));

export { useSidebarStore };
