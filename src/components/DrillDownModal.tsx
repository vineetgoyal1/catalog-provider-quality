import { useState, useMemo } from 'react';
import { Search, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
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
import './DrillDownModal.css';

interface DrillDownModalProps {
  isOpen: boolean;
  onClose: () => void;
  providers: ProviderQuality[];
  title: string;
  subtitle: string;
  mode: 'description' | 'category' | 'homepage' | 'headquarters' | 'relations';
}

type SortField = 'name' | 'wordCount';
type SortDirection = 'asc' | 'desc' | null;

export function DrillDownModal({
  isOpen,
  onClose,
  providers,
  title,
  subtitle,
  mode
}: DrillDownModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Cycle through: asc -> desc -> null
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortField(null);
        setSortDirection(null);
      }
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Filter and sort providers
  const filteredAndSortedProviders = useMemo(() => {
    let result = [...providers];

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(provider =>
        (provider.displayName || provider.id).toLowerCase().includes(query)
      );
    }

    // Sort
    if (sortField && sortDirection) {
      result.sort((a, b) => {
        let compareValue = 0;

        if (sortField === 'name') {
          const nameA = (a.displayName || a.id).toLowerCase();
          const nameB = (b.displayName || b.id).toLowerCase();
          compareValue = nameA.localeCompare(nameB);
        } else if (sortField === 'wordCount') {
          compareValue = a.wordCount - b.wordCount;
        }

        return sortDirection === 'asc' ? compareValue : -compareValue;
      });
    }

    return result;
  }, [providers, searchQuery, sortField, sortDirection]);

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown size={16} className="sort-icon sort-icon--inactive" />;
    }
    if (sortDirection === 'asc') {
      return <ArrowUp size={16} className="sort-icon sort-icon--active" />;
    }
    return <ArrowDown size={16} className="sort-icon sort-icon--active" />;
  };

  return (
    <SimpleModal
      isOpen={isOpen}
      onClose={onClose}
      size="3xl"
      className="max-w-6xl"
    >
      <SimpleModalHeader>
        <SimpleModalTitle>{title}</SimpleModalTitle>
        <SimpleModalDescription>
          {filteredAndSortedProviders.length} of {providers.length} {subtitle}
        </SimpleModalDescription>
      </SimpleModalHeader>

      <SimpleModalContent>
        {providers.length === 0 ? (
          <LxEmptyState
            title="No providers need improvement"
          />
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
            {filteredAndSortedProviders.length === 0 ? (
              <div className="no-results">
                <p>No providers found matching "{searchQuery}"</p>
              </div>
            ) : mode === 'description' ? (
              <table className="provider-table">
                <thead>
                  <tr>
                    <th
                      className="sortable-header provider-table__name"
                      onClick={() => handleSort('name')}
                    >
                      <span className="header-content">
                        Provider Name
                        {getSortIcon('name')}
                      </span>
                    </th>
                    <th className="provider-table__description">Description</th>
                    <th
                      className="sortable-header provider-table__count"
                      onClick={() => handleSort('wordCount')}
                    >
                      <span className="header-content">
                        Word Count
                        {getSortIcon('wordCount')}
                      </span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAndSortedProviders.map(provider => (
                    <tr key={provider.id}>
                      <td className="provider-table__name">
                        {provider.displayName || provider.id}
                      </td>
                      <td className="provider-table__description">
                        {provider.description || <em className="text-gray-400">No description</em>}
                      </td>
                      <td className="provider-table__count">
                        <span>{provider.wordCount}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : mode === 'category' ? (
              <table className="provider-table">
                <thead>
                  <tr>
                    <th
                      className="sortable-header provider-table__name-category"
                      onClick={() => handleSort('name')}
                    >
                      <span className="header-content">
                        Provider Name
                        {getSortIcon('name')}
                      </span>
                    </th>
                    <th className="provider-table__category">Provider Category</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAndSortedProviders.map(provider => (
                    <tr key={provider.id}>
                      <td className="provider-table__name-category">
                        {provider.displayName || provider.id}
                      </td>
                      <td className="provider-table__category">
                        {provider.providerCategory || <em className="text-gray-400">No category</em>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : mode === 'headquarters' ? (
              <table className="provider-table">
                <thead>
                  <tr>
                    <th
                      className="sortable-header provider-table__name-headquarters"
                      onClick={() => handleSort('name')}
                    >
                      <span className="header-content">
                        Provider Name
                        {getSortIcon('name')}
                      </span>
                    </th>
                    <th className="provider-table__headquarters">Headquarters Address</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAndSortedProviders.map(provider => (
                    <tr key={provider.id}>
                      <td className="provider-table__name-headquarters">
                        {provider.displayName || provider.id}
                      </td>
                      <td className="provider-table__headquarters">
                        {provider.headquartersAddress || <em className="text-gray-400">No headquarters address</em>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : mode === 'relations' ? (
              <table className="provider-table">
                <thead>
                  <tr>
                    <th
                      className="sortable-header provider-table__name-relations"
                      onClick={() => handleSort('name')}
                    >
                      <span className="header-content">
                        Provider Name
                        {getSortIcon('name')}
                      </span>
                    </th>
                    <th className="provider-table__relation-pf">Product Family</th>
                    <th className="provider-table__relation-itc">IT Component</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAndSortedProviders.map(provider => (
                    <tr key={provider.id}>
                      <td className="provider-table__name-relations">
                        {provider.displayName || provider.id}
                      </td>
                      <td className="provider-table__relation-pf">
                        {provider.relProviderToProductFamilyCount > 0 ? (
                          <span className="relation-badge relation-badge--has">{provider.relProviderToProductFamilyCount} relation{provider.relProviderToProductFamilyCount !== 1 ? 's' : ''}</span>
                        ) : (
                          <span className="relation-badge relation-badge--missing">No relations</span>
                        )}
                      </td>
                      <td className="provider-table__relation-itc">
                        {provider.relProviderToITComponentCount > 0 ? (
                          <span className="relation-badge relation-badge--has">{provider.relProviderToITComponentCount} relation{provider.relProviderToITComponentCount !== 1 ? 's' : ''}</span>
                        ) : (
                          <span className="relation-badge relation-badge--missing">No relations</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <table className="provider-table">
                <thead>
                  <tr>
                    <th
                      className="sortable-header provider-table__name-homepage"
                      onClick={() => handleSort('name')}
                    >
                      <span className="header-content">
                        Provider Name
                        {getSortIcon('name')}
                      </span>
                    </th>
                    <th className="provider-table__homepage">Homepage URL</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAndSortedProviders.map(provider => (
                    <tr key={provider.id}>
                      <td className="provider-table__name-homepage">
                        {provider.displayName || provider.id}
                      </td>
                      <td className="provider-table__homepage">
                        {provider.homePageUrl || <em className="text-gray-400">No homepage URL</em>}
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
