import { useState, useMemo } from 'react';
import { Search, Check, X } from 'lucide-react';
import {
  SimpleModal,
  SimpleModalHeader,
  SimpleModalContent,
  SimpleModalFooter,
  SimpleModalTitle,
  SimpleModalDescription
} from './ui/simple-modal';
import { LxEmptyState } from './ui/lx-empty-state';
import type { ProviderQuality } from '../types/provider.types';
import './QualityBreakdownModal.css';

interface QualityBreakdownModalProps {
  isOpen: boolean;
  onClose: () => void;
  providers: ProviderQuality[];
  level: 'perfect' | 'good' | 'fair' | 'needsWork';
}

const LEVEL_CONFIG = {
  perfect: {
    title: 'Perfect Quality Providers',
    description: 'all 5 factors met'
  },
  good: {
    title: 'Good Quality Providers',
    description: 'lacking 1 factor'
  },
  fair: {
    title: 'Fair Quality Providers',
    description: 'lacking 2 factors'
  },
  needsWork: {
    title: 'Needs Work Providers',
    description: 'lacking 3+ factors'
  }
};

export function QualityBreakdownModal({
  isOpen,
  onClose,
  providers,
  level
}: QualityBreakdownModalProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter providers by search query
  const filteredProviders = useMemo(() => {
    if (!searchQuery.trim()) return providers;

    const query = searchQuery.toLowerCase();
    return providers.filter(provider =>
      (provider.displayName || provider.id).toLowerCase().includes(query)
    );
  }, [providers, searchQuery]);

  const config = LEVEL_CONFIG[level];

  return (
    <SimpleModal
      isOpen={isOpen}
      onClose={onClose}
      size="3xl"
      className="max-w-7xl"
    >
      <SimpleModalHeader>
        <SimpleModalTitle>{config.title}</SimpleModalTitle>
        <SimpleModalDescription>
          {filteredProviders.length} of {providers.length} providers with {config.description}
        </SimpleModalDescription>
      </SimpleModalHeader>

      <SimpleModalContent>
        {providers.length === 0 ? (
          <LxEmptyState title="No providers in this category" />
        ) : (
          <>
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
              <table className="breakdown-table">
                <thead>
                  <tr>
                    <th className="breakdown-table__name">Provider Name</th>
                    <th className="breakdown-table__factor">Description</th>
                    <th className="breakdown-table__factor">Category</th>
                    <th className="breakdown-table__factor">Homepage</th>
                    <th className="breakdown-table__factor">Headquarters</th>
                    <th className="breakdown-table__factor">Relations</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProviders.map(provider => (
                    <tr key={provider.id}>
                      <td className="breakdown-table__name">
                        {provider.displayName || provider.id}
                      </td>
                      <td className="breakdown-table__factor">
                        {provider.isGoodQuality ? (
                          <Check className="factor-icon factor-icon--pass" size={20} />
                        ) : (
                          <X className="factor-icon factor-icon--fail" size={20} />
                        )}
                      </td>
                      <td className="breakdown-table__factor">
                        {provider.hasCategoryQuality ? (
                          <Check className="factor-icon factor-icon--pass" size={20} />
                        ) : (
                          <X className="factor-icon factor-icon--fail" size={20} />
                        )}
                      </td>
                      <td className="breakdown-table__factor">
                        {provider.hasHomepageQuality ? (
                          <Check className="factor-icon factor-icon--pass" size={20} />
                        ) : (
                          <X className="factor-icon factor-icon--fail" size={20} />
                        )}
                      </td>
                      <td className="breakdown-table__factor">
                        {provider.hasHeadquartersQuality ? (
                          <Check className="factor-icon factor-icon--pass" size={20} />
                        ) : (
                          <X className="factor-icon factor-icon--fail" size={20} />
                        )}
                      </td>
                      <td className="breakdown-table__factor">
                        {provider.hasRelationsQuality ? (
                          <Check className="factor-icon factor-icon--pass" size={20} />
                        ) : (
                          <X className="factor-icon factor-icon--fail" size={20} />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </>
        )}
      </SimpleModalContent>

      <SimpleModalFooter>
        <button
          onClick={onClose}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          Close
        </button>
      </SimpleModalFooter>
    </SimpleModal>
  );
}
