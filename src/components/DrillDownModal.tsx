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

  // Handle empty state
  if (providers.length === 0) {
    return (
      <SimpleModal
        isOpen={isOpen}
        onClose={onClose}
        title={title}
        subtitle={`0 ${subtitle}`}
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
    >
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
                <th className="word-count-col">
                  {mode === 'description' ? 'Word Count' :
                   mode === 'category' ? 'Category' :
                   mode === 'homepage' ? 'Homepage URL' :
                   mode === 'headquarters' ? 'Headquarters' :
                   'Relations'}
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredProviders.map(provider => (
                <tr key={provider.id}>
                  <td className="provider-name-col">
                    <a
                      href={getInventoryLink(provider.id)}
                      className="provider-link"
                      onClick={(e) => {
                        e.preventDefault();
                        lx.openLink(getInventoryLink(provider.id));
                      }}
                    >
                      {provider.displayName || provider.id}
                    </a>
                  </td>
                  <td className="word-count-col">
                    {mode === 'description' && `${provider.wordCount} words`}
                    {mode === 'category' && (provider.providerCategory || '-')}
                    {mode === 'homepage' && (provider.homePageUrl || '-')}
                    {mode === 'headquarters' && (provider.headquartersAddress || '-')}
                    {mode === 'relations' && (
                      `${provider.relProviderToITComponentCount + provider.relProviderToProductFamilyCount} relation${(provider.relProviderToITComponentCount + provider.relProviderToProductFamilyCount) !== 1 ? 's' : ''}`
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </SimpleModal>
  );
}
