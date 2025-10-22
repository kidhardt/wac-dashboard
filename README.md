# WAC Dashboard

An interactive dashboard for visualizing and analyzing Writing Across the Curriculum (WAC) programs across higher education institutions.

## Features

- **Interactive Data Visualization**: Explore WAC program data through dynamic charts and graphs
- **Carnegie Classification Analysis**: Filter and analyze institutions by Carnegie Classification (R1, R2, Baccalaureate, Associate's, etc.)
- **Geographic Mapping**: View institution locations and WAC program distribution on an interactive map
- **Comparison Tools**: Compare multiple institutions side-by-side
- **AI-Powered Chat**: Ask questions about WAC programs using Claude AI integration
- **Data Export**: Export filtered data to CSV or JSON formats
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices

## Technology Stack

- **React 18** - Modern UI framework with hooks
- **TypeScript** - Type-safe JavaScript
- **Vite** - Fast build tool and dev server
- **TailwindCSS** - Utility-first styling
- **Recharts** - Composable charting library
- **Leaflet** - Interactive mapping
- **Claude API** - AI-powered chat functionality

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- (Optional) Claude API key for chat functionality

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd wac-dashboard

# Install dependencies
npm install
```

### Configuration

If you want to use the chat feature, create a `.env.local` file:

```env
VITE_CLAUDE_API_KEY=your_api_key_here
```

### Development

```bash
# Start development server
npm run dev

# Open http://localhost:5173 in your browser
```

### Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
wac-dashboard/
├── src/
│   ├── components/           # React components
│   │   ├── ChartsView.tsx   # Data visualization charts
│   │   ├── MapView.tsx      # Interactive map
│   │   ├── ComparisonView.tsx # Institution comparison
│   │   ├── ChatTab.tsx      # AI chat interface
│   │   └── Header.tsx       # Navigation header
│   ├── data/
│   │   ├── institutions.ts  # Institution data and helpers
│   │   └── program-descriptions.json # WAC program narratives
│   ├── types/
│   │   └── index.ts         # TypeScript type definitions
│   └── utils/
│       ├── filters.ts       # Data filtering logic
│       ├── claudeIntegration.ts # Claude API integration
│       └── dataValidation.ts # Data validation utilities
├── .beads/                  # Task tracking (Beads)
├── .claude/                 # Claude Code settings
└── public/                  # Static assets
```

## Usage

### Filtering Data

Use the filter panel to narrow down institutions by:
- **Carnegie Classification**: R1, R2, Baccalaureate, Associate's, etc.
- **Enrollment Range**: Filter by student population
- **Budget Range**: Filter by WAC program budget
- **Search**: Search by institution name, location, or other fields

### Viewing Charts

The Charts view provides multiple visualizations:
- Budget distribution by Carnegie Classification
- Enrollment trends
- Geographic distribution
- Carnegie Classification breakdown
- And more...

### Exploring the Map

- Click markers to view institution details
- Use filters to show/hide institutions
- Zoom and pan to explore different regions

### Comparing Institutions

1. Navigate to the Comparison view
2. Select institutions to compare
3. View side-by-side metrics and details

### Using Chat

1. Navigate to the Chat tab
2. Ask questions about WAC programs (e.g., "What are the characteristics of R1 WAC programs?")
3. Get AI-powered insights based on the program data

## Task Management

This project uses [Beads](https://github.com/steveyegge/beads) for task tracking. If you're an AI agent or contributor:

```bash
# See ready work
bd ready

# View all tasks
bd list

# Show task details
bd show wac-dashboard-<id>
```

See [AGENTS.md](AGENTS.md) for detailed workflow instructions.

## Data Sources

Institution data includes:
- Institution name and location
- Carnegie Classification
- Enrollment statistics
- WAC program budgets
- Program structure information
- Contact details

## Contributing

1. Check `bd ready` for available tasks
2. Create a feature branch
3. Make your changes
4. Run `npm run build` to verify
5. Submit a pull request

## Development Notes

### Type Safety

All components use TypeScript. Run type checking with:

```bash
npx tsc --noEmit
```

### Styling

Uses TailwindCSS utility classes. Configuration in `tailwind.config.js`.

### Data Validation

Utilities in `src/utils/dataValidation.ts` help validate institution data integrity.

## License

[Add your license here]

## Contact

[Add contact information]
