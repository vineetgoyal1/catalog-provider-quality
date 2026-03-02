import { lx } from '@leanix/reporting';
import type { Provider } from '../types/provider.types';

const PAGE_SIZE = 1000; // Reduced from 5000 for faster initial response
const MAX_PAGES = 100; // Increased to handle more total providers

/**
 * Fetch all providers from LeanIX workspace with pagination
 *
 * @param onProgress - Optional callback for progress updates (page count, total fetched, current providers, hasMore)
 * @returns Array of Provider fact sheets
 * @throws Error if GraphQL query fails
 */
export async function fetchAllProviders(
  onProgress?: (page: number, totalFetched: number, providers: Provider[], hasMore: boolean) => void
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
                providerCategory
                homePageUrl
                headquartersAddress
                relProviderToITComponent {
                  totalCount
                }
                relProviderToProductFamily {
                  totalCount
                }
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
        .map((edge: any) => ({
          ...edge.node,
          relProviderToITComponentCount: edge.node.relProviderToITComponent?.totalCount || 0,
          relProviderToProductFamilyCount: edge.node.relProviderToProductFamily?.totalCount || 0
        }))
        .filter((provider: any) =>
          provider.collectionStatus === 'readyForConsumption' &&
          provider.deprecated !== 'Yes'
        );

      allProviders.push(...providers);
      pageCount++;

      // Check if there are more pages
      const { hasNextPage, endCursor } = allFactSheets.pageInfo;

      // Report progress with current providers and hasMore flag
      if (onProgress) {
        onProgress(pageCount, allProviders.length, [...allProviders], hasNextPage);
      }

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
