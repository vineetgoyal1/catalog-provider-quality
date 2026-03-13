import { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import { lx } from '@leanix/reporting';
import { SimpleModal } from './ui/SimpleModal';
import type { ProviderQuality } from '../types/provider.types';
import './DrillDownModal.css';

interface DrillDownModalProps {
  isOpen: boolean;
  onClose: () => void;
  baseUrl: string;
  providers: ProviderQuality[];
  title: string;
  subtitle: string;
  mode: 'description' | 'category' | 'homepage' | 'headquarters' | 'relations';
}

export function DrillDownModal({
  isOpen,
  onClose,
  baseUrl,
  providers,
  title,
  subtitle,
  mode
}: DrillDownModalProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter providers by search query
  const filteredProviders = useMemo(() => {
    if (!searchQuery.trim()) return providers;

    const query = searchQuery.toLowerCase();
    return providers.filter(provider =>
      (provider.displayName || provider.id).toLowerCase().includes(query)
    );
  }, [providers, searchQuery]);

  // Generate LeanIX inventory link using baseUrl from SDK
  const getInventoryLink = (providerId: string) => {
    return `${baseUrl}/factsheet/Provider/${providerId}`;
  };

  // Determine modal size based on mode
  const modalSize = mode === 'description' ? 'large' : mode === 'relations' ? 'medium-large' : 'medium';

  // Handle empty state
  if (providers.length === 0) {
    return (
      <SimpleModal
        isOpen={isOpen}
        onClose={onClose}
        title={title}
        subtitle={`0 ${subtitle}`}
        size={modalSize}
      >
        <div style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>
          No providers need improvement
        </div>
      </SimpleModal>
    );
  }

  return (
    <SimpleModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      subtitle={`${filteredProviders.length} of ${providers.length} ${subtitle}`}
      size={modalSize}
    >
      {/* Criteria explanation for description mode */}
      {mode === 'description' && (
        <div className="criteria-explanation">
          <div className="criteria-item">
            <strong>Activity Verbs:</strong> Action words describing what the organization does <span className="criteria-examples">(e.g., "develops software", "provides services", "maintains platforms")</span>
          </div>
          <div className="criteria-item">
            <strong>Organization Type:</strong> Identifies the type of entity <span className="criteria-examples">(e.g., "company", "foundation", "developer", "provider")</span>
          </div>
        </div>
      )}

      {/* Search Bar */}
      <div className="search-container">
        <Search size={20} className="search-icon" />
        <input
          type="text"
          placeholder="Search providers by name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="search-clear"
            aria-label="Clear search"
          >
            ×
          </button>
        )}
      </div>

      {/* Table */}
      {filteredProviders.length === 0 ? (
        <div className="no-results">
          <p>No providers found matching "{searchQuery}"</p>
        </div>
      ) : (
        <div className="drilldown-table-container">
          <table className="drilldown-table">
            <thead>
              <tr>
                <th className="provider-name-col">Provider Name</th>
                {mode === 'description' && (
                  <th className="description-col">Description</th>
                )}
                {mode === 'description' ? (
                  <>
                    <th className="factor-col" title="Organization Type">Org Type</th>
                    <th className="factor-col" title="Activity Verbs">Activity</th>
                    <th className="factor-col" title="Word Count (≥20)">Words</th>
                  </>
                ) : mode === 'relations' ? (
                  <>
                    <th className="word-count-col" title="IT Component Relations">IT Components</th>
                    <th className="word-count-col" title="Product Family Relations">Product Families</th>
                  </>
                ) : (
                  <th className="word-count-col">
                    {mode === 'category' ? 'Category' :
                     mode === 'homepage' ? 'Homepage URL' :
                     'Headquarters'}
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {filteredProviders.map(provider => (
                <tr key={provider.id}>
                  <td className="provider-name-col">
                    <div className="provider-name-text">
                      <a
                        href={getInventoryLink(provider.id)}
                        className="provider-link"
                        onClick={(e) => {
                          e.preventDefault();
                          lx.openLink(getInventoryLink(provider.id));
                        }}
                        title={provider.displayName || provider.id}
                      >
                        {provider.displayName || provider.id}
                      </a>
                    </div>
                  </td>
                  {mode === 'description' && (
                    <td className="description-col">
                      <div className="description-text" title={provider.description || ''}>
                        {provider.description || '-'}
                      </div>
                    </td>
                  )}
                  {mode === 'description' ? (
                    <>
                      <td className="factor-col">
                        {provider.hasOrganizationType ? (
                          <span className="check-icon" title="Has organization type" aria-label="Passes organization type check" role="img">✓</span>
                        ) : (
                          <span className="cross-icon" title="Missing organization type" aria-label="Fails organization type check" role="img">✗</span>
                        )}
                      </td>
                      <td className="factor-col">
                        {provider.hasActivityVerbs ? (
                          <span className="check-icon" title="Has activity verbs" aria-label="Passes activity verbs check" role="img">✓</span>
                        ) : (
                          <span className="cross-icon" title="Missing activity verbs" aria-label="Fails activity verbs check" role="img">✗</span>
                        )}
                      </td>
                      <td className="factor-col">
                        {provider.hasMinimumWordCount ? (
                          <span className="check-icon" title={`${provider.wordCount} words`} aria-label={`Passes word count check with ${provider.wordCount} words`} role="img">✓</span>
                        ) : (
                          <span className="cross-icon" title={`${provider.wordCount} words (need ≥20)`} aria-label={`Fails word count check with ${provider.wordCount} words (need 20 or more)`} role="img">✗</span>
                        )}
                      </td>
                    </>
                  ) : mode === 'relations' ? (
                    <>
                      <td className="word-count-col">
                        {provider.relProviderToITComponentCount}
                      </td>
                      <td className="word-count-col">
                        {provider.relProviderToProductFamilyCount}
                      </td>
                    </>
                  ) : (
                    <td className="word-count-col">
                      {mode === 'category' && (provider.providerCategory || '-')}
                      {mode === 'homepage' && (provider.homePageUrl || '-')}
                      {mode === 'headquarters' && (provider.headquartersAddress || '-')}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </SimpleModal>
  );
}
