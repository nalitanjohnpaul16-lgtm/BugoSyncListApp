import React, { useState, useEffect } from 'react';
import {
  Users,
  FileCheck2,
  UserCheck,
  Megaphone,
  Plus,
  FileText,
  Droplet,
  Cross,
  Trophy,
  Clock,
  CheckCircle2,
  Eye,
  Sliders,
  RotateCcw,
  Save,
  X,
  BarChart3
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { BUGO_PUROKS } from '../../data/mockData';
import { CensusData } from '../../types';
import { parseMonthlyIncome } from '../../utils/eligibilityEngine';

interface AdminDashboardViewProps {
  onNavigateTab: (tab: 'dashboard' | 'residents' | 'status-tracking' | 'announcements' | 'settings') => void;
  onOpenNewResidentModal: () => void;
  onOpenNewAnnouncementModal?: () => void;
  onOpenClearanceModal: () => void;
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({
  onNavigateTab,
  onOpenNewResidentModal,
  onOpenClearanceModal
}) => {
  const {
    announcements,
    residentsList,
    applications,
    censusData,
    updateCensusData,
    resetCensusToBenchmark,
    setSelectedZoneForRegistry
  } = useApp();

  const [analyticsView, setAnalyticsView] = useState<'accounts' | 'census'>('accounts');
  const [selectedZone, setSelectedZone] = useState<string>('All');
  const [inspectedZone, setInspectedZone] = useState<string | null>(null);
  const [isAdjustCensusOpen, setIsAdjustCensusOpen] = useState(false);
  const [isDirectCensusAdjustMode, setIsDirectCensusAdjustMode] = useState(false);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);
  const [censusForm, setCensusForm] = useState<CensusData>(censusData);

  useEffect(() => {
    setCensusForm(censusData);
  }, [censusData]);

  // Real account metrics from database
  const totalRealAccounts = residentsList.length;
  const pendingRegistrationsCount = residentsList.filter(
    r => r.registrationStatus === 'Pending Approval' || r.pendingProfileUpdate?.status === 'Pending'
  ).length;
  const bannedAccountsCount = residentsList.filter(r => r.isBanned || r.registrationStatus === 'Banned').length;
  const registeredVotersCount = residentsList.filter(r => r.voterStatus === 'Registered').length;

  // Real Gender breakdown
  const femaleAccountsCount = residentsList.filter(r => (r.gender || '').toLowerCase() === 'female').length;
  const maleAccountsCount = residentsList.filter(r => (r.gender || '').toLowerCase() === 'male').length;
  const femalePct = totalRealAccounts > 0 ? ((femaleAccountsCount / totalRealAccounts) * 100).toFixed(1) : '0';
  const malePct = totalRealAccounts > 0 ? ((maleAccountsCount / totalRealAccounts) * 100).toFixed(1) : '0';

  // Age breakdown
  const realAgeBrackets = [
    { label: 'Youth & Minors (0-17)', count: residentsList.filter(r => (r.age || 0) < 18).length },
    { label: 'Young Adults (18-29)', count: residentsList.filter(r => (r.age || 0) >= 18 && (r.age || 0) <= 29).length },
    { label: 'Working Adults (30-59)', count: residentsList.filter(r => (r.age || 0) >= 30 && (r.age || 0) <= 59).length },
    { label: 'Senior Citizens (60+)', count: residentsList.filter(r => (r.age || 0) >= 60).length }
  ];

  // Income breakdown (mutually exclusive numeric ranges)
  const realIncomeBrackets = [
    {
      label: 'Below ₱5,000 (Indigent)',
      count: residentsList.filter(r => parseMonthlyIncome(r.householdIncome || '') < 5000).length
    },
    {
      label: '₱5,000 - ₱14,999 (Low Income)',
      count: residentsList.filter(r => {
        const inc = parseMonthlyIncome(r.householdIncome || '');
        return inc >= 5000 && inc < 15000;
      }).length
    },
    {
      label: '₱15,000 - ₱34,999 (Lower Middle)',
      count: residentsList.filter(r => {
        const inc = parseMonthlyIncome(r.householdIncome || '');
        return inc >= 15000 && inc < 35000;
      }).length
    },
    {
      label: '₱35,000+ (Middle & Above)',
      count: residentsList.filter(r => parseMonthlyIncome(r.householdIncome || '') >= 35000).length
    }
  ];

  const totalAnnouncementViews = announcements.reduce((sum, item) => sum + (item.viewsCount || 0), 0);
  const adoptionPercentage = censusData.totalHouseholds > 0
    ? ((totalRealAccounts / censusData.totalHouseholds) * 100).toFixed(2)
    : '0.00';

  const handlePurokPopulationChange = (index: number, newPop: number) => {
    const updated = [...censusForm.purokBreakdown];
    const oldPop = updated[index].population;
    const diff = newPop - oldPop;
    updated[index] = {
      ...updated[index],
      population: Math.max(0, newPop),
      households: Math.max(0, Math.round(newPop / 4))
    };

    const newTotalPop = Math.max(0, censusForm.totalPopulation + diff);
    setCensusForm({
      ...censusForm,
      totalPopulation: newTotalPop,
      totalHouseholds: Math.round(newTotalPop / 4),
      purokBreakdown: updated
    });
  };

  const handleQuickPurokStep = (index: number, step: number) => {
    const current = censusForm.purokBreakdown[index].population;
    handlePurokPopulationChange(index, Math.max(0, current + step));
  };

  const handleSaveCensus = () => {
    const updated = {
      ...censusForm,
      lastUpdated: new Date().toISOString().split('T')[0]
    };
    updateCensusData(updated);
    setSaveSuccessMessage('Census data updated successfully.');
    setTimeout(() => {
      setSaveSuccessMessage(null);
      setIsAdjustCensusOpen(false);
    }, 1500);
  };

  const handleApplyGrowthPreset = (pctIncrease: number) => {
    const factor = 1 + pctIncrease / 100;
    const newTotal = Math.round(censusData.totalPopulation * factor);
    const updatedPuroks = censusData.purokBreakdown.map(p => ({
      ...p,
      population: Math.round(p.population * factor),
      households: Math.round((p.population * factor) / 4)
    }));
    const newCensus: CensusData = {
      ...censusData,
      totalPopulation: newTotal,
      totalHouseholds: Math.round(newTotal / 4),
      registeredVoters: Math.round(censusData.registeredVoters * factor),
      seniorCitizens: Math.round(censusData.seniorCitizens * factor),
      workingAge: Math.round(censusData.workingAge * factor),
      minors: Math.round(censusData.minors * factor),
      purokBreakdown: updatedPuroks,
      lastUpdated: new Date().toISOString().split('T')[0]
    };
    setCensusForm(newCensus);
    updateCensusData(newCensus);
    setSaveSuccessMessage(`Applied ${pctIncrease > 0 ? '+' : ''}${pctIncrease}% adjustment (${newTotal.toLocaleString()} citizens).`);
    setTimeout(() => setSaveSuccessMessage(null), 2000);
  };

  const handleResetBenchmark = () => {
    resetCensusToBenchmark();
    setSaveSuccessMessage('Reset to PSA Official Benchmark (36,840 population).');
    setTimeout(() => {
      setSaveSuccessMessage(null);
      setIsAdjustCensusOpen(false);
    }, 1500);
  };

  // Selected zone summary for inline preview when user clicks a row
  const selectedZoneResidents = selectedZone === 'All'
    ? residentsList
    : residentsList.filter(r => r.purok === selectedZone);

  const selectedZoneApps = selectedZone === 'All'
    ? applications
    : applications.filter(
        a =>
          a.purok === selectedZone ||
          selectedZoneResidents.some(
            r => r.id === a.applicantId || r.name.toLowerCase().includes((a.applicantName || '').toLowerCase())
          )
      );

  return (
    <div className="space-y-5">
      {/* Top Action Bar */}
      <div className="flex flex-wrap items-center justify-end gap-2.5">
        <button
          type="button"
          onClick={onOpenClearanceModal}
          className="flex items-center gap-2 px-3.5 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-semibold rounded-lg transition cursor-pointer whitespace-nowrap"
        >
          <FileText className="w-4 h-4 text-amber-700" />
          <span>Issue Clearance</span>
        </button>

        <button
          type="button"
          onClick={onOpenNewResidentModal}
          className="flex items-center gap-2 px-3.5 py-2 bg-[#0c532b] hover:bg-[#094222] text-white text-xs font-semibold rounded-lg transition cursor-pointer whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          <span>Register Resident</span>
        </button>
      </div>

      {/* 4 Key Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Registered Accounts */}
        <div
          onClick={() => onNavigateTab('residents')}
          className="bg-white rounded-xl p-5 border border-gray-200 flex flex-col justify-between cursor-pointer hover:border-[#0c532b] transition"
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500">Registered Accounts</span>
              <Users className="w-4 h-4 text-[#0c532b]" />
            </div>
            <div className="mt-2.5 tabular-nums">
              <span className="text-3xl font-bold text-gray-900">{totalRealAccounts}</span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-end text-xs">
            <span className="text-[#0c532b] font-semibold">View Registry &rarr;</span>
          </div>
        </div>

        {/* Service Applications */}
        <div
          onClick={() => onNavigateTab('status-tracking')}
          className="bg-white rounded-xl p-5 border border-gray-200 flex flex-col justify-between cursor-pointer hover:border-[#0c532b] transition"
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500">Service Applications</span>
              <FileCheck2 className="w-4 h-4 text-blue-700" />
            </div>
            <div className="mt-2.5 tabular-nums">
              <span className="text-3xl font-bold text-gray-900">{applications.length}</span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-end text-xs">
            <span className="text-[#0c532b] font-semibold">Open Queue &rarr;</span>
          </div>
        </div>

        {/* Pending Approvals */}
        <div
          onClick={() => onNavigateTab('residents')}
          className={`rounded-xl p-5 border flex flex-col justify-between cursor-pointer transition ${
            pendingRegistrationsCount > 0
              ? 'bg-rose-50/70 border-rose-200 hover:border-rose-400'
              : 'bg-white border-gray-200 hover:border-gray-300'
          }`}
        >
          <div>
            <div className="flex items-center justify-between">
              <span className={`text-xs font-semibold ${pendingRegistrationsCount > 0 ? 'text-rose-700' : 'text-gray-500'}`}>
                Pending Approvals
              </span>
              <UserCheck className={`w-4 h-4 ${pendingRegistrationsCount > 0 ? 'text-rose-700' : 'text-gray-500'}`} />
            </div>
            <div className="mt-2.5 tabular-nums">
              <span className={`text-3xl font-bold ${pendingRegistrationsCount > 0 ? 'text-rose-900' : 'text-gray-900'}`}>
                {pendingRegistrationsCount}
              </span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-end text-xs">
            <span className="text-[#0c532b] font-semibold">Review &rarr;</span>
          </div>
        </div>

        {/* Announcements & Views */}
        <div
          onClick={() => onNavigateTab('announcements')}
          className="bg-white rounded-xl p-5 border border-gray-200 flex flex-col justify-between cursor-pointer hover:border-[#0c532b] transition"
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500">Announcements & Views</span>
              <Eye className="w-4 h-4 text-[#0c532b]" />
            </div>
            <div className="mt-2.5 tabular-nums">
              <span className="text-3xl font-bold text-gray-900">{totalAnnouncementViews.toLocaleString()}</span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-end text-xs">
            <span className="text-[#0c532b] font-semibold">Manage &rarr;</span>
          </div>
        </div>
      </div>

      {/* Unified Residence Analytics & Census Panel */}
      <div className="bg-white rounded-xl p-5 sm:p-6 border border-gray-200 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-100 gap-3">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-gray-900 tracking-tight flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-[#0c532b]" />
              <span>{analyticsView === 'accounts' ? 'Resident Overview' : 'Barangay Bugo Census'}</span>
            </h2>
            <p className="text-xs text-gray-500 mt-0.5 tabular-nums">
              {analyticsView === 'accounts'
                ? `${totalRealAccounts} total accounts · ${registeredVotersCount} registered voters · ${bannedAccountsCount} banned · ${adoptionPercentage}% household adoption`
                : `Community census benchmark: ${censusData.totalPopulation.toLocaleString()} residents across 10 zones`}
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <div className="flex items-center bg-gray-100 p-1 rounded-lg text-xs font-medium">
              <button
                type="button"
                onClick={() => setAnalyticsView('accounts')}
                className={`px-3 py-1.5 rounded-md transition cursor-pointer whitespace-nowrap ${
                  analyticsView === 'accounts' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Real Accounts ({totalRealAccounts})
              </button>
              <button
                type="button"
                onClick={() => setAnalyticsView('census')}
                className={`px-3 py-1.5 rounded-md transition cursor-pointer whitespace-nowrap ${
                  analyticsView === 'census' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Barangay Census
              </button>
            </div>

            {analyticsView === 'census' && (
              <button
                type="button"
                onClick={() => setIsAdjustCensusOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0c532b] text-white text-xs font-semibold rounded-lg hover:bg-[#094222] transition cursor-pointer whitespace-nowrap"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Adjust Census</span>
              </button>
            )}
          </div>
        </div>

        {/* VIEW 1: SIMPLE, NON-REDUNDANT REAL ACCOUNTS OVERVIEW */}
        {analyticsView === 'accounts' && (
          <div className="space-y-5">
            {/* Compact Gender, Age & Income Summary (No Nested Card Clutter) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Left: Gender & Age */}
              <div className="space-y-4 border border-gray-100 rounded-xl p-4 bg-gray-50/50">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-gray-800">Gender Distribution</span>
                    <span className="text-gray-500 tabular-nums">
                      Female {femaleAccountsCount} ({femalePct}%) · Male {maleAccountsCount} ({malePct}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden flex">
                    <div className="bg-rose-500 h-2" style={{ width: `${femalePct}%` }} />
                    <div className="bg-blue-600 h-2" style={{ width: `${malePct}%` }} />
                  </div>
                </div>

                <div className="pt-2 border-t border-gray-200/70 space-y-2">
                  <span className="text-xs font-semibold text-gray-800 block">Age Groups</span>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                    {realAgeBrackets.map(item => (
                      <div key={item.label} className="flex items-center justify-between">
                        <span className="text-gray-600 truncate pr-2">{item.label}</span>
                        <span className="font-semibold text-gray-900 tabular-nums">{item.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right: Income Breakdown */}
              <div className="space-y-2.5 border border-gray-100 rounded-xl p-4 bg-gray-50/50">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-gray-800">Household Income Brackets</span>
                  <span className="text-gray-500">Aid eligibility profile</span>
                </div>
                <div className="space-y-2 pt-1">
                  {realIncomeBrackets.map(item => {
                    const pct = totalRealAccounts > 0 ? Math.round((item.count / totalRealAccounts) * 100) : 0;
                    return (
                      <div key={item.label} className="space-y-1 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-700">{item.label}</span>
                          <span className="font-semibold text-gray-900 tabular-nums">{item.count} ({pct}%)</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                          <div className="bg-[#0c532b] h-1.5 rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Unified All Bugo Zones Comparative Matrix */}
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-gray-900">
                    All Bugo Zones Comparative Matrix
                  </h3>
                  <p className="text-[11px] text-gray-500 mt-0.5 tabular-nums">
                    {selectedZone === 'All'
                      ? `Showing all 10 zones · ${residentsList.length} accounts · ${announcements.length} announcements · ${totalAnnouncementViews} views`
                      : `${selectedZone}: ${selectedZoneResidents.length} accounts · ${selectedZoneApps.length} applications · ${announcements.length} announcements · ${totalAnnouncementViews} views`}
                  </p>
                </div>

                {selectedZone !== 'All' && (
                  <button
                    type="button"
                    onClick={() => setSelectedZone('All')}
                    className="text-xs font-semibold text-[#0c532b] hover:underline cursor-pointer"
                  >
                    Show All Zones
                  </button>
                )}
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-gray-50 text-gray-500 font-semibold text-[11px] border-b border-gray-200">
                    <tr>
                      <th className="py-2.5 px-3">Zone / Purok</th>
                      <th className="py-2.5 px-3 text-center">Accounts</th>
                      <th className="py-2.5 px-3 text-center">PWD</th>
                      <th className="py-2.5 px-3 text-center">Senior</th>
                      <th className="py-2.5 px-3 text-center">Solo Parent</th>
                      <th className="py-2.5 px-3 text-center">Student</th>
                      <th className="py-2.5 px-3 text-center">Youth</th>
                      <th className="py-2.5 px-3 text-center">Announcements</th>
                      <th className="py-2.5 px-3 text-center">Views</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 tabular-nums">
                    {BUGO_PUROKS.map(purokName => {
                      const resInZone = residentsList.filter(r => r.purok === purokName);
                      const pwds = resInZone.filter(r => r.isPwd).length;
                      const seniors = resInZone.filter(r => r.isSenior || (r.age || 0) >= 60).length;
                      const sps = resInZone.filter(r => r.isSoloParent).length;
                      const students = resInZone.filter(r => r.isStudent || r.employmentStatus === 'Student').length;
                      const youth = resInZone.filter(r => r.isTeenager || ((r.age || 0) >= 13 && (r.age || 0) <= 19)).length;
                      const isCurrent = selectedZone === purokName;

                      return (
                        <tr
                          key={purokName}
                          onClick={() => {
                            setSelectedZone(purokName);
                            setInspectedZone(purokName);
                          }}
                          className={`hover:bg-gray-50 transition cursor-pointer ${
                            isCurrent ? 'bg-emerald-50/70 font-semibold' : ''
                          }`}
                        >
                          <td className="py-2.5 px-3 font-medium text-gray-900">{purokName}</td>
                          <td className="py-2.5 px-3 text-center">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedZone(purokName);
                                setInspectedZone(purokName);
                              }}
                              className={`inline-flex items-center gap-1 font-semibold underline-offset-2 hover:underline cursor-pointer ${
                                resInZone.length > 0 ? 'text-[#0c532b]' : 'text-gray-400 hover:text-gray-700'
                              }`}
                            >
                              <span>{resInZone.length}</span>
                              <span className="text-[11px] font-medium">View</span>
                            </button>
                          </td>
                          <td className="py-2.5 px-3 text-center text-gray-700">{pwds}</td>
                          <td className="py-2.5 px-3 text-center text-gray-700">{seniors}</td>
                          <td className="py-2.5 px-3 text-center text-gray-700">{sps}</td>
                          <td className="py-2.5 px-3 text-center text-gray-700">{students}</td>
                          <td className="py-2.5 px-3 text-center text-gray-700">{youth}</td>
                          <td className="py-2.5 px-3 text-center text-gray-500">{announcements.length}</td>
                          <td className="py-2.5 px-3 text-center text-gray-500">{totalAnnouncementViews}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 2: BARANGAY CENSUS */}
        {analyticsView === 'census' && (
          <div className="space-y-4">
            {saveSuccessMessage && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{saveSuccessMessage}</span>
              </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 tabular-nums">
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl">
                <span className="text-xs text-gray-500">Total Population</span>
                <div className="text-xl font-bold text-gray-900 mt-0.5">{censusForm.totalPopulation.toLocaleString()}</div>
              </div>
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl">
                <span className="text-xs text-gray-500">Total Households</span>
                <div className="text-xl font-bold text-gray-900 mt-0.5">{censusForm.totalHouseholds.toLocaleString()}</div>
              </div>
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl">
                <span className="text-xs text-gray-500">Registered Voters</span>
                <div className="text-xl font-bold text-gray-900 mt-0.5">{censusForm.registeredVoters.toLocaleString()}</div>
              </div>
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl">
                <span className="text-xs text-gray-500">Senior Citizens (60+)</span>
                <div className="text-xl font-bold text-gray-900 mt-0.5">{censusForm.seniorCitizens.toLocaleString()}</div>
              </div>
            </div>

            <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 flex flex-wrap items-center justify-between gap-2 text-xs">
              <span className="font-semibold text-gray-700">Census Adjustments:</span>
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleResetBenchmark}
                  className="px-2.5 py-1 bg-white hover:bg-gray-100 text-gray-700 font-semibold rounded-lg border border-gray-200 transition cursor-pointer"
                >
                  PSA Benchmark (36,840)
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyGrowthPreset(2.5)}
                  className="px-2.5 py-1 bg-white hover:bg-gray-100 text-[#0c532b] font-semibold rounded-lg border border-gray-200 transition cursor-pointer"
                >
                  +2.5% Growth
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyGrowthPreset(-1.5)}
                  className="px-2.5 py-1 bg-white hover:bg-gray-100 text-rose-700 font-semibold rounded-lg border border-gray-200 transition cursor-pointer"
                >
                  -1.5% Audit
                </button>
                <button
                  type="button"
                  onClick={() => setIsDirectCensusAdjustMode(!isDirectCensusAdjustMode)}
                  className={`px-3 py-1 font-semibold rounded-lg transition cursor-pointer ${
                    isDirectCensusAdjustMode
                      ? 'bg-[#0c532b] text-white'
                      : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                  }`}
                >
                  {isDirectCensusAdjustMode ? 'Done Editing' : 'Edit Zones'}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 max-h-72 overflow-y-auto pr-1 tabular-nums">
              {censusForm.purokBreakdown.map((item, idx) => {
                const pct = censusForm.totalPopulation > 0
                  ? ((item.population / censusForm.totalPopulation) * 100).toFixed(1)
                  : '0';
                return (
                  <div key={item.purok} className="p-3 bg-gray-50 border border-gray-200 rounded-xl space-y-1.5">
                    <div className="flex justify-between items-center text-xs font-semibold text-gray-800">
                      <span className="truncate pr-2">{item.purok}</span>
                      {isDirectCensusAdjustMode ? (
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleQuickPurokStep(idx, -100)}
                            className="w-6 h-6 bg-white hover:bg-gray-200 text-gray-700 rounded border border-gray-300 font-bold text-xs flex items-center justify-center cursor-pointer"
                          >
                            -
                          </button>
                          <input
                            type="number"
                            value={item.population}
                            onChange={(e) => handlePurokPopulationChange(idx, parseInt(e.target.value, 10) || 0)}
                            className="w-20 px-2 py-0.5 text-xs border border-gray-300 rounded font-bold text-gray-900 text-center bg-white"
                          />
                          <button
                            type="button"
                            onClick={() => handleQuickPurokStep(idx, 100)}
                            className="w-6 h-6 bg-white hover:bg-gray-200 text-gray-700 rounded border border-gray-300 font-bold text-xs flex items-center justify-center cursor-pointer"
                          >
                            +
                          </button>
                        </div>
                      ) : (
                        <span className="text-[#0c532b] shrink-0">
                          {item.population.toLocaleString()} ({pct}%)
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-gray-500">
                      <span>{item.households.toLocaleString()} households</span>
                      <div className="w-32 bg-gray-200 rounded-full h-1.5 overflow-hidden">
                        <div className="bg-[#0c532b] h-1.5 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-3 border-t border-gray-100 flex flex-wrap items-center justify-between gap-2 text-xs">
              <span className="text-gray-400">Last updated: {censusForm.lastUpdated}</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleResetBenchmark}
                  className="text-gray-500 hover:text-gray-800 font-medium text-xs flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" /> Reset Benchmark
                </button>
                <button
                  type="button"
                  onClick={handleSaveCensus}
                  className="px-3.5 py-1.5 bg-[#0c532b] text-white font-semibold rounded-lg hover:bg-[#094222] transition text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Changes</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom 2-Column Row: Service Applications & Announcements */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Recent Service Applications */}
        <div className="lg:col-span-6 bg-white rounded-xl p-5 border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-sm sm:text-base font-bold text-gray-900">Recent Service Applications</h2>
              <p className="text-xs text-gray-500">Latest assistance requests</p>
            </div>
            <button
              type="button"
              onClick={() => onNavigateTab('status-tracking')}
              className="text-xs font-semibold text-[#0c532b] hover:underline cursor-pointer"
            >
              View All ({applications.length}) &rarr;
            </button>
          </div>

          <div className="divide-y divide-gray-100">
            {applications.length === 0 ? (
              <p className="text-xs text-gray-400 py-6 text-center">No service applications filed yet.</p>
            ) : (
              applications.slice(0, 3).map(app => (
                <div key={app.id} className="py-3 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="text-xs font-semibold text-gray-900 truncate">{app.programTitle}</h3>
                    <p className="text-[11px] text-gray-500 truncate mt-0.5">
                      {app.applicantName} · {app.purok}
                    </p>
                    <p className="text-[11px] text-gray-400 mt-0.5 tabular-nums flex items-center gap-1.5">
                      <span>{app.referenceCode}</span>
                      <span>·</span>
                      <span className="inline-flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {app.submissionDate}
                      </span>
                    </p>
                  </div>
                  <span className="text-[11px] font-semibold text-gray-700 shrink-0">{app.status}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Announcements & Views */}
        <div className="lg:col-span-6 bg-white rounded-xl p-5 border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-sm sm:text-base font-bold text-gray-900">Announcements & Views</h2>
              <p className="text-xs text-gray-500 tabular-nums">
                {announcements.length} active · {totalAnnouncementViews} total views
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigateTab('announcements')}
              className="text-xs font-semibold text-[#0c532b] hover:underline cursor-pointer"
            >
              View All ({announcements.length}) &rarr;
            </button>
          </div>

          <div className="divide-y divide-gray-100">
            {announcements.length === 0 ? (
              <p className="text-xs text-gray-400 py-6 text-center">No announcements published yet.</p>
            ) : (
              announcements.slice(0, 3).map(item => (
                <div key={item.id} className="py-3 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#0c532b] flex items-center justify-center shrink-0">
                    {item.iconType === 'water' && <Droplet className="w-4 h-4" />}
                    {item.iconType === 'medical' && <Cross className="w-4 h-4" />}
                    {item.iconType === 'sports' && <Trophy className="w-4 h-4" />}
                    {item.iconType === 'general' && <Megaphone className="w-4 h-4" />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-xs font-semibold text-gray-900 truncate">{item.title}</h3>
                      <span className="text-[11px] text-gray-500 tabular-nums shrink-0">
                        {item.viewsCount || 0} views · {item.date}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-500 line-clamp-2 mt-0.5">{item.description}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* ADJUST CENSUS MODAL */}
      {isAdjustCensusOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl border border-gray-200 flex flex-col max-h-[90vh]">
            <div className="p-5 bg-[#0c532b] text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-emerald-200" />
                  <span>Adjust Barangay Bugo Census Figures</span>
                </h3>
                <p className="text-xs text-emerald-100 mt-0.5">
                  Persistent community census benchmark across sessions.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAdjustCensusOpen(false)}
                className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {saveSuccessMessage && (
              <div className="p-3 bg-emerald-50 border-b border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{saveSuccessMessage}</span>
              </div>
            )}

            <div className="p-5 overflow-y-auto space-y-5 flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Total Population</label>
                  <input
                    type="number"
                    value={censusForm.totalPopulation}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10) || 0;
                      setCensusForm({
                        ...censusForm,
                        totalPopulation: val,
                        totalHouseholds: Math.round(val / 4)
                      });
                    }}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0c532b]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Total Households</label>
                  <input
                    type="number"
                    value={censusForm.totalHouseholds}
                    onChange={(e) => setCensusForm({ ...censusForm, totalHouseholds: parseInt(e.target.value, 10) || 0 })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0c532b]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Registered Voters</label>
                  <input
                    type="number"
                    value={censusForm.registeredVoters}
                    onChange={(e) => setCensusForm({ ...censusForm, registeredVoters: parseInt(e.target.value, 10) || 0 })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0c532b]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Senior Citizens (60+)</label>
                  <input
                    type="number"
                    value={censusForm.seniorCitizens}
                    onChange={(e) => setCensusForm({ ...censusForm, seniorCitizens: parseInt(e.target.value, 10) || 0 })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0c532b]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Minors (0 - 17)</label>
                  <input
                    type="number"
                    value={censusForm.minors}
                    onChange={(e) => setCensusForm({ ...censusForm, minors: parseInt(e.target.value, 10) || 0 })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0c532b]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Working Age (18 - 59)</label>
                  <input
                    type="number"
                    value={censusForm.workingAge}
                    onChange={(e) => setCensusForm({ ...censusForm, workingAge: parseInt(e.target.value, 10) || 0 })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0c532b]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-800 mb-2">
                  Adjust Population by Zone / Purok
                </label>
                <div className="space-y-2 max-h-52 overflow-y-auto border border-gray-200 rounded-xl p-3 bg-gray-50/50">
                  {censusForm.purokBreakdown.map((item, idx) => (
                    <div key={item.purok} className="flex items-center justify-between gap-3 bg-white p-2.5 rounded-lg border border-gray-200 text-xs">
                      <span className="font-medium text-gray-700 truncate flex-1">{item.purok}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-gray-400">Pop:</span>
                        <input
                          type="number"
                          value={item.population}
                          onChange={(e) => handlePurokPopulationChange(idx, parseInt(e.target.value, 10) || 0)}
                          className="w-24 px-2 py-1 text-xs border border-gray-300 rounded font-semibold text-gray-900"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
              <button
                type="button"
                onClick={handleResetBenchmark}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-gray-600 hover:text-gray-900 transition cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset to Benchmark</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsAdjustCensusOpen(false)}
                  className="px-4 py-2 border border-gray-300 text-xs font-semibold text-gray-700 rounded-lg hover:bg-gray-100 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveCensus}
                  className="flex items-center gap-1.5 px-4 py-2 bg-[#0c532b] text-white text-xs font-semibold rounded-lg hover:bg-[#094222] transition cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Changes</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ZONE RESIDENTS INFORMATION MODAL */}
      {inspectedZone && (() => {
        const zoneResidents = residentsList.filter(r => r.purok === inspectedZone);
        return (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs"
            onClick={() => setInspectedZone(null)}
          >
            <div
              className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl border border-gray-200 flex flex-col max-h-[85vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-5 py-4 border-b border-gray-100 flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold text-gray-900">{inspectedZone}</h3>
                  <p className="text-xs text-gray-500 mt-0.5 tabular-nums">
                    {zoneResidents.length} registered account{zoneResidents.length === 1 ? '' : 's'} in this area
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setInspectedZone(null)}
                  className="p-1 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100 cursor-pointer"
                  aria-label="Close zone residents modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-5 overflow-y-auto divide-y divide-gray-100 flex-1 text-xs">
                {zoneResidents.length === 0 ? (
                  <p className="py-8 text-center text-gray-500">
                    No registered accounts are currently listed in {inspectedZone}.
                  </p>
                ) : (
                  zoneResidents.map(res => (
                    <div key={res.id} className="py-3.5 first:pt-0 last:pb-0 space-y-1.5">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <span className="text-sm font-semibold text-gray-900">{res.name}</span>
                          <span className="text-gray-500 ml-2 tabular-nums">{res.residentIdNumber || 'No ID'}</span>
                        </div>
                        <span className={`font-semibold ${
                          res.isBanned
                            ? 'text-rose-700'
                            : res.isVerified
                            ? 'text-emerald-700'
                            : 'text-amber-700'
                        }`}>
                          {res.registrationStatus || (res.isVerified ? 'Verified' : 'Pending Approval')}
                        </span>
                      </div>
                      <p className="text-gray-600">
                        {res.address || inspectedZone}
                      </p>
                      <p className="text-gray-500 tabular-nums">
                        {res.contactNumber || 'No contact'} · {res.email || 'No email'}
                        {res.occupation ? ` · ${res.occupation}` : ''}
                        {res.householdIncome ? ` · ${res.householdIncome.split('(')[0].trim()}` : ''}
                        {typeof res.familyMembersCount === 'number' ? ` · ${res.familyMembersCount} in household` : ''}
                      </p>
                    </div>
                  ))
                )}
              </div>

              <div className="px-5 py-3.5 bg-gray-50 border-t border-gray-100 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedZoneForRegistry(inspectedZone);
                    setInspectedZone(null);
                    onNavigateTab('residents');
                  }}
                  className="text-xs font-semibold text-[#0c532b] hover:underline cursor-pointer"
                >
                  Manage in Residents &rarr;
                </button>
                <button
                  type="button"
                  onClick={() => setInspectedZone(null)}
                  className="px-4 py-1.5 bg-white hover:bg-gray-100 border border-gray-200 text-gray-700 text-xs font-semibold rounded-lg transition cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};
