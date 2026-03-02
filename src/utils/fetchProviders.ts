import { lx } from '@leanix/reporting';
import type { Provider } from '../types/provider.types';

const PAGE_SIZE = 5000;
const MAX_PAGES = 20;

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
      // Build query with inline cursor (no GraphQL variables - SDK doesn't support them properly)
      const query = `{
        allFactSheets(
          factSheetType: Provider
          first: ${PAGE_SIZE}
          ${cursor ? `, after: "${cursor}"` : ''}
        ) {
          totalCount
          pageInfo {
            hasNextPage
            endCursor
          }
          edges {
            node {
              id
              displayName
              description
              ... on Provider {
                collectionStatus
                deprecated
              }
            }
          }
        }
      }`;

      const response: any = await lx.executeGraphQL(query);

      // LeanIX SDK returns data directly, not wrapped
      const allFactSheets = response.allFactSheets;

      if (!allFactSheets) {
        console.error('No allFactSheets in response:', response);
        throw new Error('No allFactSheets in response');
      }

      const edges = allFactSheets.edges || [];

      // Filter: only readyForConsumption and not deprecated
      const providers = edges
        .map((edge: any) => edge.node)
        .filter((provider: any) =>
          provider.collectionStatus === 'readyForConsumption' &&
          provider.deprecated !== 'Yes'
        );

      allProviders.push(...providers);
      pageCount++;

      // Report progress
      if (onProgress) {
        onProgress(pageCount, allProviders.length);
      }

      // Check if there are more pages
      const { hasNextPage, endCursor } = allFactSheets.pageInfo;

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
