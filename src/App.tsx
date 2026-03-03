import { useEffect, useState, useMemo, lazy, Suspense } from 'react';
import { lx } from '@leanix/reporting';
import { QualityProgressBar } from './components/QualityProgressBar';
import { OverviewCards } from './components/OverviewCards';
import { LxSpinner } from './components/ui/lx-spinner';
import { LxBanner } from './components/ui/lx-banner';
import { LxButton } from './components/ui/lx-button';
import { TooltipProvider } from './components/ui/tooltip';
import type { Provider, QualityMetrics, ProviderQuality } from './types/provider.types';
import { fetchAllProviders } from './utils/fetchProviders';
import { assessProviderQuality } from './utils/assessQuality';
import './App.css';

// Lazy load modals for better initial load performance
const DrillDownModal = lazy(() => import('./components/DrillDownModal').then(m => ({ default: m.DrillDownModal })));
const QualityBreakdownModal = lazy(() => import('./components/QualityBreakdownModal').then(m => ({ default: m.QualityBreakdownModal })));

function App() {
  // State
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [baseUrl, setBaseUrl] = useState<string>('');

  // Consolidated modal state - replaces 5 separate boolean states with unified type
  type DrillDownModalType = 'description' | 'category' | 'homepage' | 'headquarters' | 'relations' | null;
  const [activeDrillDownModal, setActiveDrillDownModal] = useState<DrillDownModalType>(null);

  const [loadingProgress, setLoadingProgress] = useState<string>('');
  const [isDataLoading, setIsDataLoading] = useState(false);
  const [breakdownModalOpen, setBreakdownModalOpen] = useState<'perfect' | 'good' | 'fair' | 'needsWork' | null>(null);

  // Initialize LeanIX SDK and fetch data
  useEffect(() => {
    const initAndFetchData = async () => {
      try {
        console.log('🔵 App: Starting initialization...');
        setError(null);

        // Initialize LeanIX SDK
        console.log('🔵 App: Calling lx.init()...');
        try {
          const setup = await lx.init();
          setBaseUrl(setup.settings.baseUrl);
          console.log('✅ App: lx.init() complete, baseUrl:', setup.settings.baseUrl);
        } catch (e) {
          // SDK already initialized, continue anyway
          console.log('⚠️ App: SDK already initialized');
        }

        // Configure report (minimal config, no facets needed)
        console.log('🔵 App: Calling lx.ready()...');
        lx.ready({});
        console.log('✅ App: lx.ready() called');

        // Show UI immediately, then fetch data
        setLoading(false);
        setIsDataLoading(true);

        // Fetch providers with progress updates
        console.log('🔵 App: Starting fetchAllProviders...');
        const fetchedProviders = await fetchAllProviders((page, total, currentProviders) => {
          const progress = 'Loading more...';
          console.log(`🔵 Progress: Page ${page}, ${total} providers fetched`);
          setLoadingProgress(progress);
          // Update UI with providers as we fetch them (progressive loading)
          setProviders(currentProviders);
        });

        console.log(`✅ App: Fetched ${fetchedProviders.length} providers`);
        setProviders(fetchedProviders);
        setLoadingProgress('Finalizing...');

        // Small delay to allow final render with all data before hiding loader
        await new Promise(resolve => setTimeout(resolve, 300));

        setIsDataLoading(false);
        setLoadingProgress('');
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
        description: {
          good: [],
          needsImprovement: []
        },
        category: {
          good: [],
          needsImprovement: []
        },
        homepage: {
          good: [],
          needsImprovement: []
        },
        headquarters: {
          good: [],
          needsImprovement: []
        },
        relations: {
          good: [],
          needsImprovement: []
        },
        overview: {
          perfect: 0,
          good: 0,
          fair: 0,
          needsWork: 0
        },
        totalCount: 0
      };
    }
    return assessProviderQuality(providers);
  }, [providers]);

  // Get all assessed providers for breakdown modal
  const allAssessedProviders: ProviderQuality[] = useMemo(() => {
    if (providers.length === 0) return [];

    return providers.map(provider => {
      const wordCount = provider.description ? provider.description.split(/\s+/).length : 0;
      const isGoodQuality = wordCount > 20;
      const hasCategoryQuality = !!provider.providerCategory;
      const hasHomepageQuality = !!provider.homePageUrl;
      const hasHeadquartersQuality = !!provider.headquartersAddress;
      const hasRelationsQuality = provider.relProviderToITComponentCount > 0 || provider.relProviderToProductFamilyCount > 0;

      return {
        ...provider,
        wordCount,
        isGoodQuality,
        hasCategoryQuality,
        hasHomepageQuality,
        hasHeadquartersQuality,
        hasRelationsQuality
      };
    });
  }, [providers]);

  // Filter providers by quality level for breakdown modal
  const breakdownProviders = useMemo(() => {
    if (!breakdownModalOpen) return [];

    return allAssessedProviders.filter(provider => {
      const factorsPassed = [
        provider.isGoodQuality,
        provider.hasCategoryQuality,
        provider.hasHomepageQuality,
        provider.hasHeadquartersQuality,
        provider.hasRelationsQuality
      ].filter(Boolean).length;

      switch (breakdownModalOpen) {
        case 'perfect':
          return factorsPassed === 5;
        case 'good':
          return factorsPassed === 4;
        case 'fair':
          return factorsPassed === 3;
        case 'needsWork':
          return factorsPassed <= 2;
        default:
          return false;
      }
    });
  }, [allAssessedProviders, breakdownModalOpen]);

  // Consolidated modal handlers - much cleaner than 10 separate functions
  const openDrillDownModal = (modalType: DrillDownModalType) => {
    console.log(`Opening ${modalType} modal`);
    setBreakdownModalOpen(null); // Close breakdown modal if open
    setActiveDrillDownModal(modalType);
  };

  const closeDrillDownModal = () => {
    console.log(`Closing drill-down modal`);
    setActiveDrillDownModal(null);
  };

  const openBreakdownModal = (level: 'perfect' | 'good' | 'fair' | 'needsWork') => {
    console.log(`Opening breakdown modal: ${level}`);
    setActiveDrillDownModal(null); // Close drill-down modal if open
    setBreakdownModalOpen(level);
  };

  const closeBreakdownModal = () => {
    setBreakdownModalOpen(null);
  };

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
            <LxButton onClick={handleRetry} colorScheme="danger">
              Retry
            </LxButton>
          </div>
        </LxBanner>
      </div>
    );
  }

  // Main UI
  return (
    <TooltipProvider>
      <div className="app">
        <main className="app__main">
          <OverviewCards
            perfect={qualityMetrics.overview.perfect}
            good={qualityMetrics.overview.good}
            fair={qualityMetrics.overview.fair}
            needsWork={qualityMetrics.overview.needsWork}
            totalCount={qualityMetrics.totalCount}
            onClickPerfect={() => openBreakdownModal('perfect')}
            onClickGood={() => openBreakdownModal('good')}
            onClickFair={() => openBreakdownModal('fair')}
            onClickNeedsWork={() => openBreakdownModal('needsWork')}
            isLoading={isDataLoading}
            loadingProgress={loadingProgress}
          />

          <div className="quality-metrics-grid">
            <QualityProgressBar
              title="Description"
              subtitle="Does the provider have a description greater than 20 words?"
              goodLabel="Good Descriptions"
              needsImprovementLabel="Needs Improvement"
              goodCount={qualityMetrics.description.good.length}
              needsImprovementCount={qualityMetrics.description.needsImprovement.length}
              onClickNeedsImprovement={() => openDrillDownModal('description')}
              goodHelper=">20 words"
              needsImprovementHelper="≤20 words"
            />

            <QualityProgressBar
              title="Category"
              subtitle="Does the provider have a category selected?"
              goodLabel="Has Category"
              needsImprovementLabel="Missing Category"
              goodCount={qualityMetrics.category.good.length}
              needsImprovementCount={qualityMetrics.category.needsImprovement.length}
              onClickNeedsImprovement={() => openDrillDownModal('category')}
              goodHelper="Category defined"
              needsImprovementHelper="No category"
            />

            <QualityProgressBar
              title="Homepage URL"
              subtitle="Is there a URL present?"
              goodLabel="Has Homepage URL"
              needsImprovementLabel="Missing Homepage"
              goodCount={qualityMetrics.homepage.good.length}
              needsImprovementCount={qualityMetrics.homepage.needsImprovement.length}
              onClickNeedsImprovement={() => openDrillDownModal('homepage')}
              goodHelper="URL defined"
              needsImprovementHelper="No URL"
            />

            <QualityProgressBar
              title="Headquarters Address"
              subtitle="Is the headquarters address present?"
              goodLabel="Has Headquarters"
              needsImprovementLabel="Missing Address"
              goodCount={qualityMetrics.headquarters.good.length}
              needsImprovementCount={qualityMetrics.headquarters.needsImprovement.length}
              onClickNeedsImprovement={() => openDrillDownModal('headquarters')}
              goodHelper="Address defined"
              needsImprovementHelper="No address"
            />

            <QualityProgressBar
              title="Provider Relations"
              subtitle="Does the provider have either a relation to an IT component or a product family?"
              goodLabel="Has Relations"
              needsImprovementLabel="No Relations"
              goodCount={qualityMetrics.relations.good.length}
              needsImprovementCount={qualityMetrics.relations.needsImprovement.length}
              onClickNeedsImprovement={() => openDrillDownModal('relations')}
              goodHelper="Has IT Component or Product Family"
              needsImprovementHelper="Missing both relations"
            />
          </div>
        </main>

        <Suspense fallback={<div />}>
          {/* Single unified DrillDownModal - cleaner than 5 separate instances */}
          {activeDrillDownModal && (
            <DrillDownModal
              isOpen={true}
              onClose={closeDrillDownModal}
              baseUrl={baseUrl}
              providers={
                activeDrillDownModal === 'description' ? qualityMetrics.description.needsImprovement :
                activeDrillDownModal === 'category' ? qualityMetrics.category.needsImprovement :
                activeDrillDownModal === 'homepage' ? qualityMetrics.homepage.needsImprovement :
                activeDrillDownModal === 'headquarters' ? qualityMetrics.headquarters.needsImprovement :
                qualityMetrics.relations.needsImprovement
              }
              title={
                activeDrillDownModal === 'description' ? 'Providers Needing Description Improvement' :
                activeDrillDownModal === 'category' ? 'Providers Missing Category' :
                activeDrillDownModal === 'homepage' ? 'Providers Missing Homepage URL' :
                activeDrillDownModal === 'headquarters' ? 'Providers Missing Headquarters Address' :
                'Providers Missing Relations'
              }
              subtitle={
                activeDrillDownModal === 'description' ? 'providers with ≤20 words in description' :
                activeDrillDownModal === 'category' ? 'providers with no category defined' :
                activeDrillDownModal === 'homepage' ? 'providers with no homepage URL defined' :
                activeDrillDownModal === 'headquarters' ? 'providers with no headquarters address defined' :
                'providers with no IT Component or Product Family relations'
              }
              mode={activeDrillDownModal}
            />
          )}

          {breakdownModalOpen && (
            <QualityBreakdownModal
              isOpen={true}
              onClose={closeBreakdownModal}
              baseUrl={baseUrl}
              providers={breakdownProviders}
              level={breakdownModalOpen}
            />
          )}
        </Suspense>
      </div>
    </TooltipProvider>
  );
}

export default App;
