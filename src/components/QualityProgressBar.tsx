import { CheckCircle, AlertCircle } from 'lucide-react';
import './QualityProgressBar.css';

interface QualityProgressBarProps {
  title: string;
  subtitle: string;
  goodLabel: string;
  needsImprovementLabel: string;
  goodCount: number;
  needsImprovementCount: number;
  onClickNeedsImprovement: () => void;
  goodHelper?: string;
  needsImprovementHelper?: string;
}

export function QualityProgressBar({
  title,
  subtitle,
  goodLabel,
  needsImprovementLabel,
  goodCount,
  needsImprovementCount,
  onClickNeedsImprovement
}: QualityProgressBarProps) {
  const totalCount = goodCount + needsImprovementCount;
  const goodPercentage = totalCount > 0 ? (goodCount / totalCount) * 100 : 0;
  const needsImprovementPercentage = totalCount > 0 ? (needsImprovementCount / totalCount) * 100 : 0;

  return (
    <div className="quality-progress-container">
      {/* Title and Subtitle */}
      <div className="quality-progress-header">
        <h3 className="quality-progress-title">{title}</h3>
        <p className="quality-progress-subtitle">{subtitle}</p>
      </div>

      {/* Stats Row */}
      <div className="quality-stats">
        <div className="quality-stat quality-stat--good">
          <CheckCircle className="quality-stat__icon" size={20} />
          <div className="quality-stat__content">
            <div className="quality-stat__label">{goodLabel}</div>
            <div className="quality-stat__value">
              {goodCount.toLocaleString()} <span className="quality-stat__percentage">({goodPercentage.toFixed(1)}%)</span>
            </div>
          </div>
        </div>

        <div
          className="quality-stat quality-stat--warning quality-stat--clickable"
          onClick={onClickNeedsImprovement}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onClickNeedsImprovement();
            }
          }}
        >
          <AlertCircle className="quality-stat__icon" size={20} />
          <div className="quality-stat__content">
            <div className="quality-stat__label">{needsImprovementLabel}</div>
            <div className="quality-stat__value">
              {needsImprovementCount.toLocaleString()} <span className="quality-stat__percentage">({needsImprovementPercentage.toFixed(1)}%)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="quality-progress-bar">
        <div
          className="quality-progress-bar__segment quality-progress-bar__segment--good"
          style={{ width: `${goodPercentage}%` }}
        >
          <span className="quality-progress-bar__label">
            {goodPercentage.toFixed(1)}%
          </span>
        </div>
        <div
          className="quality-progress-bar__segment quality-progress-bar__segment--warning"
          style={{ width: `${needsImprovementPercentage}%` }}
          onClick={onClickNeedsImprovement}
          role="button"
          tabIndex={0}
        >
          <span className="quality-progress-bar__label">
            {needsImprovementPercentage.toFixed(1)}%
          </span>
        </div>
      </div>
    </div>
  );
}
