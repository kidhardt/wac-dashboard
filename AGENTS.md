# Agent Instructions for WAC Dashboard

## Project Overview

This is a React-based dashboard for visualizing Writing Across the Curriculum (WAC) program data across higher education institutions. The application provides interactive charts, maps, and comparison tools for analyzing WAC programs by Carnegie Classification, enrollment, budget, and other metrics.

## Task Management with Beads

This project uses [Beads](https://github.com/steveyegge/beads) for issue tracking and task management. Beads is a lightweight, git-based task tracker designed for AI agents.

### Getting Started with Beads

When starting work on this project, always:

1. **Check ready work first**: Run `bd ready` to see what tasks are ready to work on (no blockers)
2. **Review issue details**: Use `bd show <issue-id>` to see task details
3. **Update status as you work**: Mark tasks as you progress
4. **Create new issues when needed**: If you discover new work, file it with `bd create`

### Common Beads Commands

```bash
# See what's ready to work on
bd ready

# List all issues
bd list

# Show issue details
bd show wac-dashboard-<number>

# Create a new issue
bd create --title "Task description" --type task --priority 1

# Update issue status
bd update wac-dashboard-<number> --status in_progress
bd update wac-dashboard-<number> --status closed

# View statistics
bd stats

# Show dependency tree
bd dep tree wac-dashboard-<number>
```

### Workflow Best Practices

1. **Start with `bd ready`** - Always check for ready work before starting new tasks
2. **File discovered work** - If you find bugs or needed improvements while working, create issues for them
3. **Link related work** - Use dependencies to link related tasks
4. **Update status promptly** - Keep issue status current as you work
5. **Close completed work** - Mark issues closed when fully done

## Project Structure

```
wac-dashboard/
├── src/
│   ├── components/        # React components (ChartsView, MapView, etc.)
│   ├── data/             # Institution data and program descriptions
│   ├── types/            # TypeScript type definitions
│   └── utils/            # Utility functions and filters
├── .beads/               # Beads issue tracker database
├── .claude/              # Claude Code settings
└── package.json          # Dependencies and scripts
```

## Technology Stack

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: TailwindCSS
- **Charts**: Recharts
- **Maps**: Leaflet with React-Leaflet
- **Data**: Static JSON files

## Development Commands

```bash
# Install dependencies
npm install

# Start development server (usually on port 5173)
npm run dev

# Build for production
npm run build

# Run TypeScript type checking
npx tsc --noEmit

# Preview production build
npm run preview
```

## Key Features to Understand

1. **Carnegie Classification System**: Institutions are categorized by Carnegie Classification (R1, R2, Baccalaureate, Associate's, etc.)
2. **Interactive Filtering**: Users can filter by classification, enrollment range, budget, and search terms
3. **Multiple Views**: Charts, Maps, Comparison, and Chat interfaces
4. **Claude Integration**: Chat tab uses Claude API for natural language queries about WAC programs
5. **Data Export**: Users can export filtered data to CSV/JSON

## Code Guidelines

- Use TypeScript for type safety
- Follow existing component patterns
- Maintain responsive design with Tailwind utilities
- Keep data transformations in utility functions
- Test all changes with `npm run build` before committing

## Current Focus Areas

Based on open Beads issues, current priorities include:
- Chat functionality with Claude API integration
- Program description review and consistency
- Data validation and error handling

## Getting Help

- Review existing components in `src/components/` for patterns
- Check type definitions in `src/types/index.ts` for data structures
- Reference `src/data/institutions.ts` for data format
- Use `bd show <issue-id>` for detailed task context
