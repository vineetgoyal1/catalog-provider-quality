import './OverviewCards.css';

interface OverviewCardsProps {
  perfect: number;
  good: number;
  fair: number;
  needsWork: number;
  totalCount: number;
  onClickPerfect: () => void;
  onClickGood: () => void;
  onClickFair: () => void;
  onClickNeedsWork: () => void;
}

export function OverviewCards({
  perfect,
  good,
  fair,
  needsWork,
  totalCount,
  onClickPerfect,
  onClickGood,
  onClickFair,
  onClickNeedsWork
}: OverviewCardsProps) {
  const perfectPct = totalCount > 0 ? (perfect / totalCount) * 100 : 0;
  const goodPct = totalCount > 0 ? (good / totalCount) * 100 : 0;
  const fairPct = totalCount > 0 ? (fair / totalCount) * 100 : 0;
  const needsWorkPct = totalCount > 0 ? (needsWork / totalCount) * 100 : 0;

  return (
    <div className="overview-container">
      <div className="overview-header">
        <h2 className="overview-title">Executive Overview</h2>
        <p className="overview-subtitle">Quality distribution for {totalCount.toLocaleString()} providers</p>
      </div>

      {/* Progress Bar */}
      <div className="overview-progress-bar">
        {perfectPct > 0 && (
          <div
            className="overview-progress-segment overview-progress-segment--perfect overview-progress-segment--clickable"
            style={{ width: `${perfectPct}%` }}
            title={`${perfect.toLocaleString()} providers (${perfectPct.toFixed(1)}%)`}
            onClick={onClickPerfect}
            role="button"
            tabIndex={0}
          >
            {perfectPct > 8 && (
              <span className="overview-progress-label">
                {perfectPct.toFixed(1)}%
              </span>
            )}
          </div>
        )}
        {goodPct > 0 && (
          <div
            className="overview-progress-segment overview-progress-segment--good overview-progress-segment--clickable"
            style={{ width: `${goodPct}%` }}
            title={`${good.toLocaleString()} providers (${goodPct.toFixed(1)}%)`}
            onClick={onClickGood}
            role="button"
            tabIndex={0}
          >
            {goodPct > 8 && (
              <span className="overview-progress-label">
                {goodPct.toFixed(1)}%
              </span>
            )}
          </div>
        )}
        {fairPct > 0 && (
          <div
            className="overview-progress-segment overview-progress-segment--fair overview-progress-segment--clickable"
            style={{ width: `${fairPct}%` }}
            title={`${fair.toLocaleString()} providers (${fairPct.toFixed(1)}%)`}
            onClick={onClickFair}
            role="button"
            tabIndex={0}
          >
            {fairPct > 8 && (
              <span className="overview-progress-label">
                {fairPct.toFixed(1)}%
              </span>
            )}
          </div>
        )}
        {needsWorkPct > 0 && (
          <div
            className="overview-progress-segment overview-progress-segment--needs-work overview-progress-segment--clickable"
            style={{ width: `${needsWorkPct}%` }}
            title={`${needsWork.toLocaleString()} providers (${needsWorkPct.toFixed(1)}%)`}
            onClick={onClickNeedsWork}
            role="button"
            tabIndex={0}
          >
            {needsWorkPct > 8 && (
              <span className="overview-progress-label">
                {needsWorkPct.toFixed(1)}%
              </span>
            )}
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="overview-legend">
        <div
          className="overview-legend-item overview-legend-item--clickable"
          onClick={onClickPerfect}
          role="button"
          tabIndex={0}
        >
          <div className="overview-legend-color overview-legend-color--perfect"></div>
          <div className="overview-legend-content">
            <div className="overview-legend-label">Perfect Quality</div>
            <div className="overview-legend-value">
              {perfect.toLocaleString()} <span className="overview-legend-percentage">({perfectPct.toFixed(1)}%)</span>
            </div>
            <div className="overview-legend-description">All 5 factors met</div>
          </div>
        </div>

        <div
          className="overview-legend-item overview-legend-item--clickable"
          onClick={onClickGood}
          role="button"
          tabIndex={0}
        >
          <div className="overview-legend-color overview-legend-color--good"></div>
          <div className="overview-legend-content">
            <div className="overview-legend-label">Good Quality</div>
            <div className="overview-legend-value">
              {good.toLocaleString()} <span className="overview-legend-percentage">({goodPct.toFixed(1)}%)</span>
            </div>
            <div className="overview-legend-description">Lacking 1 factor</div>
          </div>
        </div>

        <div
          className="overview-legend-item overview-legend-item--clickable"
          onClick={onClickFair}
          role="button"
          tabIndex={0}
        >
          <div className="overview-legend-color overview-legend-color--fair"></div>
          <div className="overview-legend-content">
            <div className="overview-legend-label">Fair Quality</div>
            <div className="overview-legend-value">
              {fair.toLocaleString()} <span className="overview-legend-percentage">({fairPct.toFixed(1)}%)</span>
            </div>
            <div className="overview-legend-description">Lacking 2 factors</div>
          </div>
        </div>

        <div
          className="overview-legend-item overview-legend-item--clickable"
          onClick={onClickNeedsWork}
          role="button"
          tabIndex={0}
        >
          <div className="overview-legend-color overview-legend-color--needs-work"></div>
          <div className="overview-legend-content">
            <div className="overview-legend-label">Needs Work</div>
            <div className="overview-legend-value">
              {needsWork.toLocaleString()} <span className="overview-legend-percentage">({needsWorkPct.toFixed(1)}%)</span>
            </div>
            <div className="overview-legend-description">Lacking 3+ factors</div>
          </div>
        </div>
      </div>
    </div>
  );
}
