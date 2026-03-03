import type { Provider, ProviderQuality, QualityMetrics } from '../types/provider.types';
import { countWords } from './wordCount';
import { assessDescriptionQuality } from './descriptionQuality';

/**
 * Check if provider has a valid category
 */
function hasValidCategory(providerCategory: string | null): boolean {
  return providerCategory !== null && providerCategory.trim() !== '';
}

/**
 * Check if provider has a valid homepage URL
 */
function hasValidHomepage(homePageUrl: string | null): boolean {
  return homePageUrl !== null && homePageUrl.trim() !== '';
}

/**
 * Check if provider has a valid headquarters address
 */
function hasValidHeadquarters(headquartersAddress: string | null): boolean {
  return headquartersAddress !== null && headquartersAddress.trim() !== '';
}

/**
 * Check if provider has valid relations (IT Component or Product Family)
 */
function hasValidRelations(
  itComponentCount: number,
  productFamilyCount: number
): boolean {
  return itComponentCount > 0 || productFamilyCount > 0;
}

/**
 * Assess quality of provider descriptions and categories
 *
 * @param providers - Array of Provider fact sheets
 * @returns Quality metrics with good/needsImprovement categorization
 */
export function assessProviderQuality(providers: Provider[]): QualityMetrics {
  // Add quality assessment to each provider
  const assessed: ProviderQuality[] = providers.map(provider => {
    const wordCount = countWords(provider.description);
    const descQuality = assessDescriptionQuality(provider.description);

    return {
      ...provider,
      wordCount,
      isGoodQuality: descQuality.isGoodQuality, // All 3 factors must pass
      // Description quality factors (for drill-down display)
      hasOrganizationType: descQuality.hasOrganizationType,
      hasActivityVerbs: descQuality.hasActivityVerbs,
      hasMinimumWordCount: descQuality.hasMinimumWordCount,
      // Other quality factors
      hasCategoryQuality: hasValidCategory(provider.providerCategory),
      hasHomepageQuality: hasValidHomepage(provider.homePageUrl),
      hasHeadquartersQuality: hasValidHeadquarters(provider.headquartersAddress),
      hasRelationsQuality: hasValidRelations(
        provider.relProviderToITComponentCount,
        provider.relProviderToProductFamilyCount
      )
    };
  });

  // Split by description quality
  const descriptionGood = assessed.filter(p => p.isGoodQuality);
  const descriptionNeedsImprovement = assessed.filter(p => !p.isGoodQuality);

  // Split by category quality
  const categoryGood = assessed.filter(p => p.hasCategoryQuality);
  const categoryNeedsImprovement = assessed.filter(p => !p.hasCategoryQuality);

  // Split by homepage quality
  const homepageGood = assessed.filter(p => p.hasHomepageQuality);
  const homepageNeedsImprovement = assessed.filter(p => !p.hasHomepageQuality);

  // Split by headquarters quality
  const headquartersGood = assessed.filter(p => p.hasHeadquartersQuality);
  const headquartersNeedsImprovement = assessed.filter(p => !p.hasHeadquartersQuality);

  // Split by relations quality
  const relationsGood = assessed.filter(p => p.hasRelationsQuality);
  const relationsNeedsImprovement = assessed.filter(p => !p.hasRelationsQuality);

  // Calculate overview distribution (how many factors each provider passes)
  const qualityDistribution = assessed.reduce(
    (acc, provider) => {
      const factorsPassed = [
        provider.isGoodQuality,
        provider.hasCategoryQuality,
        provider.hasHomepageQuality,
        provider.hasHeadquartersQuality,
        provider.hasRelationsQuality
      ].filter(Boolean).length;

      if (factorsPassed === 5) {
        acc.perfect++;
      } else if (factorsPassed === 4) {
        acc.good++;
      } else if (factorsPassed === 3) {
        acc.fair++;
      } else {
        acc.needsWork++;
      }

      return acc;
    },
    { perfect: 0, good: 0, fair: 0, needsWork: 0 }
  );

  return {
    description: {
      good: descriptionGood,
      needsImprovement: descriptionNeedsImprovement
    },
    category: {
      good: categoryGood,
      needsImprovement: categoryNeedsImprovement
    },
    homepage: {
      good: homepageGood,
      needsImprovement: homepageNeedsImprovement
    },
    headquarters: {
      good: headquartersGood,
      needsImprovement: headquartersNeedsImprovement
    },
    relations: {
      good: relationsGood,
      needsImprovement: relationsNeedsImprovement
    },
    overview: qualityDistribution,
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
