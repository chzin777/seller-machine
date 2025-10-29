'use client';

import React from 'react';
import AIOverviewDashboard from './AIOverviewDashboard';
import AIChurnPrediction from './AIChurnPrediction';
import AIChurnAnalysis from './AIChurnAnalysis';
import AICustomerInsightsEnhanced from './AICustomerInsightsEnhanced';
import AIConsolidatedDashboard from './AIConsolidatedDashboard';
import DiagnosticPanel from './DiagnosticPanel';
import AISalesPrediction from './AISalesPrediction';
import AIModelTraining from './AIModelTraining';
import GlobalNotificationDemo from './GlobalNotificationDemo';
import AIDashboard from './AIDashboard';
import AITourGuide from './AITourGuide';
import UserManagement from './UserManagement';

interface AIContentProps {
  activeTab: string;
  onNavigate: (tab: string) => void;
}

export default function AIContent({ activeTab, onNavigate }: AIContentProps) {
  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <AIConsolidatedDashboard />;
      case 'dashboard':
        return <AIOverviewDashboard onNavigate={onNavigate} />;
      case 'churn':
        return <AIChurnAnalysis />;
      case 'churn-prediction':
        return <AIChurnPrediction />;
      case 'customer-insights':
        return <AICustomerInsightsEnhanced />;
      case 'sales':
        return <AISalesPrediction />;
      case 'training':
        return <AIModelTraining />;
      case 'ai-dashboard':
        return <AIDashboard />;
      case 'users':
        return <UserManagement />;
      case 'tour':
        return <AITourGuide isOpen={true} onClose={() => onNavigate('overview')} onNavigate={onNavigate} />;
      case 'diagnostics':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Diagnóstico do Sistema</h2>
            <DiagnosticPanel />
          </div>
        );
      default:
        return (
          <div>
            <AIConsolidatedDashboard />
            {/* <GlobalNotificationDemo /> */}
          </div>
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