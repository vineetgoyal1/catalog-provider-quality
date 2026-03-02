import { useEffect, useState, useMemo } from 'react';
import { lx } from '@leanix/reporting';
import { QualityProgressBar } from './components/QualityProgressBar';
import { OverviewCards } from './components/OverviewCards';
import { DrillDownModal } from './components/DrillDownModal';
import { QualityBreakdownModal } from './components/QualityBreakdownModal';
import { LxSpinner } from './components/ui/lx-spinner';
import { LxBanner } from './components/ui/lx-banner';
import { LxButton } from './components/ui/lx-button';
import { TooltipProvider } from './components/ui/tooltip';
import type { Provider, QualityMetrics, ProviderQuality } from './types/provider.types';
import { fetchAllProviders } from './utils/fetchProviders';
import { assessProviderQuality } from './utils/assessQuality';
import './App.css';

function App() {
  // State
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDescriptionModalOpen, setIsDescriptionModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isHomepageModalOpen, setIsHomepageModalOpen] = useState(false);
  const [isHeadquartersModalOpen, setIsHeadquartersModalOpen] = useState(false);
  const [isRelationsModalOpen, setIsRelationsModalOpen] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState<string>('');
  const [breakdownModalOpen, setBreakdownModalOpen] = useState<'perfect' | 'good' | 'fair' | 'needsWork' | null>(null);

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
          await lx.init();
          console.log('✅ App: lx.init() complete');
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
      const isGoodQuality = wordCount > 30;
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

  // Handlers
  const handleOpenDescriptionModal = () => {
    console.log('Opening description modal');
    setIsCategoryModalOpen(false);
    setIsHomepageModalOpen(false);
    setIsHeadquartersModalOpen(false);
    setIsRelationsModalOpen(false);
    setIsDescriptionModalOpen(true);
  };
  const handleCloseDescriptionModal = () => {
    console.log('Closing description modal');
    setIsDescriptionModalOpen(false);
  };

  const handleOpenCategoryModal = () => {
    console.log('Opening category modal');
    setIsDescriptionModalOpen(false);
    setIsHomepageModalOpen(false);
    setIsHeadquartersModalOpen(false);
    setIsRelationsModalOpen(false);
    setIsCategoryModalOpen(true);
  };
  const handleCloseCategoryModal = () => {
    console.log('Closing category modal');
    setIsCategoryModalOpen(false);
  };

  const handleOpenHomepageModal = () => {
    console.log('Opening homepage modal');
    setIsDescriptionModalOpen(false);
    setIsCategoryModalOpen(false);
    setIsHeadquartersModalOpen(false);
    setIsRelationsModalOpen(false);
    setIsHomepageModalOpen(true);
  };
  const handleCloseHomepageModal = () => {
    console.log('Closing homepage modal');
    setIsHomepageModalOpen(false);
  };

  const handleOpenHeadquartersModal = () => {
    console.log('Opening headquarters modal');
    setIsDescriptionModalOpen(false);
    setIsCategoryModalOpen(false);
    setIsHomepageModalOpen(false);
    setIsRelationsModalOpen(false);
    setIsHeadquartersModalOpen(true);
  };
  const handleCloseHeadquartersModal = () => {
    console.log('Closing headquarters modal');
    setIsHeadquartersModalOpen(false);
  };

  const handleOpenRelationsModal = () => {
    console.log('Opening relations modal');
    setIsDescriptionModalOpen(false);
    setIsCategoryModalOpen(false);
    setIsHomepageModalOpen(false);
    setIsHeadquartersModalOpen(false);
    setIsRelationsModalOpen(true);
  };
  const handleCloseRelationsModal = () => {
    console.log('Closing relations modal');
    setIsRelationsModalOpen(false);
  };

  const handleRetry = () => {
    window.location.reload();
  };

  const handleOpenPerfectModal = () => {
    setBreakdownModalOpen('perfect');
  };

  const handleOpenGoodModal = () => {
    setBreakdownModalOpen('good');
  };

  const handleOpenFairModal = () => {
    setBreakdownModalOpen('fair');
  };

  const handleOpenNeedsWorkModal = () => {
    setBreakdownModalOpen('needsWork');
  };

  const handleCloseBreakdownModal = () => {
    setBreakdownModalOpen(null);
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
            onClickPerfect={handleOpenPerfectModal}
            onClickGood={handleOpenGoodModal}
            onClickFair={handleOpenFairModal}
            onClickNeedsWork={handleOpenNeedsWorkModal}
          />

          <div className="quality-metrics-grid">
            <QualityProgressBar
              title="Description"
              subtitle="Does the provider have a description greater than 30 words?"
              goodLabel="Good Descriptions"
              needsImprovementLabel="Needs Improvement"
              goodCount={qualityMetrics.description.good.length}
              needsImprovementCount={qualityMetrics.description.needsImprovement.length}
              onClickNeedsImprovement={handleOpenDescriptionModal}
              goodHelper=">30 words"
              needsImprovementHelper="≤30 words"
            />

            <QualityProgressBar
              title="Category"
              subtitle="Does the provider have a category selected?"
              goodLabel="Has Category"
              needsImprovementLabel="Missing Category"
              goodCount={qualityMetrics.category.good.length}
              needsImprovementCount={qualityMetrics.category.needsImprovement.length}
              onClickNeedsImprovement={handleOpenCategoryModal}
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
              onClickNeedsImprovement={handleOpenHomepageModal}
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
              onClickNeedsImprovement={handleOpenHeadquartersModal}
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
              onClickNeedsImprovement={handleOpenRelationsModal}
              goodHelper="Has IT Component or Product Family"
              needsImprovementHelper="Missing both relations"
            />
          </div>
        </main>

        <DrillDownModal
          isOpen={isDescriptionModalOpen}
          onClose={handleCloseDescriptionModal}
          providers={qualityMetrics.description.needsImprovement}
          title="Providers Needing Description Improvement"
          subtitle="providers with ≤30 words in description"
          mode="description"
        />

        <DrillDownModal
          isOpen={isCategoryModalOpen}
          onClose={handleCloseCategoryModal}
          providers={qualityMetrics.category.needsImprovement}
          title="Providers Missing Category"
          subtitle="providers with no category defined"
          mode="category"
        />

        <DrillDownModal
          isOpen={isHomepageModalOpen}
          onClose={handleCloseHomepageModal}
          providers={qualityMetrics.homepage.needsImprovement}
          title="Providers Missing Homepage URL"
          subtitle="providers with no homepage URL defined"
          mode="homepage"
        />

        <DrillDownModal
          isOpen={isHeadquartersModalOpen}
          onClose={handleCloseHeadquartersModal}
          providers={qualityMetrics.headquarters.needsImprovement}
          title="Providers Missing Headquarters Address"
          subtitle="providers with no headquarters address defined"
          mode="headquarters"
        />

        <DrillDownModal
          isOpen={isRelationsModalOpen}
          onClose={handleCloseRelationsModal}
          providers={qualityMetrics.relations.needsImprovement}
          title="Providers Missing Relations"
          subtitle="providers with no IT Component or Product Family relations"
          mode="relations"
        />

        <QualityBreakdownModal
          isOpen={breakdownModalOpen !== null}
          onClose={handleCloseBreakdownModal}
          providers={breakdownProviders}
          level={breakdownModalOpen || 'perfect'}
        />
      </div>
    </TooltipProvider>
  );
}

export default App;
