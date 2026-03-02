/**
 * Provider fact sheet from LeanIX GraphQL API
 */
export interface Provider {
  id: string;
  displayName: string;
  description: string | null;
}

/**
 * Provider with quality assessment
 */
export interface ProviderQuality extends Provider {
  wordCount: number;
  isGoodQuality: boolean;
}

/**
 * Aggregated quality metrics
 */
export interface QualityMetrics {
  good: ProviderQuality[];
  needsImprovement: ProviderQuality[];
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
