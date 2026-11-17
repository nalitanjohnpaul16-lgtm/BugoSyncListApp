import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  FileText, 
  Eye, 
  Check, 
  X, 
  AlertCircle, 
  UserCheck, 
  ChevronRight, 
  Plus, 
  Calendar, 
  MapPin, 
  Phone, 
  Mail, 
  ShieldCheck, 
  Settings, 
  Save, 
  RefreshCw,
  Paperclip,
  Ban,
  ShieldAlert,
  ZoomIn,
  CreditCard,
  Building,
  CheckCircle,
  ExternalLink,
  QrCode,
  Lock,
  AlertTriangle,
  Copy,
  KeyRound,
  Archive,
  Briefcase,
  Trash2,
  ArrowLeft,
  Flame
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ApplicationStatus, AssistanceApplication, AssistanceProgram, DisasterCategory, ProgramCategory, ResidentUser, AnnouncementItem } from '../../types';
import { BUGO_PUROKS } from '../../data/mockData';
import { AnnouncementModal } from '../AnnouncementModal';
import { ChangePasswordSection } from '../settings/ChangePasswordSection';
import {
  doesVictimQualifyForDisasterProgram,
  evaluateResidentForProgram,
  isBarangayServiceApplicationItem,
  isCertificateProgram,
  isDisasterProgram,
  isWalkInOrOnDemandService
} from '../../utils/eligibilityEngine';
import { AdminDisasterVictimsView } from './AdminDisasterVictimsView';


// ----------------------------------------------------
// 1. ADMIN RESIDENTS VIEW & REGISTRATION APPROVAL
// ----------------------------------------------------
export const AdminResidentsView: React.FC = () => {
  const { 
    residentsList, 
    approveResidentRegistration, 
    rejectResidentRegistration,
    verifyResidentAccount,
    banResidentAccount,
    unbanResidentAccount,
    reviewProfileChangeRequest,
    selectedZoneForRegistry,
    setSelectedZoneForRegistry
  } = useApp();

  const [filterPurok, setFilterPurok] = useState(selectedZoneForRegistry ? selectedZoneForRegistry.split(' - ')[0] : 'All');

  useEffect(() => {
    if (selectedZoneForRegistry) {
      setFilterPurok(selectedZoneForRegistry.split(' - ')[0]);
      setSelectedZoneForRegistry(null);
    }
  }, [selectedZoneForRegistry, setSelectedZoneForRegistry]);
  const [filterStatus, setFilterStatus] = useState<'All' | 'Pending' | 'Verified' | 'Banned'>('All');
  const [filterDemographic, setFilterDemographic] = useState<'All' | 'PWD' | 'Senior' | 'SoloParent' | 'Student' | 'Teenager' | 'Married'>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedResident, setSelectedResident] = useState<ResidentUser | null>(null);
  const [profileRejectReason, setProfileRejectReason] = useState('');
  const [isReviewingProfileEdit, setIsReviewingProfileEdit] = useState(false);
  const [showBanModal, setShowBanModal] = useState(false);
  const [residentToBan, setResidentToBan] = useState<ResidentUser | null>(null);
  const [banReasonInput, setBanReasonInput] = useState('Violation of barangay policy / unverified residency');

  const filteredResidents = residentsList.filter(res => {
    const q = searchTerm.toLowerCase();
    const matchesSearch = (res.name || '').toLowerCase().includes(q) || 
                          (res.email || '').toLowerCase().includes(q) ||
                          (res.residentIdNumber || '').toLowerCase().includes(q) ||
                          Boolean(res.occupation && res.occupation.toLowerCase().includes(q)) ||
                          Boolean(res.idNumber && res.idNumber.toLowerCase().includes(q));
    const matchesPurok = filterPurok === 'All' || (res.purok || '').includes(filterPurok);
    const hasPendingProfileEdit = res.pendingProfileUpdate?.status === 'Pending';
    const matchesStatus = filterStatus === 'All' 
      ? true 
      : filterStatus === 'Pending' 
      ? (res.registrationStatus === 'Pending Approval' || hasPendingProfileEdit)
      : filterStatus === 'Banned'
      ? (res.isBanned || res.registrationStatus === 'Banned')
      : res.isVerified && !res.isBanned;

    const matchesDemographic = 
      filterDemographic === 'All' ? true :
      filterDemographic === 'PWD' ? res.isPwd :
      filterDemographic === 'Senior' ? (res.isSenior || (res.age || 0) >= 60) :
      filterDemographic === 'SoloParent' ? res.isSoloParent :
      filterDemographic === 'Student' ? (res.isStudent || res.employmentStatus === 'Student') :
      filterDemographic === 'Teenager' ? (res.isTeenager || ((res.age || 0) >= 13 && (res.age || 0) <= 19)) :
      filterDemographic === 'Married' ? (res.civilStatus || '').toLowerCase() === 'married' : true;

    return matchesSearch && matchesPurok && matchesStatus && matchesDemographic;
  });

  const pendingCount = residentsList.filter(
    r => r.registrationStatus === 'Pending Approval' || r.pendingProfileUpdate?.status === 'Pending'
  ).length;
  const bannedCount = residentsList.filter(r => r.isBanned || r.registrationStatus === 'Banned').length;

  const handleOpenBanModal = (res: ResidentUser) => {
    setResidentToBan(res);
    setBanReasonInput('Violation of barangay residency criteria or fraudulent submission');
    setShowBanModal(true);
  };

  const handleConfirmBan = () => {
    if (!residentToBan) return;
    banResidentAccount(residentToBan.id, banReasonInput);
    setShowBanModal(false);
    setResidentToBan(null);
    if (selectedResident && selectedResident.id === residentToBan.id) {
      setSelectedResident(null);
    }
  };

  const handleUnban = (res: ResidentUser) => {
    unbanResidentAccount(res.id);
    if (selectedResident && selectedResident.id === res.id) {
      setSelectedResident(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
          Residents
        </h1>
      </div>

      {/* Pending Registration Alert Banner */}
      {pendingCount > 0 && (
        <div className="bg-amber-50/70 border border-amber-200 rounded-xl px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 text-xs font-medium text-amber-900">
            <UserCheck className="w-4 h-4 text-amber-700 shrink-0" />
            <span>
              <strong className="tabular-nums">{pendingCount}</strong> pending approval{pendingCount > 1 ? 's' : ''} requiring review
            </span>
          </div>
          <button
            onClick={() => setFilterStatus('Pending')}
            className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-lg transition whitespace-nowrap shrink-0 cursor-pointer"
          >
            Review ({pendingCount})
          </button>
        </div>
      )}

      {/* Filters & Search */}
      <div className="bg-white rounded-xl p-4 border border-gray-200 space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Search */}
          <div className="relative w-full lg:w-72">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search name, email, or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-[#0c532b]"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Status Tabs */}
            <div className="flex items-center bg-gray-100 p-1 rounded-lg text-xs font-medium tabular-nums">
              <button
                onClick={() => setFilterStatus('All')}
                className={`px-3 py-1 rounded-md transition whitespace-nowrap cursor-pointer ${
                  filterStatus === 'All' ? 'bg-white text-gray-900 shadow-2xs font-semibold' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                All · {residentsList.length}
              </button>
              <button
                onClick={() => setFilterStatus('Pending')}
                className={`px-3 py-1 rounded-md transition whitespace-nowrap cursor-pointer ${
                  filterStatus === 'Pending' ? 'bg-amber-600 text-white shadow-2xs font-semibold' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Pending{pendingCount > 0 ? ` · ${pendingCount}` : ''}
              </button>
              <button
                onClick={() => setFilterStatus('Verified')}
                className={`px-3 py-1 rounded-md transition whitespace-nowrap cursor-pointer ${
                  filterStatus === 'Verified' ? 'bg-white text-gray-900 shadow-2xs font-semibold' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Verified
              </button>
              <button
                onClick={() => setFilterStatus('Banned')}
                className={`px-3 py-1 rounded-md transition whitespace-nowrap cursor-pointer ${
                  filterStatus === 'Banned' ? 'bg-rose-700 text-white shadow-2xs font-semibold' : 'text-gray-600 hover:text-rose-700'
                }`}
              >
                Banned{bannedCount > 0 ? ` · ${bannedCount}` : ''}
              </button>
            </div>

            {/* Purok Filter */}
            <select
              value={filterPurok}
              onChange={(e) => setFilterPurok(e.target.value)}
              className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-xs font-medium text-gray-700 outline-none focus:ring-2 focus:ring-[#0c532b]"
            >
              <option value="All">All Zones</option>
              {BUGO_PUROKS.map(p => (
                <option key={p} value={p.split(' - ')[0]}>{p}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Group Filter */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2.5 border-t border-gray-100 text-xs tabular-nums">
          {[
            { id: 'All', label: 'All', count: residentsList.length },
            { id: 'PWD', label: 'PWD', count: residentsList.filter(r => r.isPwd).length },
            { id: 'Senior', label: 'Senior (60+)', count: residentsList.filter(r => r.isSenior || (r.age || 0) >= 60).length },
            { id: 'SoloParent', label: 'Solo Parent', count: residentsList.filter(r => r.isSoloParent).length },
            { id: 'Student', label: 'Student', count: residentsList.filter(r => r.isStudent || r.employmentStatus === 'Student').length },
            { id: 'Teenager', label: 'Youth', count: residentsList.filter(r => r.isTeenager || ((r.age || 0) >= 13 && (r.age || 0) <= 19)).length },
            { id: 'Married', label: 'Married', count: residentsList.filter(r => (r.civilStatus || '').toLowerCase() === 'married').length }
          ].map(d => (
            <button
              key={d.id}
              type="button"
              onClick={() => setFilterDemographic(d.id as any)}
              className={`px-2.5 py-1 rounded-md font-medium transition cursor-pointer whitespace-nowrap ${
                filterDemographic === d.id
                  ? 'bg-[#0c532b] text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900'
              }`}
            >
              {d.label} · {d.count}
            </button>
          ))}
        </div>
      </div>

      {/* Residents Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-500 font-semibold border-b border-gray-200">
              <tr>
                <th className="px-4 py-3">Resident</th>
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Zone</th>
                <th className="px-4 py-3">Household</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredResidents.map((res) => {
                const isPending = res.registrationStatus === 'Pending Approval';
                const hasPendingProfileEdit = res.pendingProfileUpdate?.status === 'Pending';
                const isBanned = res.isBanned || res.registrationStatus === 'Banned';

                const metaParts = [
                  res.civilStatus || 'Single',
                  res.occupation || 'Resident',
                  ...(res.idNumber ? [`ID: ${res.idNumber}`] : []),
                  ...(res.isPwd ? ['PWD'] : []),
                  ...((res.isSenior || (res.age || 0) >= 60) ? ['Senior'] : []),
                  ...(res.isSoloParent ? ['Solo Parent'] : []),
                  ...((res.isStudent || res.employmentStatus === 'Student') ? ['Student'] : []),
                  ...(res.isTeenager && !res.isSenior && ((res.age || 0) < 60) ? ['Youth'] : [])
                ];

                return (
                  <tr key={res.id} className={`hover:bg-gray-50/70 transition ${isBanned ? 'bg-rose-50/30' : ''}`}>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-full font-bold flex items-center justify-center text-xs overflow-hidden shrink-0 ${
                          isBanned ? 'bg-rose-100 text-rose-800 border border-rose-300' : 'bg-[#0c532b]/10 text-[#0c532b]'
                        }`}>
                          {res.avatarUrl ? (
                            <img src={res.avatarUrl} alt={res.name} className="w-full h-full object-cover" />
                          ) : (
                            res.name.slice(0, 2).toUpperCase()
                          )}
                        </div>
                        <div className="min-w-0 space-y-0.5">
                          <p className="font-semibold text-gray-900 flex items-center gap-1.5">
                            <span className="truncate">{res.name}</span>
                            {isBanned && (
                              <span className="text-[10px] font-bold text-rose-700 uppercase">Banned</span>
                            )}
                          </p>
                          <p className="text-[11px] text-gray-500 truncate">{res.email} · {res.contactNumber}</p>
                          <p className="text-[11px] text-gray-400 truncate">{metaParts.join(' · ')}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3.5 font-mono font-medium text-gray-700 whitespace-nowrap tabular-nums">
                      {res.residentIdNumber}
                    </td>

                    <td className="px-4 py-3.5 text-gray-600">
                      {res.purok}
                    </td>

                    <td className="px-4 py-3.5 tabular-nums">
                      <p className="font-semibold text-gray-800">{res.householdIncome || '₱8,500.00'}</p>
                      <p className="text-[11px] text-gray-500">{res.familyMembersCount || 4} dependents</p>
                    </td>

                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <div className="space-y-0.5">
                        {isBanned ? (
                          <span className="inline-flex items-center gap-1.5 font-semibold text-rose-700">
                            <Ban className="w-3.5 h-3.5" />
                            <span>Banned</span>
                          </span>
                        ) : isPending ? (
                          <span className="inline-flex items-center gap-1.5 font-semibold text-amber-700">
                            <Clock className="w-3.5 h-3.5" />
                            <span>Pending</span>
                          </span>
                        ) : res.registrationStatus === 'Rejected' ? (
                          <span className="inline-flex items-center gap-1.5 font-semibold text-gray-600">
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Rejected</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-700">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Verified</span>
                          </span>
                        )}
                        {hasPendingProfileEdit && (
                          <span className="block text-[11px] font-medium text-amber-700">
                            Edit Pending
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* 0. If Pending Profile Edit -> Review Changes */}
                        {hasPendingProfileEdit && (
                          <button
                            onClick={() => {
                              setProfileRejectReason('');
                              setSelectedResident(res);
                            }}
                            className="flex items-center gap-1 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-bold rounded-lg transition shadow-xs cursor-pointer"
                            title="Review and approve resident profile changes"
                          >
                            <UserCheck className="w-3.5 h-3.5" />
                            <span>Review Edits</span>
                          </button>
                        )}

                        {/* 1. If Pending Registration -> Approve / Reject */}
                        {isPending && (
                          <>
                            <button
                              onClick={() => approveResidentRegistration(res.id)}
                              className="flex items-center gap-1 px-3 py-1.5 bg-[#0c532b] hover:bg-[#094222] text-white text-[11px] font-bold rounded-lg transition shadow-xs"
                              title="Approve and Verify Resident Account"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Approve</span>
                            </button>

                            <button
                              onClick={() => rejectResidentRegistration(res.id, 'Incomplete residency proof.')}
                              className="flex items-center gap-1 px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-[11px] font-bold rounded-lg border border-rose-200 transition"
                              title="Reject Registration"
                            >
                              <X className="w-3.5 h-3.5" />
                              <span>Reject</span>
                            </button>
                          </>
                        )}

                        {/* 2. If Unverified or Rejected -> Verify Action */}
                        {!res.isVerified && !isPending && !isBanned && (
                          <button
                            onClick={() => verifyResidentAccount(res.id)}
                            className="flex items-center gap-1 px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold rounded-lg transition shadow-xs"
                            title="Verify and Approve Account"
                          >
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>Verify Account</span>
                          </button>
                        )}

                        {/* 3. If Banned -> Unban Action */}
                        {isBanned && (
                          <button
                            onClick={() => handleUnban(res)}
                            className="flex items-center gap-1 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-[11px] font-bold rounded-lg transition shadow-xs"
                            title="Unban this resident account"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                            <span>Unban Account</span>
                          </button>
                        )}

                        {/* 4. Ban Account Button (if not already banned) */}
                        {!isBanned && (
                          <button
                            onClick={() => handleOpenBanModal(res)}
                            className="flex items-center gap-1 px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-[11px] font-bold rounded-lg border border-rose-200 transition"
                            title="Ban resident account from system"
                          >
                            <Ban className="w-3.5 h-3.5" />
                            <span>Ban</span>
                          </button>
                        )}

                        {/* 5. View Full Profile Modal */}
                        <button
                          onClick={() => {
                            setProfileRejectReason('');
                            setSelectedResident(res);
                          }}
                          className="px-2.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-[11px] rounded-lg transition inline-flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Profile</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Admin Ban Account Modal */}
      {showBanModal && residentToBan && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 border border-gray-200 shadow-2xl space-y-4 text-xs animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2 text-rose-700">
                <ShieldAlert className="w-5 h-5" />
                <h3 className="text-base font-extrabold text-gray-900">Ban Resident Account</h3>
              </div>
              <button onClick={() => setShowBanModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 space-y-1">
              <p className="font-bold">Are you sure you want to ban {residentToBan.name}?</p>
              <p className="text-[11px] text-rose-700 leading-relaxed">
                This resident will be blocked from logging into the portal and applying for barangay services until unbanned by an administrator.
              </p>
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">Official Grounds / Ban Reason</label>
              <textarea
                rows={3}
                required
                value={banReasonInput}
                onChange={(e) => setBanReasonInput(e.target.value)}
                placeholder="Enter justification (e.g. Ineligible residency, falsified documents, policy violation)..."
                className="w-full bg-gray-50 border border-gray-300 rounded-xl p-3 font-medium outline-none focus:ring-2 focus:ring-rose-600"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowBanModal(false)}
                className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmBan}
                className="flex-1 py-2.5 bg-rose-700 hover:bg-rose-800 text-white font-bold rounded-xl transition shadow-xs flex items-center justify-center gap-1.5"
              >
                <Ban className="w-3.5 h-3.5" />
                <span>Confirm Ban</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Resident Detail Modal with Administrative Controls */}
      {selectedResident && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 border border-gray-200 shadow-2xl space-y-4 my-8 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#0c532b]">Official Registry Dossier</span>
                <h2 className="text-base font-extrabold text-gray-900">{selectedResident.name}</h2>
              </div>
              <button 
                onClick={() => setSelectedResident(null)}
                className="text-gray-400 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Resident Header Info */}
            <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-2xl">
              <div className="w-16 h-16 rounded-2xl bg-[#0c532b]/10 text-[#0c532b] font-extrabold text-xl flex items-center justify-center overflow-hidden flex-shrink-0">
                {selectedResident.avatarUrl ? (
                  <img src={selectedResident.avatarUrl} alt={selectedResident.name} className="w-full h-full object-cover" />
                ) : (
                  selectedResident.name.slice(0, 2).toUpperCase()
                )}
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-gray-900">{selectedResident.name}</h3>
                <p className="text-xs font-mono text-gray-600 font-semibold">{selectedResident.residentIdNumber}</p>
                <div className="flex items-center gap-1.5 pt-0.5">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                    selectedResident.isBanned 
                      ? 'bg-rose-100 text-rose-800'
                      : selectedResident.isVerified 
                      ? 'bg-emerald-100 text-emerald-800' 
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {selectedResident.isBanned ? 'Banned Account' : selectedResident.isVerified ? 'Verified Citizen' : 'Pending Verification'}
                  </span>
                  <span className="text-[10px] font-medium text-gray-500">Reg: {selectedResident.registeredDate}</span>
                </div>
              </div>
            </div>

            {/* Ban Notification in Modal if Banned */}
            {selectedResident.isBanned && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800">
                <span className="font-bold block">Account Ban Details:</span>
                <p className="text-rose-700 mt-0.5">{selectedResident.banReason || 'Administrative policy violation.'}</p>
              </div>
            )}

            {/* Resident Dossier Particulars */}
            <div className="bg-gray-50 rounded-2xl p-4 space-y-2.5 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-400">Purok / Zone:</span>
                <span className="font-bold text-gray-800">{selectedResident.purok}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Complete Address:</span>
                <span className="font-semibold text-gray-800 text-right">{selectedResident.address}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Nationality:</span>
                <span className="font-bold text-gray-800">{selectedResident.nationality || 'Filipino'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Contact Number:</span>
                <span className="font-semibold text-gray-800">{selectedResident.contactNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Email Address:</span>
                <span className="font-semibold text-gray-800">{selectedResident.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Monthly Household Income:</span>
                <span className="font-bold text-emerald-700">{selectedResident.householdIncome || '₱8,500.00'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Family Members:</span>
                <span className="font-semibold text-gray-800">{selectedResident.familyMembersCount || 4} dependents</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Civil Status & Age:</span>
                <span className="font-semibold text-gray-800">{selectedResident.civilStatus || 'Single'} • {selectedResident.age || 28} years old</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Government / Resident ID:</span>
                <span className="font-semibold text-gray-800">{selectedResident.idType || 'PhilSys National ID'} ({selectedResident.idNumber || 'Verified'})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Primary Occupation:</span>
                <span className="font-semibold text-gray-800">{selectedResident.occupation || 'Resident'} ({selectedResident.employmentStatus || 'Self-Employed'})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">COMELEC Voter Status:</span>
                <span className="font-bold text-gray-800">{selectedResident.voterStatus || 'Registered Voter'}</span>
              </div>
            </div>

            {/* Pending Profile Edit Request (Admin-Only Approval) */}
            {selectedResident.pendingProfileUpdate?.status === 'Pending' && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-950 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-amber-700" />
                    Pending Profile Information Changes
                  </span>
                  <span className="text-[11px] text-amber-800">
                    {selectedResident.pendingProfileUpdate.requestedAt}
                  </span>
                </div>

                <div className="space-y-1.5">
                  {Object.entries(selectedResident.pendingProfileUpdate.changes).map(([field, newVal]) => {
                    const currentVal = (selectedResident as any)[field];
                    return (
                      <div key={field} className="bg-white border border-amber-200/80 rounded-xl px-3 py-2 flex items-center justify-between gap-3">
                        <span className="font-semibold text-gray-500 capitalize">{field.replace(/([A-Z])/g, ' $1')}</span>
                        <div className="text-right">
                          <span className="text-gray-400 line-through mr-2">{String(currentVal ?? '—')}</span>
                          <span className="font-bold text-gray-900">{String(newVal)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <input
                  type="text"
                  value={profileRejectReason}
                  onChange={(e) => setProfileRejectReason(e.target.value)}
                  placeholder="Optional reason if declining..."
                  className="w-full bg-white border border-amber-200 rounded-xl px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-[#0c532b]"
                />

                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={isReviewingProfileEdit}
                    onClick={async () => {
                      setIsReviewingProfileEdit(true);
                      try {
                        await reviewProfileChangeRequest(selectedResident.id, 'approve');
                        setSelectedResident(null);
                      } finally {
                        setIsReviewingProfileEdit(false);
                      }
                    }}
                    className="flex-1 py-2 bg-[#0c532b] hover:bg-[#094222] disabled:opacity-50 text-white font-bold rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Approve Changes</span>
                  </button>
                  <button
                    type="button"
                    disabled={isReviewingProfileEdit}
                    onClick={async () => {
                      setIsReviewingProfileEdit(true);
                      try {
                        await reviewProfileChangeRequest(
                          selectedResident.id,
                          'reject',
                          profileRejectReason.trim() || undefined
                        );
                        setProfileRejectReason('');
                        setSelectedResident(null);
                      } finally {
                        setIsReviewingProfileEdit(false);
                      }
                    }}
                    className="flex-1 py-2 bg-rose-50 hover:bg-rose-100 disabled:opacity-50 text-rose-700 font-bold rounded-xl border border-rose-200 transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Reject</span>
                  </button>
                </div>
              </div>
            )}

            {/* Admin Quick Action Controls inside profile */}
            <div className="space-y-2 pt-1">
              <div className="grid grid-cols-2 gap-2 text-xs">
                {!selectedResident.isVerified && !selectedResident.isBanned && (
                  <button
                    type="button"
                    onClick={() => {
                      approveResidentRegistration(selectedResident.id);
                      setSelectedResident(null);
                    }}
                    className="py-2.5 bg-[#0c532b] hover:bg-[#094222] text-white font-bold rounded-xl transition shadow-xs flex items-center justify-center gap-1.5"
                  >
                    <Check className="w-4 h-4" />
                    <span>Verify & Approve Account</span>
                  </button>
                )}

                {selectedResident.isBanned ? (
                  <button
                    type="button"
                    onClick={() => {
                      handleUnban(selectedResident);
                    }}
                    className="col-span-2 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl transition shadow-xs flex items-center justify-center gap-1.5"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Unban & Restore Account</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      handleOpenBanModal(selectedResident);
                    }}
                    className="py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-xl border border-rose-200 transition flex items-center justify-center gap-1.5"
                  >
                    <Ban className="w-4 h-4" />
                    <span>Ban Account</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setSelectedResident(null)}
                  className={`py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold rounded-xl transition ${
                    selectedResident.isVerified && !selectedResident.isBanned ? 'col-span-1' : ''
                  }`}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Manual Add Resident Modal */}
    </div>
  );
};


// ----------------------------------------------------
// 2. ADMIN STATUS TRACKING & SERVICE APPLICATIONS VIEW
// ----------------------------------------------------
export const AdminStatusTrackingView: React.FC = () => {
  const { 
    applications, 
    programs,
    updateApplicationStatus,
    selectedApplicationForReview,
    setSelectedApplicationForReview,
    archiveRecord
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'applications' | 'services'>('applications');
  const [selectedServiceFilter, setSelectedServiceFilter] = useState<string>('All');
  const [serviceSearch, setServiceSearch] = useState('');
  const [serviceCategoryFilter, setServiceCategoryFilter] = useState<string>('All');
  const [viewingService, setViewingService] = useState<AssistanceProgram | null>(null);

  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [qualificationQueue, setQualificationQueue] = useState<'All' | 'Qualified' | 'Ineligible'>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [archiveSuccessMsg, setArchiveSuccessMsg] = useState<string | null>(null);
  
  // Evaluation modal remarks & approved amount
  const [reviewRemarks, setReviewRemarks] = useState('');
  const [reviewApprovedAmount, setReviewApprovedAmount] = useState('');
  const [zoomedRequirement, setZoomedRequirement] = useState<{ title: string; url: string; type: string } | null>(null);

  const barangayServices = useMemo(
    () => programs.filter(p => isBarangayServiceApplicationItem(p)),
    [programs]
  );

  const serviceCategories = useMemo(
    () => Array.from(new Set(barangayServices.map(s => s.category))),
    [barangayServices]
  );

  const filteredServices = useMemo(() => {
    const q = serviceSearch.trim().toLowerCase();
    return barangayServices.filter(s => {
      const matchesCat = serviceCategoryFilter === 'All' || s.category === serviceCategoryFilter;
      const matchesSearch =
        !q ||
        s.title.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q) ||
        (s.tagline || '').toLowerCase().includes(q);
      return matchesCat && matchesSearch;
    });
  }, [barangayServices, serviceCategoryFilter, serviceSearch]);

  const qualifiedCount = applications.filter(a => a.isCertificateQualified !== false).length;
  const disqualifiedCount = applications.filter(a => a.isCertificateQualified === false).length;

  const filteredApplications = applications.filter(app => {
    const matchesSearch = app.referenceCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          app.applicantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          app.programTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (app.purok && app.purok.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'All' || app.status === statusFilter;
    const matchesService =
      selectedServiceFilter === 'All' ||
      app.programId === selectedServiceFilter ||
      app.programTitle.toLowerCase() === selectedServiceFilter.toLowerCase();
    
    const isQual = app.isCertificateQualified !== false;
    const matchesQueue = 
      qualificationQueue === 'All' ? true :
      qualificationQueue === 'Qualified' ? isQual :
      !isQual;

    return matchesSearch && matchesStatus && matchesService && matchesQueue;
  });

  const handleOpenReview = (app: AssistanceApplication) => {
    setSelectedApplicationForReview(app);
    setReviewRemarks(app.evaluatorNotes || '');
    setReviewApprovedAmount(app.approvedAmount || app.requestedAmount || '');
  };

  const handleApplyStatusChange = (newStatus: ApplicationStatus) => {
    if (!selectedApplicationForReview) return;

    updateApplicationStatus(
      selectedApplicationForReview.id,
      newStatus,
      'Hon. Juan Dela Cruz (Barangay Administrator)',
      reviewRemarks,
      reviewApprovedAmount
    );

    setSelectedApplicationForReview(null);
  };

  const handleArchiveApplication = (app: AssistanceApplication) => {
    archiveRecord({
      title: `${app.programTitle} - ${app.applicantName}`,
      originalCategory: 'Service Application',
      referenceCode: app.referenceCode,
      deletedBy: 'Hon. Juan Dela Cruz (Barangay Administrator)',
      reasonForArchive: reviewRemarks || `Application (${app.status}) archived directly from status tracking pipeline.`,
      originalData: app
    });

    setArchiveSuccessMsg(`Application "${app.referenceCode}" successfully archived!`);
    setTimeout(() => setArchiveSuccessMsg(null), 3000);
    setSelectedApplicationForReview(null);
  };

  return (
    <div className="space-y-6">
      {/* Header & Section Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
            Applications &amp; Barangay Services
          </h1>
          <p className="text-xs text-gray-500 mt-0.5 tabular-nums">
            {applications.length} applications · {barangayServices.length} clearances &amp; certificates
          </p>
        </div>

        <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-xl self-start sm:self-auto text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveSubTab('applications')}
            className={`px-3.5 py-1.5 rounded-lg transition cursor-pointer ${
              activeSubTab === 'applications' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Applications ({applications.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('services')}
            className={`px-3.5 py-1.5 rounded-lg transition cursor-pointer ${
              activeSubTab === 'services' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Barangay Services ({barangayServices.length})
          </button>
        </div>
      </div>

      {activeSubTab === 'services' ? (
        <div className="space-y-4">
          {/* Barangay Services Search & Category Filter */}
          <div className="bg-white rounded-xl p-3.5 border border-gray-200 flex flex-col sm:flex-row sm:items-center gap-2.5">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search clearance, certificate, or permit..."
                value={serviceSearch}
                onChange={(e) => setServiceSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs outline-none focus:bg-white focus:ring-2 focus:ring-[#0c532b]"
              />
            </div>

            <select
              value={serviceCategoryFilter}
              onChange={(e) => setServiceCategoryFilter(e.target.value)}
              className="w-full sm:w-64 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-800 font-medium outline-none focus:bg-white focus:ring-2 focus:ring-[#0c532b]"
            >
              <option value="All">All Service Categories ({barangayServices.length})</option>
              {serviceCategories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Barangay Services Table */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {filteredServices.length === 0 ? (
              <div className="p-8 text-center text-xs text-gray-500">
                No Barangay Services match your search.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-gray-50 text-gray-500 font-semibold text-[11px] border-b border-gray-200">
                    <tr>
                      <th className="py-2.5 px-4">Barangay Service</th>
                      <th className="py-2.5 px-4">Processing Time</th>
                      <th className="py-2.5 px-4 text-center">Requests</th>
                      <th className="py-2.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredServices.map(svc => {
                      const reqCount = applications.filter(
                        a => a.programId === svc.id || a.programTitle.toLowerCase() === svc.title.toLowerCase()
                      ).length;

                      return (
                        <tr key={svc.id} className="hover:bg-gray-50/70 transition">
                          <td className="py-3 px-4">
                            <p className="font-semibold text-gray-900">{svc.title}</p>
                            <p className="text-[11px] text-gray-500">{svc.category}</p>
                          </td>
                          <td className="py-3 px-4 text-gray-600 whitespace-nowrap">
                            {svc.processingTime || 'Same Day'}
                          </td>
                          <td className="py-3 px-4 text-center tabular-nums">
                            <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                              reqCount > 0 ? 'bg-emerald-50 text-[#0c532b]' : 'bg-gray-100 text-gray-500'
                            }`}>
                              {reqCount} {reqCount === 1 ? 'request' : 'requests'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right whitespace-nowrap">
                            <div className="inline-flex items-center gap-2.5">
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedServiceFilter(svc.id);
                                  setActiveSubTab('applications');
                                }}
                                className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-[#0c532b] rounded-lg text-xs font-bold cursor-pointer transition"
                              >
                                View Applications
                              </button>
                              <button
                                type="button"
                                onClick={() => setViewingService(svc)}
                                className="text-xs font-semibold text-gray-600 hover:text-gray-900 hover:underline cursor-pointer"
                              >
                                Details
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {viewingService && (
            <div
              className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4"
              onClick={() => setViewingService(null)}
            >
              <div
                className="bg-white rounded-2xl max-w-md w-full p-5 border border-gray-200 shadow-2xl space-y-3 text-xs"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-start justify-between gap-3 pb-2.5 border-b border-gray-100">
                  <div>
                    <p className="text-[11px] text-gray-500 font-medium">{viewingService.category}</p>
                    <h2 className="text-base font-bold text-gray-900 mt-0.5">{viewingService.title}</h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => setViewingService(null)}
                    className="p-1 text-gray-400 hover:text-gray-700 rounded-lg cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-gray-700 leading-relaxed">{viewingService.description}</p>

                <div className="grid grid-cols-2 gap-2.5 bg-gray-50 p-3 rounded-xl">
                  <div>
                    <span className="text-[11px] text-gray-400 block">Target Residents</span>
                    <span className="font-semibold text-gray-900">{viewingService.targetAudience}</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-gray-400 block">Processing Time</span>
                    <span className="font-semibold text-gray-900">{viewingService.processingTime}</span>
                  </div>
                </div>

                {viewingService.requirements?.length > 0 && (
                  <div>
                    <span className="font-semibold text-gray-800 block mb-1">Requirements</span>
                    <ul className="list-disc list-inside text-gray-600 space-y-0.5">
                      {viewingService.requirements.map((req, idx) => (
                        <li key={idx}>{req}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => {
                      const targetId = viewingService.id;
                      setViewingService(null);
                      setSelectedServiceFilter(targetId);
                      setActiveSubTab('applications');
                    }}
                    className="px-3.5 py-2 bg-[#0c532b] hover:bg-[#094222] text-white font-bold rounded-xl cursor-pointer"
                  >
                    View Applications
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewingService(null)}
                    className="px-3.5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <>
          {selectedServiceFilter !== 'All' && (
            <div className="flex items-center justify-between px-3.5 py-2 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-900">
              <span>
                Filtered by service:{' '}
                {barangayServices.find(s => s.id === selectedServiceFilter)?.title || selectedServiceFilter}
              </span>
              <button
                type="button"
                onClick={() => setSelectedServiceFilter('All')}
                className="text-emerald-700 hover:underline cursor-pointer"
              >
                Show All Applications
              </button>
            </div>
          )}

          {/* Filters & Search */}
          <div className="bg-white rounded-xl p-4 border border-gray-200 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <div className="relative w-full lg:w-72">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search code, applicant, or service..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-[#0c532b]"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Qualification Queue Tabs */}
              <div className="flex items-center bg-gray-100 p-1 rounded-lg text-xs font-medium tabular-nums">
                <button
                  type="button"
                  onClick={() => setQualificationQueue('All')}
                  className={`px-3 py-1 rounded-md transition whitespace-nowrap cursor-pointer ${
                    qualificationQueue === 'All' ? 'bg-white text-gray-900 shadow-2xs font-semibold' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  All · {applications.length}
                </button>
                <button
                  type="button"
                  onClick={() => setQualificationQueue('Qualified')}
                  className={`px-3 py-1 rounded-md transition whitespace-nowrap cursor-pointer ${
                    qualificationQueue === 'Qualified' ? 'bg-[#0c532b] text-white shadow-2xs font-semibold' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Qualified · {qualifiedCount}
                </button>
                <button
                  type="button"
                  onClick={() => setQualificationQueue('Ineligible')}
                  className={`px-3 py-1 rounded-md transition whitespace-nowrap cursor-pointer ${
                    qualificationQueue === 'Ineligible' ? 'bg-rose-700 text-white shadow-2xs font-semibold' : 'text-gray-600 hover:text-rose-700'
                  }`}
                >
                  Disqualified · {disqualifiedCount}
                </button>
              </div>

              {/* Status Dropdown */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-xs font-medium text-gray-700 outline-none focus:ring-2 focus:ring-[#0c532b]"
              >
                {[
                  'All',
                  'Submitted',
                  'Under Review',
                  'Documents Verified',
                  'Approved',
                  'Needs Additional Requirements',
                  'Re-submitted',
                  'Disbursed',
                  'Disqualified',
                  'Rejected'
                ].map(s => (
                  <option key={s} value={s}>
                    {s === 'All' ? 'All Statuses' : s}
                  </option>
                ))}
              </select>
            </div>
          </div>

      {/* Applications Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-500 font-semibold border-b border-gray-200">
              <tr>
                <th className="px-4 py-3">Ref.</th>
                <th className="px-4 py-3">Service</th>
                <th className="px-4 py-3">Applicant</th>
                <th className="px-4 py-3">Eligibility</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredApplications.map((app) => {
                const isAutoQual = app.isCertificateQualified !== false;

                return (
                  <tr key={app.id} className="hover:bg-gray-50/70 transition">
                    <td className="px-4 py-3.5 font-mono font-medium text-gray-800 whitespace-nowrap tabular-nums">
                      {app.referenceCode}
                    </td>

                    <td className="px-4 py-3.5">
                      <p className="font-semibold text-gray-900">{app.programTitle}</p>
                      <p className="text-[11px] text-gray-500">{app.programCategory}</p>
                    </td>

                    <td className="px-4 py-3.5">
                      <p className="font-semibold text-gray-800">{app.applicantName}</p>
                      <p className="text-[11px] text-gray-500">{app.purok} · {app.contactNumber}</p>
                    </td>

                    <td className="px-4 py-3.5 whitespace-nowrap">
                      {isAutoQual ? (
                        <span className="inline-flex items-center gap-1 font-semibold text-emerald-700">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Qualified</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 font-semibold text-rose-700">
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span>Disqualified</span>
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span className={`font-semibold ${
                        app.status === 'Approved'
                          ? 'text-emerald-700'
                          : app.status === 'Under Review' || app.status === 'Documents Verified'
                          ? 'text-blue-700'
                          : app.status === 'Ready for Release'
                          ? 'text-purple-700'
                          : app.status === 'Disqualified' || app.status === 'Rejected'
                          ? 'text-rose-700'
                          : 'text-amber-700'
                      }`}>
                        {app.status}
                      </span>
                    </td>

                    <td className="px-4 py-3.5 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => handleOpenReview(app)}
                          className="px-3 py-1.5 bg-[#0c532b] hover:bg-[#094222] text-white text-xs font-semibold rounded-lg transition inline-flex items-center gap-1.5 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Review</span>
                        </button>
                        <button
                          onClick={() => handleArchiveApplication(app)}
                          className="px-2.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-lg transition inline-flex items-center gap-1 cursor-pointer"
                          title="Archive application"
                        >
                          <Archive className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Archive</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
        </>
      )}

      {/* Admin Application Evaluation & Submitted Requirements Inspection Modal */}
      {selectedApplicationForReview && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 border border-gray-200 shadow-2xl space-y-5 my-8 max-h-[92vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#0c532b]">Official Requirements & Evaluation Review</span>
                <h2 className="text-lg font-extrabold text-gray-900 flex items-center gap-2">
                  <span>{selectedApplicationForReview.programTitle}</span>
                  <span className="text-xs font-mono bg-gray-100 text-gray-700 px-2 py-0.5 rounded-md">
                    {selectedApplicationForReview.referenceCode}
                  </span>
                </h2>
              </div>
              <button 
                onClick={() => setSelectedApplicationForReview(null)}
                className="text-gray-400 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Applicant Summary */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-gray-50 p-4 rounded-2xl text-xs">
              <div>
                <span className="text-gray-400 block font-semibold">Applicant Name:</span>
                <span className="font-bold text-gray-900 text-sm">{selectedApplicationForReview.applicantName}</span>
                <span className="text-gray-500 block">{selectedApplicationForReview.purok}</span>
              </div>

              <div>
                <span className="text-gray-400 block font-semibold">Contact & Email:</span>
                <span className="font-semibold text-gray-800">{selectedApplicationForReview.contactNumber}</span>
                <span className="text-gray-500 block">{selectedApplicationForReview.email}</span>
              </div>

              <div>
                <span className="text-gray-400 block font-semibold">Submitted On:</span>
                <span className="font-bold text-gray-800">{selectedApplicationForReview.submissionDate}</span>
                <span className="text-[11px] font-semibold text-[#0c532b] block">{selectedApplicationForReview.programCategory}</span>
              </div>

              <div className="col-span-2 sm:col-span-3 pt-2 border-t border-gray-200/60">
                <span className="text-gray-400 block font-semibold">Application Reason / Stated Purpose:</span>
                <p className="font-medium text-gray-800 mt-0.5 leading-relaxed bg-white p-2.5 rounded-xl border border-gray-200">
                  {selectedApplicationForReview.purposeOrDiagnosis}
                </p>
              </div>
            </div>

            {/* Automated Eligibility Brain Audit Card */}
            {selectedApplicationForReview.eligibilityEvaluation && (
              <div className={`p-4 rounded-2xl border ${
                selectedApplicationForReview.eligibilityEvaluation.isCapable
                  ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                  : 'bg-rose-50/90 border-rose-300 text-rose-950'
              } space-y-3`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className={`w-4 h-4 ${
                      selectedApplicationForReview.eligibilityEvaluation.isCapable ? 'text-emerald-700' : 'text-rose-700'
                    }`} />
                    <span className="font-extrabold text-xs uppercase tracking-wider">
                      Eligibility & Requirements Audit
                    </span>
                  </div>
                  <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                    selectedApplicationForReview.eligibilityEvaluation.isCapable
                      ? 'bg-emerald-200 text-emerald-900'
                      : 'bg-rose-200 text-rose-900'
                  }`}>
                    {selectedApplicationForReview.eligibilityEvaluation.verdict === 'ELIGIBLE' ? 'CAPABLE & ELIGIBLE' : 'INELIGIBLE / DISQUALIFIED'} ({selectedApplicationForReview.eligibilityEvaluation.score}/100)
                  </span>
                </div>

                <p className="text-xs leading-relaxed font-medium">
                  {selectedApplicationForReview.eligibilityEvaluation.summary}
                </p>

                {/* Rule-by-rule breakdown */}
                {selectedApplicationForReview.eligibilityEvaluation.ruleResults && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                    {selectedApplicationForReview.eligibilityEvaluation.ruleResults.map((r, i) => (
                      <div key={i} className={`p-2.5 rounded-xl border flex items-start gap-2 ${
                        r.passed ? 'bg-white/80 border-emerald-100' : 'bg-white border-rose-200 shadow-xs'
                      }`}>
                        {r.passed ? (
                          <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                        ) : (
                          <XCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                        )}
                        <div className="space-y-0.5">
                          <span className="font-bold text-gray-900 block">{r.ruleName}</span>
                          <span className="text-[11px] text-gray-600 block">{r.details}</span>
                          {r.limitValue && (
                            <span className="text-[10px] text-gray-400 block">
                              Ceiling: {r.limitValue} • Submitted: {r.actualValue}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Automated Certificate Qualification Audit based on Household Profiling */}
            {(selectedApplicationForReview.qualificationDetails || selectedApplicationForReview.isCertificateQualified !== undefined) && (
              <div className={`p-4 rounded-2xl border ${
                selectedApplicationForReview.isCertificateQualified !== false
                  ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950'
                  : 'bg-rose-50/90 border-rose-300 text-rose-950'
              } space-y-3`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className={`w-4 h-4 ${
                      selectedApplicationForReview.isCertificateQualified !== false ? 'text-emerald-700' : 'text-rose-700'
                    }`} />
                    <span className="font-extrabold text-xs uppercase tracking-wider">
                      Household Profiling & Certificate Eligibility Engine
                    </span>
                  </div>
                  <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                    selectedApplicationForReview.isCertificateQualified !== false
                      ? 'bg-emerald-200 text-emerald-900 border border-emerald-300'
                      : 'bg-rose-200 text-rose-900 border border-rose-300'
                  }`}>
                    {selectedApplicationForReview.isCertificateQualified !== false
                      ? `PRE-QUALIFIED (${selectedApplicationForReview.qualificationDetails?.score || 100}%)`
                      : `INELIGIBLE / UNMET (${selectedApplicationForReview.qualificationDetails?.score || 40}%)`}
                  </span>
                </div>

                {selectedApplicationForReview.qualificationDetails && (
                  <div className="space-y-2 text-xs">
                    {/* Passed Rules */}
                    {selectedApplicationForReview.qualificationDetails.passedRules?.length > 0 && (
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-900 block">
                          Verified Profile Criteria:
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                          {selectedApplicationForReview.qualificationDetails.passedRules.map((rule, idx) => (
                            <div key={idx} className="p-2 rounded-lg bg-white/90 border border-emerald-200 flex items-start gap-1.5">
                              <CheckCircle className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                              <span className="text-[11px] font-medium text-emerald-950">{rule}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Failure Reasons */}
                    {selectedApplicationForReview.qualificationDetails.failureReasons?.length > 0 && (
                      <div className="space-y-1 pt-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-rose-900 block">
                          Unmet Eligibility Requirements:
                        </span>
                        <div className="space-y-1">
                          {selectedApplicationForReview.qualificationDetails.failureReasons.map((reason, idx) => (
                            <div key={idx} className="p-2 rounded-lg bg-white/90 border border-rose-200 flex items-start gap-1.5 text-rose-950">
                              <XCircle className="w-3.5 h-3.5 text-rose-600 flex-shrink-0 mt-0.5" />
                              <span className="text-[11px] font-semibold">{reason}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* SUBMITTED REQUIREMENTS & ID CARDS INSPECTION SECTION */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-[#0c532b]" />
                  <span>Submitted Resident ID Verification (Front & Back)</span>
                </h4>
                <span className="text-[11px] font-semibold text-gray-500">Click any image to zoom in</span>
              </div>

              {/* ID Cards Preview Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Front of ID */}
                <div className="bg-emerald-50/50 border border-emerald-200/70 rounded-2xl p-3.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-[#0c532b]" />
                      <span>Front of Valid ID</span>
                    </span>
                    <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                      Submitted
                    </span>
                  </div>

                  <div 
                    onClick={() => setZoomedRequirement({
                      title: `Front of ID - ${selectedApplicationForReview.applicantName}`,
                      url: selectedApplicationForReview.idCardFrontUrl || '/assets/services/brgy_clearance_cert_1794197711166.jpg',
                      type: 'Valid Government / Barangay ID (Front)'
                    })}
                    className="relative group cursor-pointer aspect-video rounded-xl bg-gray-900 overflow-hidden border border-emerald-300/60 shadow-xs flex items-center justify-center"
                  >
                    <img 
                      src={selectedApplicationForReview.idCardFrontUrl || '/assets/services/brgy_clearance_cert_1794197711166.jpg'} 
                      alt="Front of ID"
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-1.5 text-white text-xs font-bold">
                      <ZoomIn className="w-4 h-4" />
                      <span>Click to Inspect Full Size</span>
                    </div>
                  </div>
                  <p className="text-[11px] text-gray-500 text-center font-medium">Valid Government / Barangay Citizen ID Front View</p>
                </div>

                {/* Back of ID */}
                <div className="bg-emerald-50/50 border border-emerald-200/70 rounded-2xl p-3.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-[#0c532b]" />
                      <span>Back of Valid ID</span>
                    </span>
                    <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                      Submitted
                    </span>
                  </div>

                  <div 
                    onClick={() => setZoomedRequirement({
                      title: `Back of ID - ${selectedApplicationForReview.applicantName}`,
                      url: selectedApplicationForReview.idCardBackUrl || '/assets/services/brgy_clearance_cert_1794197711166.jpg',
                      type: 'Valid Government / Barangay ID (Back)'
                    })}
                    className="relative group cursor-pointer aspect-video rounded-xl bg-gray-900 overflow-hidden border border-emerald-300/60 shadow-xs flex items-center justify-center"
                  >
                    <img 
                      src={selectedApplicationForReview.idCardBackUrl || '/assets/services/brgy_clearance_cert_1794197711166.jpg'} 
                      alt="Back of ID"
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-1.5 text-white text-xs font-bold">
                      <ZoomIn className="w-4 h-4" />
                      <span>Click to Inspect Full Size</span>
                    </div>
                  </div>
                  <p className="text-[11px] text-gray-500 text-center font-medium">Valid Government / Barangay Citizen ID Back View</p>
                </div>
              </div>

              {/* Supporting Requirement Documents Checklist */}
              <div>
                <h4 className="text-xs font-bold text-gray-700 mb-2 flex items-center gap-1.5">
                  <Paperclip className="w-3.5 h-3.5 text-gray-500" />
                  <span>Supporting Documents & Certifications ({selectedApplicationForReview.documents.length})</span>
                </h4>
                <div className="space-y-2">
                  {selectedApplicationForReview.documents.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-200 text-xs">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#0c532b]/10 text-[#0c532b] flex items-center justify-center font-bold">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="font-bold text-gray-900 block">{doc.name}</span>
                          <span className="text-[10px] text-gray-400">File size: {doc.size} • Type: {doc.type || 'Official Document'}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setZoomedRequirement({
                            title: doc.name,
                            url: doc.fileUrl || doc.previewUrl || '/assets/services/brgy_clearance_cert_1794197711166.jpg',
                            type: doc.type || 'Official Requirement Attachment'
                          })}
                          className="px-2.5 py-1 bg-white hover:bg-gray-100 text-gray-700 border border-gray-200 rounded-lg font-bold text-[11px] transition inline-flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5 text-[#0c532b]" />
                          <span>View Doc</span>
                        </button>
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-200">
                          Verified
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Status Timeline History */}
            <div>
              <h4 className="text-xs font-bold text-gray-700 mb-2 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-gray-500" />
                <span>Status History & Audit Trail</span>
              </h4>
              <div className="space-y-2 border-l-2 border-gray-200 ml-3 pl-3 text-xs">
                {selectedApplicationForReview.timeline.map((entry, idx) => (
                  <div key={idx} className="relative">
                    <div className="absolute -left-[19px] top-1 w-2.5 h-2.5 rounded-full bg-[#0c532b]"></div>
                    <p className="font-bold text-gray-900">{entry.status} <span className="text-[10px] font-normal text-gray-400">• {entry.timestamp}</span></p>
                    <p className="text-[11px] text-gray-500">{entry.remarks || 'Status logged by ' + entry.officerName}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Evaluation Form / Remarks */}
            <div className="space-y-3 pt-3 border-t border-gray-100 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Approved Grant Amount (if applicable)</label>
                  <input
                    type="text"
                    value={reviewApprovedAmount}
                    onChange={(e) => setReviewApprovedAmount(e.target.value)}
                    placeholder="e.g. ₱5,000.00"
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl p-2.5 font-bold text-emerald-800 outline-none focus:ring-2 focus:ring-[#0c532b]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Evaluator / Approving Officer</label>
                  <input
                    type="text"
                    disabled
                    value="Hon. Juan Dela Cruz (Barangay Administrator)"
                    className="w-full bg-gray-100 border border-gray-200 rounded-xl p-2.5 font-medium text-gray-600 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Evaluator Notes / Officer Remarks</label>
                <textarea
                  rows={2}
                  placeholder="Enter remarks for the applicant (e.g. Requirements verified, ready for check pickup at Session Hall)..."
                  value={reviewRemarks}
                  onChange={(e) => setReviewRemarks(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl p-2.5 font-medium outline-none focus:ring-2 focus:ring-[#0c532b]"
                />
              </div>

              {/* Status Action Buttons */}
              <div className="space-y-1.5 pt-1">
                <label className="block font-bold text-gray-700">Administrative Decision:</label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  <button
                    type="button"
                    onClick={() => handleApplyStatusChange('Under Review')}
                    className="py-2.5 px-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-xl border border-blue-200 transition text-center text-xs"
                  >
                    Under Review
                  </button>

                  <button
                    type="button"
                    onClick={() => handleApplyStatusChange('Documents Verified')}
                    className="py-2.5 px-2 bg-sky-50 hover:bg-sky-100 text-sky-700 font-bold rounded-xl border border-sky-200 transition text-center text-xs"
                  >
                    Docs Verified
                  </button>

                  <button
                    type="button"
                    onClick={() => handleApplyStatusChange('Needs Additional Requirements')}
                    className="py-2.5 px-2 bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold rounded-xl border border-amber-300 transition text-center text-xs"
                  >
                    Needs Reqs
                  </button>

                  <button
                    type="button"
                    onClick={() => handleApplyStatusChange('Approved')}
                    className="py-2.5 px-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition shadow-xs text-center text-xs"
                  >
                    Approve
                  </button>

                  <button
                    type="button"
                    onClick={() => handleApplyStatusChange('Ready for Release')}
                    className="py-2.5 px-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl transition shadow-xs text-center text-xs"
                  >
                    Ready Release
                  </button>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap justify-between items-center gap-2 pt-2">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleApplyStatusChange('Disqualified')}
                  className="px-3 py-1.5 bg-rose-100 hover:bg-rose-200 text-rose-800 border border-rose-300 rounded-xl text-xs font-bold transition inline-flex items-center gap-1"
                >
                  <Ban className="w-3.5 h-3.5 text-rose-700" />
                  <span>Disqualify (Ineligible)</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleApplyStatusChange('Rejected')}
                  className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition inline-flex items-center gap-1"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Reject Application</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleArchiveApplication(selectedApplicationForReview)}
                  className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-xl text-xs font-bold transition inline-flex items-center gap-1 cursor-pointer"
                  title="Archive this application right now"
                >
                  <Archive className="w-3.5 h-3.5 text-amber-700" />
                  <span>Archive Record Now</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => setSelectedApplicationForReview(null)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition"
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Requirement / ID Zoom Modal */}
      {zoomedRequirement && (
        <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-4 border border-gray-800 shadow-2xl space-y-3 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <div>
                <h3 className="text-sm font-bold text-gray-900">{zoomedRequirement.title}</h3>
                <span className="text-[11px] text-gray-500 font-medium">{zoomedRequirement.type}</span>
              </div>
              <button
                onClick={() => setZoomedRequirement(null)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="w-full aspect-video rounded-2xl overflow-hidden bg-gray-900 flex items-center justify-center">
              <img 
                src={zoomedRequirement.url} 
                alt={zoomedRequirement.title} 
                className="w-full h-full object-contain"
              />
            </div>

            <div className="flex justify-between items-center text-xs pt-1">
              <span className="text-emerald-700 font-bold flex items-center gap-1">
                <CheckCircle className="w-4 h-4" />
                <span>Document verified by resident authentication pipeline</span>
              </span>
              <button
                onClick={() => setZoomedRequirement(null)}
                className="px-4 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold rounded-xl transition"
              >
                Back to Evaluation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal removed */}
    </div>
  );
};


// ----------------------------------------------------
// 3. ADMIN ANNOUNCEMENTS VIEW
// ----------------------------------------------------
export const AdminAnnouncementsView: React.FC = () => {
  const { 
    announcements, 
    programs, 
    residentsList, 
    addAnnouncement, 
    incrementAnnouncementViews 
  } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [viewingAnn, setViewingAnn] = useState<AnnouncementItem | null>(null);
  const [publishFeedback, setPublishFeedback] = useState<string | null>(null);

  const assistancePrograms = programs.filter(
    p => !isCertificateProgram(p.id, p.title, p.category)
  );

  const [annForm, setAnnForm] = useState<{
    title: string;
    category: AnnouncementItem['category'];
    description: string;
    iconType: AnnouncementItem['iconType'];
    targetAudienceType: 'All' | 'Qualified Beneficiaries Only';
    targetProgramId: string;
    releaseDate: string;
    meetingTime: string;
    meetingVenue: string;
    instructions: string;
  }>({
    title: '',
    category: 'General',
    description: '',
    iconType: 'general',
    targetAudienceType: 'All',
    targetProgramId: assistancePrograms[0]?.id || '',
    releaseDate: '',
    meetingTime: '08:30 AM',
    meetingVenue: 'Barangay Bugo Covered Court / Session Hall',
    instructions: 'Bring your Barangay Bugo Resident ID and original valid government ID.'
  });

  const selectedTargetProgram = assistancePrograms.find(p => p.id === annForm.targetProgramId);
  const qualifiedRecipients = annForm.targetAudienceType === 'Qualified Beneficiaries Only' && selectedTargetProgram
    ? residentsList.filter(r => evaluateResidentForProgram(r, selectedTargetProgram.id, selectedTargetProgram.title).isQualified)
    : [];

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const isTargeted = annForm.targetAudienceType === 'Qualified Beneficiaries Only';

    addAnnouncement({
      title: annForm.title,
      category: isTargeted && annForm.category === 'General' ? 'Program Release' : annForm.category,
      description: annForm.description,
      date: 'Today',
      iconType: isTargeted ? 'calendar' : annForm.iconType,
      status: 'Published',
      targetAudienceType: annForm.targetAudienceType,
      ...(isTargeted && selectedTargetProgram ? {
        targetProgramId: selectedTargetProgram.id,
        targetProgramTitle: selectedTargetProgram.title,
        releaseDate: annForm.releaseDate || undefined,
        meetingTime: annForm.meetingTime || undefined,
        meetingVenue: annForm.meetingVenue || undefined,
        instructions: annForm.instructions || undefined
      } : {})
    });

    setShowModal(false);
    setPublishFeedback(
      isTargeted
        ? `Targeted release notice published! Dispatched to ${qualifiedRecipients.length} qualified beneficiar${qualifiedRecipients.length === 1 ? 'y' : 'ies'}.`
        : 'Public advisory published to the Barangay Bugo resident portal.'
    );
    setTimeout(() => setPublishFeedback(null), 4000);
    setAnnForm({
      title: '',
      category: 'General',
      description: '',
      iconType: 'general',
      targetAudienceType: 'All',
      targetProgramId: assistancePrograms[0]?.id || '',
      releaseDate: '',
      meetingTime: '08:30 AM',
      meetingVenue: 'Barangay Bugo Covered Court / Session Hall',
      instructions: 'Bring your Barangay Bugo Resident ID and original valid government ID.'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            Barangay Announcements
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">
            Publish public advisories or targeted benefit release schedules exclusively for qualified beneficiaries.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#0c532b] hover:bg-[#094222] text-white text-sm font-semibold rounded-lg transition shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Announcement</span>
        </button>
      </div>

      {publishFeedback && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs font-bold text-emerald-900 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{publishFeedback}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {announcements.map((ann) => {
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
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-50 text-[#0c532b] rounded-md">
                    {ann.category}
                  </span>
                  <span className="text-xs text-gray-400">{ann.date}</span>
                </div>

                {isExclusive && (
                  <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-600 text-white text-[10px] font-extrabold">
                    <ShieldCheck className="w-3 h-3" />
                    <span>Qualified Only • {ann.targetProgramTitle || 'Targeted Program'}</span>
                  </div>
                )}

                <h3 className="text-sm font-bold text-gray-900 mt-2 group-hover:text-[#0c532b] transition-colors">{ann.title}</h3>
                <p className="text-xs text-gray-500 mt-1 line-clamp-3 leading-relaxed">{ann.description}</p>

                {isExclusive && (ann.releaseDate || ann.meetingTime) && (
                  <div className="mt-2.5 p-2 bg-emerald-100/60 rounded-xl border border-emerald-200 text-[11px] text-emerald-950 space-y-0.5">
                    {ann.releaseDate && (
                      <div className="font-semibold flex items-center gap-1">
                        <Clock className="w-3 h-3 text-emerald-700" />
                        <span>Release: {ann.releaseDate} {ann.meetingTime ? `• ${ann.meetingTime}` : ''}</span>
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
                <span className="text-emerald-700 font-semibold">{ann.status || 'Published'}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* View Announcement Detail Modal */}
      <AnnouncementModal 
        announcement={viewingAnn}
        onClose={() => setViewingAnn(null)}
      />

      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 border border-gray-200 shadow-2xl space-y-4 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h2 className="text-base font-bold text-gray-900">Publish Barangay Notice</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-700 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              {/* Target Audience Switcher */}
              <div>
                <label className="block font-bold text-gray-700 mb-1.5">Target Audience</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setAnnForm({ ...annForm, targetAudienceType: 'All' })}
                    className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                      annForm.targetAudienceType === 'All'
                        ? 'bg-emerald-50 border-[#0c532b] text-[#0c532b] font-bold'
                        : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <div className="text-xs font-extrabold">All Residents</div>
                    <div className="text-[10px] opacity-80">Public community bulletin</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setAnnForm({ ...annForm, targetAudienceType: 'Qualified Beneficiaries Only', category: 'Program Release' })}
                    className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                      annForm.targetAudienceType === 'Qualified Beneficiaries Only'
                        ? 'bg-emerald-50 border-[#0c532b] text-[#0c532b] font-bold'
                        : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <div className="text-xs font-extrabold">Qualified Beneficiaries Only</div>
                    <div className="text-[10px] opacity-80">Targeted aid release schedule</div>
                  </button>
                </div>
              </div>

              {/* Targeted Program & Release Fields */}
              {annForm.targetAudienceType === 'Qualified Beneficiaries Only' && (
                <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-3">
                  <div>
                    <label className="block font-bold text-emerald-950 mb-1">Target Assistance Program</label>
                    <select
                      value={annForm.targetProgramId}
                      onChange={(e) => setAnnForm({ ...annForm, targetProgramId: e.target.value })}
                      className="w-full bg-white border border-emerald-300 rounded-xl px-3 py-2 font-semibold text-gray-900 outline-none focus:ring-2 focus:ring-[#0c532b]"
                    >
                      {assistancePrograms.map(prog => (
                        <option key={prog.id} value={prog.id}>
                          {prog.title} ({prog.category})
                        </option>
                      ))}
                    </select>
                    <p className="text-[11px] font-bold text-emerald-800 mt-1.5 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>
                        {qualifiedRecipients.length} registered resident{qualifiedRecipients.length === 1 ? '' : 's'} currently auto-qualif{qualifiedRecipients.length === 1 ? 'ies' : 'y'} and will receive this release notice.
                      </span>
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block font-bold text-emerald-950 mb-1">Release Date</label>
                      <input
                        type="date"
                        value={annForm.releaseDate}
                        onChange={(e) => setAnnForm({ ...annForm, releaseDate: e.target.value })}
                        className="w-full bg-white border border-emerald-200 rounded-xl px-3 py-2 font-medium outline-none focus:ring-2 focus:ring-[#0c532b]"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-emerald-950 mb-1">Meeting / Release Time</label>
                      <input
                        type="text"
                        placeholder="e.g. 08:30 AM - 12:00 PM"
                        value={annForm.meetingTime}
                        onChange={(e) => setAnnForm({ ...annForm, meetingTime: e.target.value })}
                        className="w-full bg-white border border-emerald-200 rounded-xl px-3 py-2 font-medium outline-none focus:ring-2 focus:ring-[#0c532b]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-emerald-950 mb-1">Meeting Venue</label>
                    <input
                      type="text"
                      placeholder="e.g. Barangay Bugo Covered Court"
                      value={annForm.meetingVenue}
                      onChange={(e) => setAnnForm({ ...annForm, meetingVenue: e.target.value })}
                      className="w-full bg-white border border-emerald-200 rounded-xl px-3 py-2 font-medium outline-none focus:ring-2 focus:ring-[#0c532b]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-emerald-950 mb-1">Beneficiary Instructions</label>
                    <input
                      type="text"
                      placeholder="What to bring..."
                      value={annForm.instructions}
                      onChange={(e) => setAnnForm({ ...annForm, instructions: e.target.value })}
                      className="w-full bg-white border border-emerald-200 rounded-xl px-3 py-2 font-medium outline-none focus:ring-2 focus:ring-[#0c532b]"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block font-bold text-gray-700 mb-1">Announcement Title</label>
                <input
                  type="text"
                  required
                  placeholder={annForm.targetAudienceType === 'Qualified Beneficiaries Only' ? 'e.g. Senior Citizen Social Pension Payout Schedule' : 'e.g. Free Medical Checkup at Covered Court'}
                  value={annForm.title}
                  onChange={(e) => setAnnForm({ ...annForm, title: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 font-medium outline-none focus:ring-2 focus:ring-[#0c532b]"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Category</label>
                <select
                  value={annForm.category}
                  onChange={(e) => setAnnForm({ ...annForm, category: e.target.value as AnnouncementItem['category'] })}
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 font-semibold outline-none focus:ring-2 focus:ring-[#0c532b]"
                >
                  <option value="Program Release">Program Release</option>
                  <option value="Meeting">Beneficiary Meeting</option>
                  <option value="Water">Water Interruption</option>
                  <option value="Health">Health & Medical</option>
                  <option value="Sports">Sports & SK</option>
                  <option value="Assembly">Barangay Assembly</option>
                  <option value="General">General Notice</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Announcement Details</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Write notice details for residents..."
                  value={annForm.description}
                  onChange={(e) => setAnnForm({ ...annForm, description: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl p-3 font-medium outline-none focus:ring-2 focus:ring-[#0c532b]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-[#0c532b] hover:bg-[#094222] text-white font-bold rounded-xl transition shadow-xs cursor-pointer"
              >
                {annForm.targetAudienceType === 'Qualified Beneficiaries Only'
                  ? `Publish & Notify ${qualifiedRecipients.length} Qualified Beneficiar${qualifiedRecipients.length === 1 ? 'y' : 'ies'}`
                  : 'Broadcast to Resident Portal'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};


// ----------------------------------------------------
// 3.5 PROGRAM-SCOPED QUALIFIED RESIDENTS ("VIEW RESIDENTS")
// ----------------------------------------------------
interface AdminProgramQualifiedResidentsViewProps {
  program: AssistanceProgram;
  onBack: () => void;
}

const AdminProgramQualifiedResidentsView: React.FC<AdminProgramQualifiedResidentsViewProps> = ({
  program,
  onBack
}) => {
  const { residentsList } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [residentScope, setResidentScope] = useState<'qualified' | 'all'>('qualified');
  const [selectedResidentId, setSelectedResidentId] = useState<string | null>(null);

  const activeResidents = useMemo(() => {
    const seen = new Set<string>();
    return residentsList
      .filter(r => r.role === 'resident' && !r.isBanned)
      .filter(r => {
        const key = `${r.id}`;
        const nameKey = (r.name || '').trim().toLowerCase();
        if (seen.has(key) || (nameKey && seen.has(nameKey))) return false;
        seen.add(key);
        if (nameKey) seen.add(nameKey);
        return true;
      });
  }, [residentsList]);

  const evaluations = activeResidents
    .map(resident => {
      const evaluation = evaluateResidentForProgram(resident, program.id, program.title, program);
      return { resident, eval: evaluation };
    })
    .sort((a, b) => {
      if (a.eval.isQualified !== b.eval.isQualified) {
        return Number(b.eval.isQualified) - Number(a.eval.isQualified);
      }
      return (a.resident.name || '').localeCompare(b.resident.name || '');
    });

  const qualifiedCount = evaluations.filter(e => e.eval.isQualified).length;

  const filtered = evaluations.filter(entry => {
    const matchesScope = residentScope === 'all' ? true : entry.eval.isQualified;
    const q = searchTerm.trim().toLowerCase();
    const matchesSearch =
      !q ||
      (entry.resident.name || '').toLowerCase().includes(q) ||
      (entry.resident.purok || '').toLowerCase().includes(q) ||
      (entry.resident.residentIdNumber || '').toLowerCase().includes(q);
    return matchesScope && matchesSearch;
  });

  const inspected = selectedResidentId
    ? evaluations.find(e => e.resident.id === selectedResidentId) || null
    : null;

  const formatTraits = (res: ResidentUser): string => {
    const traits: string[] = [];
    if (res.householdIncome) traits.push(res.householdIncome.split('(')[0].trim());
    if (res.occupation) traits.push(res.occupation);
    if (res.isSenior || (typeof res.age === 'number' && res.age >= 60)) traits.push('Senior');
    if (res.isPwd) traits.push('PWD');
    if (res.isSoloParent) traits.push('Solo Parent');
    if (res.isStudent) traits.push('Student');
    return traits.join(' · ');
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <button
            type="button"
            onClick={onBack}
            className="mt-0.5 p-2 bg-white hover:bg-gray-100 border border-gray-200 rounded-xl text-gray-700 cursor-pointer transition"
            title="Back to Programs"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">
              {program.title}
            </h1>
            <p className="text-xs text-gray-500 mt-0.5 tabular-nums">
              {qualifiedCount} qualified · {activeResidents.length} residents
            </p>
          </div>
        </div>
      </div>

      {/* Search & Qualified Toggle */}
      <div className="bg-white rounded-2xl border border-gray-200 p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search resident name, ID, or zone..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#0c532b]"
          />
        </div>

        <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-xl self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setResidentScope('qualified')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition cursor-pointer ${
              residentScope === 'qualified' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Qualified ({qualifiedCount})
          </button>
          <button
            type="button"
            onClick={() => setResidentScope('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition cursor-pointer ${
              residentScope === 'all' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            All ({activeResidents.length})
          </button>
        </div>
      </div>

      {/* Residents Qualification Table */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-2xs">
        {filtered.length === 0 ? (
          <div className="py-12 text-center px-4">
            <Users className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm font-bold text-gray-700">No residents found</p>
            <p className="text-xs text-gray-400 mt-1">
              {residentScope === 'qualified'
                ? 'No residents match the qualification criteria for this program.'
                : 'Try another search keyword.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-[11px] font-bold text-gray-500 uppercase">
                  <th className="py-3 px-4">Resident</th>
                  <th className="py-3 px-4">Profile</th>
                  <th className="py-3 px-4">Qualification</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map(({ resident, eval: evalRes }) => {
                  const traits = formatTraits(resident);
                  return (
                    <tr key={resident.id} className="hover:bg-gray-50/70">
                      <td className="py-3 px-4">
                        <p className="font-bold text-gray-900">{resident.name}</p>
                        <p className="text-[11px] text-gray-500">
                          {resident.residentIdNumber || 'No ID'} · {(resident.purok || 'Bugo').split(' - ')[0]}
                        </p>
                      </td>
                      <td className="py-3 px-4 text-[11px] text-gray-600">
                        {traits || 'Registered Resident'}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-md border text-[11px] font-bold ${
                            evalRes.isQualified
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : 'bg-gray-100 text-gray-600 border-gray-200'
                          }`}
                        >
                          {evalRes.isQualified ? 'Qualified' : 'Not Qualified'}
                        </span>
                        <p className="text-[11px] text-gray-500 mt-0.5 truncate max-w-xs">
                          {evalRes.summary}
                        </p>
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => setSelectedResidentId(resident.id)}
                          className="px-2.5 py-1 bg-white hover:bg-gray-100 border border-gray-200 text-gray-700 text-[11px] font-semibold rounded-lg cursor-pointer"
                        >
                          Details
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Qualification Breakdown Modal */}
      {inspected && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setSelectedResidentId(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-md w-full p-5 border border-gray-200 shadow-2xl space-y-3 text-xs"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3 pb-2.5 border-b border-gray-100">
              <div>
                <h2 className="text-base font-bold text-gray-900">{inspected.resident.name}</h2>
                <p className="text-[11px] text-gray-500">
                  {program.title} · {(inspected.resident.purok || 'Bugo').split(' - ')[0]}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedResidentId(null)}
                className="p-1 text-gray-400 hover:text-gray-700 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className={`p-3 rounded-xl border ${
              inspected.eval.isQualified
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-rose-50 border-rose-200 text-rose-900'
            }`}>
              <p className="font-bold">{inspected.eval.isQualified ? 'Qualified' : 'Not Qualified'}</p>
              <p className="text-[11px] mt-0.5">{inspected.eval.summary}</p>
            </div>

            {inspected.eval.passedCriteria.length > 0 && (
              <div className="space-y-1">
                <p className="font-bold text-emerald-800">Passed Criteria</p>
                <ul className="list-disc list-inside text-gray-700 space-y-0.5">
                  {inspected.eval.passedCriteria.map((c, idx) => (
                    <li key={idx}>{c}</li>
                  ))}
                </ul>
              </div>
            )}

            {inspected.eval.failedCriteria.length > 0 && (
              <div className="space-y-1">
                <p className="font-bold text-rose-700">Unmet Criteria</p>
                <ul className="list-disc list-inside text-rose-700 space-y-0.5">
                  {inspected.eval.failedCriteria.map((c, idx) => (
                    <li key={idx}>{c}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setSelectedResidentId(null)}
                className="px-3.5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


// ----------------------------------------------------
// 4. ADMIN SETTINGS VIEW
// ----------------------------------------------------
export const AdminSettingsView: React.FC = () => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
          System Account & Administrative Settings
        </h1>
        <p className="text-gray-500 text-sm mt-0.5">
          Barangay Bugo administrative configuration, security credentials, and secretariat information.
        </p>
      </div>

      {/* 1. System Account Directory & Security Status */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-3">
          <div className="flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-[#0c532b]" />
            <h3 className="text-sm font-extrabold text-gray-900">System Account Directory & Security</h3>
          </div>
          <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-100 self-start sm:self-auto">
            Bcrypt + JWT + RBAC Active
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Admin Account */}
          <div className="p-4 rounded-xl border border-blue-100 bg-blue-50/40 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-blue-600 text-white uppercase tracking-wider">
                Administrator
              </span>
              <span className="text-[11px] text-gray-500 font-medium">BG-ADMIN-001</span>
            </div>
            <div>
              <div className="text-xs font-bold text-gray-900">Brgy. Bugo Admin</div>
              <div className="text-[11px] text-gray-500">Barangay Administrator & Secretariat</div>
            </div>
            <div className="bg-white p-2.5 rounded-lg border border-gray-200 space-y-1 font-mono text-[11px]">
              <div className="flex items-center justify-between text-gray-700">
                <span>Email:</span>
                <span className="font-bold text-gray-900">admin@bugo.gov.ph</span>
              </div>
              <div className="flex items-center justify-between text-gray-700">
                <span>Access Scope:</span>
                <span className="font-bold text-[#0c532b]">Role-Based Admin (RBAC)</span>
              </div>
            </div>
            <button
              onClick={() => handleCopy('admin@bugo.gov.ph', 'admin-creds')}
              className="w-full py-1.5 bg-white border border-gray-200 hover:border-gray-300 text-gray-700 hover:text-gray-900 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1.5 transition"
            >
              {copiedKey === 'admin-creds' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedKey === 'admin-creds' ? 'Email Copied!' : 'Copy Admin Email'}
            </button>
          </div>

          {/* Resident Account */}
          <div className="p-4 rounded-xl border border-emerald-100 bg-emerald-50/40 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-[#0c532b] text-white uppercase tracking-wider">
                Resident (Verified)
              </span>
              <span className="text-[11px] text-gray-500 font-medium">BG-2026-04829</span>
            </div>
            <div>
              <div className="text-xs font-bold text-gray-900">Joshua Abella Laurio</div>
              <div className="text-[11px] text-gray-500">Zone 3 - Suntingcahon Valley, Bugo</div>
            </div>
            <div className="bg-white p-2.5 rounded-lg border border-gray-200 space-y-1 font-mono text-[11px]">
              <div className="flex items-center justify-between text-gray-700">
                <span>Email:</span>
                <span className="font-bold text-gray-900">resident@bugo.gov.ph</span>
              </div>
              <div className="flex items-center justify-between text-gray-700">
                <span>Access Scope:</span>
                <span className="font-bold text-[#0c532b]">Resident Self-Service (RBAC)</span>
              </div>
            </div>
            <button
              onClick={() => handleCopy('resident@bugo.gov.ph', 'res-creds')}
              className="w-full py-1.5 bg-white border border-gray-200 hover:border-gray-300 text-gray-700 hover:text-gray-900 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1.5 transition"
            >
              {copiedKey === 'res-creds' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedKey === 'res-creds' ? 'Email Copied!' : 'Copy Resident Email'}
            </button>
          </div>
        </div>
      </div>

      {/* 2. Change Password & Security Credentials */}
      <ChangePasswordSection />

      {/* 3. LGU Secretariat Details */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-xs space-y-4 text-xs">
        <h3 className="text-sm font-bold text-gray-900">Barangay Secretariat Details</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-bold text-gray-600 mb-1">LGU / Barangay Unit</label>
            <input 
              type="text" 
              readOnly 
              value="Barangay Bugo, Cagayan de Oro City"
              className="w-full bg-gray-100 border border-gray-200 rounded-xl px-3 py-2 text-gray-700 font-bold"
            />
          </div>
          <div>
            <label className="block font-bold text-gray-600 mb-1">Punong Barangay (Captain)</label>
            <input 
              type="text" 
              readOnly 
              value="Hon. Juan Dela Cruz"
              className="w-full bg-gray-100 border border-gray-200 rounded-xl px-3 py-2 text-gray-700 font-bold"
            />
          </div>
        </div>

        <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 flex items-center gap-3">
          <ShieldCheck className="w-5 h-5 text-[#0c532b] flex-shrink-0" />
          <p className="text-[11px] text-[#0c532b] font-medium">
            Barangay Citizen & Administrative Portal is encrypted with role-based access control. All status updates, SQL exports, and registrations are timestamped on audit logs.
          </p>
        </div>
      </div>
    </div>
  );
};


// ----------------------------------------------------
// 5. ADMIN PROGRAMS CATALOG & ADD PROGRAM VIEW
// ----------------------------------------------------
const PROGRAM_CATEGORIES: ProgramCategory[] = [
  'Social Welfare Services',
  'Health and Medical Services',
  'Livelihood and Employment Services',
  'Legal Services',
  'Community and Emergency Services',
];

const DISASTER_CATEGORIES: DisasterCategory[] = [
  'Flood',
  'Fire',
  'Landslide',
  'Earthquake',
  'Typhoon / Storm',
  'Other',
];

export const AdminProgramsView: React.FC = () => {
  const { programs, disasterVictims, residentsList, addProgram, deleteProgram } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [programTypeFilter, setProgramTypeFilter] = useState<'all' | 'regular' | 'disaster'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedProgramForVictims, setSelectedProgramForVictims] = useState<AssistanceProgram | null>(null);
  const [selectedProgramForResidents, setSelectedProgramForResidents] = useState<AssistanceProgram | null>(null);
  const [viewingProgram, setViewingProgram] = useState<AssistanceProgram | null>(null);
  const [programToDelete, setProgramToDelete] = useState<AssistanceProgram | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [modalMode, setModalMode] = useState<'regular' | 'disaster' | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const [form, setForm] = useState({
    title: '',
    category: 'Social Welfare Services' as ProgramCategory,
    tagline: '',
    description: '',
    targetAudience: 'All Bugo Residents',
    processingTime: '1 - 3 Business Days',
    maxBenefitAmount: '',
    status: 'Active' as 'Active' | 'Open' | 'Closed',
    requirementsText: '',
    eligibilityText: 'Resident of Barangay Bugo',
    autoEnrollVictims: true
  });

  const activeResidents = useMemo(() => {
    const seen = new Set<string>();
    return residentsList
      .filter(r => r.role === 'resident' && !r.isBanned)
      .filter(r => {
        const nameKey = (r.name || '').trim().toLowerCase();
        if (seen.has(r.id) || (nameKey && seen.has(nameKey))) return false;
        seen.add(r.id);
        if (nameKey) seen.add(nameKey);
        return true;
      });
  }, [residentsList]);

  const catalogPrograms = useMemo(
    () => programs.filter(p => !isBarangayServiceApplicationItem(p)),
    [programs]
  );
  const categories = Array.from(new Set(catalogPrograms.map(p => p.category)));

  const filteredPrograms = catalogPrograms.filter(p => {
    const q = searchTerm.trim().toLowerCase();
    const isDis = isDisasterProgram(p);
    const matchesType =
      programTypeFilter === 'all' ||
      (programTypeFilter === 'disaster' && isDis) ||
      (programTypeFilter === 'regular' && !isDis);
    const matchesSearch =
      !q ||
      p.title.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      (p.targetAudience || '').toLowerCase().includes(q);
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    return matchesType && matchesSearch && matchesCategory;
  });

  const openModal = (mode: 'regular' | 'disaster') => {
    setFeedback(null);
    setModalMode(mode);
    setForm({
      title: '',
      category: mode === 'disaster' ? 'Flood' : 'Social Welfare Services',
      tagline: '',
      description: '',
      targetAudience: mode === 'disaster' ? 'Affected Disaster Victims' : 'All Bugo Residents',
      processingTime: mode === 'disaster' ? 'Immediate / Emergency' : '1 - 3 Business Days',
      maxBenefitAmount: '',
      status: 'Active',
      requirementsText: '',
      eligibilityText: mode === 'disaster' ? 'Recorded Disaster Victim' : 'Resident of Barangay Bugo',
      autoEnrollVictims: mode === 'disaster'
    });
  };

  const handleCreateProgram = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalMode || !form.title.trim()) return;

    const isDisaster = modalMode === 'disaster';
    if (!isDisaster && !form.description.trim()) return;

    setIsSaving(true);
    const requirements = form.requirementsText
      .split(/\n|,/)
      .map(s => s.trim())
      .filter(Boolean);
    const eligibilityCriteria = form.eligibilityText
      .split(/\n|,/)
      .map(s => s.trim())
      .filter(Boolean);

    const resolvedDescription = isDisaster
      ? `${form.category} disaster assistance program.`
      : form.description.trim();

    const res = await addProgram({
      title: form.title.trim(),
      category: form.category,
      tagline: form.tagline.trim() || resolvedDescription.slice(0, 110),
      description: resolvedDescription,
      imageUrl: isDisaster
        ? '/assets/services/brgy_disaster_rescue_1794197713383.jpg'
        : '/assets/services/real_barangay_hall_1788172230992.jpg',
      status: isDisaster ? 'Active' : form.status,
      badgeText: isDisaster ? 'Disaster Program' : 'Barangay Program',
      deadline: 'Year-Round Service',
      targetAudience: isDisaster ? 'Affected Disaster Victims' : (form.targetAudience.trim() || 'All Bugo Residents'),
      processingTime: form.processingTime.trim() || '1 - 3 Business Days',
      maxBenefitAmount: isDisaster ? 'Disaster Assistance' : (form.maxBenefitAmount.trim() || 'Barangay Assistance'),
      requirements: isDisaster ? [] : requirements,
      eligibilityCriteria: eligibilityCriteria.length > 0 ? eligibilityCriteria : ['Resident of Barangay Bugo'],
      programType: modalMode,
      autoEnrollVictims: isDisaster ? true : false
    });

    setIsSaving(false);

    if (res.success && res.program) {
      setFeedback({
        type: 'success',
        message: `Added ${isDisaster ? 'disaster program' : 'program'} "${res.program.title}".`
      });
      setModalMode(null);
    } else {
      setFeedback({
        type: 'error',
        message: res.message || 'Could not add program. Please check your session and try again.'
      });
    }
  };

  if (selectedProgramForVictims) {
    return (
      <AdminDisasterVictimsView
        program={selectedProgramForVictims}
        onBack={() => setSelectedProgramForVictims(null)}
      />
    );
  }

  if (selectedProgramForResidents) {
    return (
      <AdminProgramQualifiedResidentsView
        program={selectedProgramForResidents}
        onBack={() => setSelectedProgramForResidents(null)}
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
            Programs & Disaster Aid
          </h1>
          <p className="text-xs text-gray-500 mt-0.5 tabular-nums">
            {catalogPrograms.length} programs · {disasterVictims.length} recorded victims
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => openModal('disaster')}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-lg transition whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Flame className="w-4 h-4" />
            <span>Add a Disaster Program</span>
          </button>
          <button
            type="button"
            onClick={() => openModal('regular')}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#0c532b] hover:bg-[#094222] text-white text-xs font-semibold rounded-lg transition whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Program</span>
          </button>
        </div>
      </div>

      {feedback && (
        <div
          className={`p-3 rounded-xl text-xs font-medium flex items-center justify-between gap-2 border ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-rose-50 border-rose-200 text-rose-900'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-gray-400 hover:text-gray-700 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Search & Filters */}
      <div className="bg-white rounded-xl p-3.5 border border-gray-200 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 flex-1">
          <div className="relative w-full sm:w-56">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search programs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs outline-none focus:bg-white focus:ring-2 focus:ring-[#0c532b]"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            aria-label="Filter by category"
            className="w-full sm:w-56 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-800 font-medium outline-none focus:bg-white focus:ring-2 focus:ring-[#0c532b] cursor-pointer"
          >
            <option value="All">All Categories ({catalogPrograms.length})</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-lg self-start lg:self-auto">
          <button
            type="button"
            onClick={() => setProgramTypeFilter('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition cursor-pointer ${
              programTypeFilter === 'all' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => setProgramTypeFilter('regular')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition cursor-pointer ${
              programTypeFilter === 'regular' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Programs
          </button>
          <button
            type="button"
            onClick={() => setProgramTypeFilter('disaster')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition cursor-pointer ${
              programTypeFilter === 'disaster' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Disaster
          </button>
        </div>
      </div>

      {/* Simple Programs Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {filteredPrograms.length === 0 ? (
          <div className="p-8 text-center text-xs text-gray-500">
            No programs match your search or selected filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-gray-50 text-gray-500 font-semibold text-[11px] border-b border-gray-200">
                <tr>
                  <th className="py-2.5 px-4">Program</th>
                  <th className="py-2.5 px-4">Type</th>
                  <th className="py-2.5 px-4">Status</th>
                  <th className="py-2.5 px-4 text-center">Eligible / Victims</th>
                  <th className="py-2.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredPrograms.map(prog => {
                  const isDis = isDisasterProgram(prog);
                  const victimCount = isDis
                    ? new Set(
                        disasterVictims
                          .filter(v => (v.enrolledProgramIds || []).includes(prog.id) && doesVictimQualifyForDisasterProgram(v.disasterType, prog))
                          .map(v => (v.residentId ? `id:${v.residentId}` : `name:${v.fullName.trim().toLowerCase()}`))
                      ).size
                    : 0;
                  const qualifiedCount = !isDis
                    ? activeResidents.filter(r => evaluateResidentForProgram(r, prog.id, prog.title, prog).isQualified).length
                    : 0;

                  return (
                    <tr key={prog.id} className="hover:bg-gray-50/70 transition">
                      <td className="py-3 px-4">
                        <p className="font-semibold text-gray-900">{prog.title}</p>
                        <p className="text-[11px] text-gray-500">{prog.category}</p>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded-md border text-[11px] font-bold ${
                            isDis
                              ? 'bg-amber-50 text-amber-800 border-amber-200'
                              : 'bg-emerald-50 text-[#0c532b] border-emerald-200'
                          }`}
                        >
                          {isDis ? 'Disaster' : 'Program'}
                        </span>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className={`font-semibold ${
                          prog.status === 'Closed' ? 'text-gray-400' : 'text-emerald-700'
                        }`}>
                          {prog.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center tabular-nums">
                        {isDis ? (
                          <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                            victimCount > 0 ? 'bg-amber-50 text-amber-800' : 'bg-gray-100 text-gray-500'
                          }`}>
                            {victimCount} {victimCount === 1 ? 'victim' : 'victims'}
                          </span>
                        ) : (
                          <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                            qualifiedCount > 0 ? 'bg-emerald-50 text-[#0c532b]' : 'bg-gray-100 text-gray-500'
                          }`}>
                            {qualifiedCount} qualified
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-2.5">
                          {isDis ? (
                            <button
                              type="button"
                              onClick={() => setSelectedProgramForVictims(prog)}
                              className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 rounded-lg text-xs font-bold cursor-pointer transition"
                            >
                              View Victims
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setSelectedProgramForResidents(prog)}
                              className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-[#0c532b] rounded-lg text-xs font-bold cursor-pointer transition"
                            >
                              View Residents
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => setViewingProgram(prog)}
                            className="text-xs font-semibold text-gray-600 hover:text-gray-900 hover:underline cursor-pointer"
                          >
                            Details
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setFeedback(null);
                              setProgramToDelete(prog);
                            }}
                            className="text-xs font-semibold text-rose-600 hover:text-rose-700 hover:underline cursor-pointer"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* View Program Details Modal */}
      {viewingProgram && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setViewingProgram(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-lg w-full p-6 border border-gray-200 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-gray-100">
              <div>
                <p className="text-[11px] font-medium text-gray-500">{viewingProgram.category}</p>
                <h2 className="text-base font-bold text-gray-900 mt-0.5">{viewingProgram.title}</h2>
              </div>
              <button
                type="button"
                onClick={() => setViewingProgram(null)}
                className="p-1 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-gray-700 leading-relaxed">{viewingProgram.description}</p>

              <div className="grid grid-cols-2 gap-3 pt-1 text-gray-600">
                <div>
                  <span className="text-[11px] text-gray-400 block">Target Audience</span>
                  <span className="font-semibold text-gray-900">{viewingProgram.targetAudience}</span>
                </div>
                <div>
                  <span className="text-[11px] text-gray-400 block">Processing Time</span>
                  <span className="font-semibold text-gray-900">{viewingProgram.processingTime}</span>
                </div>
                {viewingProgram.maxBenefitAmount && (
                  <div className="col-span-2">
                    <span className="text-[11px] text-gray-400 block">Benefit / Service Provided</span>
                    <span className="font-semibold text-gray-900">{viewingProgram.maxBenefitAmount}</span>
                  </div>
                )}
              </div>

              {viewingProgram.requirements?.length > 0 && (
                <div className="pt-2 border-t border-gray-100">
                  <span className="font-semibold text-gray-800 block mb-1">Requirements</span>
                  <ul className="list-disc list-inside text-gray-600 space-y-0.5">
                    {viewingProgram.requirements.map((req, idx) => (
                      <li key={idx}>{req}</li>
                    ))}
                  </ul>
                </div>
              )}

              {viewingProgram.eligibilityCriteria?.length > 0 && (
                <div className="pt-2 border-t border-gray-100">
                  <span className="font-semibold text-gray-800 block mb-1">Eligibility Criteria</span>
                  <ul className="list-disc list-inside text-gray-600 space-y-0.5">
                    {viewingProgram.eligibilityCriteria.map((crit, idx) => (
                      <li key={idx}>{crit}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => {
                  const target = viewingProgram;
                  setViewingProgram(null);
                  setFeedback(null);
                  setProgramToDelete(target);
                }}
                className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold rounded-lg transition flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Program</span>
              </button>
              <button
                type="button"
                onClick={() => setViewingProgram(null)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-lg transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Program Confirmation Modal */}
      {programToDelete && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => !isDeleting && setProgramToDelete(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-sm w-full p-6 border border-gray-200 shadow-2xl space-y-4 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-11 h-11 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">Delete Program?</h3>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                Are you sure you want to remove <span className="font-semibold text-gray-800">{programToDelete.title}</span> from the catalog?
              </p>
            </div>
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setProgramToDelete(null)}
                className="flex-1 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-lg transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={async () => {
                  setIsDeleting(true);
                  const deletedTitle = programToDelete.title;
                  const res = await deleteProgram(programToDelete.id);
                  setIsDeleting(false);
                  setProgramToDelete(null);
                  if (res.success) {
                    setFeedback({
                      type: 'success',
                      message: `Deleted "${deletedTitle}".`
                    });
                  } else {
                    setFeedback({
                      type: 'error',
                      message: res.message || 'Could not delete program.'
                    });
                  }
                }}
                className="flex-1 py-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-60 text-white text-xs font-semibold rounded-lg transition cursor-pointer"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Program / Add a Disaster Program Modal */}
      {modalMode && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setModalMode(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-lg w-full p-6 border border-gray-200 shadow-2xl space-y-4 my-8 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <h2 className="text-base font-bold text-gray-900">
                  {modalMode === 'disaster' ? 'Add a Disaster Program' : 'Add Program'}
                </h2>
                <p className="text-xs text-gray-500">
                  {modalMode === 'disaster'
                    ? 'For disaster relief victims managed under View Victims.'
                    : 'Qualified residents are matched automatically under View Residents.'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setModalMode(null)}
                className="p-1 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProgram} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Program Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder={modalMode === 'disaster' ? 'e.g. Flood Emergency Cash & Food Aid' : 'e.g. Senior Citizen Medical Grant'}
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-[#0c532b] outline-none"
                />
              </div>

              {modalMode === 'disaster' ? (
                <>
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Category</label>
                    <select
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value as ProgramCategory })}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-[#0c532b] outline-none"
                    >
                      {DISASTER_CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Eligibility Criteria (one per line)</label>
                    <textarea
                      rows={2}
                      value={form.eligibilityText}
                      onChange={(e) => setForm({ ...form, eligibilityText: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-[#0c532b] outline-none"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-gray-700 mb-1">Category</label>
                      <select
                        value={form.category}
                        onChange={(e) => setForm({ ...form, category: e.target.value as ProgramCategory })}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-[#0c532b] outline-none"
                      >
                        {PROGRAM_CATEGORIES.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold text-gray-700 mb-1">Status</label>
                      <select
                        value={form.status}
                        onChange={(e) => setForm({ ...form, status: e.target.value as 'Active' | 'Open' | 'Closed' })}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-[#0c532b] outline-none"
                      >
                        <option value="Active">Active</option>
                        <option value="Open">Open</option>
                        <option value="Closed">Closed</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">
                      Description <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      required
                      rows={2}
                      placeholder="Program description..."
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-[#0c532b] outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-gray-700 mb-1">Qualified Group</label>
                      <select
                        value={form.targetAudience}
                        onChange={(e) => setForm({ ...form, targetAudience: e.target.value })}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-[#0c532b] outline-none"
                      >
                        <option value="All Bugo Residents">All Bugo Residents</option>
                        <option value="Low-Income / Indigent (<= ₱10,000)">Low-Income / Indigent</option>
                        <option value="Senior Citizens (60+)">Senior Citizens (60+)</option>
                        <option value="Persons with Disability (PWD)">Persons with Disability (PWD)</option>
                        <option value="Solo Parents">Solo Parents</option>
                        <option value="Students">Students</option>
                        <option value="Unemployed / Jobseekers">Unemployed / Jobseekers</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold text-gray-700 mb-1">Benefit / Aid Provided</label>
                      <input
                        type="text"
                        placeholder="e.g. ₱5,000 Cash Aid or Relief Pack"
                        value={form.maxBenefitAmount}
                        onChange={(e) => setForm({ ...form, maxBenefitAmount: e.target.value })}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-[#0c532b] outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-gray-700 mb-1">Requirements (optional, one per line)</label>
                      <textarea
                        rows={2}
                        placeholder="Optional requirements..."
                        value={form.requirementsText}
                        onChange={(e) => setForm({ ...form, requirementsText: e.target.value })}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-[#0c532b] outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-gray-700 mb-1">Eligibility Criteria (one per line)</label>
                      <textarea
                        rows={2}
                        value={form.eligibilityText}
                        onChange={(e) => setForm({ ...form, eligibilityText: e.target.value })}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-[#0c532b] outline-none"
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalMode(null)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className={`px-4 py-2 disabled:opacity-60 text-white font-semibold rounded-lg transition cursor-pointer ${
                    modalMode === 'disaster'
                      ? 'bg-amber-600 hover:bg-amber-700'
                      : 'bg-[#0c532b] hover:bg-[#094222]'
                  }`}
                >
                  {isSaving ? 'Saving...' : modalMode === 'disaster' ? 'Save Disaster Program' : 'Save Program'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

