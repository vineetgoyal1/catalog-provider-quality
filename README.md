# Catalog Provider Quality Report

A LeanIX Custom Report that tracks Provider data quality by analyzing description completeness.

## Overview

This report provides at-a-glance metrics to identify providers with good descriptions versus those needing improvement, enabling data quality teams to prioritize their catalog enrichment efforts.

## Features

- **Quality Metrics Dashboard**: Two KPI cards showing:
  - Good Descriptions: Providers with >20 words in description
  - Needs Improvement: Providers with ≤20 words in description

- **Filtered Data**: Automatically filters to show only relevant providers:
  - `collectionStatus: readyForConsumption`
  - `deprecated: not "Yes"`

- **Drill-Down Capability**: Click "Needs Improvement" card to view detailed list of providers requiring description enhancement

- **Direct LeanIX Links**: Each provider in the drill-down view has a "View in LeanIX" button linking directly to the fact sheet

## Technology Stack

- **React 19** with TypeScript
- **Vite** for build tooling
- **LeanIX Reporting SDK** (@leanix/reporting v0.4.171)
- **LeanIX Design System Components** for consistent UI

## Development

### Prerequisites

- Node.js (LTS version)
- LeanIX workspace with admin access
- LeanIX API token

### Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create `lxr.json` file in project root with your workspace credentials:
   ```json
   {
     "host": "your-instance.leanix.net",
     "apitoken": "your-api-token"
   }
   ```

3. Start development server:
   ```bash
   npm run dev
   ```

4. Access the report through the LeanIX platform:
   ```
   https://{instance}.leanix.net/{workspace}/reporting/dev?url=http://localhost:5173
   ```

### Building

Build for production:
```bash
npm run build
```

Output will be in `dist/` directory, including `bundle.tgz` ready for upload.

### Upload to LeanIX

Upload the report to your workspace:
```bash
npm run upload
```

After upload:
1. Go to **Administration → Reports**
2. Find "Catalog Provider Quality" in the disabled reports list
3. Enable the report
4. Open and save it to your workspace

## Quality Criteria

Provider descriptions are assessed using **3 quality factors**:

**Good Quality (All 3 criteria met)**:
1. **Organization Type**: Mentions company, foundation, developer, vendor, or other organization descriptors (e.g., "Inc.", "LLC", "company", "foundation")
2. **Activity Verbs**: Contains action verbs indicating what the organization does (e.g., "develops", "provides", "manages", "supports", "manufactures")
3. **Word Count**: At least 20 words (based on statistical analysis of high-quality descriptions)

**Needs Improvement (Missing 1+ criteria)**:
- Providers with minimal descriptions, missing organization context, or lacking activity verbs
- Prioritize these for data enrichment using the drill-down modal to see which specific criteria are missing

## Current Metrics

Based on the ltlsCollection workspace (as of 2026-03-02):
- **Total Providers**: 16,016 (after filters)
- **Good Descriptions**: 8,050 (50.3%)
- **Needs Improvement**: 7,966 (49.7%)

## Project Structure

```
src/
├── App.tsx                      # Main component
├── components/
│   ├── OverviewCards.tsx       # KPI cards display
│   ├── DrillDownModal.tsx      # Provider list modal
│   └── ui/                     # LeanIX Design System components
├── types/
│   └── provider.types.ts       # TypeScript interfaces
├── utils/
│   ├── wordCount.ts            # Word counting logic
│   ├── fetchProviders.ts       # GraphQL data fetching
│   └── assessQuality.ts        # Quality assessment
└── App.css                      # Styles
```

## Technical Notes

### GraphQL Query Pattern

The LeanIX Reporting SDK requires inline string interpolation for queries (not parameterized variables):

```typescript
const query = `{
  allFactSheets(
    factSheetType: Provider
    first: 5000
    ${cursor ? `, after: "${cursor}"` : ''}
  ) { ... }
}`;
```

### SDK Initialization

Reports must be accessed through the LeanIX platform URL for proper SDK initialization. Direct localhost access will fail with `this._currentSetup.config` errors.

## Future Enhancements

Potential additions for v2.0:
- Additional quality fields (URL, headquarters, aliases)
- Combined quality score across multiple fields
- Export to CSV functionality
- Historical trend tracking
- Bulk update actions

## Version History

### v1.0.0 (2026-03-02)
- Initial release
- Description quality tracking
- Filtered provider list (readyForConsumption, non-deprecated)
- KPI cards with drill-down modal
- Direct LeanIX inventory links

## Author

Vineet Goyal

## License

Internal LeanIX use only
