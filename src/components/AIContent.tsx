'use client';

import AIOverviewDashboard from './AIOverviewDashboard';
import AIRecommendations from './AIRecommendations';
import AIChurnPrediction from './AIChurnPrediction';
import AICustomerInsights from './AICustomerInsights';
import AIClustering from './AIClustering';
import AISalesPrediction from './AISalesPrediction';
import AIModelTraining from './AIModelTraining';
import AINotifications from './AINotifications';
import GlobalNotificationDemo from './GlobalNotificationDemo';

interface AIContentProps {
  activeTab: string;
  onNavigate: (tab: string) => void;
}

export default function AIContent({ activeTab, onNavigate }: AIContentProps) {
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <>
            <AIOverviewDashboard onNavigate={onNavigate} />
            <GlobalNotificationDemo />
          </>
        );
      case 'recommendations':
        return <AIRecommendations />;
      case 'churn':
        return <AIChurnPrediction />;
      case 'insights':
        return <AICustomerInsights />;
      case 'clustering':
        return <AIClustering />;
      case 'sales':
        return <AISalesPrediction />;
      case 'training':
        return <AIModelTraining />;
      case 'notifications':
        return <AINotifications />;
      default:
        return (
          <>
            <AIOverviewDashboard onNavigate={onNavigate} />
            <GlobalNotificationDemo />
          </>
        );
    }
  };

  return (
    <div className="w-full">
      <div className="space-y-6">
        {renderContent()}
      </div>
    </div>
  );
}