import { BookOpen, Download } from 'lucide-react';
import { exportInstitutionsToCSV, exportInstitutionsToJSON } from '../utils/filters';
import { institutions } from '../data/institutions';

interface HeaderProps {
  totalInstitutions: number;
  filteredCount: number;
}

const Header = ({ totalInstitutions, filteredCount }: HeaderProps) => {
  const handleExportCSV = () => {
    exportInstitutionsToCSV(institutions);
  };

  const handleExportJSON = () => {
    exportInstitutionsToJSON(institutions);
  };

  return (
    <header className="bg-primary-900 text-white shadow-lg">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 bg-primary-800 rounded-lg">
              <BookOpen className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">WAC Explorer</h1>
              <p className="text-primary-100 mt-1">
                Writing Across the Curriculum
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Export Dropdown */}
            <div className="relative group">
              <button
                className="flex items-center gap-2 px-4 py-2 bg-primary-800 hover:bg-primary-700 rounded-lg transition-colors"
                aria-label="Export data"
              >
                <Download className="w-5 h-5" />
                <span className="font-medium">Export</span>
              </button>
              
              {/* Dropdown Menu */}
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-20">
                <div className="py-2">
                  <button
                    onClick={handleExportCSV}
                    className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-100 transition-colors"
                  >
                    Export as CSV
                  </button>
                  <button
                    onClick={handleExportJSON}
                    className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-100 transition-colors"
                  >
                    Export as JSON
                  </button>
                </div>
              </div>
            </div>

            {/* Institution Count Badge */}
            <div className="hidden sm:flex items-center gap-3 px-4 py-2 bg-primary-800 rounded-lg">
              <div className="text-right">
                <div className="text-2xl font-bold">{filteredCount}</div>
                <div className="text-xs text-primary-200">
                  {filteredCount === totalInstitutions 
                    ? 'Institutions' 
                    : `of ${totalInstitutions}`}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
