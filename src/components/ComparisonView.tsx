import { useState } from 'react';
import { Check, X, Download } from 'lucide-react';
import { Institution } from '../types';
import { getFieldLabel, formatValue } from '../utils/filters';

interface ComparisonViewProps {
  institutions: Institution[];
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
}

const COMPARISON_FIELDS: (keyof Institution)[] = [
  'name',
  'state',
  'city',
  'institutionType',
  'carnegieClassification',
  'totalEnrollment',
  'undergraduateEnrollment',
  'graduateEnrollment',
  'foundedYear',
  'hasWACProgram',
  'wacProgramEstablished',
  'wacDirectorPosition',
  'wacFacultyFTE',
  'wacBudget',
  'writingIntensiveCourses',
  'requiredWICourses',
  'hasWritingCenter',
  'writingCenterStaff',
  'writingCenterHoursPerWeek',
  'writingFellowsProgram',
  'writingTutorsAvailable',
  'facultyWorkshopsPerYear',
  'writingFacultyDevelopmentProgram',
  'crossDisciplinaryWritingInitiatives',
];

const ComparisonView = ({ institutions, selectedIds, onSelectionChange }: ComparisonViewProps) => {
  const [showAllFields, setShowAllFields] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);

  const selectedInstitutions = institutions.filter(inst => selectedIds.includes(inst.id));

  // Export functions
  const exportToCSV = () => {
    const headers = [
      'Field',
      ...selectedInstitutions.map(inst => inst.shortName),
    ];

    const csvData = COMPARISON_FIELDS.map(field => [
      getFieldLabel(field),
      ...selectedInstitutions.map(inst => {
        const value = inst[field];
        if (typeof value === 'boolean') {
          return value ? 'Yes' : 'No';
        }
        return formatValue(value, field);
      }),
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `wac-comparison-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToJSON = () => {
    const jsonData = JSON.stringify(selectedInstitutions, null, 2);
    const blob = new Blob([jsonData], { type: 'application/json' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `wac-comparison-${new Date().toISOString().split('T')[0]}.json`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleToggleInstitution = (id: string) => {
    if (selectedIds.includes(id)) {
      onSelectionChange(selectedIds.filter(i => i !== id));
    } else {
      if (selectedIds.length < 4) {
        onSelectionChange([...selectedIds, id]);
      }
    }
  };

  const fieldsToShow = showAllFields ? COMPARISON_FIELDS : COMPARISON_FIELDS.slice(0, 15);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-xl font-semibold text-slate-900 mb-2">
            Compare Institutions
          </h3>
          <p className="text-slate-600">
            Select up to 4 institutions to compare side-by-side
          </p>
        </div>

        {/* Export Button - Only show when 2 or more institutions are selected */}
        {selectedInstitutions.length >= 2 && (
          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition-colors shadow-sm"
              aria-expanded={showExportMenu}
              aria-haspopup="true"
            >
              <Download className="w-4 h-4" />
              Export Comparison
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
                      {selectedInstitutions.length} institution{selectedInstitutions.length !== 1 ? 's' : ''} will be exported
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Institution Selection */}
      <div className="bg-slate-50 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-slate-900 mb-4">
          Select Institutions ({selectedIds.length}/4)
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {institutions.map(inst => (
            <button
              key={inst.id}
              onClick={() => handleToggleInstitution(inst.id)}
              disabled={!selectedIds.includes(inst.id) && selectedIds.length >= 4}
              className={`p-3 rounded-lg border-2 text-left transition-all ${
                selectedIds.includes(inst.id)
                  ? 'border-primary-600 bg-primary-50 text-primary-900'
                  : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
              } ${
                !selectedIds.includes(inst.id) && selectedIds.length >= 4
                  ? 'opacity-50 cursor-not-allowed'
                  : 'cursor-pointer'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="font-medium">{inst.shortName}</div>
                  <div className="text-xs text-slate-600 mt-0.5">
                    {inst.city}, {inst.state}
                  </div>
                </div>
                {selectedIds.includes(inst.id) && (
                  <div className="ml-2 w-5 h-5 bg-primary-600 rounded-full flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Comparison Table */}
      {selectedInstitutions.length > 0 ? (
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900 sticky left-0 bg-slate-50 z-10">
                    Field
                  </th>
                  {selectedInstitutions.map(inst => (
                    <th
                      key={inst.id}
                      className="px-4 py-3 text-left text-sm font-semibold text-slate-900 min-w-[200px]"
                    >
                      <div>{inst.shortName}</div>
                      <div className="text-xs font-normal text-slate-600 mt-1">
                        {inst.city}, {inst.state}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {fieldsToShow.map((field, idx) => {
                  const values = selectedInstitutions.map(inst => inst[field]);
                  const allSame = values.every(v => JSON.stringify(v) === JSON.stringify(values[0]));

                  return (
                    <tr
                      key={field}
                      className={`${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'} hover:bg-slate-100`}
                    >
                      <td className="px-4 py-3 text-sm font-medium text-slate-900 sticky left-0 bg-inherit">
                        {getFieldLabel(field)}
                      </td>
                      {selectedInstitutions.map(inst => {
                        const value = inst[field];
                        const isDifferent = !allSame;

                        return (
                          <td
                            key={inst.id}
                            className={`px-4 py-3 text-sm ${
                              isDifferent ? 'font-medium text-slate-900' : 'text-slate-600'
                            }`}
                          >
                            {field === 'wacWebsiteUrl' && typeof value === 'string' ? (
                              <a
                                href={value}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary-600 hover:text-primary-700 underline"
                              >
                                Visit
                              </a>
                            ) : typeof value === 'boolean' ? (
                              <div className="flex items-center gap-1">
                                {value ? (
                                  <>
                                    <Check className="w-4 h-4 text-green-600" />
                                    <span>Yes</span>
                                  </>
                                ) : (
                                  <>
                                    <X className="w-4 h-4 text-red-600" />
                                    <span>No</span>
                                  </>
                                )}
                              </div>
                            ) : (
                              formatValue(value, field)
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Show More/Less Button */}
          {COMPARISON_FIELDS.length > 15 && (
            <div className="border-t border-slate-200 p-4 text-center">
              <button
                onClick={() => setShowAllFields(!showAllFields)}
                className="text-primary-600 hover:text-primary-700 font-medium text-sm"
              >
                {showAllFields ? 'Show Less Fields' : `Show All Fields (${COMPARISON_FIELDS.length})`}
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-slate-50 rounded-lg p-12 text-center">
          <div className="text-slate-400 mb-4">
            <svg
              className="w-16 h-16 mx-auto"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
          </div>
          <h4 className="text-lg font-semibold text-slate-900 mb-2">
            No Institutions Selected
          </h4>
          <p className="text-slate-600">
            Select at least one institution above to start comparing
          </p>
        </div>
      )}

      {/* Legend */}
      {selectedInstitutions.length > 1 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center mt-0.5">
              <svg
                className="w-3 h-3 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="flex-1">
              <h5 className="text-sm font-semibold text-blue-900 mb-1">Comparison Tips</h5>
              <p className="text-sm text-blue-800">
                Fields with <strong>bold text</strong> indicate differences between institutions.
                Use this to quickly identify unique characteristics of each program.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComparisonView;
