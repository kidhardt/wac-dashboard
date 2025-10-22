import { useState, useMemo } from 'react';
import { Map, BarChart3, Table2, GitCompare, MessageSquare } from 'lucide-react';
import Header from './components/Header';
import MapView from './components/MapView';
import ChartsView from './components/ChartsView';
import ComparisonView from './components/ComparisonView';
import ChatTab from './components/ChatTab';
import { institutions, getCarnegieClassifications } from './data/institutions';
import { filterInstitutions, createDefaultFilterState, sortInstitutions } from './utils/filters';
import { ViewMode, FilterState, SortConfig, Institution } from './types';

function App() {
  const [viewMode, setViewMode] = useState<ViewMode>('map');
  const [filters, setFilters] = useState<FilterState>(createDefaultFilterState());
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    field: 'name',
    direction: 'asc',
  });
  const [selectedInstitutions, setSelectedInstitutions] = useState<string[]>([]);

  // Apply filters and sorting
  const filteredInstitutions = useMemo(() => {
    const filtered = filterInstitutions(institutions, filters);
    return sortInstitutions(filtered, sortConfig);
  }, [filters, sortConfig]);

  // Handle view mode change
  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
  };

  // Handle filter changes
  const handleFilterChange = (newFilters: Partial<FilterState>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  // Handle sort change
  const handleSortChange = (field: keyof Institution) => {
    setSortConfig(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  // Reset filters
  const handleResetFilters = () => {
    setFilters(createDefaultFilterState());
    setSelectedInstitutions([]);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header 
        totalInstitutions={institutions.length}
        filteredCount={filteredInstitutions.length}
      />

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4">
          <nav className="flex space-x-1" role="tablist">
            <button
              onClick={() => handleViewModeChange('map')}
              className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors border-b-2 ${
                viewMode === 'map'
                  ? 'border-primary-900 text-primary-900'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
              }`}
              role="tab"
              aria-selected={viewMode === 'map'}
            >
              <Map className="w-5 h-5" />
              Map View
            </button>
            <button
              onClick={() => handleViewModeChange('table')}
              className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors border-b-2 ${
                viewMode === 'table'
                  ? 'border-primary-900 text-primary-900'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
              }`}
              role="tab"
              aria-selected={viewMode === 'table'}
            >
              <Table2 className="w-5 h-5" />
              Table View
            </button>
            <button
              onClick={() => handleViewModeChange('charts')}
              className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors border-b-2 ${
                viewMode === 'charts'
                  ? 'border-primary-900 text-primary-900'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
              }`}
              role="tab"
              aria-selected={viewMode === 'charts'}
            >
              <BarChart3 className="w-5 h-5" />
              Charts
            </button>
            <button
              onClick={() => handleViewModeChange('comparison')}
              className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors border-b-2 ${
                viewMode === 'comparison'
                  ? 'border-primary-900 text-primary-900'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
              }`}
              role="tab"
              aria-selected={viewMode === 'comparison'}
            >
              <GitCompare className="w-5 h-5" />
              Compare
              {selectedInstitutions.length > 0 && (
                <span className="ml-1 px-2 py-0.5 text-xs font-semibold bg-primary-900 text-white rounded-full">
                  {selectedInstitutions.length}
                </span>
              )}
            </button>
            <button
              onClick={() => handleViewModeChange('chat')}
              className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors border-b-2 ${
                viewMode === 'chat'
                  ? 'border-primary-900 text-primary-900'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
              }`}
              role="tab"
              aria-selected={viewMode === 'chat'}
            >
              <MessageSquare className="w-5 h-5" />
              Chat
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <aside className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-card p-6 sticky top-24">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-slate-900">Filters</h2>
                <button
                  onClick={handleResetFilters}
                  className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                >
                  Reset
                </button>
              </div>

              {/* Search */}
              <div className="mb-6">
                <label htmlFor="search" className="block text-sm font-medium text-slate-700 mb-2">
                  Search
                </label>
                <input
                  type="text"
                  id="search"
                  placeholder="Search institutions..."
                  value={filters.searchQuery}
                  onChange={(e) => handleFilterChange({ searchQuery: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              {/* Institution Type */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Institution Type
                </label>
                <div className="space-y-2">
                  {['public', 'private', 'community'].map(type => (
                    <label key={type} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.institutionTypes.includes(type as any)}
                        onChange={(e) => {
                          const types = e.target.checked
                            ? [...filters.institutionTypes, type as any]
                            : filters.institutionTypes.filter(t => t !== type);
                          handleFilterChange({ institutionTypes: types });
                        }}
                        className="rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="ml-2 text-sm text-slate-700 capitalize">{type}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Carnegie Classification */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Carnegie Classification
                </label>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {getCarnegieClassifications().map(classification => (
                    <label key={classification} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.carnegieClassifications.includes(classification)}
                        onChange={(e) => {
                          const classifications = e.target.checked
                            ? [...filters.carnegieClassifications, classification]
                            : filters.carnegieClassifications.filter(c => c !== classification);
                          handleFilterChange({ carnegieClassifications: classifications });
                        }}
                        className="rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="ml-2 text-sm text-slate-700">{classification}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Statistics */}
              <div className="pt-6 border-t border-slate-200">
                <h3 className="text-sm font-medium text-slate-700 mb-3">Results</h3>
                <div className="text-2xl font-bold text-primary-900">
                  {filteredInstitutions.length}
                </div>
                <div className="text-sm text-slate-600">
                  of {institutions.length} institutions
                </div>
              </div>
            </div>
          </aside>

          {/* Main View Area */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-card p-6">
              {viewMode === 'map' && (
                <div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-4">
                    Interactive Map View
                  </h3>
                  <MapView institutions={filteredInstitutions} />
                </div>
              )}

              {viewMode === 'table' && (
                <div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-4">
                    Institution Data Table
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider cursor-pointer hover:bg-slate-100"
                              onClick={() => handleSortChange('name')}>
                            Name
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider cursor-pointer hover:bg-slate-100"
                              onClick={() => handleSortChange('state')}>
                            State
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider cursor-pointer hover:bg-slate-100"
                              onClick={() => handleSortChange('institutionType')}>
                            Type
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider cursor-pointer hover:bg-slate-100"
                              onClick={() => handleSortChange('totalEnrollment')}>
                            Enrollment
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider cursor-pointer hover:bg-slate-100"
                              onClick={() => handleSortChange('carnegieClassification')}>
                            Carnegie Classification
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-slate-200">
                        {filteredInstitutions.map(inst => (
                          <tr key={inst.id} className="hover:bg-slate-50">
                            <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-slate-900">
                              {inst.shortName}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-700">
                              {inst.state}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-700 capitalize">
                              {inst.institutionType}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-700">
                              {inst.totalEnrollment.toLocaleString()}
                            </td>
                            <td className="px-4 py-3 text-sm text-slate-700">
                              {inst.carnegieClassification}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {viewMode === 'charts' && (
                <ChartsView institutions={filteredInstitutions} />
              )}

              {viewMode === 'comparison' && (
                <ComparisonView
                  institutions={filteredInstitutions}
                  selectedIds={selectedInstitutions}
                  onSelectionChange={setSelectedInstitutions}
                />
              )}

              {viewMode === 'chat' && (
                <ChatTab />
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-12">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center text-sm text-slate-600">
            <p>WAC Dashboard &copy; 2025 | Writing Across the Curriculum Research</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
