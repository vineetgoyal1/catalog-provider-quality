import { lx } from '@leanix/reporting';
import type { Provider, FetchProvidersResponse } from '../types/provider.types';

const PAGE_SIZE = 5000;
const MAX_PAGES = 20;

/**
 * GraphQL query to fetch Provider fact sheets
 * Filters: collectionStatus = readyForConsumption, deprecated != Yes
 */
const PROVIDER_QUERY = `
  query FetchProviders($after: String) {
    allFactSheets(
      factSheetType: Provider
      first: ${PAGE_SIZE}
      after: $after
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
`;

/**
 * Fetch all providers from LeanIX workspace with pagination
 *
 * @param onProgress - Optional callback for progress updates (page count, total fetched)
 * @returns Array of Provider fact sheets
 * @throws Error if GraphQL query fails
 */
export async function fetchAllProviders(
  onProgress?: (page: number, totalFetched: number) => void
): Promise<Provider[]> {
  const allProviders: Provider[] = [];
  let cursor: string | null = null;
  let pageCount = 0;

  while (pageCount < MAX_PAGES) {
    try {
      const response: FetchProvidersResponse = await lx.executeGraphQL(
        PROVIDER_QUERY,
        { after: cursor || undefined }
      );

      // Check for GraphQL errors
      if (response.errors && response.errors.length > 0) {
        const errorMessages = response.errors.map(e => e.message).join(', ');
        throw new Error(`GraphQL errors: ${errorMessages}`);
      }

      const edges = response.data.allFactSheets.edges;
      const providers = edges.map(edge => edge.node);

      allProviders.push(...providers);
      pageCount++;

      // Report progress
      if (onProgress) {
        onProgress(pageCount, allProviders.length);
      }

      // Check if there are more pages
      const { hasNextPage, endCursor } = response.data.allFactSheets.pageInfo;
      if (!hasNextPage || !endCursor) {
        break;
      }

      cursor = endCursor;
    } catch (error) {
      console.error('Error fetching providers:', error);
      throw error;
    }
  }

  return allProviders;
}
