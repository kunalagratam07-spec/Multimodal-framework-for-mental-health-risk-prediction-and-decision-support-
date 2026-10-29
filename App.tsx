import React, { useState, useEffect, useCallback } from 'react';
import { 
  AssessmentFormInputs, 
  PredictionResult, 
  ModelCapabilities, 
  StoredAssessmentRecord 
} from './types/assessment';
import { apiService } from './services/api';
import { ThemeProvider } from './context/ThemeContext';
import { Header } from './components/Header';
import { DisclaimerBanner } from './components/DisclaimerBanner';
import { CrisisModal } from './components/CrisisModal';
import { AssessmentForm } from './components/AssessmentForm';
import { ResultsDashboard } from './components/ResultsDashboard';
import { DecisionGuidanceView } from './components/DecisionGuidanceView';
import { PrivacyAndHistory } from './components/PrivacyAndHistory';
import { ModelIntegrationSettings } from './components/ModelIntegrationSettings';

const AppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'assessment' | 'results' | 'guidance' | 'history' | 'settings'>('assessment');
  const [currentResult, setCurrentResult] = useState<PredictionResult | null>(null);
  const [isCrisisModalOpen, setIsCrisisModalOpen] = useState<boolean>(false);
  const [crisisTriggerReason, setCrisisTriggerReason] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  
  const [isMockMode, setIsMockMode] = useState<boolean>(() => apiService.isMockModeEnabled());
  const [isBackendOnline, setIsBackendOnline] = useState<boolean>(false);
  const [modelCapabilities, setModelCapabilities] = useState<ModelCapabilities>({
    modelId: 'Mock-Clinical-CDS-v2.1',
    architecture: 'Standard Multimodal Decision Support Pipeline',
    supportedCategories: ['Low Risk', 'Medium Risk', 'High Risk'],
    supportsNumericalScore: true,
    scoreValidationMethod: 'Validated PHQ-9 Standardized Psychometric Scale (0-27 Range)',
    supportsAudioAnalysis: true,
    supportsBehavioralFeatures: true,
    calibrationMethod: 'Platt Scaling / Calibrated Likelihood',
    clinicalDisclaimer: 'Non-diagnostic clinical decision support interface.'
  });

  const checkStatus = useCallback(async () => {
    const health = await apiService.checkBackendHealth();
    setIsBackendOnline(health.isOnline);
    try {
      const caps = await apiService.getModelCapabilities();
      setModelCapabilities(caps);
    } catch {
      // Keep defaults
    }
  }, []);

  useEffect(() => {
    checkStatus();
  }, [checkStatus]);

  const handleTriggerCrisis = (reason: string) => {
    setCrisisTriggerReason(reason);
    setIsCrisisModalOpen(true);
  };

  const handleSubmitAssessment = async (inputs: AssessmentFormInputs) => {
    setIsLoading(true);
    setSubmissionError(null);

    try {
      const result = await apiService.submitAssessment(inputs);
      setCurrentResult(result);

      const isStorageEnabled = localStorage.getItem('mh_enable_local_storage') === 'true';
      if (isStorageEnabled) {
        try {
          const raw = localStorage.getItem('mh_assessment_history_records');
          const existing: StoredAssessmentRecord[] = raw ? JSON.parse(raw) : [];
          const newRecord: StoredAssessmentRecord = {
            id: result.assessmentId,
            date: result.timestamp,
            predictedCategory: result.predictedCategory,
            numericalScore: result.numericalRiskScore,
            confidence: result.modelConfidence,
            summary: `${result.predictedCategory} (${result.submittedInputsSummary.completedQuestionsCount}/9 items answered)`
          };
          localStorage.setItem('mh_assessment_history_records', JSON.stringify([newRecord, ...existing]));
        } catch (e) {
          console.error('Failed to save assessment locally:', e);
        }
      }

      if (result.immediateCrisisFlag) {
        handleTriggerCrisis('Immediate safety flag triggered during model inference');
      }

      setActiveTab('results');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      setSubmissionError(err.message || 'An error occurred during risk assessment inference.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadRecordFromHistory = (record: StoredAssessmentRecord) => {
    setCurrentResult({
      assessmentId: record.id,
      timestamp: record.date,
      predictedCategory: record.predictedCategory,
      numericalRiskScore: record.numericalScore,
      scoreValidationSource: 'Archived Local Assessment Record',
      modelConfidence: record.confidence,
      modelUncertainty: null,
      contributingFactors: [],
      immediateCrisisFlag: record.predictedCategory === 'High Risk',
      modelVersion: 'Archived Record',
      isMockResponse: false,
      disclaimer: 'Archived assessment record retrieved from local browser persistence.',
      submittedInputsSummary: {
        completedQuestionsCount: 9,
        totalQuestionsCount: 9,
        hasJournalText: false,
        journalWordCount: 0,
        hasBehavioralData: false,
        hasAudioAttachment: false
      }
    });
    setActiveTab('results');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* Top Disclaimer Banner */}
      <DisclaimerBanner onCrisisClick={() => handleTriggerCrisis('User requested immediate crisis resources')} />

      {/* Main Header with Navigation, Theme Toggle & Crisis Button */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenCrisisModal={() => handleTriggerCrisis('Emergency lifeline requested from top navigation')}
        isBackendOnline={isBackendOnline}
        isMockMode={isMockMode}
        hasResult={currentResult !== null}
      />

      {/* Submission Error Banner */}
      {submissionError && (
        <div className="max-w-4xl mx-auto px-4 mt-6 w-full">
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200 text-xs flex items-start justify-between gap-3 shadow-xs">
            <div>
              <p className="font-bold">Assessment Inference Failed</p>
              <p className="mt-0.5">{submissionError}</p>
            </div>
            <button
              onClick={() => setSubmissionError(null)}
              className="text-rose-700 dark:text-rose-400 hover:text-rose-950 dark:hover:text-rose-200 font-bold px-2 py-1 text-xs"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 pb-16">
        {activeTab === 'assessment' && (
          <AssessmentForm
            onSubmit={handleSubmitAssessment}
            isLoading={isLoading}
            modelCapabilities={modelCapabilities}
            onTriggerCrisis={handleTriggerCrisis}
          />
        )}

        {activeTab === 'results' && currentResult && (
          <ResultsDashboard
            result={currentResult}
            onNavigateToGuidance={() => {
              setActiveTab('guidance');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onOpenCrisisModal={() => handleTriggerCrisis('High-risk prompt support requested from results dashboard')}
            onRetakeAssessment={() => {
              setActiveTab('assessment');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {activeTab === 'guidance' && (
          <DecisionGuidanceView
            currentCategory={currentResult?.predictedCategory || 'Low Risk'}
            onOpenCrisisModal={() => handleTriggerCrisis('Immediate support requested from decision guidance')}
          />
        )}

        {activeTab === 'history' && (
          <PrivacyAndHistory onLoadRecord={handleLoadRecordFromHistory} />
        )}

        {activeTab === 'settings' && (
          <ModelIntegrationSettings
            isMockMode={isMockMode}
            setIsMockMode={setIsMockMode}
            isBackendOnline={isBackendOnline}
            onRefreshHealth={checkStatus}
            modelCapabilities={modelCapabilities}
          />
        )}
      </main>

      {/* Clinical Footer */}
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-6 text-slate-500 dark:text-slate-400 text-xs transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800 dark:text-slate-200">MindPulse CDS</span>
            <span>•</span>
            <span>Clinical Decision Support System</span>
            <span>•</span>
            <span className="font-mono text-[11px]">v2.1.0</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span>WCAG 2.1 AA Accessible Colors</span>
            <span>•</span>
            <span>Strict Privacy by Design</span>
            <span>•</span>
            <button
              onClick={() => handleTriggerCrisis('Footer 24/7 Lifeline')}
              className="text-rose-600 dark:text-rose-400 font-bold hover:underline"
            >
              24/7 Crisis Hotline: 988
            </button>
          </div>
        </div>
      </footer>

      {/* Accessible Crisis & Urgent Help Modal */}
      <CrisisModal
        isOpen={isCrisisModalOpen}
        onClose={() => setIsCrisisModalOpen(false)}
        triggerReason={crisisTriggerReason}
      />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
};
