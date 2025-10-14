import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import { Institution } from '../types';

interface ChartsViewProps {
  institutions: Institution[];
}

const COLORS = ['#1e3a8a', '#2563eb', '#3b82f6', '#60a5fa', '#93c5fd', '#dbeafe'];

const ChartsView = ({ institutions }: ChartsViewProps) => {
  // Institutions by Type
  const typeData = institutions.reduce((acc, inst) => {
    const type = inst.institutionType;
    const existing = acc.find(item => item.name === type);
    if (existing) {
      existing.value += 1;
    } else {
      acc.push({ name: type.charAt(0).toUpperCase() + type.slice(1), value: 1 });
    }
    return acc;
  }, [] as { name: string; value: number }[]);

  // WAC Program Types
  const wacTypeData = institutions.reduce((acc, inst) => {
    const type = inst.wacProgramType;
    const existing = acc.find(item => item.name === type);
    if (existing) {
      existing.value += 1;
    } else {
      acc.push({ name: type.charAt(0).toUpperCase() + type.slice(1), value: 1 });
    }
    return acc;
  }, [] as { name: string; value: number }[]);

  // Enrollment by Institution
  const enrollmentData = institutions
    .map(inst => ({
      name: inst.shortName,
      enrollment: inst.totalEnrollment,
    }))
    .sort((a, b) => b.enrollment - a.enrollment);

  // Budget by Institution
  const budgetData = institutions
    .filter(inst => inst.wacBudget !== null)
    .map(inst => ({
      name: inst.shortName,
      budget: inst.wacBudget!,
    }))
    .sort((a, b) => b.budget - a.budget);

  // Writing Intensive Courses
  const wiCoursesData = institutions
    .map(inst => ({
      name: inst.shortName,
      courses: inst.writingIntensiveCourses,
    }))
    .sort((a, b) => b.courses - a.courses);

  // WAC Program Establishment Timeline
  const timelineData = institutions
    .filter(inst => inst.wacProgramEstablished !== null)
    .map(inst => ({
      year: inst.wacProgramEstablished!,
      count: 1,
    }))
    .reduce((acc, item) => {
      const existing = acc.find(i => i.year === item.year);
      if (existing) {
        existing.count += 1;
      } else {
        acc.push(item);
      }
      return acc;
    }, [] as { year: number; count: number }[])
    .sort((a, b) => a.year - b.year);

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-xl font-semibold text-slate-900 mb-4">
          Charts & Analytics
        </h3>
        <p className="text-slate-600 mb-6">
          Visual analytics for {institutions.length} institutions
        </p>
      </div>

      {/* Row 1: Pie Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Institution Types */}
        <div className="bg-slate-50 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-slate-900 mb-4">
            Institutions by Type
          </h4>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={typeData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {typeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* WAC Program Types */}
        <div className="bg-slate-50 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-slate-900 mb-4">
            WAC Program Types
          </h4>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={wacTypeData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {wacTypeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Row 2: Enrollment Bar Chart */}
      <div className="bg-slate-50 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-slate-900 mb-4">
          Total Enrollment by Institution
        </h4>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={enrollmentData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
            <YAxis />
            <Tooltip formatter={(value) => value.toLocaleString()} />
            <Legend />
            <Bar dataKey="enrollment" fill="#1e3a8a" name="Total Enrollment" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Row 3: Budget Bar Chart */}
      <div className="bg-slate-50 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-slate-900 mb-4">
          WAC Program Budget by Institution
        </h4>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={budgetData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
            <YAxis />
            <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
            <Legend />
            <Bar dataKey="budget" fill="#2563eb" name="Annual Budget ($)" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Row 4: Writing Intensive Courses */}
      <div className="bg-slate-50 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-slate-900 mb-4">
          Writing Intensive Courses Offered
        </h4>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={wiCoursesData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="courses" fill="#3b82f6" name="WI Courses" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Row 5: Timeline */}
      <div className="bg-slate-50 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-slate-900 mb-4">
          WAC Program Establishment Timeline
        </h4>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={timelineData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="count"
              stroke="#1e3a8a"
              strokeWidth={2}
              name="Programs Established"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-primary-50 rounded-lg p-4 border border-primary-200">
          <div className="text-sm font-medium text-primary-600">Total Institutions</div>
          <div className="text-3xl font-bold text-primary-900 mt-1">
            {institutions.length}
          </div>
        </div>
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <div className="text-sm font-medium text-blue-600">Avg Enrollment</div>
          <div className="text-3xl font-bold text-blue-900 mt-1">
            {Math.round(
              institutions.reduce((sum, i) => sum + i.totalEnrollment, 0) / institutions.length
            ).toLocaleString()}
          </div>
        </div>
        <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
          <div className="text-sm font-medium text-purple-600">Avg WAC Budget</div>
          <div className="text-3xl font-bold text-purple-900 mt-1">
            $
            {Math.round(
              institutions
                .filter(i => i.wacBudget !== null)
                .reduce((sum, i) => sum + (i.wacBudget || 0), 0) /
                institutions.filter(i => i.wacBudget !== null).length
            ).toLocaleString()}
          </div>
        </div>
        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
          <div className="text-sm font-medium text-green-600">Total WI Courses</div>
          <div className="text-3xl font-bold text-green-900 mt-1">
            {institutions.reduce((sum, i) => sum + i.writingIntensiveCourses, 0).toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChartsView;
