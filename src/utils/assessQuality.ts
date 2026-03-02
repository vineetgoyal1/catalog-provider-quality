import type { Provider, ProviderQuality, QualityMetrics } from '../types/provider.types';
import { countWords, isGoodQuality } from './wordCount';

/**
 * Assess quality of provider descriptions
 *
 * @param providers - Array of Provider fact sheets
 * @returns Quality metrics with good/needsImprovement categorization
 */
export function assessProviderQuality(providers: Provider[]): QualityMetrics {
  // Add quality assessment to each provider
  const assessed: ProviderQuality[] = providers.map(provider => {
    const wordCount = countWords(provider.description);

    return {
      ...provider,
      wordCount,
      isGoodQuality: isGoodQuality(provider.description)
    };
  });

  // Split into good and needs improvement
  const good = assessed.filter(p => p.isGoodQuality);
  const needsImprovement = assessed.filter(p => !p.isGoodQuality);

  return {
    good,
    needsImprovement,
    totalCount: providers.length
  };
}

/**
 * Generate LeanIX inventory link for a provider fact sheet
 *
 * @param workspaceHost - LeanIX workspace host (e.g., "acme.leanix.net")
 * @param providerId - Provider fact sheet ID
 * @returns Full URL to provider fact sheet in LeanIX inventory
 */
export function generateInventoryLink(
  workspaceHost: string,
  providerId: string
): string {
  return `https://${workspaceHost}/factsheet/Provider/${providerId}`;
}
