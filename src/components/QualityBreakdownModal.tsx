import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { Search } from 'lucide-react';
import { lx } from '@leanix/reporting';
import { SimpleModal } from './ui/SimpleModal';
import type { ProviderQuality } from '../types/provider.types';
import './QualityBreakdownModal.css';

interface QualityBreakdownModalProps {
  isOpen: boolean;
  onClose: () => void;
  baseUrl: string;
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

const QUALITY_FACTORS = [
  { key: 'isGoodQuality', label: 'Desc', tooltip: 'Description Quality (>20 words)' },
  { key: 'hasCategoryQuality', label: 'Category', tooltip: 'Category Presence' },
  { key: 'hasHomepageQuality', label: 'Homepage', tooltip: 'Homepage URL Presence' },
  { key: 'hasHeadquartersQuality', label: 'HQ', tooltip: 'Headquarters Address Presence' },
  { key: 'hasRelationsQuality', label: 'Relations', tooltip: 'IT Component or Product Family Relations' },
];

const INITIAL_LOAD = 50;
const LOAD_MORE_THRESHOLD = 100;

export function QualityBreakdownModal({
  isOpen,
  onClose,
  baseUrl,
  providers,
  level
}: QualityBreakdownModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [displayCount, setDisplayCount] = useState(INITIAL_LOAD);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const config = LEVEL_CONFIG[level];

  // Filter providers by search query
  const filteredProviders = useMemo(() => {
    if (!searchQuery.trim()) return providers;

    const query = searchQuery.toLowerCase();
    return providers.filter(provider =>
      (provider.displayName || provider.id).toLowerCase().includes(query)
    );
  }, [providers, searchQuery]);

  // Displayed providers (for lazy loading)
  const displayedProviders = useMemo(() => {
    return filteredProviders.slice(0, displayCount);
  }, [filteredProviders, displayCount]);

  // Reset display count when modal opens
  useEffect(() => {
    if (isOpen) {
      setDisplayCount(INITIAL_LOAD);
      setSearchQuery('');
    }
  }, [isOpen]);

  // Lazy loading on scroll
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = scrollContainer;
      const distanceFromBottom = scrollHeight - scrollTop - clientHeight;

      if (distanceFromBottom < LOAD_MORE_THRESHOLD && displayCount < filteredProviders.length) {
        setDisplayCount((prev) => Math.min(prev + INITIAL_LOAD, filteredProviders.length));
      }
    };

    scrollContainer.addEventListener('scroll', handleScroll);

    return () => {
      scrollContainer.removeEventListener('scroll', handleScroll);
    };
  }, [displayCount, filteredProviders.length]);

  // Truncate provider name
  const truncateName = useCallback((name: string, maxLength: number = 12) => {
    if (name.length <= maxLength) return name;
    return name.substring(0, maxLength) + '...';
  }, []);

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
        title={`${config.title} (0)`}
        subtitle={config.description}
      >
        <div style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>
          No providers in this quality tier
        </div>
      </SimpleModal>
    );
  }

  return (
    <SimpleModal
      isOpen={isOpen}
      onClose={onClose}
      title={`${config.title} (${filteredProviders.length.toLocaleString()})`}
      subtitle={config.description}
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

      {filteredProviders.length === 0 ? (
        <div className="no-results">
          <p>No providers found matching "{searchQuery}"</p>
        </div>
      ) : (
        <>
          <div className="executive-overview-count">
            Showing {displayedProviders.length} of {filteredProviders.length} providers
          </div>

          <div
            ref={scrollContainerRef}
            className="executive-overview-table-container"
          >
            <table className="executive-overview-table">
              <thead>
                <tr>
                  <th className="provider-name-col">Provider</th>
                  {QUALITY_FACTORS.map((factor) => (
                    <th key={factor.key} className="factor-col" title={factor.tooltip}>
                      {factor.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {displayedProviders.map((provider) => (
                  <tr key={provider.id}>
                    <td className="provider-name-cell" title={provider.displayName}>
                      <a
                        href={getInventoryLink(provider.id)}
                        className="provider-link"
                        onClick={(e) => {
                          e.preventDefault();
                          lx.openLink(getInventoryLink(provider.id));
                        }}
                      >
                        {truncateName(provider.displayName || provider.id)}
                      </a>
                    </td>
                    {QUALITY_FACTORS.map((factor) => {
                      const passes = provider[factor.key as keyof ProviderQuality] as boolean;
                      return (
                        <td key={factor.key} className="factor-cell">
                          {passes ? (
                            <span className="check-icon" title="Meets quality">✓</span>
                          ) : (
                            <span className="cross-icon" title="Needs improvement">✗</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
            {displayCount < filteredProviders.length && (
              <div className="loading-indicator">
                Scroll down to load more ({(filteredProviders.length - displayCount).toLocaleString()} remaining)
              </div>
            )}
          </div>
        </>
      )}
    </SimpleModal>
  );
}
