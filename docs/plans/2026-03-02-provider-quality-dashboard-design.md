# Provider Quality Dashboard - Design Document

**Date**: 2026-03-02
**Project**: Catalog Provider Quality Custom Report
**Version**: 1.0 (Initial MVP)

---

## Overview

A LeanIX Custom Report dashboard that visualizes Provider data quality metrics, starting with description field quality. The report provides at-a-glance metrics and drill-down capability to identify specific providers needing improvement.

## Objectives

1. Show count of providers with good descriptions (>30 words)
2. Show count of providers needing description improvement (≤30 words)
3. Enable drill-down to see which specific providers need improvement
4. Provide direct links to LeanIX inventory for each provider
5. Build foundation for incremental addition of more quality metrics

## Scope

### In Scope (v1.0)

- Provider description quality tracking (single metric: word count)
- KPI card overview with good/needs-improvement counts
- Drill-down modal showing providers needing improvement
- Direct links to provider fact sheets in LeanIX inventory
- Filters: `collectionStatus: readyForConsumption`, `deprecated: false`

### Out of Scope (Future Versions)

- Additional quality fields (URL, headquarters, aliases, etc.)
- Combined quality score across multiple fields
- Export to CSV functionality
- Historical trends
- Bulk update actions

## Requirements

### Functional Requirements

1. **Data Fetching**
   - Fetch all Provider fact sheets from LeanIX workspace
   - Filter to only `collectionStatus: readyForConsumption`
   - Exclude deprecated providers (`deprecated != "Yes"`)
   - Fetch fields: `id`, `displayName`, `description`

2. **Quality Assessment**
   - Calculate word count for each provider's description
   - Classify as "Good Quality" if >30 words
   - Classify as "Needs Improvement" if ≤30 words
   - Handle null/undefined descriptions as 0 words

3. **Overview Visualization**
   - Display two KPI cards side-by-side
   - Card 1: "Good Descriptions" count (green indicator, non-clickable)
   - Card 2: "Needs Improvement" count (warning indicator, clickable)

4. **Drill-Down Modal**
   - Opens when clicking "Needs Improvement" card
   - Shows list of providers with ≤30 word descriptions
   - Displays: provider name, current word count
   - Each row has "View in LeanIX" button linking to fact sheet

5. **LeanIX Integration**
   - Generate inventory links: `https://{workspace}.leanix.net/factsheet/Provider/{id}`
   - Open links in new tab

### Non-Functional Requirements

1. **Performance**
   - Handle up to 100,000 providers (pagination: 5000/page, max 20 pages)
   - Progressive loading with visual feedback
   - Use React.useMemo for expensive calculations

2. **Usability**
   - Clean, dashboard-like appearance
   - Clear visual indicators (green = good, red/yellow = needs improvement)
   - Obvious clickability on "Needs Improvement" card (hover effects)

3. **Extensibility**
   - Architecture supports adding more quality metrics
   - Component structure scales to multiple KPI cards
   - Easy to add more fields to quality assessment

## Technical Design

### Tech Stack

- **Frontend**: React 19 + TypeScript
- **Build Tool**: Vite
- **LeanIX SDK**: `@leanix/reporting` v0.4.171
- **UI Components**: LeanIX Design System (via leanix-design MCP)
- **Styling**: CSS + Design tokens (--lx-* variables)

### Component Architecture

```
src/
├── App.tsx               # Main component - data fetching & state management
├── components/
│   ├── OverviewCards.tsx # Two LxKpiCard components
│   └── DrillDownModal.tsx # LxModal with provider list
├── types/
│   └── provider.types.ts # TypeScript interfaces
├── utils/
│   └── wordCount.ts      # Word counting logic
├── App.css               # Styles
└── main.tsx              # Entry point
```

### Component Details

#### **App.tsx**

**Responsibilities:**
- Initialize LeanIX SDK (`lx.init()`)
- Fetch Provider data via GraphQL
- Calculate quality metrics
- Manage modal visibility state
- Pass data to child components

**State:**
```typescript
const [providers, setProviders] = useState<Provider[]>([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);
const [isModalOpen, setIsModalOpen] = useState(false);
const [workspaceHost, setWorkspaceHost] = useState<string>('');
```

**Data Flow:**
1. Fetch providers → `setProviders()`
2. Calculate metrics → `useMemo(() => assessQuality(providers))`
3. Pass to `<OverviewCards>` and `<DrillDownModal>`

#### **OverviewCards.tsx**

**Props:**
```typescript
interface OverviewCardsProps {
  goodCount: number;
  needsImprovementCount: number;
  onClickNeedsImprovement: () => void;
}
```

**UI:**
- Two `LxKpiCard` components in flex container
- Good card: green indicator, non-interactive
- Needs improvement card: warning indicator, onClick handler, cursor pointer

#### **DrillDownModal.tsx**

**Props:**
```typescript
interface DrillDownModalProps {
  isOpen: boolean;
  onClose: () => void;
  providers: ProviderQuality[];
  workspaceHost: string;
}
```

**UI:**
- `LxModal` component
- Header: Title + provider count
- Body: Table/list of providers with name, word count, action button
- Footer: Close button

### Data Model

#### **Provider (from LeanIX)**
```typescript
interface Provider {
  id: string;
  displayName: string;
  description: string | null;
}
```

#### **ProviderQuality (assessed)**
```typescript
interface ProviderQuality extends Provider {
  wordCount: number;
  isGoodQuality: boolean;
}
```

#### **QualityMetrics (computed)**
```typescript
interface QualityMetrics {
  good: ProviderQuality[];
  needsImprovement: ProviderQuality[];
  totalCount: number;
}
```

### Data Fetching Strategy

#### **GraphQL Query**

```graphql
query FetchProviders($after: String) {
  allFactSheets(
    factSheetType: Provider
    first: 5000
    after: $after
    filter: {
      facetFilters: [
        { facetKey: "collectionStatus", keys: ["readyForConsumption"] }
        { facetKey: "deprecated", operator: NOT, keys: ["Yes"] }
      ]
    }
  ) {
    edges {
      node {
        id
        displayName
        description
      }
      cursor
    }
    pageInfo {
      hasNextPage
      endCursor
    }
  }
}
```

#### **Pagination Logic**

```typescript
async function fetchAllProviders(): Promise<Provider[]> {
  const PAGE_SIZE = 5000;
  const MAX_PAGES = 20;
  let allProviders: Provider[] = [];
  let cursor: string | null = null;
  let pageCount = 0;

  while (pageCount < MAX_PAGES) {
    const response = await lx.executeGraphQL(query, { after: cursor });
    const edges = response.data.allFactSheets.edges;

    allProviders.push(...edges.map(e => e.node));

    if (!response.data.allFactSheets.pageInfo.hasNextPage) break;
    cursor = response.data.allFactSheets.pageInfo.endCursor;
    pageCount++;
  }

  return allProviders;
}
```

### Quality Assessment Logic

#### **Word Count Function**

```typescript
export function countWords(text: string | null | undefined): number {
  if (!text) return 0;
  return text.trim().split(/\s+/).filter(word => word.length > 0).length;
}
```

**Handles:**
- Null/undefined → 0 words
- Empty strings → 0 words
- Multiple spaces → counted as single separator
- Punctuation → included in word

#### **Quality Assessment Function**

```typescript
export function assessProviderQuality(
  providers: Provider[]
): QualityMetrics {
  const assessed = providers.map(p => ({
    ...p,
    wordCount: countWords(p.description),
    isGoodQuality: countWords(p.description) > 30
  }));

  return {
    good: assessed.filter(p => p.isGoodQuality),
    needsImprovement: assessed.filter(p => !p.isGoodQuality),
    totalCount: providers.length
  };
}
```

### LeanIX Integration

#### **Inventory Link Generation**

```typescript
function generateInventoryLink(
  workspaceHost: string,
  providerId: string
): string {
  return `https://${workspaceHost}/factsheet/Provider/${providerId}`;
}
```

**Example:**
- Workspace: `acme.leanix.net`
- Provider ID: `abc-123-def-456`
- Link: `https://acme.leanix.net/factsheet/Provider/abc-123-def-456`

#### **Getting Workspace Host**

```typescript
const setup = await lx.init();
const workspaceHost = setup.settings.baseUrl.replace('https://', '');
```

## UI/UX Design

### Layout Structure

```
┌─────────────────────────────────────────────────────┐
│  Provider Quality Dashboard                          │
├─────────────────────────────────────────────────────┤
│                                                       │
│  ┌──────────────────┐  ┌──────────────────┐        │
│  │ Good Descriptions│  │Needs Improvement │        │
│  │                  │  │    [CLICKABLE]   │        │
│  │      245         │  │       42         │        │
│  │   >30 words      │  │    ≤30 words     │        │
│  │  [Green badge]   │  │  [Warning badge] │        │
│  └──────────────────┘  └──────────────────┘        │
│                                                       │
└─────────────────────────────────────────────────────┘

When clicking "Needs Improvement" card:

┌─────────────────────────────────────────────────────┐
│  Providers Needing Description Improvement      [X] │
│  42 providers with ≤30 words in description         │
├─────────────────────────────────────────────────────┤
│                                                       │
│  Provider Name          Word Count    Action         │
│  ─────────────────────  ──────────    ──────         │
│  Acme Corp              15            [View in LX]   │
│  Beta Solutions         0             [View in LX]   │
│  Gamma Inc              28            [View in LX]   │
│  ...                                                  │
│                                                       │
├─────────────────────────────────────────────────────┤
│                               [Close]                │
└─────────────────────────────────────────────────────┘
```

### Visual Design

#### **Color Scheme**

- Good quality: Green (`--lx-color-success-500`)
- Needs improvement: Yellow/Red (`--lx-color-warning-500`)
- Background: LeanIX neutral colors
- Text: LeanIX text colors (high contrast)

#### **Typography**

- Card titles: SAP 72 font, medium weight
- Metrics: SAP 72 font, large size, bold
- Provider names: SAP 72 font, regular weight
- Word counts: SAP 72 font, monospace variant

#### **Spacing**

- Card gap: 1.5rem
- Padding: Use LeanIX spacing tokens (`--lx-spacing-*`)
- Modal margins: Standard LxModal defaults

## Error Handling

### Error Scenarios

1. **GraphQL Query Fails**
   - Show `LxBanner` with error message
   - Provide "Retry" button
   - Log error to console

2. **Network Timeout**
   - Show friendly error message
   - Option to retry fetch
   - Don't lose already-fetched data

3. **No Providers Found**
   - Show `LxEmptyState` component
   - Message: "No providers match the current filters"
   - Suggest checking workspace data

4. **Invalid Data Structure**
   - Skip malformed provider records
   - Log warning to console
   - Continue processing valid records

### Loading States

- **Initial load**: Full-page `LxSpinner` with "Loading providers..."
- **Progressive updates**: Update count as pages load
- **Modal opening**: Instant (data already in memory)

## Edge Cases

1. **All providers have good descriptions**
   - "Needs Improvement" card shows "0"
   - Card still clickable, modal shows empty state with success message

2. **All providers need improvement**
   - Highlight metric, perhaps different messaging
   - Modal shows all providers

3. **Null descriptions**
   - Treated as 0 words
   - Counted in "Needs Improvement"

4. **Very long descriptions (>1000 words)**
   - Still counted accurately
   - In modal, show preview (first 100 chars) if needed

5. **Special characters/emojis in descriptions**
   - Word count handles normally (splits on whitespace)

6. **Provider with no displayName**
   - Show ID as fallback
   - Log warning

## Testing Strategy

### Development Testing

```bash
npm run dev  # Local development with hot reload
```

**Manual Test Checklist:**
- [ ] KPI cards display correct counts
- [ ] "Needs Improvement" card opens modal on click
- [ ] Modal shows correct provider list
- [ ] Word counts are accurate
- [ ] "View in LeanIX" links work
- [ ] Modal closes properly
- [ ] Loading spinner shows during fetch
- [ ] Error states display correctly

### Data Validation

- Test with providers having 0, 15, 30, 31, 50, 100+ word descriptions
- Test with null/undefined descriptions
- Test with empty string descriptions
- Verify filters exclude deprecated providers
- Verify filters include only readyForConsumption providers

### Browser Testing

- Test in Chrome (primary)
- Test in Safari (LeanIX requirement)
- Verify responsive design (modal adapts to screen size)

## Deployment

### Build Process

```bash
npm run build  # TypeScript compilation + Vite build
```

### Upload to LeanIX

```bash
npm run upload  # Build + upload to workspace
```

**Prerequisites:**
- `lxr.json` file with workspace credentials
- Increment version in `package.json` (currently 0.0.0 → 1.0.0)

**Report Configuration:**
- Report ID: `catalog.providerquality`
- Title: "Catalog Provider Quality"
- Type: Custom Report

### Versioning Strategy

- **v1.0.0**: Initial release (description quality only)
- **v1.1.0**: Add second quality field
- **v1.2.0**: Add third quality field
- **v2.0.0**: Combined quality score across all fields

## Future Enhancements

### Planned Additions (Incremental)

1. **Additional Quality Fields**
   - URL validation (webpageUrl exists and valid)
   - Headquarters address (city + country present)
   - Aliases (at least one alias present)
   - Each new field = new KPI card

2. **Combined Quality Score**
   - Aggregate metric: "Overall Quality"
   - Percentage of fields meeting criteria
   - Visual: Progress bar or percentage indicator

3. **Export Functionality**
   - Export "Needs Improvement" list to CSV
   - Include all quality metrics in export

4. **Enhanced Drill-Down**
   - Search/filter providers in modal
   - Sort by name, word count, etc.
   - Show preview of description text

5. **Bulk Actions**
   - Select multiple providers in modal
   - Bulk open in LeanIX (future)

### Architecture Supports

- Easy to add more `assessQuality` functions for new fields
- KPI card array can scale to 6-8 cards comfortably
- Modal content can be enhanced without changing overview

## Dependencies

### NPM Packages

- `@leanix/reporting`: ^0.4.171
- `react`: ^19.2.4
- `react-dom`: ^19.2.4
- `chart.js`: ^4.5.1 (currently installed, may not need)

### LeanIX Design System Components

Components to be fetched via leanix-design MCP:
- `LxKpiCard` - Main metric cards
- `LxModal` - Drill-down modal
- `LxButton` - Action buttons
- `LxBanner` - Error messages
- `LxSpinner` - Loading indicator
- `LxEmptyState` - No data state

### Development Dependencies

- TypeScript
- Vite
- ESLint
- @sap/vite-plugin-leanix-custom-report

## References

- **LeanIX Reporting SDK**: Custom report guide (from MCP)
- **LeanIX Design System**: Component library (leanix-design MCP)
- **Provider Description Guidelines**: `/Users/I529175/Desktop/Claude/Sample good datasets/Provider Creation/Provider_Description_Guidelines.md`
- **Similar Project**: Factsheet Data Quality report (`../factsheet-data-quality/`)

## Success Criteria

### MVP Launch (v1.0)

- [ ] Report displays in LeanIX workspace
- [ ] Correctly filters to readyForConsumption, non-deprecated providers
- [ ] Accurately counts words in descriptions
- [ ] KPI cards show correct metrics
- [ ] Modal opens/closes properly
- [ ] LeanIX inventory links work
- [ ] No console errors
- [ ] Professional appearance using LeanIX design system

### User Acceptance

- [ ] Users can quickly see provider description quality at a glance
- [ ] Users can identify which providers need improvement
- [ ] Users can easily navigate to provider fact sheets
- [ ] Report loads in <5 seconds for typical workspace (~500-1000 providers)

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Large provider count (>100k) causes performance issues | High | Pagination with 5000/page limit, progressive loading |
| Word count algorithm doesn't handle edge cases | Medium | Comprehensive testing, handle null/undefined |
| LeanIX design components not compatible | High | Fetch components early, verify compatibility |
| Users want more fields immediately | Low | Explain incremental approach, v1.1 timeline |

## Timeline Estimate

- Setup & component fetching: ~30 minutes
- Core data fetching implementation: ~1 hour
- UI implementation (cards + modal): ~1.5 hours
- Testing & debugging: ~1 hour
- Documentation: ~30 minutes

**Total**: ~4-5 hours for v1.0

---

**Document Status**: Approved
**Next Step**: Create implementation plan with writing-plans skill
