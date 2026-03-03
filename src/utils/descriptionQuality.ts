/**
 * Description Quality Assessment Utilities
 *
 * Evaluates provider descriptions based on 3 quality factors:
 * 1. Organization Type (entity identification)
 * 2. Activity Verbs (what the organization does)
 * 3. Word Count (minimum 20 words)
 */

import { countWords } from './wordCount';

/**
 * Check if description mentions organization type
 *
 * Simple keyword matching for organization types:
 * - Legal entity suffixes (Inc., Corp., LLC, etc.)
 * - Organization descriptors (company, provider, foundation, etc.)
 *
 * @param text - Description text
 * @returns true if organization type is mentioned
 */
export function hasOrganizationType(text: string | null | undefined): boolean {
  if (!text) return false;

  const lowerText = text.toLowerCase();

  // Check for legal entity suffixes
  const legalEntityPattern = /\b(Inc\.|Incorporated|Corp\.|Corporation|LLC|L\.L\.C\.|Ltd\.|Limited|Co\.|Company|GmbH|AG|SA|SAS|SARL|S\.p\.A\.|BV|AB|Oy|S\.A\.)\b/i;
  if (legalEntityPattern.test(text)) return true;

  // Organization descriptors
  const orgDescriptors = [
    'company', 'corporation', 'firm', 'organization', 'organisation',
    'vendor', 'startup', 'start-up', 'foundation', 'consortium', 'association',
    'developer', 'individual', 'nonprofit', 'non-profit', 'ngo', 'enterprise',
    'provider', 'business', 'group',
    'division', 'subsidiary', 'unit',
    'project', 'manufacturer', 'partner',
    'open-source', 'open source',
    'technology company', 'software company', 'saas provider', 'platform provider',
    'software vendor', 'tech company', 'software firm'
  ];

  return orgDescriptors.some(descriptor => lowerText.includes(descriptor));
}

/**
 * Check if description contains activity verbs
 *
 * Simple keyword matching for activity verbs that indicate what the organization does.
 *
 * @param text - Description text
 * @returns true if activity verbs are present
 */
export function hasActivityVerbs(text: string | null | undefined): boolean {
  if (!text) return false;

  const lowerText = text.toLowerCase();

  const activityVerbs = [
    // Creation/Development
    'develops', 'develop', 'developing', 'creates', 'create', 'creating',
    'designs', 'design', 'builds', 'build', 'building',
    'produces', 'produce', 'constructs', 'construct',
    'engineers', 'engineer', 'launches', 'launch', 'pioneers', 'pioneer',
    'makes', 'make', 'making',

    // Provision/Delivery
    'provides', 'provide', 'providing', 'delivers', 'deliver', 'delivering',
    'offers', 'offer', 'offering', 'supplies', 'supply', 'distributes', 'distribute',

    // Operations/Maintenance
    'maintains', 'maintain', 'operates', 'operate', 'manages', 'manage', 'managing',
    'runs', 'run', 'supports', 'support', 'supporting', 'hosts', 'host', 'hosting',

    // Specialization
    'specializes', 'specialize', 'specializing',
    'focuses', 'focus', 'focusing', 'focused',

    // Ownership
    'owns', 'own',

    // Service
    'serves', 'serve', 'serving',

    // Manufacturing/Production
    'manufactures', 'manufacture', 'assembles', 'assemble', 'fabricates', 'fabricate',

    // Other Business Activities
    'establishes', 'establish', 'implements', 'implement', 'expands', 'expand',
    'generates', 'generate', 'publishes', 'publish', 'publishing', 'contributes', 'contribute'
  ];

  return activityVerbs.some(verb => {
    const pattern = new RegExp(`\\b${verb}\\b`, 'i');
    return pattern.test(lowerText);
  });
}

/**
 * Check if description meets minimum word count
 *
 * @param text - Description text
 * @returns true if word count >= 20
 */
export function hasMinimumWordCount(text: string | null | undefined): boolean {
  return countWords(text) >= 20;
}

/**
 * Assess overall description quality based on 3 factors
 *
 * Quality factors:
 * 1. Organization Type mentioned (company, foundation, developer, etc.)
 * 2. Activity Verbs present (develops, provides, maintains, etc.)
 * 3. Word Count >= 20
 *
 * @param text - Description text
 * @returns Object with quality assessment
 */
export interface DescriptionQualityAssessment {
  hasOrganizationType: boolean;
  hasActivityVerbs: boolean;
  hasMinimumWordCount: boolean;
  wordCount: number;
  factorsPassed: number;
  isGoodQuality: boolean; // true if all 3 factors pass
}

export function assessDescriptionQuality(text: string | null | undefined): DescriptionQualityAssessment {
  const wordCount = countWords(text);

  const orgType = hasOrganizationType(text);
  const activity = hasActivityVerbs(text);
  const minWords = hasMinimumWordCount(text);

  const factorsPassed = [orgType, activity, minWords].filter(Boolean).length;

  return {
    hasOrganizationType: orgType,
    hasActivityVerbs: activity,
    hasMinimumWordCount: minWords,
    wordCount,
    factorsPassed,
    isGoodQuality: factorsPassed === 3 // All 3 factors must pass
  };
}
