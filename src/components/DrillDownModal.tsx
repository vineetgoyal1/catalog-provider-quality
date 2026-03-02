import { LxModal } from './ui/lx-modal';
import { LxButton } from './ui/lx-button';
import { LxEmptyState } from './ui/lx-empty-state';
import type { ProviderQuality } from '../types/provider.types';
import { generateInventoryLink } from '../utils/assessQuality';
import './DrillDownModal.css';

interface DrillDownModalProps {
  isOpen: boolean;
  onClose: () => void;
  providers: ProviderQuality[];
  workspaceHost: string;
}

export function DrillDownModal({
  isOpen,
  onClose,
  providers,
  workspaceHost
}: DrillDownModalProps) {
  const handleViewInLeanIX = (providerId: string) => {
    const url = generateInventoryLink(workspaceHost, providerId);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <LxModal
      open={isOpen}
      onOpenChange={onClose}
      size="dialog-large"
    >
      <div className="drill-down-modal">
        <div className="drill-down-modal__header">
          <h2 className="drill-down-modal__title">Providers Needing Description Improvement</h2>
          <p className="drill-down-modal__subtitle">
            {providers.length} provider{providers.length !== 1 ? 's' : ''} with ≤30 words in description
          </p>
        </div>

        <div className="drill-down-modal__body">
          {providers.length === 0 ? (
            <LxEmptyState
              title="No providers need improvement"
            />
          ) : (
            <table className="provider-table">
              <thead>
                <tr>
                  <th>Provider Name</th>
                  <th>Word Count</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {providers.map(provider => (
                  <tr key={provider.id}>
                    <td className="provider-table__name">
                      {provider.displayName || provider.id}
                    </td>
                    <td className="provider-table__count">
                      {provider.wordCount}
                    </td>
                    <td className="provider-table__action">
                      <LxButton
                        size="small"
                        mode="outline"
                        onClick={() => handleViewInLeanIX(provider.id)}
                      >
                        View in LeanIX
                      </LxButton>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="drill-down-modal__footer">
          <LxButton
            colorScheme="primary"
            onClick={onClose}
          >
            Close
          </LxButton>
        </div>
      </div>
    </LxModal>
  );
}
