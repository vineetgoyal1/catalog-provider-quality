import { useEffect, useState, useMemo } from 'react';
import { lx } from '@leanix/reporting';
import { OverviewCards } from './components/OverviewCards';
import { DrillDownModal } from './components/DrillDownModal';
import { LxSpinner } from './components/ui/lx-spinner';
import { LxBanner } from './components/ui/lx-banner';
import { TooltipProvider } from './components/ui/tooltip';
import type { Provider, QualityMetrics } from './types/provider.types';
import { fetchAllProviders } from './utils/fetchProviders';
import { assessProviderQuality } from './utils/assessQuality';
import './App.css';

function App() {
  // State
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [workspaceHost, setWorkspaceHost] = useState<string>('');
  const [loadingProgress, setLoadingProgress] = useState<string>('');

  // Initialize LeanIX SDK and fetch data
  useEffect(() => {
    const initAndFetchData = async () => {
      try {
        console.log('🔵 App: Starting initialization...');
        setLoading(true);
        setError(null);

        // Initialize LeanIX SDK
        console.log('🔵 App: Calling lx.init()...');
        try {
          const setup = await lx.init();
          console.log('✅ App: lx.init() complete');

          // Get workspace host for inventory links
          const host = setup.settings.baseUrl.replace('https://', '').replace('http://', '');
          setWorkspaceHost(host);
          console.log('✅ App: Workspace host:', host);
        } catch (e) {
          // SDK already initialized, continue anyway
          console.log('⚠️ App: SDK already initialized');
        }

        // Configure report (minimal config, no facets needed)
        console.log('🔵 App: Calling lx.ready()...');
        lx.ready({});
        console.log('✅ App: lx.ready() called');

        // Fetch providers with progress updates
        console.log('🔵 App: Starting fetchAllProviders...');
        const fetchedProviders = await fetchAllProviders((page, total) => {
          const progress = `Loading providers... Page ${page}, ${total} total`;
          console.log(`🔵 Progress: ${progress}`);
          setLoadingProgress(progress);
        });

        console.log(`✅ App: Fetched ${fetchedProviders.length} providers`);
        setProviders(fetchedProviders);
        setLoading(false);
      } catch (err) {
        console.error('❌ App: Error initializing report:', err);
        console.error('❌ App: Error stack:', err instanceof Error ? err.stack : 'No stack');
        setError(err instanceof Error ? err.message : 'Failed to load providers');
        setLoading(false);
      }
    };

    initAndFetchData();
  }, []);

  // Calculate quality metrics (memoized for performance)
  const qualityMetrics: QualityMetrics = useMemo(() => {
    if (providers.length === 0) {
      return {
        good: [],
        needsImprovement: [],
        totalCount: 0
      };
    }
    return assessProviderQuality(providers);
  }, [providers]);

  // Handlers
  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  const handleRetry = () => {
    window.location.reload();
  };

  // Loading state
  if (loading) {
    return (
      <div className="app app--loading">
        <LxSpinner fullSpace />
        <p className="loading-text">{loadingProgress || 'Loading providers...'}</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="app app--error">
        <LxBanner type="danger" title="Error Loading Providers">
          <div className="error-content">
            <p>{error}</p>
            <button onClick={handleRetry} className="error-retry-button">
              Retry
            </button>
          </div>
        </LxBanner>
      </div>
    );
  }

  // Main UI
  return (
    <TooltipProvider>
      <div className="app">
        <header className="app__header">
          <h1 className="app__title">Provider Quality Dashboard</h1>
          <p className="app__subtitle">
            Tracking description quality for {qualityMetrics.totalCount} providers
          </p>
        </header>

        <main className="app__main">
          <OverviewCards
            goodCount={qualityMetrics.good.length}
            needsImprovementCount={qualityMetrics.needsImprovement.length}
            onClickNeedsImprovement={handleOpenModal}
          />
        </main>

        <DrillDownModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          providers={qualityMetrics.needsImprovement}
          workspaceHost={workspaceHost}
        />
      </div>
    </TooltipProvider>
  );
}

export default App;
