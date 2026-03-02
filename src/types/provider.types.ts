/**
 * Provider fact sheet from LeanIX GraphQL API
 */
export interface Provider {
  id: string;
  displayName: string;
  description: string | null;
  providerCategory: string | null;
  homePageUrl: string | null;
  headquartersAddress: string | null;
  relProviderToITComponentCount: number;
  relProviderToProductFamilyCount: number;
}

/**
 * Provider with quality assessment
 */
export interface ProviderQuality extends Provider {
  wordCount: number;
  isGoodQuality: boolean;
  hasCategoryQuality: boolean;
  hasHomepageQuality: boolean;
  hasHeadquartersQuality: boolean;
  hasRelationsQuality: boolean;
}

/**
 * Aggregated quality metrics
 */
export interface QualityMetrics {
  description: {
    good: ProviderQuality[];
    needsImprovement: ProviderQuality[];
  };
  category: {
    good: ProviderQuality[];
    needsImprovement: ProviderQuality[];
  };
  homepage: {
    good: ProviderQuality[];
    needsImprovement: ProviderQuality[];
  };
  headquarters: {
    good: ProviderQuality[];
    needsImprovement: ProviderQuality[];
  };
  relations: {
    good: ProviderQuality[];
    needsImprovement: ProviderQuality[];
  };
  overview: {
    perfect: number;        // 5/5 factors
    good: number;           // 4/5 factors (missing 1)
    fair: number;           // 3/5 factors (missing 2)
    needsWork: number;      // 0-2/5 factors (missing 3+)
  };
  totalCount: number;
}

/**
 * GraphQL response structure for Provider query
 */
export interface ProviderEdge {
  node: Provider;
  cursor: string;
}

export interface ProviderConnection {
  edges: ProviderEdge[];
  pageInfo: {
    hasNextPage: boolean;
    endCursor: string | null;
  };
}

export interface FetchProvidersResponse {
  data: {
    allFactSheets: ProviderConnection;
  };
  errors?: Array<{ message: string }>;
}
