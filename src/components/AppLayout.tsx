import React, { useState, useEffect } from 'react';

import ModernHero from './ModernHero';
import SocialProof from './SocialProof';
import HowItWorks from './HowItWorks';
import BenefitsGrid from './BenefitsGrid';
import Testimonials from './Testimonials';
import CTASection from './CTASection';
import FeaturesSection from './FeaturesSection';
import DashboardSection from './DashboardSection';
import DocumentUpload from './DocumentUpload';
import YearEndChecklist from './YearEndChecklist';
import TaxPreview from './TaxPreview';
import SecuritySection from './SecuritySection';
import SubscriptionManagement from './SubscriptionManagement';




import OnboardingModal from './OnboardingModal';
import ErrorModal from './ErrorModal';
import Footer from './Footer';
import PilotBanner from './PilotBanner';
import { EmailIntegration } from './EmailIntegration';
import { DocumentReview } from './DocumentReview';
import { TaxAssistant } from './TaxAssistant';
import AIAssistantSection from './AIAssistantSection';
import { PlaidConnection } from './PlaidConnection';
import { TransactionReview } from './TransactionReview';
import { BankDashboard } from './BankDashboard';

import { QuarterlyTaxSection } from './QuarterlyTaxSection';
import { ReceiptManager } from './ReceiptManager';
import { TripRecorder } from './TripRecorder';
import { MileageLogManager } from './MileageLogManager';
import { VehicleExpenseTracker } from './VehicleExpenseTracker';
import { HomeOfficeCalculator } from './HomeOfficeCalculator';
import { TaxFormGenerator } from './TaxFormGenerator';
import EntityDashboard from './EntityDashboard';
import { AuditDefenseHub } from './AuditDefenseHub';
import { CryptoDashboard } from './CryptoDashboard';






import ReceiptGamification from './ReceiptGamification';
import ReminderSettings from './ReminderSettings';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';


const AppLayout: React.FC = () => {
  const { user } = useAuth();
  const [refreshTrips, setRefreshTrips] = useState(0);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [showError, setShowError] = useState(false);
  const [errorInfo, setErrorInfo] = useState({ title: '', message: '' });
  const [reviewDocuments, setReviewDocuments] = useState<any[]>([]);
  const [showReview, setShowReview] = useState(false);
  const [userProfile, setUserProfile] = useState({
    filingStatus: 'single',
    dependents: 0,
    income: 0,
    state: 'CA',
    homeOwner: false,
    selfEmployed: false
  });
  
  const [documents, setDocuments] = useState([
    { id: 1, name: 'W-2 Form - ABC Corp', category: 'Tax Forms', date: 'Jan 15, 2024', amount: '', status: 'verified' as const, type: 'W-2' },
    { id: 2, name: '1099-NEC - Freelance Work', category: 'Tax Forms', date: 'Jan 20, 2024', amount: '', status: 'verified' as const, type: '1099' },
    { id: 3, name: 'Doctor Visit Invoice', category: 'Medical Expenses', date: 'Sep 28, 2024', amount: '$250.00', status: 'verified' as const },
    { id: 4, name: 'Charitable Donation', category: 'Charitable Contributions', date: 'Sep 15, 2024', amount: '$500.00', status: 'pending' as const },
    { id: 5, name: 'Home Office Supplies', category: 'Business Expenses', date: 'Sep 10, 2024', amount: '$89.99', status: 'verified' as const },
    { id: 6, name: 'Pharmacy Receipt', category: 'Medical Expenses', date: 'Sep 5, 2024', amount: '$45.20', status: 'verified' as const },
    { id: 7, name: 'Restaurant Receipt', category: 'Business Meals', date: 'Aug 30, 2024', amount: '$156.75', status: 'pending' as const },
    { id: 8, name: 'Tuition Payment', category: 'Education', date: 'Aug 25, 2024', amount: '$2,500.00', status: 'verified' as const },
    { id: 9, name: 'Bank Statement - Q3', category: 'Financial Records', date: 'Aug 20, 2024', amount: '', status: 'verified' as const },
    { id: 10, name: 'Insurance Premium', category: 'Medical Expenses', date: 'Aug 15, 2024', amount: '$450.00', status: 'verified' as const },
    { id: 11, name: 'Software Subscription', category: 'Business Expenses', date: 'Aug 10, 2024', amount: '$99.00', status: 'pending' as const },
    { id: 12, name: 'Dental Visit', category: 'Medical Expenses', date: 'Aug 5, 2024', amount: '$180.00', status: 'verified' as const },
  ]);

  // Check if user has completed onboarding
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      if (user) {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('onboarding_completed')
            .eq('id', user.id)
            .single();

          if (error) {
            console.error('Error checking onboarding status:', error);
            return;
          }

          // Show onboarding if not completed
          if (!data?.onboarding_completed) {
            setShowOnboarding(true);
          }
        } catch (error) {
          console.error('Error checking onboarding status:', error);
        }
      }
    };

    checkOnboardingStatus();
  }, [user]);

  const handleUpload = (files: File[]) => {
    console.log('Uploading files:', files);
    const newDocs = files.map((file, index) => ({
      id: documents.length + index + 1,
      name: file.name,
      category: 'Uncategorized',
      date: new Date().toLocaleDateString(),
      amount: '',
      status: 'pending' as const
    }));
    setDocuments([...documents, ...newDocs]);
  };

  const handleScanEmail = () => {
    console.log('Scanning email...');
    setErrorInfo({ title: 'Email Scan Started', message: 'Scanning your Gmail/Outlook for receipts. This may take a few minutes.' });
    setShowError(true);
  };

  const handleConnectBank = () => {
    console.log('Connecting bank...');
    setErrorInfo({ title: 'Bank Connection', message: 'Redirecting to Plaid for secure bank connection...' });
    setShowError(true);
  };

  const handleViewDocument = (id: number) => {
    console.log('Viewing document:', id);
  };

  const handleDeleteDocument = (id: number) => {
    setDocuments(documents.filter(doc => doc.id !== id));
  };

  const handleFeatureClick = (feature: string) => {
    if (feature === 'ai-assistant') {
      // AI assistant is always visible as a floating button
      return;
    }
    setActiveSection(feature);
    const element = document.getElementById(feature);
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleDocumentsFound = (docs: any[]) => {
    setReviewDocuments(docs);
    setShowReview(true);
  };

  const handleApproveDocument = (doc: any) => {
    const newDoc = {
      id: documents.length + 1,
      name: doc.filename,
      category: doc.documentType === 'tax.us.w2' ? 'Tax Forms' : 
                doc.documentType === 'tax.us.1099' ? 'Tax Forms' : 
                'Uncategorized',
      date: new Date().toLocaleDateString(),
      amount: doc.fields?.wages || doc.fields?.compensation || doc.fields?.amount || '',
      status: 'verified' as const,
      type: doc.documentType,
      ...doc.fields
    };
    setDocuments([...documents, newDoc]);
  };

  const handleRejectDocument = (doc: any) => {
    console.log('Rejected document:', doc.filename);
  };
  return (
    <div className="min-h-screen bg-white">
      <PilotBanner />
      
      <OnboardingModal 
        isOpen={showOnboarding} 
        onComplete={() => setShowOnboarding(false)} 
      />
      
      <ErrorModal
        isOpen={showError}
        title={errorInfo.title}
        message={errorInfo.message}
        onClose={() => setShowError(false)}
      />

      {showReview && reviewDocuments.length > 0 && (
        <DocumentReview
          documents={reviewDocuments}
          onApprove={handleApproveDocument}
          onReject={handleRejectDocument}
          onClose={() => {
            setShowReview(false);
            setReviewDocuments([]);
          }}
        />
      )}
      <ModernHero onGetStarted={() => setShowOnboarding(true)} />
      
      <SocialProof />
      
      
      <HowItWorks />
      
      <Testimonials />
      
      <FeaturesSection onFeatureClick={handleFeatureClick} />


      
      <div id="dashboard">
        <DashboardSection 
          documents={documents}
          onViewDocument={handleViewDocument}
          onDeleteDocument={handleDeleteDocument}
        />
      </div>

      <div id="upload" className="bg-gray-50 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Upload Documents</h2>
          <DocumentUpload 
            onUpload={handleUpload}
            onScanEmail={handleScanEmail}
            onConnectBank={handleConnectBank}
          />
        </div>
      </div>

      <div id="email-integration" className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Email Integration</h2>
          <EmailIntegration onDocumentsFound={handleDocumentsFound} />
        </div>
      </div>
      <AIAssistantSection />

      <div id="bank-connection" className="bg-gray-50 py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Bank Integration Dashboard</h2>
          <div className="space-y-6">
            <BankDashboard />
            <PlaidConnection />
          </div>
        </div>
      </div>


      <div id="transactions" className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Transaction Review</h2>
          <TransactionReview />
        </div>
      </div>

      <div id="quarterly-taxes" className="bg-gray-50 py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <QuarterlyTaxSection />
        </div>
      </div>

      <div id="receipt-scanner" className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Receipt Scanner & Expense Tracking</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="lg:col-span-2">
              <ReceiptManager />
            </div>
            <ReceiptGamification />
            <ReminderSettings />
          </div>
        </div>
      </div>

      <div id="mileage-tracking" className="bg-gray-50 py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Mileage & Vehicle Expense Tracking</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <TripRecorder onTripAdded={() => setRefreshTrips(prev => prev + 1)} />
            <VehicleExpenseTracker />
          </div>
          <MileageLogManager key={refreshTrips} />
          <div className="mt-6">
            <HomeOfficeCalculator />
          </div>
        </div>
      </div>

      <div id="tax-forms" className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <TaxFormGenerator />
        </div>
      </div>

      <div id="entity-management" className="bg-gray-50 py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <EntityDashboard />
        </div>
      </div>

      <div id="audit-defense" className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <AuditDefenseHub />
        </div>
      </div>

      <div id="crypto-tax" className="bg-gray-50 py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <CryptoDashboard />
        </div>
      </div>






      <div id="checklist" className="bg-gray-50 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Year-End Review</h2>
          <YearEndChecklist />
        </div>
      </div>

      <div id="preview" className="bg-gray-50 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <TaxPreview />
        </div>
      </div>

      <div id="security" className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <SecuritySection />
        </div>
      </div>
      <div id="subscription" className="bg-gray-50 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <SubscriptionManagement />
        </div>
      </div>
      
      <CTASection onGetStarted={() => setShowOnboarding(true)} />
      
      <Footer />

      
      <TaxAssistant 
        userContext={userProfile}
        documentContent={documents.length > 0 ? JSON.stringify(documents.slice(0, 3)) : undefined}
      />
    </div>
  );
};

export default AppLayout;
