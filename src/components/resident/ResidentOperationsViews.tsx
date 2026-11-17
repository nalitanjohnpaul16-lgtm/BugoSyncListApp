import React, { useState } from 'react';
import { 
  HeartHandshake, 
  FileText, 
  Clock, 
  Calendar, 
  MapPin, 
  User, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  Plus, 
  Upload, 
  Search, 
  Download, 
  CheckCircle, 
  Check,
  HelpCircle, 
  FileCheck2, 
  ShieldCheck, 
  Building, 
  GraduationCap, 
  Activity, 
  ChevronRight, 
  Send, 
  Printer, 
  X,
  Phone,
  DollarSign,
  Globe,
  Briefcase,
  Users,
  QrCode,
  Sparkles,
  ExternalLink,
  Smile,
  Shuffle,
  Paperclip,
  Trash2,
  Accessibility,
  CreditCard,
  Lock,
  KeyRound,
  Eye,
  EyeOff,
  RefreshCw
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AssistanceProgram, AssistanceApplication, UploadedDocument, EditableResidentProfileFields } from '../../types';
import { BUGO_PUROKS, MONTHLY_INCOME_OPTIONS, NATIONALITY_OPTIONS, CARTOON_AVATAR_PRESETS, MALE_CARTOON_AVATARS, FEMALE_CARTOON_AVATARS, detectUserGender } from '../../data/mockData';
import { CERTIFICATE_SERVICES } from '../../data/servicesCatalog';
import { evaluateCertificateQualification, evaluateResidentForProgram, getQualifiedProgramsForResident, canResidentViewAnnouncement } from '../../utils/eligibilityEngine';
import { ChangePasswordSection } from '../settings/ChangePasswordSection';

// ----------------------------------------------------
// 1. ENHANCED RESIDENT DASHBOARD VIEW
// ----------------------------------------------------
export const ResidentDashboardView: React.FC<{
  onApplyProgram: (prog: AssistanceProgram) => void;
  onNavigateTab: (tab: 'dashboard' | 'services' | 'hazard-map' | 'announcements' | 'profile' | 'help' | 'settings') => void;
}> = ({ onApplyProgram, onNavigateTab }) => {
  const { 
    currentUser, 
    applications, 
    announcements, 
    programs,
    resubmitApplicationRequirements,
    deleteApplication
  } = useApp();

  const autoQualified = getQualifiedProgramsForResident(currentUser, programs);
  const visibleAnnouncements = announcements.filter(ann => canResidentViewAnnouncement(currentUser, ann));

  const [resubmittingApp, setResubmittingApp] = useState<AssistanceApplication | null>(null);
  const [confirmDeleteApp, setConfirmDeleteApp] = useState<AssistanceApplication | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedDocPreset, setSelectedDocPreset] = useState('2026 Certificate of Matriculation');
  const [resubmitNote, setResubmitNote] = useState('');
  const [showAllQualified, setShowAllQualified] = useState(false);
  const [viewingQualifiedProgram, setViewingQualifiedProgram] = useState<AssistanceProgram | null>(null);

  // Filter applications belonging to the current resident with robust null/undefined safety
  const residentApps = (applications || []).filter(app => {
    if (!app) return false;
    if (!currentUser) return true;
    
    // Check ID match first if available
    if (app.applicantId && currentUser.id && app.applicantId === currentUser.id) {
      return true;
    }

    const currentUserName = (currentUser.name || '').trim().toLowerCase();
    const currentFirstName = currentUserName.split(/\s+/)[0] || '';
    const applicantName = (app.applicantName || '').trim().toLowerCase();
    
    const nameMatches = Boolean(
      (applicantName && currentFirstName && applicantName.includes(currentFirstName)) ||
      (applicantName && currentUserName && applicantName.includes(currentUserName))
    );

    const emailMatches = Boolean(
      currentUser.email && 
      app.email && 
      app.email.trim().toLowerCase() === currentUser.email.trim().toLowerCase()
    );

    return nameMatches || emailMatches;
  });

  const activeApps = residentApps.filter(
    a => a && (a.status === 'Submitted' || a.status === 'Under Review' || a.status === 'Documents Verified')
  );
  const approvedApps = residentApps.filter(
    a => a && (a.status === 'Approved' || a.status === 'Ready for Release')
  );

  return (
    <div className="space-y-6">
      {/* 1. Citizen Identity & Welcome Hero Banner */}
      <div className="bg-gradient-to-br from-[#0c532b] via-[#0e5c31] to-[#07361c] rounded-3xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
        {/* Subtle decorative circles */}
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute right-24 bottom-0 translate-y-12 w-48 h-48 rounded-full bg-emerald-400/10 pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-emerald-100 text-xs font-bold border border-white/20">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
                <span>Verified Resident</span>
              </span>
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-black/25 text-white/90 text-xs font-mono">
                <span>ID:</span>
                <strong className="text-emerald-200">{currentUser?.residentIdNumber || 'BG-RES-04829'}</strong>
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Mabuhay, {currentUser?.name || 'Resident'}!
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100 max-w-xl leading-relaxed">
              Official Barangay Bugo Resident Portal. Access clearances, track your assistance requests, and view official status updates.
            </p>

            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs font-medium">
              <span className="flex items-center gap-1 text-emerald-200">
                <MapPin className="w-3.5 h-3.5 text-emerald-300" />
                <span>{currentUser?.purok || 'Barangay Bugo, CDO'}</span>
              </span>
              <span className="text-white/40">•</span>
              <span className="px-2 py-0.5 rounded-full bg-white/10 text-emerald-100 text-[11px] border border-white/15">
                {currentUser?.civilStatus || 'Single'}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-white/10 text-emerald-100 text-[11px] border border-white/15">
                {currentUser?.occupation || 'Resident'}
              </span>
              {currentUser?.isPwd && (
                <span className="px-2 py-0.5 rounded-full bg-purple-500/30 text-purple-200 text-[11px] font-bold border border-purple-400/40 flex items-center gap-1">
                  <Accessibility className="w-3 h-3" /> PWD ({currentUser.pwdDisabilityType || 'Registered'})
                </span>
              )}
              {currentUser?.isSoloParent && (
                <span className="px-2 py-0.5 rounded-full bg-pink-500/30 text-pink-200 text-[11px] font-bold border border-pink-400/40 flex items-center gap-1">
                  <HeartHandshake className="w-3 h-3" /> Solo Parent (RA 11861)
                </span>
              )}
              {currentUser?.isSenior && (
                <span className="px-2 py-0.5 rounded-full bg-amber-500/30 text-amber-200 text-[11px] font-bold border border-amber-400/40 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Senior Citizen (60+)
                </span>
              )}
              {currentUser?.isStudent && (
                <span className="px-2 py-0.5 rounded-full bg-blue-500/30 text-blue-200 text-[11px] font-bold border border-blue-400/40 flex items-center gap-1">
                  <GraduationCap className="w-3 h-3" /> Student ({currentUser.studentLevel || 'Enrolled'})
                </span>
              )}
              {currentUser?.isTeenager && !currentUser?.isSenior && (
                <span className="px-2 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 text-[11px] font-bold border border-indigo-400/40">
                  Youth / Teen
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Key Resident Summary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Card 1: Active Requests */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">In Review</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-gray-900">{activeApps.length}</span>
            <p className="text-[11px] text-gray-400 mt-0.5">Pending evaluation</p>
          </div>
        </div>

        {/* Card 2: Ready for Release */}
        <div 
          onClick={() => onNavigateTab('services')}
          className={`rounded-2xl p-4 sm:p-5 border shadow-xs flex flex-col justify-between transition cursor-pointer hover:border-[#0c532b] ${
            approvedApps.length > 0 
              ? 'bg-emerald-50/70 border-emerald-200' 
              : 'bg-white border-gray-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-[11px] font-bold uppercase tracking-wider ${approvedApps.length > 0 ? 'text-[#0c532b]' : 'text-gray-500'}`}>
              Ready for Release
            </span>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${approvedApps.length > 0 ? 'bg-emerald-100 text-[#0c532b]' : 'bg-gray-100 text-gray-600'}`}>
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className={`text-2xl sm:text-3xl font-extrabold ${approvedApps.length > 0 ? 'text-emerald-900' : 'text-gray-900'}`}>
              {approvedApps.length}
            </span>
            <p className={`text-[11px] mt-0.5 font-medium ${approvedApps.length > 0 ? 'text-[#0c532b]' : 'text-gray-400'}`}>
              {approvedApps.length > 0 ? 'Claim at Barangay Hall Window' : 'No pending releases'}
            </p>
          </div>
        </div>

        {/* Card 3: Official Advisories */}
        <div 
          onClick={() => onNavigateTab('announcements')}
          className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-200 shadow-xs flex flex-col justify-between cursor-pointer hover:border-[#0c532b] transition"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Official Advisories</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#0c532b] flex items-center justify-center">
              <Building className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-gray-900">{visibleAnnouncements.length}</span>
            <p className="text-[11px] text-gray-400 mt-0.5">Active bulletins for you</p>
          </div>
        </div>
      </div>

      {/* 2.5. Auto-Qualified Assistance Programs (No Application Form Needed) */}
      {(() => {
        const sortedPrograms = [...autoQualified].sort((a, b) => {
          const aHasSched = announcements.some(ann => ann.targetProgramId === a.id && ann.targetAudienceType === 'Qualified Beneficiaries Only' && (ann.releaseDate || ann.meetingTime));
          const bHasSched = announcements.some(ann => ann.targetProgramId === b.id && ann.targetAudienceType === 'Qualified Beneficiaries Only' && (ann.releaseDate || ann.meetingTime));
          return Number(bHasSched) - Number(aHasSched);
        });
        const visiblePrograms = showAllQualified ? sortedPrograms : sortedPrograms.slice(0, 6);

        return (
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-200 shadow-xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-gray-100">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-gray-900">Qualified Programs</h2>
                  <span className="text-xs font-semibold text-emerald-700 tabular-nums">
                    {autoQualified.length} matched
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">
                  Based on your Create Account profile · No application form needed.
                </p>
              </div>

              {autoQualified.length > 6 && (
                <button
                  type="button"
                  onClick={() => setShowAllQualified(prev => !prev)}
                  className="text-xs font-semibold text-[#0c532b] hover:underline whitespace-nowrap shrink-0 cursor-pointer"
                >
                  {showAllQualified ? 'Show fewer' : `View all ${autoQualified.length}`}
                </button>
              )}
            </div>

            {autoQualified.length === 0 ? (
              <div className="py-8 px-4 text-center rounded-xl border border-dashed border-gray-200 bg-gray-50/60">
                <p className="text-sm font-semibold text-gray-700">No targeted programs matched</p>
                <p className="text-xs text-gray-500 mt-1">
                  No assistance programs currently match your account profile details.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {visiblePrograms.map(prog => {
                  const targetedAnn = announcements.find(
                    a => a.targetProgramId === prog.id && a.targetAudienceType === 'Qualified Beneficiaries Only'
                  );
                  const hasSchedule = Boolean(targetedAnn && (targetedAnn.releaseDate || targetedAnn.meetingTime));

                  return (
                    <button
                      key={prog.id}
                      type="button"
                      onClick={() => setViewingQualifiedProgram(prog)}
                      className={`w-full text-left p-3.5 rounded-xl border transition flex items-center justify-between gap-3 cursor-pointer group ${
                        hasSchedule
                          ? 'bg-emerald-50/60 border-emerald-200 hover:border-emerald-400'
                          : 'bg-gray-50/70 border-gray-200 hover:border-[#0c532b] hover:bg-white'
                      }`}
                    >
                      <div className="min-w-0 flex-1 space-y-0.5">
                        <div className="text-sm font-semibold text-gray-900 group-hover:text-[#0c532b] truncate">
                          {prog.title}
                        </div>
                        <div className="text-xs text-gray-500 flex items-center gap-1.5 truncate">
                          <span className="truncate">{prog.category}</span>
                          <span aria-hidden="true">·</span>
                          {hasSchedule ? (
                            <span className="font-medium text-emerald-800 truncate">
                              {targetedAnn?.releaseDate || 'Scheduled'}{targetedAnn?.meetingTime ? ` · ${targetedAnn.meetingTime}` : ''}
                            </span>
                          ) : (
                            <span className="text-gray-400 shrink-0">Schedule TBD</span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className={`text-xs font-semibold whitespace-nowrap ${
                          hasSchedule ? 'text-emerald-700' : 'text-[#0c532b]'
                        }`}>
                          {hasSchedule ? 'Scheduled' : 'Qualified'}
                        </span>
                        <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-[#0c532b] transition-colors" />
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        );
      })()}

      {/* 3. Certificate Requests (Compact & Readable) */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between gap-2 pb-3 border-b border-gray-100">
          <div>
            <h2 className="text-base font-bold text-gray-900">Certificate Requests</h2>
            <p className="text-xs text-gray-500 mt-0.5">Status of your requested barangay certificates.</p>
          </div>
          <button
            type="button"
            onClick={() => onNavigateTab('services')}
            className="text-xs font-semibold text-[#0c532b] hover:underline flex items-center gap-1 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <span>Request Certificate</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {residentApps.length === 0 ? (
          <div className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-gray-500">
            <span>You have no certificate requests yet.</span>
            <button
              type="button"
              onClick={() => onNavigateTab('services')}
              className="text-xs font-semibold text-[#0c532b] hover:underline w-fit cursor-pointer"
            >
              Browse certificates &rarr;
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {residentApps.map((app) => {
              const statusColor =
                app.status === 'Approved' || app.status === 'Ready for Release'
                  ? 'text-emerald-700'
                  : app.status === 'Disbursed'
                  ? 'text-blue-700'
                  : app.status === 'Needs Additional Requirements'
                  ? 'text-amber-700'
                  : app.status === 'Re-submitted'
                  ? 'text-sky-700'
                  : app.status === 'Disqualified' || app.status === 'Rejected'
                  ? 'text-rose-700'
                  : 'text-gray-600';

              return (
                <div key={app.id} className="py-3 first:pt-1 last:pb-1 space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-gray-900 truncate">{app.programTitle}</div>
                      <div className="text-xs text-gray-500 mt-0.5 flex flex-wrap items-center gap-1.5">
                        <span className="font-mono text-gray-700">{app.referenceCode}</span>
                        <span aria-hidden="true">·</span>
                        <span>{app.submissionDate}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-xs font-semibold whitespace-nowrap ${statusColor}`}>
                        {app.status}
                      </span>
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteApp(app)}
                        title="Delete Request"
                        className="p-1 text-gray-400 hover:text-rose-600 rounded-lg transition cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {app.status === 'Needs Additional Requirements' && (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-amber-50/70 rounded-xl p-2.5 text-xs text-amber-900">
                      <span className="truncate">
                        {app.evaluatorNotes || 'Additional documents requested by evaluator.'}
                      </span>
                      <button
                        type="button"
                        onClick={() => setResubmittingApp(app)}
                        className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg transition shrink-0 w-fit cursor-pointer"
                      >
                        Upload Documents
                      </button>
                    </div>
                  )}

                  {app.status === 'Disqualified' && app.rejectionReason && (
                    <p className="text-xs text-rose-700">{app.rejectionReason}</p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. Latest Advisories (Simple & Readable Bulletin Feed) */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between gap-2 pb-3 border-b border-gray-100">
          <div>
            <h2 className="text-base font-bold text-gray-900">Latest Advisories</h2>
            <p className="text-xs text-gray-500 mt-0.5">Release schedules and community updates from Barangay Bugo.</p>
          </div>
          <button
            type="button"
            onClick={() => onNavigateTab('announcements')}
            className="text-xs font-semibold text-[#0c532b] hover:underline flex items-center gap-1 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <span>View all</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {visibleAnnouncements.length === 0 ? (
          <p className="py-3 text-xs text-gray-500">No active advisories at this time.</p>
        ) : (
          <div className="divide-y divide-gray-100">
            {visibleAnnouncements.slice(0, 3).map((ann) => (
              <button
                key={ann.id}
                type="button"
                onClick={() => onNavigateTab('announcements')}
                className="w-full text-left py-3 first:pt-1 last:pb-1 flex items-center justify-between gap-3 hover:bg-gray-50/70 rounded-lg px-1 -mx-1 transition cursor-pointer group"
              >
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-gray-900 group-hover:text-[#0c532b] truncate">
                    {ann.title}
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5 truncate">
                    {ann.category} · {ann.releaseDate ? `Release: ${ann.releaseDate}` : ann.date}
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-[#0c532b] shrink-0" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* MODAL: Resident Resubmit Requirements Modal */}
      {resubmittingApp && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 border border-gray-200 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <h3 className="text-base font-bold text-gray-900">Upload Requested Requirements</h3>
                <span className="text-[10px] text-gray-400 font-mono">Reference: {resubmittingApp.referenceCode}</span>
              </div>
              <button 
                onClick={() => setResubmittingApp(null)}
                className="text-gray-400 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 text-xs text-amber-900 space-y-1">
              <span className="font-bold block">Evaluator's Specific Request:</span>
              <p className="text-[11px] text-amber-800 leading-relaxed">
                {resubmittingApp.evaluatorNotes || 'Please upload the requested documents to continue evaluation.'}
              </p>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Select Document to Attach</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    '2026 Certificate of Matriculation',
                    'Barangay Indigency Certificate',
                    'Doctor Prescription & Hospital Bill',
                    'Electric / Water Utility Receipt'
                  ].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setSelectedDocPreset(preset)}
                      className={`p-2.5 rounded-xl border text-left text-[11px] font-semibold transition ${
                        selectedDocPreset === preset 
                          ? 'bg-emerald-50 border-[#0c532b] text-[#0c532b] font-bold' 
                          : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <Paperclip className="w-3.5 h-3.5 inline mr-1 text-gray-400" />
                      <span>{preset}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Applicant Note / Explanation</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Attached certified true copy of 2nd semester school enrolment form..."
                  value={resubmitNote}
                  onChange={(e) => setResubmitNote(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl p-2.5 font-medium outline-none focus:ring-2 focus:ring-[#0c532b]"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setResubmittingApp(null)}
                  className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    const newDoc: UploadedDocument = {
                      id: `doc-${Date.now()}`,
                      name: selectedDocPreset,
                      type: 'PDF / Verified Document',
                      size: '520 KB',
                      uploadDate: new Date().toISOString().split('T')[0],
                      verified: true
                    };
                    await resubmitApplicationRequirements(resubmittingApp.id, [newDoc], resubmitNote);
                    setResubmittingApp(null);
                    setResubmitNote('');
                  }}
                  className="flex-1 py-2.5 bg-[#0c532b] hover:bg-[#094222] text-white font-bold rounded-xl transition shadow-xs flex items-center justify-center gap-1.5"
                >
                  <Upload className="w-4 h-4" />
                  <span>Submit Updated Document</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal: Delete Application */}
      {confirmDeleteApp && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-gray-100 text-center space-y-4 animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">Delete Application?</h3>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                Are you sure you want to delete application <span className="font-mono font-bold text-gray-800">{confirmDeleteApp.referenceCode}</span> ({confirmDeleteApp.programTitle})? This record will be permanently removed.
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setConfirmDeleteApp(null)}
                className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={async () => {
                  setIsDeleting(true);
                  try {
                    await deleteApplication(confirmDeleteApp.referenceCode || confirmDeleteApp.id);
                  } finally {
                    setIsDeleting(false);
                    setConfirmDeleteApp(null);
                  }
                }}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl transition shadow-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isDeleting ? 'Deleting...' : 'Delete'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Simple Notice Modal for Qualified Program */}
      {viewingQualifiedProgram && (() => {
        const qual = evaluateResidentForProgram(currentUser, viewingQualifiedProgram.id, viewingQualifiedProgram.title);
        const primaryReason = qual.passedCriteria[1] || qual.passedCriteria[0] || 'Verified resident profile';
        const targetedAnn = announcements.find(
          a => a.targetProgramId === viewingQualifiedProgram.id && a.targetAudienceType === 'Qualified Beneficiaries Only'
        );
        const scheduleText = targetedAnn
          ? [targetedAnn.releaseDate, targetedAnn.meetingTime, targetedAnn.meetingVenue].filter(Boolean).join(' · ')
          : '';

        return (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-5 sm:p-6 border border-gray-200 shadow-2xl space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    <span>Qualified · No Form Needed</span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mt-1 leading-snug">
                    {viewingQualifiedProgram.title}
                  </h3>
                  {viewingQualifiedProgram.maxBenefitAmount && (
                    <p className="text-xs font-medium text-gray-500 mt-0.5">
                      {viewingQualifiedProgram.maxBenefitAmount}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setViewingQualifiedProgram(null)}
                  className="text-gray-400 hover:text-gray-700 p-1 rounded-lg cursor-pointer shrink-0"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="divide-y divide-gray-100 border-y border-gray-100 text-xs">
                <div className="py-2.5 flex justify-between gap-4">
                  <span className="text-gray-500 shrink-0">Match</span>
                  <span className="text-gray-900 font-medium text-right">{primaryReason}</span>
                </div>

                <div className="py-2.5 flex justify-between gap-4">
                  <span className="text-gray-500 shrink-0">Schedule</span>
                  <span className={`font-medium text-right ${scheduleText ? 'text-emerald-700' : 'text-gray-500'}`}>
                    {scheduleText || 'To be announced'}
                  </span>
                </div>

                {viewingQualifiedProgram.requirements.length > 0 && (
                  <div className="py-2.5 flex justify-between gap-4">
                    <span className="text-gray-500 shrink-0">Bring</span>
                    <span className="text-gray-900 text-right">
                      {viewingQualifiedProgram.requirements.slice(0, 2).join(', ')}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setViewingQualifiedProgram(null)}
                  className="px-4 py-2 bg-[#0c532b] hover:bg-[#094222] text-white text-xs font-bold rounded-xl transition cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};

// ----------------------------------------------------
// 2. ENHANCED RESIDENT SERVICES VIEW (OFFICIAL CERTIFICATE & CLEARANCE APPLICATIONS)
// ----------------------------------------------------
export const ResidentServicesView: React.FC<{
  onApplyProgram: (prog: AssistanceProgram) => void;
}> = ({ onApplyProgram }) => {
  const { currentUser } = useApp();
  const [searchTerm, setSearchTerm] = useState('');

  // Evaluate qualification for every certificate against the current resident's profile
  const certificateList = CERTIFICATE_SERVICES.map(cert => ({
    ...cert,
    qualification: evaluateCertificateQualification(currentUser, cert.id)
  }));

  const filteredCertificates = certificateList.filter(c => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return true;
    return (
      c.title.toLowerCase().includes(term) ||
      c.description.toLowerCase().includes(term) ||
      (c.tagline && c.tagline.toLowerCase().includes(term))
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Certificates &amp; Clearances
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Browse and apply for official Barangay Bugo documents.
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search certificate or clearance..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#0c532b]"
          />
        </div>
      </div>

      {/* Certificate Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCertificates.length === 0 ? (
          <div className="col-span-full py-12 text-center text-sm text-gray-500 bg-white rounded-2xl border border-gray-200">
            No certificate services matching &ldquo;{searchTerm}&rdquo;.
          </div>
        ) : (
          filteredCertificates.map((cert) => {
            const { isQualified, failureReasons } = cert.qualification;

            return (
              <div
                key={cert.id}
                className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden flex flex-col justify-between transition group hover:shadow-md"
              >
                <div>
                  <div className="h-40 w-full bg-gray-100 overflow-hidden">
                    <img
                      src={cert.imageUrl}
                      alt={cert.title}
                      loading="lazy"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/assets/services/real_barangay_hall_1788172230992.jpg';
                      }}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>

                  <div className="p-5 space-y-2.5">
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                      <Clock className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      <span>{cert.processingTime}</span>
                    </div>

                    <h2 className="text-base font-bold text-gray-900 leading-snug group-hover:text-[#0c532b] transition">
                      {cert.title}
                    </h2>

                    <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                      {cert.tagline || cert.description}
                    </p>

                    <div className="pt-1">
                      {isQualified ? (
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
                          <CheckCircle2 className="w-4 h-4 shrink-0" />
                          <span>Eligible to apply</span>
                        </div>
                      ) : (
                        <div className="flex items-start gap-1.5 text-xs text-rose-700">
                          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                          <span className="line-clamp-2">
                            <span className="font-semibold">Criteria unmet:</span>{' '}
                            {failureReasons[0] || 'Check profile requirements'}
                          </span>
                        </div>
                      )}
                    </div>

                    <p className="text-xs text-gray-500 line-clamp-1 pt-1 border-t border-gray-100">
                      <span className="font-medium text-gray-700">Needs:</span>{' '}
                      {cert.requirements.slice(0, 2).join(', ')}
                    </p>
                  </div>
                </div>

                <div className="p-5 pt-0">
                  <button
                    type="button"
                    onClick={() => onApplyProgram(cert)}
                    className={`w-full py-2.5 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer ${
                      isQualified
                        ? 'bg-[#0c532b] hover:bg-[#094222] text-white shadow-xs'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                    }`}
                  >
                    <span>{isQualified ? 'Apply' : 'View Requirements'}</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

// ----------------------------------------------------
// 4. RESIDENT SETTINGS VIEW (Includes Change Profile & Detail Editing)
// ----------------------------------------------------
export const ResidentSettingsView: React.FC = () => {
  const { currentUser, updateUserProfile, submitProfileChangeRequest, verifyCurrentPassword } = useApp();
  const [photoUrl, setPhotoUrl] = useState(currentUser?.avatarUrl || '');

  const buildInitialFormData = (user: typeof currentUser) => ({
    name: user?.name || '',
    email: user?.email || '',
    contactNumber: user?.contactNumber || '',
    nationality: user?.nationality || 'Filipino',
    purok: user?.purok || BUGO_PUROKS[0],
    address: user?.address || '',
    householdIncome: user?.householdIncome || MONTHLY_INCOME_OPTIONS[2],
    familyMembersCount: user?.familyMembersCount || 4,
    occupation: user?.occupation || 'Resident',
    employmentStatus: user?.employmentStatus || 'Self-Employed',
    age: user?.age || 30,
    gender: user?.gender || (detectUserGender(user) === 'male' ? 'Male' : 'Female'),
    voterStatus: user?.voterStatus || 'Registered'
  });

  // Profile Editable Details
  const [formData, setFormData] = useState(() => buildInitialFormData(currentUser));

  const userDetectedGender = detectUserGender(currentUser, formData.name);
  const [avatarGenderFilter, setAvatarGenderFilter] = useState<'male' | 'female'>(userDetectedGender);

  React.useEffect(() => {
    setAvatarGenderFilter(detectUserGender(currentUser, formData.name));
  }, [currentUser, formData.name]);

  React.useEffect(() => {
    if (!currentUser) return;
    setFormData(buildInitialFormData(currentUser));
  }, [currentUser]);

  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [errorMsg, setErrorMsg] = useState('');
  const [savedSuccess, setSavedSuccess] = useState<string | false>(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Lock & Password Verification before editing / submitting for approval
  const [isProfileUnlocked, setIsProfileUnlocked] = useState(false);
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [unlockPassword, setUnlockPassword] = useState('');
  const [showUnlockPass, setShowUnlockPass] = useState(false);
  const [unlockError, setUnlockError] = useState('');
  const [isVerifyingPassword, setIsVerifyingPassword] = useState(false);

  // Field validation rules
  const errors: Record<string, string> = {};
  if (!formData.name.trim()) errors.name = 'Full legal name is required';
  if (!formData.email.trim()) {
    errors.email = 'Email address is required';
  } else if (!formData.email.includes('@') || !formData.email.includes('.')) {
    errors.email = 'Enter a valid email address';
  }
  
  if (!formData.contactNumber.trim()) {
    errors.contactNumber = 'Contact number is required';
  } else if (formData.contactNumber.length < 10) {
    errors.contactNumber = 'Enter at least 10-12 digits';
  } else if (formData.contactNumber.length > 12) {
    errors.contactNumber = 'Contact number must not exceed 12 digits';
  }

  if (!formData.nationality) errors.nationality = 'Nationality is required';
  if (!formData.purok) errors.purok = 'Purok / Zone selection is required';
  if (!formData.address.trim()) errors.address = 'Street address is required';
  if (!formData.householdIncome) errors.householdIncome = 'Monthly income selection is required';

  const handleContactChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Strictly numbers only, max 12 digits
    const numericOnly = e.target.value.replace(/\D/g, '').slice(0, 12);
    setFormData(prev => ({ ...prev, contactNumber: numericOnly }));
  };

  const handleUpdatePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setPhotoUrl(reader.result);
          updateUserProfile({ avatarUrl: reader.result });
          setSavedSuccess('Profile photo updated.');
          setTimeout(() => setSavedSuccess(false), 3000);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSelectPreset = (url: string) => {
    setPhotoUrl(url);
    updateUserProfile({ avatarUrl: url });
    setSavedSuccess('Profile photo updated.');
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleUnlockWithPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setUnlockError('');
    if (!unlockPassword.trim()) {
      setUnlockError('Please enter your account password.');
      return;
    }
    setIsVerifyingPassword(true);
    try {
      const res = await verifyCurrentPassword(unlockPassword);
      if (res.success) {
        setIsProfileUnlocked(true);
        setShowUnlockModal(false);
        setUnlockPassword('');
        setUnlockError('');
      } else {
        setUnlockError(res.message || 'Incorrect password.');
      }
    } finally {
      setIsVerifyingPassword(false);
    }
  };

  const handleSaveProfileDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!isProfileUnlocked) {
      setUnlockPassword('');
      setUnlockError('');
      setShowUnlockModal(true);
      return;
    }

    const allTouched: Record<string, boolean> = {
      name: true,
      email: true,
      contactNumber: true,
      nationality: true,
      purok: true,
      address: true,
      householdIncome: true
    };
    setTouched(allTouched);

    if (Object.keys(errors).length > 0) {
      setErrorMsg('Please complete all highlighted fields marked in red.');
      return;
    }

    const baseline = buildInitialFormData(currentUser);
    const changedFields: Partial<EditableResidentProfileFields> = {};
    if (formData.name !== baseline.name) changedFields.name = formData.name;
    if (formData.email !== baseline.email) changedFields.email = formData.email;
    if (formData.contactNumber !== baseline.contactNumber) changedFields.contactNumber = formData.contactNumber;
    if (formData.nationality !== baseline.nationality) changedFields.nationality = formData.nationality;
    if (formData.purok !== baseline.purok) changedFields.purok = formData.purok;
    if (formData.address !== baseline.address) changedFields.address = formData.address;
    if (formData.householdIncome !== baseline.householdIncome) changedFields.householdIncome = formData.householdIncome;
    if (Number(formData.familyMembersCount) !== Number(baseline.familyMembersCount)) {
      changedFields.familyMembersCount = Number(formData.familyMembersCount);
    }
    if (formData.occupation !== baseline.occupation) changedFields.occupation = formData.occupation;
    if (formData.employmentStatus !== baseline.employmentStatus) {
      changedFields.employmentStatus = formData.employmentStatus as any;
    }
    if (Number(formData.age) !== Number(baseline.age)) changedFields.age = Number(formData.age);
    if (formData.gender !== baseline.gender) changedFields.gender = formData.gender as any;
    if (formData.voterStatus !== baseline.voterStatus) changedFields.voterStatus = formData.voterStatus as any;

    if (Object.keys(changedFields).length === 0) {
      setErrorMsg('No changes detected.');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await submitProfileChangeRequest(changedFields);

      if (!result.success) {
        setErrorMsg(result.message);
        return;
      }

      setIsProfileUnlocked(false);
      setSavedSuccess('Profile changes submitted. Only the Barangay Admin can approve these updates.');
      setTimeout(() => setSavedSuccess(false), 4500);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getFieldClass = (field: string) => {
    if (!isProfileUnlocked) {
      return 'w-full bg-gray-100 border border-gray-200 text-gray-500 rounded-xl px-3 py-2.5 font-medium outline-none cursor-not-allowed transition';
    }
    const isRed = touched[field] && Boolean(errors[field]);
    if (isRed) {
      return 'w-full bg-rose-50/50 border-2 border-rose-500 text-rose-950 rounded-xl px-3 py-2.5 font-medium outline-none ring-2 ring-rose-200 placeholder-rose-400 transition';
    }
    return 'w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-xl px-3 py-2.5 font-medium outline-none focus:ring-2 focus:ring-[#0c532b] transition';
  };

  const pendingRequest = currentUser?.pendingProfileUpdate;

  return (
    <div className="space-y-6 max-w-3xl mx-auto">

      {savedSuccess && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 p-4 rounded-2xl text-xs font-bold flex items-center gap-2.5 shadow-xs animate-in fade-in">
          <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span>{savedSuccess}</span>
        </div>
      )}

      {errorMsg && (
        <div className="bg-rose-50 border border-rose-300 p-3.5 rounded-2xl text-xs text-rose-800 font-semibold flex items-start gap-2.5 shadow-xs animate-in fade-in">
          <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-xs">

        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-emerald-100 shadow-md bg-gray-100 flex items-center justify-center">
              {currentUser?.avatarUrl ? (
                <img src={currentUser.avatarUrl} alt={currentUser.name} className="w-full h-full object-cover" />
              ) : (
                <User className="w-12 h-12 text-gray-400" />
              )}
            </div>
          </div>

          <div className="space-y-3 flex-1 text-center sm:text-left">
            <div>
              <h3 className="text-sm font-bold text-gray-900">{currentUser?.name}</h3>
              <p className="text-xs text-gray-500 font-mono">Resident ID: {currentUser?.residentIdNumber}</p>
            </div>

            <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
              <label className="cursor-pointer px-4 py-2 text-xs font-bold rounded-xl transition shadow-xs flex items-center gap-2 bg-[#0c532b] hover:bg-[#083c1f] text-white">
                <Upload className="w-3.5 h-3.5" />
                <span>Upload Custom Photo</span>
                <input type="file" accept="image/*" onChange={handleUpdatePhoto} className="hidden" />
              </label>

              {currentUser?.avatarUrl && (
                <button
                  type="button"
                  onClick={() => {
                    setPhotoUrl('');
                    updateUserProfile({ avatarUrl: '' });
                  }}
                  className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl transition cursor-pointer"
                >
                  Remove Picture
                </button>
              )}
            </div>

            <div className="pt-2 space-y-3">
              <div className="flex items-center justify-end pb-1">
                <div className="flex items-center bg-gray-100 p-0.5 rounded-xl border border-gray-200 text-[10px] font-bold">
                  <button
                    type="button"
                    onClick={() => setAvatarGenderFilter('male')}
                    className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                      avatarGenderFilter === 'male'
                        ? 'bg-[#0c532b] text-white shadow-xs'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Male
                  </button>
                  <button
                    type="button"
                    onClick={() => setAvatarGenderFilter('female')}
                    className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                      avatarGenderFilter === 'female'
                        ? 'bg-[#0c532b] text-white shadow-xs'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Female
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                {(avatarGenderFilter === 'male' ? MALE_CARTOON_AVATARS : FEMALE_CARTOON_AVATARS).map((preset) => {
                  const isSelected = currentUser?.avatarUrl === preset.url;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => handleSelectPreset(preset.url)}
                      className={`relative p-1.5 rounded-xl border-2 transition transform hover:scale-105 flex flex-col items-center gap-1 cursor-pointer ${
                        isSelected 
                          ? 'border-[#0c532b] bg-emerald-50 ring-2 ring-emerald-300' 
                          : 'border-gray-200 hover:border-emerald-500 bg-gray-50/50'
                      }`}
                      title={preset.name}
                    >
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-white shadow-xs">
                        <img src={preset.url} alt={preset.name} className="w-full h-full object-cover" />
                      </div>
                      <span className="text-[9px] font-bold text-gray-700 truncate max-w-[55px] block text-center">
                        {preset.name.split(' ')[0]}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Resident Details Section */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-xs space-y-5">
        <div className="flex items-center justify-between gap-2 pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#0c532b]" />
            <h2 className="text-base font-bold text-gray-900">Resident Details</h2>
          </div>
          {!isProfileUnlocked ? (
            <button
              type="button"
              onClick={() => {
                setUnlockPassword('');
                setUnlockError('');
                setShowUnlockModal(true);
              }}
              className="px-3.5 py-1.5 bg-[#0c532b] hover:bg-[#083c1f] text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Unlock to Edit</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setIsProfileUnlocked(false)}
              className="px-3.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Lock</span>
            </button>
          )}
        </div>

        {pendingRequest?.status === 'Rejected' && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Previous edit request declined: </span>
              <span>{pendingRequest.rejectionReason || 'Submitted changes could not be verified.'}</span>
            </div>
          </div>
        )}

        <form onSubmit={handleSaveProfileDetails} noValidate className="space-y-5 text-xs">
          <div className="space-y-3">

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className={`block font-bold ${touched.name && errors.name ? 'text-rose-600' : 'text-gray-700'}`}>
                    Full Legal Name <span className="text-rose-500">*</span>
                  </label>
                  {touched.name && errors.name && (
                    <span className="text-[11px] font-bold text-rose-600">{errors.name}</span>
                  )}
                </div>
                <input
                  type="text"
                  disabled={!isProfileUnlocked}
                  value={formData.name}
                  onBlur={() => setTouched(prev => ({ ...prev, name: true }))}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={getFieldClass('name')}
                  placeholder="Juan Carlos Dela Cruz"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className={`block font-bold ${touched.email && errors.email ? 'text-rose-600' : 'text-gray-700'}`}>
                    Email Address <span className="text-rose-500">*</span>
                  </label>
                  {touched.email && errors.email && (
                    <span className="text-[11px] font-bold text-rose-600">{errors.email}</span>
                  )}
                </div>
                <input
                  type="email"
                  disabled={!isProfileUnlocked}
                  value={formData.email}
                  onBlur={() => setTouched(prev => ({ ...prev, email: true }))}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={getFieldClass('email')}
                  placeholder="name@email.com"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className={`block font-bold ${touched.contactNumber && errors.contactNumber ? 'text-rose-600' : 'text-gray-700'}`}>
                    Mobile Contact (12 Digits Max) <span className="text-rose-500">*</span>
                  </label>
                  {touched.contactNumber && errors.contactNumber ? (
                    <span className="text-[11px] font-bold text-rose-600">{errors.contactNumber}</span>
                  ) : (
                    <span className="text-[10px] text-gray-400">{formData.contactNumber.length}/12 digits</span>
                  )}
                </div>
                <div className="relative">
                  <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    disabled={!isProfileUnlocked}
                    maxLength={12}
                    placeholder="09171234567 or 639171234567"
                    value={formData.contactNumber}
                    onBlur={() => setTouched(prev => ({ ...prev, contactNumber: true }))}
                    onChange={handleContactChange}
                    className={`${getFieldClass('contactNumber')} pl-9`}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className={`block font-bold ${touched.nationality && errors.nationality ? 'text-rose-600' : 'text-gray-700'}`}>
                    Nationality <span className="text-rose-500">*</span>
                  </label>
                  {touched.nationality && errors.nationality && (
                    <span className="text-[11px] font-bold text-rose-600">{errors.nationality}</span>
                  )}
                </div>
                <div className="relative">
                  <Globe className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <select
                    disabled={!isProfileUnlocked}
                    value={formData.nationality}
                    onBlur={() => setTouched(prev => ({ ...prev, nationality: true }))}
                    onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                    className={`${getFieldClass('nationality')} pl-9 font-semibold`}
                  >
                    {NATIONALITY_OPTIONS.map(nat => (
                      <option key={nat} value={nat}>{nat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className={`block font-bold ${touched.purok && errors.purok ? 'text-rose-600' : 'text-gray-700'}`}>
                    Purok / Zone <span className="text-rose-500">*</span>
                  </label>
                  {touched.purok && errors.purok && (
                    <span className="text-[11px] font-bold text-rose-600">{errors.purok}</span>
                  )}
                </div>
                <select
                  disabled={!isProfileUnlocked}
                  value={formData.purok}
                  onBlur={() => setTouched(prev => ({ ...prev, purok: true }))}
                  onChange={(e) => setFormData({ ...formData, purok: e.target.value })}
                  className={`${getFieldClass('purok')} font-semibold`}
                >
                  {BUGO_PUROKS.map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Voter Registration Status</label>
                <select
                  disabled={!isProfileUnlocked}
                  value={formData.voterStatus}
                  onChange={(e) => setFormData({ ...formData, voterStatus: e.target.value as any })}
                  className={`${getFieldClass('voterStatus')} font-semibold`}
                >
                  <option value="Registered">Registered Voter (COMELEC Bugo)</option>
                  <option value="Unregistered">Unregistered / Transfer Pending</option>
                </select>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className={`block font-bold ${touched.address && errors.address ? 'text-rose-600' : 'text-gray-700'}`}>
                  Street Address <span className="text-rose-500">*</span>
                </label>
                {touched.address && errors.address && (
                  <span className="text-[11px] font-bold text-rose-600">{errors.address}</span>
                )}
              </div>
              <input
                type="text"
                disabled={!isProfileUnlocked}
                value={formData.address}
                onBlur={() => setTouched(prev => ({ ...prev, address: true }))}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className={getFieldClass('address')}
                placeholder="House No., Street Name, Bugo, Cagayan de Oro City"
              />
            </div>
          </div>

          <div className="space-y-3 pt-4 border-t border-gray-100">

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className={`block font-bold ${touched.householdIncome && errors.householdIncome ? 'text-rose-600' : 'text-gray-700'}`}>
                    Monthly Household Income (Select Bracket) <span className="text-rose-500">*</span>
                  </label>
                  {touched.householdIncome && errors.householdIncome && (
                    <span className="text-[11px] font-bold text-rose-600">{errors.householdIncome}</span>
                  )}
                </div>
                <div className="relative">
                  <DollarSign className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <select
                    disabled={!isProfileUnlocked}
                    value={formData.householdIncome}
                    onBlur={() => setTouched(prev => ({ ...prev, householdIncome: true }))}
                    onChange={(e) => setFormData({ ...formData, householdIncome: e.target.value })}
                    className={`${getFieldClass('householdIncome')} pl-9 font-semibold`}
                  >
                    {MONTHLY_INCOME_OPTIONS.map((inc) => (
                      <option key={inc} value={inc}>{inc}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Family Dependents Count</label>
                <input
                  type="number"
                  disabled={!isProfileUnlocked}
                  min="1"
                  max="25"
                  value={formData.familyMembersCount}
                  onChange={(e) => setFormData({ ...formData, familyMembersCount: Number(e.target.value) })}
                  className={`${getFieldClass('familyMembersCount')} font-semibold`}
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Occupation / Employment</label>
                <div className="relative">
                  <Briefcase className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    disabled={!isProfileUnlocked}
                    value={formData.occupation}
                    onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                    className={`${getFieldClass('occupation')} pl-9`}
                    placeholder="e.g. Market Vendor, Teacher, Carpenter"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Age</label>
                  <input
                    type="number"
                    disabled={!isProfileUnlocked}
                    min="1"
                    max="120"
                    value={formData.age}
                    onChange={(e) => {
                      const newAge = Number(e.target.value) || 0;
                      setFormData(prev => ({
                        ...prev,
                        age: newAge
                      }));
                    }}
                    className={`${getFieldClass('age')} font-semibold`}
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Gender</label>
                  <select
                    disabled={!isProfileUnlocked}
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                    className={`${getFieldClass('gender')} font-semibold`}
                  >
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {isProfileUnlocked && (
            <div className="pt-3 border-t border-gray-100 flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 bg-[#0c532b] hover:bg-[#083c1f] disabled:opacity-50 text-white text-xs font-bold rounded-xl transition shadow-xs flex items-center gap-2 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isSubmitting ? 'Submitting...' : 'Submit for Admin Approval'}</span>
              </button>
            </div>
          )}
        </form>
      </div>

      {/* Password Verification Modal */}
      {showUnlockModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 border border-gray-200 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-[#0c532b]" />
                <h3 className="text-base font-bold text-gray-900">Verify Password</h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowUnlockModal(false);
                  setUnlockError('');
                }}
                className="text-gray-400 hover:text-gray-700 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-gray-500">
              Enter your password to edit and submit changes for admin approval.
            </p>

            <form onSubmit={handleUnlockWithPassword} className="space-y-3">
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type={showUnlockPass ? 'text' : 'password'}
                  autoFocus
                  value={unlockPassword}
                  onChange={(e) => {
                    setUnlockPassword(e.target.value);
                    setUnlockError('');
                  }}
                  placeholder="Account password"
                  className="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-xl pl-9 pr-10 py-2.5 text-xs font-medium outline-none focus:ring-2 focus:ring-[#0c532b]"
                />
                <button
                  type="button"
                  onClick={() => setShowUnlockPass(!showUnlockPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  {showUnlockPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {unlockError && (
                <p className="text-xs font-semibold text-rose-600">{unlockError}</p>
              )}

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setShowUnlockModal(false);
                    setUnlockError('');
                  }}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isVerifyingPassword || !unlockPassword}
                  className="px-4 py-2 bg-[#0c532b] hover:bg-[#083c1f] disabled:opacity-50 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                >
                  {isVerifyingPassword && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>Unlock</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Change Password & Security Credentials */}
      <ChangePasswordSection />
    </div>
  );
};


// ----------------------------------------------------
// 5. RESIDENT HELP & SUPPORT VIEW
// ----------------------------------------------------
export const ResidentHelpView: React.FC = () => {
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [ticketQuery, setTicketQuery] = useState('');

  const handleSendFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketQuery.trim()) return;
    setFeedbackSent(true);
    setTimeout(() => {
      setTicketQuery('');
      setFeedbackSent(false);
    }, 4000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
          Citizen Help Center & Assistance Guide
        </h1>
        <p className="text-gray-500 text-sm mt-0.5">
          Everything you need to know about registering, uploading ID verification, and claiming barangay assistance.
        </p>
      </div>

      {/* Official Helpdesk & Precinct Contact Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-xs space-y-2">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#0c532b] flex items-center justify-center">
            <Building className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-gray-900">Barangay Bugo Hall Desk</h3>
          <p className="text-xs text-gray-500">National Highway, Bugo, CDO</p>
          <p className="text-xs font-bold text-[#0c532b] bg-gray-50 p-2 rounded-xl border border-gray-200 text-center">Tel: (088) 855-2244</p>
          <p className="text-[11px] text-gray-400 text-center">Mon - Fri • 8:00 AM - 5:00 PM</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-xs space-y-2">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-gray-900">PNP Precinct 6 Bugo</h3>
          <p className="text-xs text-gray-500">Barangay Security & Patrol</p>
          <p className="text-xs font-bold text-blue-700 bg-gray-50 p-2 rounded-xl border border-gray-200 text-center">Mobile: 0917-882-9911</p>
          <p className="text-[11px] text-gray-400 text-center">24/7 Police Assistance</p>
        </div>
      </div>

      {/* Step-by-Step Instructions */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-xs space-y-6">
        <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-[#0c532b]" />
          <span>Step-by-Step Guide for Barangay Services</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="bg-gray-50 p-4 rounded-2xl space-y-2 border border-gray-100">
            <div className="w-7 h-7 rounded-lg bg-[#0c532b] text-white font-bold flex items-center justify-center text-xs">
              1
            </div>
            <h3 className="font-bold text-gray-900 text-sm">Upload Front & Back ID</h3>
            <p className="text-gray-600 leading-relaxed">
              When applying for assistance, attach clear photos of the Front and Back of your valid government ID (PhilSys, Driver's License, Voter's ID, or Barangay ID).
            </p>
          </div>

          <div className="bg-gray-50 p-4 rounded-2xl space-y-2 border border-gray-100">
            <div className="w-7 h-7 rounded-lg bg-[#0c532b] text-white font-bold flex items-center justify-center text-xs">
              2
            </div>
            <h3 className="font-bold text-gray-900 text-sm">Administrative Verification</h3>
            <p className="text-gray-600 leading-relaxed">
              Barangay Bugo evaluators review all submitted requirements and eligibility data. You will receive live notifications when approved.
            </p>
          </div>

          <div className="bg-gray-50 p-4 rounded-2xl space-y-2 border border-gray-100">
            <div className="w-7 h-7 rounded-lg bg-[#0c532b] text-white font-bold flex items-center justify-center text-xs">
              3
            </div>
            <h3 className="font-bold text-gray-900 text-sm">Release of Aid & Assistance</h3>
            <p className="text-gray-600 leading-relaxed">
              Present your Reference Code and valid Resident ID at the Barangay Hall Treasury Window to receive your approved grant or certificate.
            </p>
          </div>
        </div>
      </div>

      {/* Inquiry Form */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-xs space-y-4">
        <h2 className="text-base font-bold text-gray-900">Send an Inquiry or Support Message</h2>
        <p className="text-xs text-gray-500">
          Have a question about your application or need assistance? Send a message directly to the Barangay Officer on duty.
        </p>

        {feedbackSent ? (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-semibold flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>Thank you! Your inquiry has been forwarded to the Barangay Officer on duty.</span>
          </div>
        ) : (
          <form onSubmit={handleSendFeedback} className="space-y-3 text-xs">
            <textarea
              rows={3}
              required
              value={ticketQuery}
              onChange={(e) => setTicketQuery(e.target.value)}
              placeholder="Describe your inquiry or question here..."
              className="w-full bg-gray-50 border border-gray-300 rounded-2xl p-3 font-medium outline-none focus:ring-2 focus:ring-[#0c532b]"
            />
            <button
              type="submit"
              className="px-6 py-2.5 bg-[#0c532b] hover:bg-[#083c1f] text-white font-bold rounded-xl transition shadow-xs flex items-center gap-2"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Submit Inquiry</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

// ----------------------------------------------------
// 6. RESIDENT PROFILE & DIGITAL RESIDENT ID CARD (Used in Drawer / Upper Right)
// ----------------------------------------------------
export const ResidentProfileView: React.FC = () => {
  const { currentUser, updateUserProfile } = useApp();
  const [photoUrl, setPhotoUrl] = useState(currentUser?.avatarUrl || '');

  const handleUpdatePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setPhotoUrl(reader.result);
          updateUserProfile({ avatarUrl: reader.result });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
          Official Digital Resident ID & Information
        </h1>
        <p className="text-gray-500 text-sm mt-0.5">
          Your centralized digital citizen identity and records in Barangay Bugo, CDO.
        </p>
      </div>

      {/* ID Card Front */}
      <div className="bg-linear-to-br from-[#0c532b] via-[#0f6837] to-[#083a1e] rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border-2 border-emerald-400/30">
        <div className="flex items-center justify-between pb-4 border-b border-emerald-400/30">
          <div>
            <p className="text-[10px] tracking-widest uppercase font-bold text-emerald-200">Republic of the Philippines</p>
            <h2 className="text-base font-extrabold tracking-tight">BARANGAY BUGO</h2>
            <p className="text-[10px] text-emerald-200">Cagayan de Oro City • Northern Mindanao</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-white text-[#0c532b] font-extrabold flex items-center justify-center text-lg shadow-sm">
            BG
          </div>
        </div>

        <div className="py-6 flex flex-col sm:flex-row items-center gap-6">
          <div className="w-24 h-24 rounded-2xl bg-white/20 border-2 border-white/40 overflow-hidden flex items-center justify-center text-3xl font-extrabold text-white flex-shrink-0 shadow-md">
            {currentUser?.avatarUrl ? (
              <img src={currentUser.avatarUrl} alt={currentUser.name} className="w-full h-full object-cover" />
            ) : (
              currentUser?.name.slice(0, 2).toUpperCase()
            )}
          </div>

          <div className="space-y-1.5 text-center sm:text-left flex-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300">Official Resident ID</span>
            <h3 className="text-xl font-extrabold tracking-tight">{currentUser?.name}</h3>
            <p className="text-xs text-emerald-100 font-medium">{currentUser?.purok}</p>
            <p className="text-[11px] text-emerald-200/80">{currentUser?.address}</p>
            <div className="pt-2 flex flex-wrap gap-2 justify-center sm:justify-start">
              <span className="px-2.5 py-0.5 bg-white/20 text-white rounded-md text-[10px] font-mono font-bold">
                {currentUser?.residentIdNumber}
              </span>
              <span className="px-2.5 py-0.5 bg-emerald-400 text-emerald-950 rounded-md text-[10px] font-bold">
                Voter: {currentUser?.voterStatus || 'Registered'}
              </span>
              <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold ${
                currentUser?.isVerified ? 'bg-emerald-300 text-emerald-950' : 'bg-amber-300 text-amber-950'
              }`}>
                {currentUser?.isVerified ? 'Verified Citizen' : 'Pending Verification'}
              </span>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-emerald-400/30 flex justify-between items-center text-[10px] text-emerald-200">
          <span>Registered: {currentUser?.registeredDate}</span>
          <span className="font-bold text-white uppercase">Valid & Certified</span>
        </div>
      </div>

      {/* Household & Economic Summary */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-xs space-y-4 text-xs">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-gray-900">Resident Registry Particulars</h3>
          <label className="cursor-pointer text-[#0c532b] hover:underline font-bold text-xs">
            <span>Change Photo</span>
            <input type="file" accept="image/*" onChange={handleUpdatePhoto} className="hidden" />
          </label>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="text-gray-400 block">Monthly Household Income:</span>
            <span className="font-bold text-gray-900 text-sm">{currentUser?.householdIncome || '₱8,500.00'}</span>
          </div>
          <div>
            <span className="text-gray-400 block">Dependents Count:</span>
            <span className="font-bold text-gray-900 text-sm">{currentUser?.familyMembersCount || 4} Members</span>
          </div>
          <div>
            <span className="text-gray-400 block">Email Address:</span>
            <span className="font-medium text-gray-800">{currentUser?.email}</span>
          </div>
          <div>
            <span className="text-gray-400 block">Contact Phone:</span>
            <span className="font-medium text-gray-800">{currentUser?.contactNumber}</span>
          </div>
          <div>
            <span className="text-gray-400 block">Occupation:</span>
            <span className="font-medium text-gray-800">{currentUser?.occupation || 'Resident'}</span>
          </div>
          <div>
            <span className="text-gray-400 block">Civil Status:</span>
            <span className="font-medium text-gray-800">{currentUser?.civilStatus || 'Single'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
