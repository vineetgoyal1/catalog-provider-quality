import { LxKpiCard } from './ui/lx-kpi-card';
import './OverviewCards.css';

interface OverviewCardsProps {
  goodCount: number;
  needsImprovementCount: number;
  onClickNeedsImprovement: () => void;
}

export function OverviewCards({
  goodCount,
  needsImprovementCount,
  onClickNeedsImprovement
}: OverviewCardsProps) {
  return (
    <div className="overview-cards">
      <LxKpiCard
        title="Good Descriptions"
        kpiValue={goodCount.toString()}
        helperText=">30 words"
        indicatorColor="bg-green-500"
        className="overview-card"
      />

      <LxKpiCard
        title="Needs Improvement"
        kpiValue={needsImprovementCount.toString()}
        helperText="≤30 words"
        indicatorColor="bg-yellow-500"
        className="overview-card overview-card--clickable"
        onClick={onClickNeedsImprovement}
      />
    </div>
  );
}
