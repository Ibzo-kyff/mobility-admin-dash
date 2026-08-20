export const parkingVehicleTabsStyles = {
  nav: 'flex items-center justify-between mb-4',
  navTabs: 'flex gap-2',
  tabButton: (active: boolean) => `px-3 py-1 rounded ${active ? 'bg-gray-200' : ''}`,
  actions: 'flex items-center gap-2',
  addButton: 'px-3 py-1 bg-green-600 text-white rounded',
  refreshButton: 'px-3 py-1 border rounded',
  searchSection: 'flex flex-col md:flex-row gap-4 items-center justify-between',
  searchWrap: 'relative w-full md:w-96',
  searchInput:
    'w-full pl-12 pr-4 py-3 bg-white border border-slate-100 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-slate-700 font-medium',
  filterRow: 'flex flex-wrap gap-3 w-full md:w-auto',
  segment: 'flex flex-1 md:flex-initial bg-slate-100 p-1.5 rounded-2xl shadow-inner',
  segmentButton: (active: boolean) =>
    `flex-1 md:px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
      active ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'
    }`,
  filterButton:
    'px-6 py-3 bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md transition-all flex items-center gap-3 text-slate-600 font-bold',
  selectWrap: 'relative flex-1 md:flex-initial',
  select:
    'w-full md:w-48 pl-4 pr-10 py-3 bg-white border border-slate-100 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 appearance-none cursor-pointer font-bold text-slate-600',
  viewSwitch: 'flex bg-slate-100 p-1.5 rounded-2xl shadow-inner ml-auto',
  viewButton: (active: boolean) =>
    `w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
      active ? 'bg-white text-orange-500 shadow-sm' : 'text-slate-400 hover:text-slate-600'
    }`,
  quickFilters: 'flex overflow-x-auto pb-2 gap-3 no-scrollbar scroll-smooth',
  quickFilterButton: (active: boolean) =>
    `whitespace-nowrap px-6 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest border transition-all ${
      active ? 'bg-orange-500 text-white border-orange-500 shadow-lg shadow-orange-500/20' : 'bg-white text-slate-400 border-slate-100 hover:border-slate-300'
    }`,
  resultRow: 'flex justify-between items-center mb-4',
  clearFiltersButton: 'text-orange-500 font-black text-[10px] uppercase tracking-widest hover:underline',
  gridWrap: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6',
};

export const parkingVehicleTabsActionStyles = {
  statusButton: (active: boolean, tone: 'green' | 'amber' | 'rose') => {
    const map = {
      green: active ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-600',
      amber: active ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20' : 'bg-amber-50 hover:bg-amber-100 text-amber-600',
      rose: active ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20' : 'bg-rose-50 hover:bg-rose-100 text-rose-500',
    } as const;
    return `w-11 h-11 rounded-2xl flex items-center justify-center transition-all ${map[tone]}`;
  },
};
