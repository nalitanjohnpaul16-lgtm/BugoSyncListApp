import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  HeartHandshake, 
  Megaphone, 
  HelpCircle, 
  Settings, 
  Upload,
  CheckCircle,
  AlertCircle,
  FileCheck2,
  Printer,
  X,
  FileText,
  ShieldCheck,
  Check,
  Clock,
  Send,
  Eye,
  Camera,
  CreditCard,
  UploadCloud,
  Trash2,
  Paperclip,
  QrCode,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  AlertTriangle,
  RefreshCw,
  Ban,
  MapPin
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { BugoLogo } from '../BugoLogo';
import { TopNavBar } from '../TopNavBar';
import { 
  ResidentDashboardView, 
  ResidentServicesView, 
  ResidentSettingsView,
  ResidentHelpView
} from './ResidentOperationsViews';
import { AssistanceProgram, IdPhotoAnalysis, AnnouncementItem } from '../../types';
import { BUGO_PUROKS, MONTHLY_INCOME_OPTIONS } from '../../data/mockData';
import { PROGRAM_RULES, parseMonthlyIncome, inspectIdPhotoClientHeuristic, evaluateApplicantEligibility, canResidentViewAnnouncement } from '../../utils/eligibilityEngine';
import { AnnouncementModal } from '../AnnouncementModal';
import { BugoHazardMapView } from '../maps/BugoHazardMapView';

export const ResidentLayout: React.FC = () => {
  const { 
    residentTab, 
    setResidentTab, 
    currentUser,
    submitAssistanceApplication,
    announcements,
    applications,
    incrementAnnouncementViews
  } = useApp();

  const [viewingAnn, setViewingAnn] = useState<AnnouncementItem | null>(null);

  // Registration & Service Application Fill-up Form Modal State
  const [applyingProgram, setApplyingProgram] = useState<AssistanceProgram | null>(null);
  const [applicationStep, setApplicationStep] = useState<1 | 2 | 3>(1);
  const [submittedRef, setSubmittedRef] = useState<string | null>(null);
  const [formError, setFormError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Clean empty initial form state (Empty & Realistic by Default)
  const [appForm, setAppForm] = useState({
    applicantName: '',
    email: '',
    contactNumber: '',
    purok: '',
    address: '',
    householdIncome: '',
    familyMembersCount: '',
    occupation: '',
    purpose: '',
    agreedToTerms: false,
    idType: 'PhilSys National ID (PhilID / ePhilID)',
    frontIdFileName: '',
    frontIdPreviewUrl: '',
    frontIdSize: '',
    frontIdAnalysis: null as IdPhotoAnalysis | null,
    isScanningId: false,
    backIdFileName: '',
    backIdPreviewUrl: '',
    backIdSize: '',
    backIdAnalysis: null as IdPhotoAnalysis | null,
    isScanningBackId: false,
    additionalDocName: '',
    additionalDocUrl: '',
    additionalDocSize: ''
  });

  const [previewDocModal, setPreviewDocModal] = useState<{ title: string; url: string } | null>(null);

  const handleStartApply = (prog: AssistanceProgram) => {
    setApplyingProgram(prog);
    setApplicationStep(1);
    setSubmittedRef(null);
    setFormError('');
    setIsSubmitting(false);
    // Initialize form with verified resident profile
    setAppForm({
      applicantName: currentUser?.name || '',
      email: currentUser?.email || '',
      contactNumber: currentUser?.contactNumber || '',
      purok: currentUser?.purok || '',
      address: currentUser?.address || '',
      householdIncome: currentUser?.householdIncome || '',
      familyMembersCount: currentUser?.familyMembersCount ? String(currentUser.familyMembersCount) : '',
      occupation: currentUser?.occupation || '',
      purpose: '',
      agreedToTerms: false,
      idType: 'PhilSys National ID (PhilID / ePhilID)',
      frontIdFileName: '',
      frontIdPreviewUrl: '',
      frontIdSize: '',
      frontIdAnalysis: null,
      isScanningId: false,
      backIdFileName: '',
      backIdPreviewUrl: '',
      backIdSize: '',
      backIdAnalysis: null,
      isScanningBackId: false,
      additionalDocName: '',
      additionalDocUrl: '',
      additionalDocSize: ''
    });
  };


  const handleFrontIdUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setFormError('Front ID file exceeds 5MB limit. Please select a smaller file.');
      return;
    }
    setFormError('');

    const sizeStr = `${(file.size / (1024 * 1024)).toFixed(1)} MB`;
    const reader = new FileReader();
    reader.onloadend = async () => {
      if (typeof reader.result === 'string') {
        const base64Data = reader.result;
        // Fast local heuristic first
        const localCheck = inspectIdPhotoClientHeuristic(file);

        setAppForm(prev => ({
          ...prev,
          frontIdFileName: file.name,
          frontIdPreviewUrl: base64Data,
          frontIdSize: sizeStr,
          frontIdAnalysis: localCheck,
          isScanningId: true
        }));

        // Send to server-side Gemini Vision API for deep verification
        try {
          const res = await fetch('/api/ai/validate-id-photo', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              imageBase64: base64Data,
              mimeType: file.type || 'image/jpeg',
              fileName: file.name,
              side: 'front'
            })
          });
          const resData = await res.json();
          if (resData.success && resData.analysis) {
            setAppForm(prev => ({
              ...prev,
              frontIdAnalysis: resData.analysis,
              isScanningId: false
            }));
          } else {
            setAppForm(prev => ({ ...prev, isScanningId: false }));
          }
        } catch {
          setAppForm(prev => ({ ...prev, isScanningId: false }));
        }
      }
    };
    reader.readAsDataURL(file);
  };



  const handleRemoveFrontId = () => {
    setAppForm(prev => ({
      ...prev,
      frontIdFileName: '',
      frontIdPreviewUrl: '',
      frontIdSize: '',
      frontIdAnalysis: null,
      isScanningId: false
    }));
  };

  const handleBackIdUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setFormError('Back ID file exceeds 5MB limit. Please select a smaller file.');
      return;
    }
    setFormError('');

    const sizeStr = `${(file.size / (1024 * 1024)).toFixed(1)} MB`;
    const reader = new FileReader();
    reader.onloadend = async () => {
      if (typeof reader.result === 'string') {
        const base64Data = reader.result;
        const localCheck = inspectIdPhotoClientHeuristic(file);

        setAppForm(prev => ({
          ...prev,
          backIdFileName: file.name,
          backIdPreviewUrl: base64Data,
          backIdSize: sizeStr,
          backIdAnalysis: localCheck,
          isScanningBackId: true
        }));

        try {
          const res = await fetch('/api/ai/validate-id-photo', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              imageBase64: base64Data,
              mimeType: file.type || 'image/jpeg',
              fileName: file.name,
              side: 'back'
            })
          });
          const resData = await res.json();
          if (resData.success && resData.analysis) {
            setAppForm(prev => ({
              ...prev,
              backIdAnalysis: resData.analysis,
              isScanningBackId: false
            }));
          } else {
            setAppForm(prev => ({ ...prev, isScanningBackId: false }));
          }
        } catch {
          setAppForm(prev => ({ ...prev, isScanningBackId: false }));
        }
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveBackId = () => {
    setAppForm(prev => ({
      ...prev,
      backIdFileName: '',
      backIdPreviewUrl: '',
      backIdSize: '',
      backIdAnalysis: null,
      isScanningBackId: false
    }));
  };

  const handleAdditionalDocUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setFormError('Document file exceeds 5MB limit.');
      return;
    }

    const sizeStr = `${(file.size / (1024 * 1024)).toFixed(1)} MB`;
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        setAppForm(prev => ({
          ...prev,
          additionalDocName: file.name,
          additionalDocUrl: reader.result as string,
          additionalDocSize: sizeStr
        }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAdditionalDoc = () => {
    setAppForm(prev => ({
      ...prev,
      additionalDocName: '',
      additionalDocUrl: '',
      additionalDocSize: ''
    }));
  };

  const handleSubmitApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!applyingProgram) return;

    // Realistic validation
    if (!appForm.applicantName.trim()) {
      setFormError('Please enter your full legal name.');
      return;
    }
    if (!appForm.contactNumber.trim()) {
      setFormError('Please enter your contact phone number.');
      return;
    }
    if (!appForm.purok) {
      setFormError('Please select your Purok / Zone.');
      return;
    }
    if (!appForm.address.trim()) {
      setFormError('Please enter your complete street address.');
      return;
    }
    if (!appForm.purpose.trim()) {
      setFormError('Please provide the purpose or reason for your request.');
      return;
    }
    if (!appForm.frontIdPreviewUrl || !appForm.backIdPreviewUrl) {
      setFormError('Please attach both Front and Back photos of your ID.');
      return;
    }
    if (appForm.frontIdAnalysis?.isId === false || appForm.backIdAnalysis?.isId === false) {
      setFormError('Not qualified: Front and Back must both be valid IDs.');
      return;
    }
    if (appForm.frontIdAnalysis?.isClear === false || appForm.backIdAnalysis?.isClear === false) {
      setFormError('ID photo is not clear. Please try again with a clearer photo.');
      return;
    }
    if (!appForm.agreedToTerms) {
      setFormError('Please accept the certification acknowledgment before submitting.');
      return;
    }

    setFormError('');
    setIsSubmitting(true);

    const documentsToSubmit = [];

    if (appForm.frontIdPreviewUrl) {
      documentsToSubmit.push({
        id: `doc-front-${Date.now()}`,
        name: `[Front ID] ${appForm.frontIdFileName || 'Front_ID.jpg'}`,
        type: 'Image',
        docCategory: 'Front ID' as const,
        previewUrl: appForm.frontIdPreviewUrl,
        fileUrl: appForm.frontIdPreviewUrl,
        size: appForm.frontIdSize || '1.2 MB',
        uploadDate: 'Today',
        verified: false,
        analysis: appForm.frontIdAnalysis || undefined
      });
    }

    if (appForm.backIdPreviewUrl) {
      documentsToSubmit.push({
        id: `doc-back-${Date.now()}`,
        name: `[Back ID] ${appForm.backIdFileName || 'Back_ID.jpg'}`,
        type: 'Image',
        docCategory: 'Back ID' as const,
        previewUrl: appForm.backIdPreviewUrl,
        fileUrl: appForm.backIdPreviewUrl,
        size: appForm.backIdSize || '1.1 MB',
        uploadDate: 'Today',
        verified: false,
        analysis: appForm.backIdAnalysis || undefined
      });
    }

    if (appForm.additionalDocName) {
      documentsToSubmit.push({
        id: `doc-extra-${Date.now()}`,
        name: appForm.additionalDocName,
        type: appForm.additionalDocName.toLowerCase().endsWith('.pdf') ? 'PDF' : 'Image',
        docCategory: 'Proof of Residency' as const,
        previewUrl: appForm.additionalDocUrl,
        fileUrl: appForm.additionalDocUrl,
        size: appForm.additionalDocSize || '1.0 MB',
        uploadDate: 'Today',
        verified: false
      });
    }

    try {
      const ref = await submitAssistanceApplication({
        programId: applyingProgram.id,
        programTitle: applyingProgram.title,
        category: applyingProgram.category,
        applicantName: appForm.applicantName,
        contactNumber: appForm.contactNumber,
        email: appForm.email,
        purok: appForm.purok,
        address: appForm.address,
        householdMonthlyIncome: appForm.householdIncome || '₱8,500.00',
        familyMembersCount: Number(appForm.familyMembersCount) || 1,
        occupation: appForm.occupation || 'Resident',
        purposeOrDiagnosis: appForm.purpose,
        documents: documentsToSubmit
      });

      setSubmittedRef(ref);
    } catch {
      setFormError('Submission failed. Please check your network connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const upperNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'services', label: 'Certificate Applications', icon: FileCheck2 },
    { id: 'hazard-map', label: 'Hazard Map', icon: MapPin },
    { id: 'announcements', label: 'Announcements', icon: Megaphone },
  ] as const;

  const lowerNavItems = [
    { id: 'help', label: 'Help', icon: HelpCircle },
    { id: 'settings', label: 'Settings', icon: Settings },
  ] as const;

  return (
    <div className="min-h-screen flex bg-[#f0f4f9] text-gray-800 font-sans antialiased">
      {/* Left Sidebar (Hidden on Mobile Web, Visible on Desktop) */}
      <aside className="hidden md:flex w-64 bg-white border-r border-gray-200 flex-col flex-shrink-0 min-h-screen sticky top-0 h-screen z-40">
        <div>
          {/* Logo */}
          <div className="p-6 border-b border-gray-100">
            <BugoLogo size="md" />
          </div>

          {/* Navigation */}
          <nav className="p-4 space-y-1.5">
            {/* Upper Navigations */}
            {upperNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = residentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setResidentTab(item.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#0c532b] text-white shadow-xs'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/80'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-gray-500'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}

            {/* Help & Settings placed directly below upper navigations */}
            <div className="pt-2 mt-2 border-t border-gray-100 space-y-1.5">
              {lowerNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = residentTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setResidentTab(item.id)}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-[#0c532b] text-white shadow-xs'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/80'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-gray-500'}`} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <TopNavBar />

        <main className="flex-1 p-4 sm:p-6 md:p-8 pb-24 md:pb-8 max-w-7xl w-full mx-auto">
          {residentTab === 'dashboard' && (
            <ResidentDashboardView 
              onApplyProgram={handleStartApply}
              onNavigateTab={(tab) => setResidentTab(tab as any)}
            />
          )}

          {residentTab === 'services' && (
            <ResidentServicesView 
              onApplyProgram={handleStartApply}
            />
          )}

          {residentTab === 'announcements' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                  Barangay Announcements & Advisories
                </h1>
                <p className="text-gray-500 text-sm mt-0.5">
                  Official community updates broadcast by the Barangay Bugo Secretariat.
                </p>
              </div>

              {(() => {
                const visibleAnnouncements = announcements.filter(ann => canResidentViewAnnouncement(currentUser, ann));
                if (visibleAnnouncements.length === 0) {
                  return (
                    <div className="py-16 text-center text-gray-400 bg-white rounded-3xl border border-gray-200">
                      <Megaphone className="w-8 h-8 mx-auto text-gray-300 mb-2" />
                      <p className="text-sm font-semibold text-gray-700">No Announcements Available</p>
                      <p className="text-xs text-gray-400 mt-1">There are currently no active public or targeted announcements for your profile.</p>
                    </div>
                  );
                }

                return (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {visibleAnnouncements.map((ann) => {
                      const isExclusive = ann.targetAudienceType === 'Qualified Beneficiaries Only';

                      return (
                        <div 
                          key={ann.id} 
                          onClick={() => {
                            setViewingAnn(ann);
                            incrementAnnouncementViews(ann.id);
                          }}
                          className={`bg-white rounded-2xl p-5 border shadow-xs hover:border-[#0c532b] hover:shadow-md transition cursor-pointer flex flex-col justify-between space-y-3 group ${
                            isExclusive ? 'border-emerald-300 ring-1 ring-emerald-100 bg-emerald-50/20' : 'border-gray-200'
                          }`}
                        >
                          <div>
                            <div className="flex flex-wrap items-center justify-between gap-1.5">
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-[#0c532b]">
                                {ann.category}
                              </span>
                              <span className="text-xs text-gray-400">{ann.date}</span>
                            </div>

                            {/* Exclusive Badge */}
                            {isExclusive && (
                              <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-600 text-white text-[10px] font-extrabold shadow-2xs">
                                <ShieldCheck className="w-3 h-3" />
                                <span>Qualified Beneficiaries Exclusive</span>
                              </div>
                            )}

                            <h3 className="text-sm font-bold text-gray-900 mt-2 group-hover:text-[#0c532b] transition-colors">{ann.title}</h3>
                            <p className="text-xs text-gray-500 leading-relaxed line-clamp-3 mt-1">{ann.description}</p>

                            {/* Release Schedule Quick Preview */}
                            {isExclusive && (ann.releaseDate || ann.meetingTime) && (
                              <div className="mt-2.5 p-2 bg-emerald-100/60 rounded-xl border border-emerald-200 text-[11px] text-emerald-950 space-y-0.5">
                                {ann.releaseDate && (
                                  <div className="font-semibold flex items-center gap-1">
                                    <Clock className="w-3 h-3 text-emerald-700" />
                                    <span>Release Date: {ann.releaseDate}</span>
                                  </div>
                                )}
                                {ann.meetingVenue && (
                                  <div className="text-[10px] text-emerald-800 truncate">
                                    Venue: {ann.meetingVenue}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>

                          <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
                            <span className="flex items-center gap-1 font-semibold text-gray-600">
                              <Eye className="w-3.5 h-3.5 text-gray-400" />
                              {ann.viewsCount || 0} views
                            </span>
                            <span className="text-emerald-700 font-semibold text-[11px] group-hover:underline">Read Full Notice &rarr;</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}

              <AnnouncementModal 
                announcement={viewingAnn}
                onClose={() => setViewingAnn(null)}
              />
            </div>
          )}

          {residentTab === 'hazard-map' && (
            <BugoHazardMapView canManage={false} />
          )}

          {residentTab === 'settings' && (
            <ResidentSettingsView />
          )}

          {residentTab === 'help' && (
            <ResidentHelpView />
          )}
        </main>

        {/* Mobile Bottom Quick Navigation Bar (Hidden on Desktop) */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-200 z-40 px-2 py-1.5 flex items-center justify-around shadow-lg">
          <button
            onClick={() => setResidentTab('dashboard')}
            className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-xl transition ${residentTab === 'dashboard' ? 'text-[#0c532b] font-bold' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span className="text-[10px]">Home</span>
          </button>
          <button
            onClick={() => setResidentTab('services')}
            className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-xl transition ${residentTab === 'services' ? 'text-[#0c532b] font-bold' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <FileCheck2 className="w-5 h-5" />
            <span className="text-[10px]">Services</span>
          </button>
          <button
            onClick={() => setResidentTab('hazard-map')}
            className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-xl transition ${residentTab === 'hazard-map' ? 'text-[#0c532b] font-bold' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <MapPin className="w-5 h-5" />
            <span className="text-[10px]">Map</span>
          </button>
          <button
            onClick={() => setResidentTab('announcements')}
            className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-xl transition ${residentTab === 'announcements' ? 'text-[#0c532b] font-bold' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <Megaphone className="w-5 h-5" />
            <span className="text-[10px]">Notices</span>
          </button>
        </div>
      </div>

      {/* Official Registration & Application Fill-up Form Modal (Empty, Realistic & Simple) */}
      {applyingProgram && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-7 border border-gray-200 shadow-2xl max-h-[92vh] overflow-y-auto space-y-5 my-6 animate-in fade-in">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-3 border-b border-gray-100">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#0c532b]">
                  Official Barangay Bugo Service Request
                </span>
                <h2 className="text-xl font-bold text-gray-900 mt-0.5">
                  {applyingProgram.title}
                </h2>
              </div>
              <button 
                onClick={() => setApplyingProgram(null)}
                className="text-gray-400 hover:text-gray-700 p-1.5 rounded-full hover:bg-gray-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {!submittedRef ? (
              <form onSubmit={handleSubmitApplication} className="space-y-5 text-xs">
                {/* 3-Step Wizard Navigation Stepper */}
                <div className="grid grid-cols-3 gap-2 pb-2 border-b border-gray-100">
                  <button
                    type="button"
                    onClick={() => setApplicationStep(1)}
                    className={`py-2 px-2 rounded-xl text-center transition flex flex-col items-center gap-1 cursor-pointer ${
                      applicationStep === 1
                        ? 'bg-emerald-50 text-[#0c532b] font-extrabold border border-emerald-200'
                        : 'text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    <span className="text-[10px] uppercase tracking-wider">Step 1</span>
                    <span className="text-xs font-bold truncate">Resident Info</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (!appForm.applicantName.trim() || !appForm.contactNumber.trim() || !appForm.purok || !appForm.address.trim()) {
                        setFormError('Please fill out all required fields in Step 1 first.');
                        return;
                      }
                      setFormError('');
                      setApplicationStep(2);
                    }}
                    className={`py-2 px-2 rounded-xl text-center transition flex flex-col items-center gap-1 cursor-pointer ${
                      applicationStep === 2
                        ? 'bg-emerald-50 text-[#0c532b] font-extrabold border border-emerald-200'
                        : 'text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    <span className="text-[10px] uppercase tracking-wider">Step 2</span>
                    <span className="text-xs font-bold truncate">ID & Purpose</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (!appForm.applicantName.trim() || !appForm.contactNumber.trim() || !appForm.purok || !appForm.address.trim()) {
                        setFormError('Please complete Step 1 first.');
                        return;
                      }
                      if (!appForm.purpose.trim() || !appForm.frontIdPreviewUrl) {
                        setFormError('Please provide request purpose and upload Front ID in Step 2.');
                        return;
                      }
                      setFormError('');
                      setApplicationStep(3);
                    }}
                    className={`py-2 px-2 rounded-xl text-center transition flex flex-col items-center gap-1 cursor-pointer ${
                      applicationStep === 3
                        ? 'bg-emerald-50 text-[#0c532b] font-extrabold border border-emerald-200'
                        : 'text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    <span className="text-[10px] uppercase tracking-wider">Step 3</span>
                    <span className="text-xs font-bold truncate">Review & Submit</span>
                  </button>
                </div>

                {/* Form Error Alert */}
                {formError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl flex items-center gap-2 font-semibold">
                    <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}

                {/* Step 1 Container */}
                {applicationStep === 1 && (
                  <div className="space-y-4">


                {/* Section 1: Applicant Personal Information */}
                <div className="space-y-3">
                  <div className="flex items-center gap-1.5 font-bold text-gray-900 border-b border-gray-100 pb-1.5">
                    <span>Applicant Personal Information</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-gray-700 mb-1">
                        Full Legal Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Juan C. Dela Cruz"
                        value={appForm.applicantName}
                        onChange={(e) => setAppForm({ ...appForm, applicantName: e.target.value })}
                        className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2.5 font-medium outline-none focus:ring-2 focus:ring-[#0c532b] focus:border-[#0c532b]"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="block font-bold text-gray-700">
                          Contact Phone <span className="text-rose-500">*</span>
                        </label>
                        <span className="text-[10px] text-gray-400">
                          {appForm.contactNumber.replace(/\D/g, '').length}/12
                        </span>
                      </div>
                      <input
                        type="tel"
                        maxLength={12}
                        required
                        placeholder="0917 123 4567"
                        value={appForm.contactNumber}
                        onChange={(e) => setAppForm({ ...appForm, contactNumber: e.target.value.replace(/\D/g, '').slice(0, 12) })}
                        className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2.5 font-medium outline-none focus:ring-2 focus:ring-[#0c532b] focus:border-[#0c532b]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-gray-700 mb-1">
                        Purok / Zone <span className="text-rose-500">*</span>
                      </label>
                      <select
                        required
                        value={appForm.purok}
                        onChange={(e) => setAppForm({ ...appForm, purok: e.target.value })}
                        className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2.5 font-medium outline-none focus:ring-2 focus:ring-[#0c532b] focus:border-[#0c532b]"
                      >
                        <option value="">-- Select Purok / Zone --</option>
                        {BUGO_PUROKS.map(p => (
                          <option key={p} value={p}>{p}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-gray-700 mb-1">
                        Complete Street Address <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="House No., Street, Purok / Sitio"
                        value={appForm.address}
                        onChange={(e) => setAppForm({ ...appForm, address: e.target.value })}
                        className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2.5 font-medium outline-none focus:ring-2 focus:ring-[#0c532b] focus:border-[#0c532b]"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 2: Socio-Economic Profile */}
                <div className="space-y-3">
                  <div className="flex items-center gap-1.5 font-bold text-gray-900 border-b border-gray-100 pb-1.5">
                    <span>Socio-Economic & Household Profile</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block font-bold text-gray-700 mb-1">Monthly Household Income</label>
                      <select
                        value={appForm.householdIncome}
                        onChange={(e) => setAppForm({ ...appForm, householdIncome: e.target.value })}
                        className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2.5 font-medium outline-none focus:ring-2 focus:ring-[#0c532b] focus:border-[#0c532b]"
                      >
                        <option value="">-- Select Income Bracket --</option>
                        {MONTHLY_INCOME_OPTIONS.map((inc) => (
                          <option key={inc} value={inc}>{inc}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-gray-700 mb-1">Dependents in Family</label>
                      <input
                        type="number"
                        min="1"
                        placeholder="e.g. 4"
                        value={appForm.familyMembersCount}
                        onChange={(e) => setAppForm({ ...appForm, familyMembersCount: e.target.value })}
                        className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2.5 font-medium outline-none focus:ring-2 focus:ring-[#0c532b] focus:border-[#0c532b]"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-gray-700 mb-1">Primary Occupation</label>
                      <input
                        type="text"
                        placeholder="e.g. Self-Employed, Employee, Student"
                        value={appForm.occupation}
                        onChange={(e) => setAppForm({ ...appForm, occupation: e.target.value })}
                        className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2.5 font-medium outline-none focus:ring-2 focus:ring-[#0c532b] focus:border-[#0c532b]"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setApplyingProgram(null)}
                    className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (!appForm.applicantName.trim()) {
                        setFormError('Please enter your full legal name.');
                        return;
                      }
                      if (!appForm.contactNumber.trim()) {
                        setFormError('Please enter your contact phone number.');
                        return;
                      }
                      if (!appForm.purok) {
                        setFormError('Please select your Purok / Zone.');
                        return;
                      }
                      if (!appForm.address.trim()) {
                        setFormError('Please enter your complete street address.');
                        return;
                      }
                      setFormError('');
                      setApplicationStep(2);
                    }}
                    className="px-6 py-2.5 bg-[#0c532b] hover:bg-[#094222] text-white font-bold rounded-xl transition shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Continue to ID & Documents</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: PURPOSE & VALID ID VERIFICATION */}
            {applicationStep === 2 && (
              <div className="space-y-4">
                {/* Section 3: Purpose of Application */}
                <div className="space-y-3">
                  <div className="flex items-center gap-1.5 font-bold text-gray-900 border-b border-gray-100 pb-1.5">
                    <span>Service Purpose & Statement of Need <span className="text-rose-500">*</span></span>
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 mb-1">
                      Specific Reason / Justification for Request
                    </label>
                    <textarea
                      rows={3}
                      required
                      placeholder="State the purpose of this clearance or assistance request in detail (e.g. job requirement, school enrollment, medical assistance)..."
                      value={appForm.purpose}
                      onChange={(e) => setAppForm({ ...appForm, purpose: e.target.value })}
                      className="w-full bg-white border border-gray-300 rounded-xl p-3 font-medium outline-none focus:ring-2 focus:ring-[#0c532b] focus:border-[#0c532b]"
                    />
                  </div>
                </div>

                {/* Section 4: Front and Back ID Verification */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-1.5">
                    <span className="font-bold text-gray-900">Valid Government ID Verification</span>
                    <span className="text-[10px] font-bold text-[#0c532b] bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      Mandatory
                    </span>
                  </div>

                  {/* ID Type Selector */}
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Select Valid Government ID Type</label>
                    <select
                      value={appForm.idType}
                      onChange={(e) => setAppForm({ ...appForm, idType: e.target.value })}
                      className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2.5 font-medium outline-none focus:ring-2 focus:ring-[#0c532b]"
                    >
                      <option value="PhilSys National ID (PhilID / ePhilID)">PhilSys National ID (PhilID / ePhilID)</option>
                      <option value="LTO Driver's License">LTO Driver's License</option>
                      <option value="COMELEC Voter's ID / Certificate">COMELEC Voter's ID / Certificate</option>
                      <option value="Barangay Bugo Citizen ID">Barangay Bugo Official Citizen ID</option>
                      <option value="UMID / SSS ID">Unified Multi-Purpose ID (UMID / SSS)</option>
                      <option value="DFA Philippine Passport">DFA Philippine Passport</option>
                      <option value="Senior Citizen / PWD ID">Senior Citizen / PWD Identification Card</option>
                      <option value="Valid Student ID">DepEd / CHED Valid Student ID</option>
                    </select>
                  </div>

                  {/* ID AI Inspection Alert */}
                  {appForm.isScanningId && (
                    <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-xl flex items-center gap-2 text-xs text-blue-900 animate-pulse">
                      <RefreshCw className="w-3.5 h-3.5 text-blue-600 animate-spin flex-shrink-0" />
                      <span>Scanning image with Gemini Vision AI for ID authenticity and clarity...</span>
                    </div>
                  )}

                  {appForm.frontIdAnalysis && (
                    <div className={`p-3 rounded-xl border text-xs space-y-1 ${
                      !appForm.frontIdAnalysis.isId
                        ? 'bg-rose-50 border-rose-300 text-rose-950'
                        : !appForm.frontIdAnalysis.isClear
                        ? 'bg-amber-50 border-amber-300 text-amber-950'
                        : 'bg-emerald-50 border-emerald-300 text-emerald-950'
                    }`}>
                      <div className="flex items-center justify-between">
                        <span className="font-bold flex items-center gap-1.5">
                          {!appForm.frontIdAnalysis.isId ? (
                            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                          ) : !appForm.frontIdAnalysis.isClear ? (
                            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                          ) : (
                            <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                          )}
                          <span>
                            {!appForm.frontIdAnalysis.isId
                              ? `Non-ID Detected: ${appForm.frontIdAnalysis.detectedDocType || 'Unrecognized File'}`
                              : !appForm.frontIdAnalysis.isClear
                              ? `Blurry / Low Clarity ID Photo`
                              : `Valid ID Verified: ${appForm.frontIdAnalysis.detectedDocType}`}
                          </span>
                        </span>
                        <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-white/80">
                          Score: {appForm.frontIdAnalysis.score}/100
                        </span>
                      </div>
                      {appForm.frontIdAnalysis.warning && (
                        <p className="text-[11px] leading-snug">{appForm.frontIdAnalysis.warning}</p>
                      )}
                      {appForm.frontIdAnalysis.advice && (
                        <p className="text-[10px] opacity-80 leading-snug">{appForm.frontIdAnalysis.advice}</p>
                      )}
                    </div>
                  )}

                  {/* Front & Back ID Uploads in 2 Columns */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Front ID Dropzone */}
                    <div className="bg-gray-50/80 rounded-2xl border-2 border-dashed border-gray-300 hover:border-[#0c532b] transition p-3.5 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-gray-800 flex items-center gap-1.5">
                          <CreditCard className="w-4 h-4 text-[#0c532b]" />
                          <span>Front of ID</span>
                        </span>
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded">
                          Required
                        </span>
                      </div>

                      {appForm.frontIdPreviewUrl ? (
                        <div className="space-y-2">
                          <div className="relative rounded-xl overflow-hidden h-28 bg-gray-100 border border-gray-200 group">
                            <img 
                              src={appForm.frontIdPreviewUrl} 
                              alt="Front ID Preview" 
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                              <button
                                type="button"
                                onClick={() => setPreviewDocModal({ title: 'Front of ID', url: appForm.frontIdPreviewUrl })}
                                className="p-1.5 bg-white text-gray-900 rounded-lg shadow-sm hover:scale-105"
                                title="Zoom Image"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                          {appForm.isScanningId ? (
                            <p className="text-[11px] font-semibold text-[#0c532b]">Checking ID...</p>
                          ) : appForm.frontIdAnalysis?.isId === false ? (
                            <p className="text-[11px] font-bold text-rose-600">Not an ID — Not qualified. Try again.</p>
                          ) : appForm.frontIdAnalysis?.isClear === false ? (
                            <p className="text-[11px] font-bold text-amber-700">Photo not clear — Please try again.</p>
                          ) : (
                            <p className="text-[11px] font-semibold text-emerald-700">Valid ID</p>
                          )}
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-gray-600 truncate max-w-[130px]">
                              {appForm.frontIdFileName}
                            </span>
                            <div className="flex items-center gap-2">
                              <label className="cursor-pointer text-[#0c532b] font-bold hover:underline">
                                {appForm.frontIdAnalysis && (!appForm.frontIdAnalysis.isId || !appForm.frontIdAnalysis.isClear) ? 'Try Again' : 'Change'}
                                <input type="file" accept="image/*" onChange={handleFrontIdUpload} className="hidden" />
                              </label>
                              <button
                                type="button"
                                onClick={handleRemoveFrontId}
                                className="text-rose-600 hover:text-rose-800 p-1 rounded"
                                title="Remove file"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center justify-center h-28 bg-white rounded-xl border border-gray-200 cursor-pointer hover:bg-emerald-50/40 transition p-3 text-center">
                          <UploadCloud className="w-7 h-7 text-gray-400 mb-1.5" />
                          <span className="text-xs font-bold text-gray-800">Attach Front of ID</span>
                          <span className="text-[10px] text-gray-400 mt-0.5">JPG or PNG up to 5MB</span>
                          <input type="file" accept="image/*" onChange={handleFrontIdUpload} className="hidden" />
                        </label>
                      )}
                    </div>

                    {/* Back ID Dropzone */}
                    <div className="bg-gray-50/80 rounded-2xl border-2 border-dashed border-gray-300 hover:border-[#0c532b] transition p-3.5 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-gray-800 flex items-center gap-1.5">
                          <CreditCard className="w-4 h-4 text-[#0c532b]" />
                          <span>Back of ID</span>
                        </span>
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded">
                          Required
                        </span>
                      </div>

                      {appForm.backIdPreviewUrl ? (
                        <div className="space-y-2">
                          <div className="relative rounded-xl overflow-hidden h-28 bg-gray-100 border border-gray-200 group">
                            <img 
                              src={appForm.backIdPreviewUrl} 
                              alt="Back ID Preview" 
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                              <button
                                type="button"
                                onClick={() => setPreviewDocModal({ title: 'Back of ID', url: appForm.backIdPreviewUrl })}
                                className="p-1.5 bg-white text-gray-900 rounded-lg shadow-sm hover:scale-105"
                                title="Zoom Image"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                          {appForm.isScanningBackId ? (
                            <p className="text-[11px] font-semibold text-[#0c532b]">Checking ID...</p>
                          ) : appForm.backIdAnalysis?.isId === false ? (
                            <p className="text-[11px] font-bold text-rose-600">Not an ID — Not qualified. Try again.</p>
                          ) : appForm.backIdAnalysis?.isClear === false ? (
                            <p className="text-[11px] font-bold text-amber-700">Photo not clear — Please try again.</p>
                          ) : (
                            <p className="text-[11px] font-semibold text-emerald-700">Valid ID</p>
                          )}
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-gray-600 truncate max-w-[130px]">
                              {appForm.backIdFileName}
                            </span>
                            <div className="flex items-center gap-2">
                              <label className="cursor-pointer text-[#0c532b] font-bold hover:underline">
                                {appForm.backIdAnalysis && (!appForm.backIdAnalysis.isId || !appForm.backIdAnalysis.isClear) ? 'Try Again' : 'Change'}
                                <input type="file" accept="image/*" onChange={handleBackIdUpload} className="hidden" />
                              </label>
                              <button
                                type="button"
                                onClick={handleRemoveBackId}
                                className="text-rose-600 hover:text-rose-800 p-1 rounded"
                                title="Remove file"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center justify-center h-28 bg-white rounded-xl border border-gray-200 cursor-pointer hover:bg-emerald-50/40 transition p-3 text-center">
                          <UploadCloud className="w-7 h-7 text-gray-400 mb-1.5" />
                          <span className="text-xs font-bold text-gray-800">Attach Back of ID</span>
                          <span className="text-[10px] text-gray-400 mt-0.5">JPG or PNG up to 5MB</span>
                          <input type="file" accept="image/*" onChange={handleBackIdUpload} className="hidden" />
                        </label>
                      )}
                    </div>
                  </div>

                  {/* Supporting Document (Optional) */}
                  <div className="pt-1">
                    {appForm.additionalDocName ? (
                      <div className="p-3 bg-emerald-50/60 rounded-xl flex items-center justify-between border border-emerald-200 text-xs">
                        <div className="flex items-center gap-2.5">
                          <FileCheck2 className="w-4 h-4 text-[#0c532b] flex-shrink-0" />
                          <div>
                            <span className="font-bold text-gray-900 block">{appForm.additionalDocName}</span>
                            <span className="text-[10px] text-gray-500">{appForm.additionalDocSize} • Attached</span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={handleRemoveAdditionalDoc}
                          className="text-rose-600 hover:text-rose-800 text-[11px] font-bold"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <label className="p-3 bg-gray-50 hover:bg-gray-100 rounded-xl flex items-center justify-between border border-gray-200 cursor-pointer transition text-xs">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Paperclip className="w-4 h-4 text-gray-400" />
                          <span>Attach Indigency Certificate, Cedula, or Utility Bill (Optional)</span>
                        </div>
                        <span className="text-[11px] font-bold text-[#0c532b] bg-white px-2.5 py-1 rounded-md border border-gray-200">
                          Browse File
                        </span>
                        <input type="file" accept=".pdf,image/*" onChange={handleAdditionalDocUpload} className="hidden" />
                      </label>
                    )}
                  </div>
                </div>

                <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setApplicationStep(1)}
                    className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back to Resident Info</span>
                  </button>

                  <button
                    type="button"
                    disabled={appForm.isScanningId || appForm.isScanningBackId}
                    onClick={() => {
                      if (!appForm.purpose.trim()) {
                        setFormError('Please provide the purpose or reason for your request.');
                        return;
                      }
                      if (!appForm.frontIdPreviewUrl || !appForm.backIdPreviewUrl) {
                        setFormError('Please attach both Front and Back photos of your ID.');
                        return;
                      }
                      if (appForm.frontIdAnalysis?.isId === false || appForm.backIdAnalysis?.isId === false) {
                        setFormError('Not qualified: Front and Back must both be valid IDs.');
                        return;
                      }
                      if (appForm.frontIdAnalysis?.isClear === false || appForm.backIdAnalysis?.isClear === false) {
                        setFormError('ID photo is not clear. Please try again with a clearer photo.');
                        return;
                      }
                      setFormError('');
                      setApplicationStep(3);
                    }}
                    className="px-6 py-2.5 bg-[#0c532b] hover:bg-[#094222] text-white font-bold rounded-xl transition shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <span>{appForm.isScanningId || appForm.isScanningBackId ? 'Checking IDs...' : 'Review Application'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: REVIEW & SWORN CERTIFICATION */}
            {applicationStep === 3 && (
              <div className="space-y-4">
                {/* Pre-Check Brain Assessment Ticket */}
                {(() => {
                  const preCheck = evaluateApplicantEligibility({
                    programId: applyingProgram.id,
                    programTitle: applyingProgram.title,
                    applicantName: appForm.applicantName,
                    purok: appForm.purok,
                    address: appForm.address,
                    householdIncome: appForm.householdIncome || '₱8,500.00',
                    familyCount: Number(appForm.familyMembersCount) || 4,
                    occupation: appForm.occupation || 'Resident',
                    purpose: appForm.purpose,
                    hasFrontId: Boolean(appForm.frontIdPreviewUrl),
                    hasBackId: Boolean(appForm.backIdPreviewUrl),
                    hasSupportingDoc: Boolean(appForm.additionalDocName),
                    idAnalysis: appForm.frontIdAnalysis || undefined,
                    backIdAnalysis: appForm.backIdAnalysis || undefined
                  });

                  return (
                    <div className={`p-3.5 rounded-2xl border text-xs space-y-2 ${
                      preCheck.isCapable 
                        ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950' 
                        : 'bg-rose-50 border-rose-300 text-rose-950'
                    }`}>
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                          <ShieldCheck className="w-3.5 h-3.5 text-[#0c532b]" />
                          <span>Eligibility Pre-Check Assessment</span>
                        </span>
                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                          preCheck.isCapable ? 'bg-emerald-200 text-emerald-900' : 'bg-rose-200 text-rose-900'
                        }`}>
                          {preCheck.isCapable ? (
                            <Check className="w-3 h-3 text-emerald-800" />
                          ) : (
                            <AlertCircle className="w-3 h-3 text-rose-800" />
                          )}
                          <span>{preCheck.verdict === 'ELIGIBLE' ? 'Eligible' : 'Ineligible / Disqualified'}</span>
                        </span>
                      </div>
                      <p className="text-[11px] leading-relaxed">
                        {preCheck.summary}
                      </p>
                      {!preCheck.isCapable && (
                        <div className="text-[11px] bg-white/90 p-2 rounded-xl border border-rose-200 font-medium text-rose-800">
                          <strong>Reason for Ineligibility:</strong> {preCheck.disqualifiedReason}
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* Summary Ticket Card */}
                <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200 space-y-3">
                  <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                    <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Application Summary</span>
                    <span className="text-xs font-bold text-[#0c532b] bg-emerald-100 px-2 py-0.5 rounded">
                      {applyingProgram.category}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-gray-400">Requested Service:</span>
                      <p className="font-bold text-gray-900">{applyingProgram.title}</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Processing Time:</span>
                      <p className="font-bold text-gray-900">{applyingProgram.processingTime}</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Applicant:</span>
                      <p className="font-semibold text-gray-800">{appForm.applicantName}</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Contact Number:</span>
                      <p className="font-semibold text-gray-800">{appForm.contactNumber}</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Zone / Purok:</span>
                      <p className="font-semibold text-gray-800">{appForm.purok}</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Government ID:</span>
                      <p className="font-bold text-[#0c532b]">{appForm.idType}</p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-gray-200 text-xs">
                    <span className="text-gray-400">Statement of Purpose:</span>
                    <p className="font-medium text-gray-700 italic mt-0.5">{appForm.purpose}</p>
                  </div>
                </div>

                {/* Section 5: Sworn Certification */}
                <div className="p-3.5 bg-white rounded-2xl border border-gray-200">
                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      required
                      checked={appForm.agreedToTerms}
                      onChange={(e) => setAppForm({ ...appForm, agreedToTerms: e.target.checked })}
                      className="mt-0.5 rounded text-[#0c532b] focus:ring-[#0c532b]"
                    />
                    <span className="text-[11px] text-gray-700 leading-snug">
                      I hereby swear and certify that all information provided and attached identification documents are authentic, accurate, and belong to me.
                    </span>
                  </label>
                </div>

                <div className="flex justify-between items-center pt-2">
                  <button
                    type="button"
                    onClick={() => setApplicationStep(2)}
                    className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Edit Documents</span>
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting || !appForm.agreedToTerms}
                    className="px-6 py-2.5 bg-[#0c532b] hover:bg-[#094222] text-white font-bold rounded-xl transition shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <span>Submitting Request...</span>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Submit Application & IDs</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
              </form>
            ) : (
              /* Official Application Receipt & Acknowledgment Slip (Handles Approved/Submitted and Disqualified) */
              (() => {
                const submittedApp = applications.find(a => a.referenceCode === submittedRef);
                const isDisqualified = submittedApp?.status === 'Disqualified';
                const evaluation = submittedApp?.eligibilityEvaluation;

                if (isDisqualified) {
                  return (
                    <div className="space-y-4 text-xs">
                      <div className="p-6 bg-rose-50/80 border border-rose-300 rounded-3xl text-center space-y-3 font-sans">
                        <div className="w-12 h-12 rounded-full bg-rose-600 text-white flex items-center justify-center mx-auto shadow-sm">
                          <AlertTriangle className="w-6 h-6" />
                        </div>

                        <div className="space-y-0.5">
                          <h3 className="text-base font-extrabold text-rose-950">
                            Application Processed: Disqualified / Ineligible
                          </h3>
                          <p className="text-xs text-rose-700">
                            Automated Verification • Barangay Bugo Eligibility Guidelines
                          </p>
                        </div>

                        <div className="bg-white rounded-2xl p-4 border border-rose-200 text-left space-y-2 text-xs">
                          <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                            <span className="text-gray-400">Tracking Reference:</span>
                            <span className="font-mono font-extrabold text-gray-900 bg-gray-100 px-2.5 py-1 rounded-lg text-sm">
                              {submittedRef}
                            </span>
                          </div>

                          <div className="flex justify-between">
                            <span className="text-gray-400">Service Requested:</span>
                            <span className="font-bold text-gray-900">{applyingProgram.title}</span>
                          </div>

                          <div className="flex justify-between">
                            <span className="text-gray-400">Applicant:</span>
                            <span className="font-semibold text-gray-800">{appForm.applicantName}</span>
                          </div>

                          <div className="flex justify-between">
                            <span className="text-gray-400">Status:</span>
                            <span className="font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded">
                              Disqualified • Not Capable/Eligible
                            </span>
                          </div>

                          <div className="pt-2 border-t border-gray-100 text-rose-900 bg-rose-50/70 p-2.5 rounded-xl border border-rose-200">
                            <strong className="block text-rose-950 mb-0.5">Automated Determination Reason:</strong>
                            <p className="text-[11px] leading-relaxed">
                              {evaluation?.disqualifiedReason || submittedApp?.rejectionReason || 'The application did not satisfy the program eligibility criteria.'}
                            </p>
                          </div>

                          {evaluation && evaluation.ruleResults && (
                            <div className="pt-2 space-y-1.5">
                              <span className="font-bold text-gray-700 block text-[11px]">Rule Compliance Audit:</span>
                              <div className="grid grid-cols-1 gap-1 text-[11px]">
                                {evaluation.ruleResults.map((r, i) => (
                                  <div key={i} className={`flex items-center justify-between p-1.5 rounded-lg ${
                                    r.passed ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-100 text-rose-900 font-semibold'
                                  }`}>
                                    <span>{r.ruleName}:</span>
                                    <span>{r.passed ? 'Passed' : `Failed (${r.actualValue})`}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        <p className="text-[11px] text-rose-700 font-medium px-2">
                          Notice: Application does not meet program eligibility boundaries.
                        </p>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-2">
                        <button
                          type="button"
                          onClick={() => window.print()}
                          className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition"
                        >
                          <Printer className="w-4 h-4" />
                          <span>Print Ineligibility Notice</span>
                        </button>

                        <div className="flex-1 py-2.5 bg-rose-50 text-rose-600 border border-rose-200 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5">
                          <Ban className="w-4 h-4" />
                          <span>Application Disqualified</span>
                        </div>

                        <button
                          type="button"
                          onClick={() => setApplyingProgram(null)}
                          className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition"
                        >
                          Done
                        </button>
                      </div>
                    </div>
                  );
                }

                return (
                  <div className="space-y-4 text-xs">
                    <div className="p-6 bg-white border-2 border-gray-300 rounded-3xl text-center space-y-3 font-sans printable-document">
                      <div className="w-12 h-12 rounded-full bg-[#0c532b] text-white flex items-center justify-center mx-auto shadow-sm">
                        <CheckCircle className="w-6 h-6" />
                      </div>

                      <div className="space-y-0.5">
                        <h3 className="text-base font-extrabold text-gray-900">
                          Application Verified & Submitted Successfully
                        </h3>
                        <p className="text-xs text-gray-500">
                          Official Acknowledgment • Barangay Bugo Administrative Office
                        </p>
                      </div>

                      <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200 text-left space-y-2 text-xs">
                        <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                          <span className="text-gray-500">Tracking Reference:</span>
                          <span className="font-mono font-extrabold text-gray-900 bg-white px-2.5 py-1 rounded-lg text-sm border border-gray-200">
                            {submittedRef}
                          </span>
                        </div>

                        <div className="flex justify-between">
                          <span className="text-gray-500">Service Requested:</span>
                          <span className="font-bold text-gray-900">{applyingProgram.title}</span>
                        </div>

                        <div className="flex justify-between">
                          <span className="text-gray-500">Applicant:</span>
                          <span className="font-semibold text-gray-800">{appForm.applicantName}</span>
                        </div>

                        <div className="flex justify-between">
                          <span className="text-gray-500">ID Attached:</span>
                          <span className="font-bold text-[#0c532b]">{appForm.idType}</span>
                        </div>

                        <div className="flex justify-between">
                          <span className="text-gray-500">Purok / Zone:</span>
                          <span className="font-semibold text-gray-800">{appForm.purok}</span>
                        </div>

                        <div className="flex justify-between">
                          <span className="text-gray-500">Status:</span>
                          <span className="font-bold text-emerald-700">Submitted • In Verification Queue</span>
                        </div>
                      </div>

                      <p className="text-[11px] text-[#0c532b] font-medium px-2">
                        Your request and identification documents satisfy program rules and have been queued for Barangay Bugo processing.
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2 no-print">
                      <button
                        type="button"
                        onClick={() => window.print()}
                        className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer"
                      >
                        <Printer className="w-4 h-4" />
                        <span>Print Receipt</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setResidentTab('dashboard');
                          setApplyingProgram(null);
                        }}
                        className="flex-1 py-2.5 bg-[#0c532b] hover:bg-[#094222] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition shadow-xs cursor-pointer"
                      >
                        <FileCheck2 className="w-4 h-4" />
                        <span>View In Dashboard</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setApplyingProgram(null)}
                        className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition"
                      >
                        Done
                      </button>
                    </div>
                  </div>
                );
              })()
            )}
          </div>
        </div>
      )}

      {/* Document Zoom Modal */}
      {previewDocModal && (
        <div className="fixed inset-0 z-60 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-4 border border-gray-200 shadow-2xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <h4 className="font-bold text-sm text-gray-900">{previewDocModal.title}</h4>
              <button onClick={() => setPreviewDocModal(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="max-h-[70vh] overflow-hidden rounded-2xl bg-gray-100 flex items-center justify-center">
              <img src={previewDocModal.url} alt="Document Zoom" className="w-full h-auto object-contain" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
