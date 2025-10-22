import { useState, useMemo, memo } from 'react';
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Institution } from '../types';
import { Filter, X, Download } from 'lucide-react';
import { simplifyCarnegieClassification } from '../data/institutions';

interface ChartsViewProps {
  institutions: Institution[];
}

// WCAG AA compliant color palette with sufficient contrast ratios (4.5:1 minimum)
const COLORS = ['#1e3a8a', '#2563eb', '#3b82f6', '#1d4ed8', '#1e40af', '#2563eb'];

// Custom Tooltip Components - Memoized for performance
const CustomPercentageTooltip = memo(({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-3 border border-slate-200 rounded-lg shadow-lg">
        <p className="font-semibold text-slate-900 mb-1">{data.name}</p>
        <p className="text-sm text-slate-600">
          <span className="font-medium">{data.percentage}%</span> of institutions
        </p>
        <p className="text-xs text-slate-500 mt-1">
          {data.count} institution{data.count !== 1 ? 's' : ''}
        </p>
      </div>
    );
  }
  return null;
});

const CustomEnrollmentTooltip = memo(({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-3 border border-slate-200 rounded-lg shadow-lg">
        <p className="font-semibold text-slate-900 mb-1">{data.name}</p>
        <p className="text-sm text-slate-600">
          <span className="font-medium">{data.enrollment.toLocaleString()}</span> students
        </p>
      </div>
    );
  }
  return null;
});

const CustomBudgetTooltip = memo(({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-3 border border-slate-200 rounded-lg shadow-lg">
        <p className="font-semibold text-slate-900 mb-1">{data.name}</p>
        <p className="text-sm text-slate-600">
          Annual WAC Budget
        </p>
        <p className="text-lg font-bold text-blue-600">
          ${data.budget.toLocaleString()}
        </p>
      </div>
    );
  }
  return null;
});

const CustomCoursesTooltip = memo(({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-3 border border-slate-200 rounded-lg shadow-lg">
        <p className="font-semibold text-slate-900 mb-1">{data.name}</p>
        <p className="text-sm text-slate-600">
          <span className="font-medium">{data.courses}</span> writing intensive course{data.courses !== 1 ? 's' : ''}
        </p>
      </div>
    );
  }
  return null;
});

interface ChartFilters {
  institutionTypes: string[];
  enrollmentRange: [number, number];
  budgetRange: [number, number];
}

const ChartsView = ({ institutions }: ChartsViewProps) => {
  // Export functions - These will be defined inline as they depend on filteredInstitutions
  const exportToCSV = () => {
    const headers = [
      'Institution Name',
      'Short Name',
      'Type',
      'Carnegie Classification',
      'Total Enrollment',
      'WAC Budget',
      'Writing Intensive Courses',
      'WAC Program Established',
    ];

    const csvData = filteredInstitutions.map(inst => [
      inst.name,
      inst.shortName,
      inst.institutionType,
      inst.carnegieClassification,
      inst.totalEnrollment?.toString() || '',
      inst.wacBudget?.toString() || '',
      inst.writingIntensiveCourses?.toString() || '',
      inst.wacProgramEstablished?.toString() || '',
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `wac-dashboard-data-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToJSON = () => {
    const jsonData = JSON.stringify(filteredInstitutions, null, 2);
    const blob = new Blob([jsonData], { type: 'application/json' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `wac-dashboard-data-${new Date().toISOString().split('T')[0]}.json`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Calculate min/max values for range filters
  const enrollmentMin = useMemo(() =>
    Math.min(...institutions.map(i => i.totalEnrollment || 0)),
    [institutions]
  );
  const enrollmentMax = useMemo(() =>
    Math.max(...institutions.map(i => i.totalEnrollment || 0)),
    [institutions]
  );
  const budgetMin = useMemo(() =>
    Math.min(...institutions.filter(i => i.wacBudget).map(i => i.wacBudget || 0)),
    [institutions]
  );
  const budgetMax = useMemo(() =>
    Math.max(...institutions.filter(i => i.wacBudget).map(i => i.wacBudget || 0)),
    [institutions]
  );

  // Get unique institution types
  const uniqueTypes = useMemo(() =>
    Array.from(new Set(institutions.map(i => i.institutionType).filter(Boolean))),
    [institutions]
  );

  // Filter state
  const [filters, setFilters] = useState<ChartFilters>({
    institutionTypes: [],
    enrollmentRange: [enrollmentMin, enrollmentMax],
    budgetRange: [budgetMin, budgetMax],
  });

  const [showFilters, setShowFilters] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);

  // Apply filters to institutions
  const filteredInstitutions = useMemo(() => {
    return institutions.filter(inst => {
      // Filter by institution type
      if (filters.institutionTypes.length > 0 && !filters.institutionTypes.includes(inst.institutionType)) {
        return false;
      }

      // Filter by enrollment range
      if (inst.totalEnrollment !== null && inst.totalEnrollment !== undefined) {
        if (inst.totalEnrollment < filters.enrollmentRange[0] || inst.totalEnrollment > filters.enrollmentRange[1]) {
          return false;
        }
      }

      // Filter by budget range
      if (inst.wacBudget !== null && inst.wacBudget !== undefined) {
        if (inst.wacBudget < filters.budgetRange[0] || inst.wacBudget > filters.budgetRange[1]) {
          return false;
        }
      }

      return true;
    });
  }, [institutions, filters]);

  // Reset filters
  const resetFilters = () => {
    setFilters({
      institutionTypes: [],
      enrollmentRange: [enrollmentMin, enrollmentMax],
      budgetRange: [budgetMin, budgetMax],
    });
  };

  // Check if filters are active
  const hasActiveFilters =
    filters.institutionTypes.length > 0 ||
    filters.enrollmentRange[0] !== enrollmentMin ||
    filters.enrollmentRange[1] !== enrollmentMax ||
    filters.budgetRange[0] !== budgetMin ||
    filters.budgetRange[1] !== budgetMax;

  // Handle empty institutions array
  if (!institutions || institutions.length === 0) {
    return (
      <div className="space-y-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <h3 className="text-lg font-semibold text-yellow-900 mb-2">
            No Data Available
          </h3>
          <p className="text-yellow-700">
            No institution data is currently available to display charts.
          </p>
        </div>
      </div>
    );
  }

  // Institutions by Type - Memoized for performance
  const typeData = useMemo(() => filteredInstitutions
    .filter(inst => inst.institutionType) // Filter out institutions without type
    .reduce((acc, inst) => {
      const type = inst.institutionType;
      const normalizedType = type.toLowerCase();
      const displayName = type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
      const existing = acc.find(item => item.id === normalizedType);
      if (existing) {
        existing.count += 1;
      } else {
        acc.push({ id: normalizedType, name: displayName, count: 1 });
      }
      return acc;
    }, [] as { id: string; name: string; count: number }[])
    .map(item => ({
      ...item,
      percentage: Math.round((item.count / filteredInstitutions.length) * 100)
    }))
    .sort((a, b) => b.count - a.count), [filteredInstitutions]);

  // Carnegie Classifications - Memoized for performance
  const carnegieData = useMemo(() => filteredInstitutions
    .filter(inst => inst.carnegieClassification) // Filter out institutions without Carnegie classification
    .reduce((acc, inst) => {
      const classification = inst.carnegieClassification;
      // Use simplified Carnegie classification labels
      const shortName = simplifyCarnegieClassification(classification);
      const existing = acc.find(item => item.name === shortName);
      if (existing) {
        existing.count += 1;
      } else {
        acc.push({ id: classification, name: shortName, count: 1 });
      }
      return acc;
    }, [] as { id: string; name: string; count: number }[])
    .map(item => ({
      ...item,
      percentage: Math.round((item.count / filteredInstitutions.length) * 100)
    }))
    .sort((a, b) => b.count - a.count), [filteredInstitutions]);

  // Enrollment by Institution - Memoized for performance
  const enrollmentData = useMemo(() => filteredInstitutions
    .filter(inst => inst.shortName && inst.totalEnrollment !== null && inst.totalEnrollment !== undefined)
    .map(inst => ({
      name: inst.shortName,
      enrollment: inst.totalEnrollment,
    }))
    .sort((a, b) => b.enrollment - a.enrollment), [filteredInstitutions]);

  // Budget by Institution - Memoized for performance
  const budgetData = useMemo(() => filteredInstitutions
    .filter(inst => inst.shortName && inst.wacBudget !== null && inst.wacBudget !== undefined)
    .map(inst => ({
      name: inst.shortName,
      budget: inst.wacBudget!,
    }))
    .sort((a, b) => b.budget - a.budget), [filteredInstitutions]);

  // Writing Intensive Courses - Memoized for performance
  const wiCoursesData = useMemo(() => filteredInstitutions
    .filter(inst => inst.shortName && inst.writingIntensiveCourses !== null && inst.writingIntensiveCourses !== undefined)
    .map(inst => ({
      name: inst.shortName,
      courses: inst.writingIntensiveCourses,
    }))
    .sort((a, b) => b.courses - a.courses), [filteredInstitutions]);

  return (
    <div className="space-y-8" role="region" aria-label="Charts and Analytics Dashboard">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-900 mb-2">
            Charts & Analytics
          </h2>
          <p className="text-slate-600">
            Visual analytics for {institutions.length} institutions
            {hasActiveFilters && ` (${filteredInstitutions.length} shown after filtering)`}
          </p>
        </div>

        {/* Export Button */}
        <div className="relative">
          <button
            onClick={() => setShowExportMenu(!showExportMenu)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition-colors shadow-sm"
            aria-expanded={showExportMenu}
            aria-haspopup="true"
          >
            <Download className="w-4 h-4" />
            Export Data
          </button>

          {showExportMenu && (
            <>
              {/* Backdrop to close menu */}
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowExportMenu(false)}
                aria-hidden="true"
              />

              {/* Dropdown Menu */}
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-slate-200 z-20">
                <div className="py-1" role="menu">
                  <button
                    onClick={() => {
                      exportToCSV();
                      setShowExportMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 flex items-center gap-2"
                    role="menuitem"
                  >
                    <Download className="w-4 h-4" />
                    Export as CSV
                  </button>
                  <button
                    onClick={() => {
                      exportToJSON();
                      setShowExportMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 flex items-center gap-2"
                    role="menuitem"
                  >
                    <Download className="w-4 h-4" />
                    Export as JSON
                  </button>
                </div>
                <div className="border-t border-slate-200 px-4 py-2 bg-slate-50">
                  <p className="text-xs text-slate-500">
                    {filteredInstitutions.length} institution{filteredInstitutions.length !== 1 ? 's' : ''} will be exported
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Filter Controls */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-50 transition-colors"
          aria-expanded={showFilters}
          aria-controls="filter-panel"
        >
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-slate-600" />
            <span className="font-semibold text-slate-900">
              Filter Charts
              {hasActiveFilters && (
                <span className="ml-2 px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded-full">
                  Active
                </span>
              )}
            </span>
          </div>
          <svg
            className={`w-5 h-5 text-slate-400 transition-transform ${showFilters ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {showFilters && (
          <div id="filter-panel" className="p-4 border-t border-slate-200 space-y-6">
            {/* Institution Type Filter */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Institution Type
              </label>
              <div className="flex flex-wrap gap-2">
                {uniqueTypes.map(type => (
                  <button
                    key={type}
                    onClick={() => {
                      setFilters(prev => ({
                        ...prev,
                        institutionTypes: prev.institutionTypes.includes(type)
                          ? prev.institutionTypes.filter(t => t !== type)
                          : [...prev.institutionTypes, type],
                      }));
                    }}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                      filters.institutionTypes.includes(type)
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                    aria-pressed={filters.institutionTypes.includes(type)}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1).toLowerCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Enrollment Range Filter */}
            <div>
              <label htmlFor="enrollment-min" className="block text-sm font-medium text-slate-700 mb-3">
                Enrollment Range: {filters.enrollmentRange[0].toLocaleString()} - {filters.enrollmentRange[1].toLocaleString()}
              </label>
              <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
                <div className="flex-1">
                  <label htmlFor="enrollment-min" className="text-xs text-slate-600 mb-1 block sm:hidden">
                    Minimum: {filters.enrollmentRange[0].toLocaleString()}
                  </label>
                  <input
                    id="enrollment-min"
                    type="range"
                    min={enrollmentMin}
                    max={enrollmentMax}
                    value={filters.enrollmentRange[0]}
                    onChange={(e) =>
                      setFilters(prev => ({
                        ...prev,
                        enrollmentRange: [Number(e.target.value), prev.enrollmentRange[1]],
                      }))
                    }
                    className="w-full"
                    aria-label="Minimum enrollment"
                  />
                </div>
                <div className="flex-1">
                  <label htmlFor="enrollment-max" className="text-xs text-slate-600 mb-1 block sm:hidden">
                    Maximum: {filters.enrollmentRange[1].toLocaleString()}
                  </label>
                  <input
                    id="enrollment-max"
                    type="range"
                    min={enrollmentMin}
                    max={enrollmentMax}
                    value={filters.enrollmentRange[1]}
                    onChange={(e) =>
                      setFilters(prev => ({
                        ...prev,
                        enrollmentRange: [prev.enrollmentRange[0], Number(e.target.value)],
                      }))
                    }
                    className="w-full"
                    aria-label="Maximum enrollment"
                  />
                </div>
              </div>
            </div>

            {/* Budget Range Filter */}
            {budgetMax > 0 && (
              <div>
                <label htmlFor="budget-min" className="block text-sm font-medium text-slate-700 mb-3">
                  WAC Budget Range: ${filters.budgetRange[0].toLocaleString()} - ${filters.budgetRange[1].toLocaleString()}
                </label>
                <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
                  <div className="flex-1">
                    <label htmlFor="budget-min" className="text-xs text-slate-600 mb-1 block sm:hidden">
                      Minimum: ${filters.budgetRange[0].toLocaleString()}
                    </label>
                    <input
                      id="budget-min"
                      type="range"
                      min={budgetMin}
                      max={budgetMax}
                      value={filters.budgetRange[0]}
                      onChange={(e) =>
                        setFilters(prev => ({
                          ...prev,
                          budgetRange: [Number(e.target.value), prev.budgetRange[1]],
                        }))
                      }
                      className="w-full"
                      aria-label="Minimum budget"
                    />
                  </div>
                  <div className="flex-1">
                    <label htmlFor="budget-max" className="text-xs text-slate-600 mb-1 block sm:hidden">
                      Maximum: ${filters.budgetRange[1].toLocaleString()}
                    </label>
                    <input
                      id="budget-max"
                      type="range"
                      min={budgetMin}
                      max={budgetMax}
                      value={filters.budgetRange[1]}
                      onChange={(e) =>
                        setFilters(prev => ({
                          ...prev,
                          budgetRange: [prev.budgetRange[0], Number(e.target.value)],
                        }))
                      }
                      className="w-full"
                      aria-label="Maximum budget"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Reset Button */}
            {hasActiveFilters && (
              <div className="flex justify-end pt-2">
                <button
                  onClick={resetFilters}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-sm font-medium transition-colors"
                >
                  <X className="w-4 h-4" />
                  Reset Filters
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Row 1: Horizontal Bar Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Institution Types */}
        <section
          className="bg-slate-50 rounded-lg p-6"
          aria-labelledby="institution-types-heading"
          role="region"
        >
          <h3 id="institution-types-heading" className="text-lg font-semibold text-slate-900 mb-4">
            Institutions by Type
          </h3>
          <div
            role="img"
            aria-label={`Bar chart showing distribution of institutions by type. ${typeData.map(d => `${d.name}: ${d.percentage}%`).join(', ')}`}
          >
            <ResponsiveContainer width="100%" height={250} className="text-xs sm:text-sm">
              <BarChart
                data={typeData}
                margin={{ top: 20, right: 10, left: 10, bottom: 5 }}
                aria-hidden="true"
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 12 }}
                  interval={0}
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fontSize: 11 }}
                  tickFormatter={(value) => `${value}%`}
                />
                <Tooltip content={<CustomPercentageTooltip />} animationDuration={200} />
                <Bar dataKey="percentage" animationDuration={800} animationEasing="ease-in-out">
                  {typeData.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Carnegie Classifications */}
        <section
          className="bg-slate-50 rounded-lg p-6"
          aria-labelledby="carnegie-classification-heading"
          role="region"
        >
          <h3 id="carnegie-classification-heading" className="text-lg font-semibold text-slate-900 mb-4">
            Carnegie Classification
          </h3>
          <div
            role="img"
            aria-label={`Bar chart showing distribution of Carnegie classifications. ${carnegieData.map((d: any) => `${d.name}: ${d.percentage}%`).join(', ')}`}
          >
            <ResponsiveContainer width="100%" height={300} className="text-xs sm:text-sm">
              <BarChart
                data={carnegieData}
                margin={{ top: 20, right: 10, left: 10, bottom: 60 }}
                aria-hidden="true"
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 10 }}
                  interval={0}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fontSize: 11 }}
                  tickFormatter={(value) => `${value}%`}
                />
                <Tooltip content={<CustomPercentageTooltip />} animationDuration={200} />
                <Bar dataKey="percentage" animationDuration={800} animationEasing="ease-in-out">
                  {carnegieData.map((_entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      {/* Row 2: Enrollment Bar Chart */}
      <section
        className="bg-slate-50 rounded-lg p-6"
        aria-labelledby="enrollment-heading"
        role="region"
      >
        <h3 id="enrollment-heading" className="text-lg font-semibold text-slate-900 mb-4">
          Total Enrollment by Institution
        </h3>
        <div
          role="img"
          aria-label={`Bar chart showing total enrollment by institution. Top institutions: ${enrollmentData.slice(0, 3).map(d => `${d.name} with ${d.enrollment.toLocaleString()} students`).join(', ')}`}
          className="min-h-[300px] sm:min-h-[350px]"
        >
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={enrollmentData} aria-hidden="true" margin={{ top: 20, right: 10, left: 10, bottom: 80 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="name"
                angle={-45}
                textAnchor="end"
                height={100}
                tick={{ fontSize: 10 }}
                interval={0}
              />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip content={<CustomEnrollmentTooltip />} animationDuration={200} />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Bar dataKey="enrollment" fill="#1e3a8a" name="Total Enrollment" animationDuration={800} animationEasing="ease-in-out" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Row 3: Budget Bar Chart */}
      <section
        className="bg-slate-50 rounded-lg p-6"
        aria-labelledby="budget-heading"
        role="region"
      >
        <h3 id="budget-heading" className="text-lg font-semibold text-slate-900 mb-4">
          WAC Program Budget by Institution
        </h3>
        {budgetData.length === 0 ? (
          <div className="h-[350px] flex items-center justify-center text-slate-500" role="status">
            <p>No budget data available for institutions</p>
          </div>
        ) : (
          <div
            role="img"
            aria-label={`Bar chart showing WAC program budgets by institution. Top budgets: ${budgetData.slice(0, 3).map(d => `${d.name} with $${d.budget.toLocaleString()}`).join(', ')}`}
            className="min-h-[300px] sm:min-h-[350px]"
          >
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={budgetData} aria-hidden="true" margin={{ top: 20, right: 10, left: 10, bottom: 80 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  tick={{ fontSize: 10 }}
                  interval={0}
                />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip content={<CustomBudgetTooltip />} animationDuration={200} />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="budget" fill="#2563eb" name="Annual Budget ($)" animationDuration={800} animationEasing="ease-in-out" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>

      {/* Row 4: Writing Intensive Courses */}
      <section
        className="bg-slate-50 rounded-lg p-6"
        aria-labelledby="wi-courses-heading"
        role="region"
      >
        <h3 id="wi-courses-heading" className="text-lg font-semibold text-slate-900 mb-4">
          Writing Intensive Courses Offered
        </h3>
        <div
          role="img"
          aria-label={`Bar chart showing writing intensive courses offered by institution. Top institutions: ${wiCoursesData.slice(0, 3).map(d => `${d.name} with ${d.courses} courses`).join(', ')}`}
          className="min-h-[300px] sm:min-h-[350px]"
        >
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={wiCoursesData} aria-hidden="true" margin={{ top: 20, right: 10, left: 10, bottom: 80 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="name"
                angle={-45}
                textAnchor="end"
                height={100}
                tick={{ fontSize: 10 }}
                interval={0}
              />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip content={<CustomCoursesTooltip />} animationDuration={200} />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Bar dataKey="courses" fill="#3b82f6" name="WI Courses" animationDuration={800} animationEasing="ease-in-out" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Summary Statistics */}
      <section aria-labelledby="summary-statistics-heading">
        <h3 id="summary-statistics-heading" className="sr-only">Summary Statistics</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" role="list">
          <div className="bg-primary-50 rounded-lg p-4 border border-primary-200" role="listitem">
            <div className="text-sm font-medium text-primary-600">Total Institutions</div>
            <div className="text-3xl font-bold text-primary-900 mt-1" aria-label={`Total institutions: ${filteredInstitutions.length}`}>
              {filteredInstitutions.length}
            </div>
          </div>
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200" role="listitem">
            <div className="text-sm font-medium text-blue-600">Avg Enrollment</div>
            <div className="text-3xl font-bold text-blue-900 mt-1">
              {(() => {
                const validInstitutions = filteredInstitutions.filter(i => i.totalEnrollment !== null && i.totalEnrollment !== undefined);
                if (validInstitutions.length === 0) {
                  return <span aria-label="Average enrollment: Not available">N/A</span>;
                }
                const avg = Math.round(
                  validInstitutions.reduce((sum, i) => sum + i.totalEnrollment, 0) / validInstitutions.length
                );
                return <span aria-label={`Average enrollment: ${avg.toLocaleString()} students`}>{avg.toLocaleString()}</span>;
              })()}
            </div>
          </div>
          <div className="bg-purple-50 rounded-lg p-4 border border-purple-200" role="listitem">
            <div className="text-sm font-medium text-purple-600">Avg WAC Budget</div>
            <div className="text-3xl font-bold text-purple-900 mt-1">
              {(() => {
                const institutionsWithBudget = filteredInstitutions.filter(i => i.wacBudget !== null);
                if (institutionsWithBudget.length === 0) {
                  return <span aria-label="Average WAC budget: Not available">N/A</span>;
                }
                const avg = Math.round(
                  institutionsWithBudget.reduce((sum, i) => sum + (i.wacBudget || 0), 0) /
                  institutionsWithBudget.length
                );
                return <span aria-label={`Average WAC budget: $${avg.toLocaleString()}`}>${avg.toLocaleString()}</span>;
              })()}
            </div>
          </div>
          <div className="bg-green-50 rounded-lg p-4 border border-green-200" role="listitem">
            <div className="text-sm font-medium text-green-600">Total WI Courses</div>
            <div className="text-3xl font-bold text-green-900 mt-1">
              {(() => {
                const total = filteredInstitutions
                  .filter(i => i.writingIntensiveCourses !== null && i.writingIntensiveCourses !== undefined)
                  .reduce((sum, i) => sum + i.writingIntensiveCourses, 0);
                return <span aria-label={`Total writing intensive courses: ${total.toLocaleString()}`}>{total.toLocaleString()}</span>;
              })()}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ChartsView;
