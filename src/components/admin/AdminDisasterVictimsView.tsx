import React, { useMemo, useState } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  Download,
  Edit3,
  Flame,
  Plus,
  Search,
  Trash2,
  Upload,
  X
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { BUGO_PUROKS } from '../../data/mockData';
import { parseCsvText } from '../../utils/csvParser';
import { doesVictimQualifyForDisasterProgram } from '../../utils/eligibilityEngine';
import {
  AssistanceProgram,
  DamageSeverity,
  DisasterCategory,
  DisasterVictimRecord,
  VictimSelectionStatus
} from '../../types';

const DISASTER_TYPES: DisasterCategory[] = [
  'Fire',
  'Flood',
  'Landslide',
  'Earthquake',
  'Typhoon / Storm',
  'Other'
];

const DAMAGE_LEVELS: DamageSeverity[] = ['Minor', 'Moderate', 'Severe', 'Total Loss'];
const SELECTION_STATUSES: VictimSelectionStatus[] = ['Waitlisted', 'Selected', 'Distributed'];

const STATUS_BADGE: Record<VictimSelectionStatus, string> = {
  Waitlisted: 'bg-amber-50 text-amber-800 border-amber-200',
  Selected: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  Distributed: 'bg-blue-50 text-blue-800 border-blue-200'
};

interface AdminDisasterVictimsViewProps {
  program?: AssistanceProgram;
  onBack?: () => void;
}

export const AdminDisasterVictimsView: React.FC<AdminDisasterVictimsViewProps> = ({
  program,
  onBack
}) => {
  const {
    disasterVictims,
    residentsList,
    hazardZones,
    programs,
    role,
    addDisasterVictim,
    updateDisasterVictim,
    deleteDisasterVictim,
    downloadExportedRecords,
    importRecords
  } = useApp();

  const isAdmin = role === 'admin';

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | VictimSelectionStatus>('All');
  const [actionMsg, setActionMsg] = useState('');

  // Add / Edit Victim Modal
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingVictim, setEditingVictim] = useState<DisasterVictimRecord | null>(null);
  const [formError, setFormError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [residentSearch, setResidentSearch] = useState('');
  const [proneZoneFilter, setProneZoneFilter] = useState<string>('All');

  const [form, setForm] = useState({
    residentId: '',
    disasterType: 'Flood' as DisasterCategory,
    incidentDate: new Date().toISOString().split('T')[0],
    damageLevel: 'Moderate' as DamageSeverity,
    selectionStatus: 'Waitlisted' as VictimSelectionStatus
  });

  // Scoped Import Modal (Admin Only)
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [importMode, setImportMode] = useState<'merge' | 'replace'>('merge');
  const [importRows, setImportRows] = useState<any[]>([]);
  const [importFileName, setImportFileName] = useState('');
  const [importMsg, setImportMsg] = useState('');
  const [isImporting, setIsImporting] = useState(false);

  const lockedDisasterCategory: DisasterCategory | null =
    program && DISASTER_TYPES.includes(program.category as DisasterCategory)
      ? (program.category as DisasterCategory)
      : null;

  const selectableResidents = useMemo(() => {
    const seen = new Set<string>();
    return residentsList
      .filter(r => r.role === 'resident' && !r.isBanned && r.registrationStatus !== 'Rejected')
      .sort((a, b) => a.name.localeCompare(b.name))
      .filter(r => {
        const key = `${r.id}::${r.name.trim().toLowerCase()}`;
        const nameKey = r.name.trim().toLowerCase();
        if (seen.has(key) || seen.has(nameKey)) return false;
        seen.add(key);
        seen.add(nameKey);
        return true;
      });
  }, [residentsList]);

  // Build prone-zone options matching the chosen disaster type first
  const proneZoneOptions = useMemo(() => {
    const matchingHazards = hazardZones.filter(
      z => form.disasterType === 'Other' || z.disasterType === form.disasterType
    );
    const seen = new Set<string>();
    const options: Array<{ purok: string; label: string; isProne: boolean }> = [];

    matchingHazards.forEach(hz => {
      if (!seen.has(hz.purok)) {
        seen.add(hz.purok);
        options.push({
          purok: hz.purok,
          label: `${hz.purok.split(' - ')[0]} — ${hz.disasterType} Prone (${hz.riskLevel})`,
          isProne: true
        });
      }
    });

    BUGO_PUROKS.forEach(p => {
      if (!seen.has(p)) {
        seen.add(p);
        options.push({
          purok: p,
          label: p,
          isProne: false
        });
      }
    });

    return options;
  }, [hazardZones, form.disasterType]);

  const alreadyRecordedKeys = useMemo(() => {
    const ids = new Set<string>();
    const names = new Set<string>();
    disasterVictims.forEach(v => {
      const relevant = program
        ? (v.enrolledProgramIds || []).includes(program.id) && doesVictimQualifyForDisasterProgram(v.disasterType, program)
        : String(v.disasterType || '').trim().toLowerCase() === String(form.disasterType || '').trim().toLowerCase();
      if (!relevant) return;
      if (v.residentId) ids.add(v.residentId);
      if (v.fullName) names.add(v.fullName.trim().toLowerCase());
    });
    return { ids, names };
  }, [disasterVictims, program, form.disasterType]);

  // Filter residents in the modal by prone zone + search bar (excluding duplicates already listed)
  const modalFilteredResidents = useMemo(() => {
    const q = residentSearch.trim().toLowerCase();
    return selectableResidents.filter(r => {
      if (alreadyRecordedKeys.ids.has(r.id) || alreadyRecordedKeys.names.has(r.name.trim().toLowerCase())) {
        return false;
      }
      const zoneOk = proneZoneFilter === 'All' || r.purok === proneZoneFilter;
      const searchOk =
        !q ||
        r.name.toLowerCase().includes(q) ||
        r.purok.toLowerCase().includes(q) ||
        (r.residentIdNumber || '').toLowerCase().includes(q);
      return zoneOk && searchOk;
    });
  }, [selectableResidents, alreadyRecordedKeys, proneZoneFilter, residentSearch]);

  const selectedResident = useMemo(
    () => selectableResidents.find(r => r.id === form.residentId) || null,
    [selectableResidents, form.residentId]
  );

  // Victims scoped to this program (qualified by disaster category and deduplicated by resident)
  const programVictims = useMemo(() => {
    let base = program
      ? disasterVictims.filter(
          v => (v.enrolledProgramIds || []).includes(program.id) && doesVictimQualifyForDisasterProgram(v.disasterType, program)
        )
      : disasterVictims;

    base = [...base].sort((a, b) => (b.recordedAt || '').localeCompare(a.recordedAt || ''));

    if (program) {
      const seenKeys = new Set<string>();
      base = base.filter(v => {
        const key = v.residentId ? `id:${v.residentId}` : `name:${v.fullName.trim().toLowerCase()}`;
        if (seenKeys.has(key)) return false;
        seenKeys.add(key);
        return true;
      });
    }

    const q = search.trim().toLowerCase();
    return base
      .filter(v => statusFilter === 'All' || v.selectionStatus === statusFilter)
      .filter(v => {
        if (!q) return true;
        return (
          v.fullName.toLowerCase().includes(q) ||
          v.purok.toLowerCase().includes(q) ||
          v.disasterType.toLowerCase().includes(q) ||
          v.victimCode.toLowerCase().includes(q)
        );
      });
  }, [disasterVictims, program, search, statusFilter]);

  const adminAutoPrograms = useMemo(() => {
    return programs.filter(
      p => p.status !== 'Closed' && (p.programType === 'disaster' || (p.programType !== 'regular' && p.autoEnrollVictims === true))
    );
  }, [programs]);

  const openCreateModal = () => {
    setEditingVictim(null);
    setFormError('');
    setResidentSearch('');
    setProneZoneFilter('All');
    setForm({
      residentId: '',
      disasterType: lockedDisasterCategory || 'Flood',
      incidentDate: new Date().toISOString().split('T')[0],
      damageLevel: 'Moderate',
      selectionStatus: 'Waitlisted'
    });
    setIsFormOpen(true);
  };

  const openEditModal = (v: DisasterVictimRecord) => {
    setEditingVictim(v);
    setFormError('');
    setForm({
      residentId: v.residentId || '',
      disasterType: v.disasterType,
      incidentDate: v.incidentDate,
      damageLevel: v.damageLevel,
      selectionStatus: v.selectionStatus
    });
    setIsFormOpen(true);
  };

  const handleSaveVictim = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingVictim && !form.residentId) {
      setFormError('Select a resident first.');
      return;
    }

    const activeDisasterType = lockedDisasterCategory && !editingVictim ? lockedDisasterCategory : form.disasterType;

    setIsSaving(true);
    setFormError('');

    const qualifyingAutoIds = adminAutoPrograms
      .filter(p => doesVictimQualifyForDisasterProgram(activeDisasterType, p))
      .map(p => p.id);

    const enrolledIds = Array.from(
      new Set([
        ...(program && doesVictimQualifyForDisasterProgram(activeDisasterType, program) ? [program.id] : []),
        ...qualifyingAutoIds
      ])
    );

    const res = editingVictim
      ? await updateDisasterVictim(editingVictim.id, {
          disasterType: form.disasterType,
          incidentDate: form.incidentDate,
          damageLevel: form.damageLevel,
          selectionStatus: form.selectionStatus
        })
      : await addDisasterVictim({
          residentId: form.residentId,
          disasterType: activeDisasterType,
          incidentDate: form.incidentDate,
          damageLevel: form.damageLevel,
          enrolledProgramIds: enrolledIds
        });

    setIsSaving(false);
    if (!res.success) {
      setFormError(res.message || 'Unable to save record.');
      return;
    }
    setIsFormOpen(false);
  };

  const handleExport = async (format: 'csv' | 'json') => {
    if (!isAdmin) return;
    setActionMsg('');
    const res = await downloadExportedRecords('victims', format, program?.id);
    setActionMsg(res.success ? `Exported ${format.toUpperCase()}.` : res.message || 'Export failed.');
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportFileName(file.name);
    setImportMsg('');

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const text = String(reader.result || '');
        if (file.name.toLowerCase().endsWith('.json')) {
          const parsed = JSON.parse(text);
          const list = Array.isArray(parsed)
            ? parsed
            : Array.isArray(parsed.records)
              ? parsed.records
              : Array.isArray(parsed.victims)
                ? parsed.victims
                : [];
          setImportRows(list);
          if (list.length === 0) setImportMsg('No victim rows found in JSON.');
        } else {
          const rows = parseCsvText(text);
          setImportRows(rows);
          if (rows.length === 0) setImportMsg('No data rows found in CSV.');
        }
      } catch {
        setImportRows([]);
        setImportMsg('Invalid CSV or JSON file.');
      }
    };
    reader.readAsText(file);
  };

  const handleConfirmImport = async () => {
    if (!isAdmin || importRows.length === 0) return;
    setIsImporting(true);
    setImportMsg('');
    const res = await importRecords('victims', importMode, importRows, program?.id);
    setIsImporting(false);
    if (!res.success) {
      setImportMsg(res.message || 'Import failed.');
      return;
    }
    setIsImportOpen(false);
    setImportRows([]);
    setImportFileName('');
    setActionMsg(`Imported ${res.importedCount} victim records.`);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-start gap-2.5">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="mt-0.5 p-2 bg-white hover:bg-gray-100 border border-gray-200 rounded-xl text-gray-700 cursor-pointer transition"
              title="Back to Programs"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">
              {program ? program.title : 'Disaster Victims'}
            </h1>
            <p className="text-xs text-gray-500 mt-0.5 tabular-nums">
              {programVictims.length} recorded {programVictims.length === 1 ? 'victim' : 'victims'}
            </p>
          </div>
        </div>

        {isAdmin && (
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => handleExport('csv')}
              className="px-3 py-2 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-emerald-700" />
              <span>Export CSV</span>
            </button>
            <button
              type="button"
              onClick={() => handleExport('json')}
              className="px-3 py-2 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-blue-700" />
              <span>Export JSON</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setImportRows([]);
                setImportFileName('');
                setImportMsg('');
                setIsImportOpen(true);
              }}
              className="px-3 py-2 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5 text-gray-700" />
              <span>Import</span>
            </button>
            <button
              type="button"
              onClick={openCreateModal}
              className="px-3.5 py-2 bg-[#0c532b] hover:bg-[#094222] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Victim</span>
            </button>
          </div>
        )}
      </div>

      {actionMsg && (
        <div className="px-3.5 py-2 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-800 flex items-center justify-between">
          <span>{actionMsg}</span>
          <button type="button" onClick={() => setActionMsg('')} className="text-emerald-600 cursor-pointer">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Search & Status Filter */}
      <div className="bg-white rounded-2xl border border-gray-200 p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search victim name, zone, or disaster..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#0c532b]"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold outline-none"
        >
          <option value="All">All Status</option>
          <option value="Waitlisted">Waitlisted</option>
          <option value="Selected">Selected</option>
          <option value="Distributed">Distributed</option>
        </select>
      </div>

      {/* Victims Table */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-2xs">
        {programVictims.length === 0 ? (
          <div className="py-12 text-center px-4">
            <Flame className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm font-bold text-gray-700">No victims recorded</p>
            <p className="text-xs text-gray-400 mt-1">
              Click "Add Victim" to select an affected resident.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-[11px] font-bold text-gray-500 uppercase">
                  <th className="py-3 px-4">Resident</th>
                  <th className="py-3 px-4">Zone & Contact</th>
                  <th className="py-3 px-4">Disaster</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {programVictims.map((v) => {
                  const linkedResident = residentsList.find(
                    r => r.id === v.residentId || r.name.toLowerCase() === v.fullName.toLowerCase()
                  );
                  const displayZone = (linkedResident?.purok || v.purok || '').split(' - ')[0];
                  const displayContact = linkedResident?.contactNumber || v.contactNumber;

                  return (
                    <tr key={v.id} className="hover:bg-gray-50/70">
                      <td className="py-3 px-4">
                        <p className="font-bold text-gray-900">{linkedResident?.name || v.fullName}</p>
                        <p className="text-[11px] text-gray-500">
                          {linkedResident?.residentIdNumber || v.victimCode}
                          {v.vulnerabilityTags?.length > 0 ? ` • ${v.vulnerabilityTags.join(', ')}` : ''}
                        </p>
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-semibold text-gray-800">{displayZone}</p>
                        <p className="text-[11px] text-gray-500">{displayContact}</p>
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-bold text-gray-800">{v.disasterType}</p>
                        <p className="text-[11px] text-gray-500">
                          {v.damageLevel} • {v.incidentDate}
                        </p>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-md border text-[11px] font-bold ${STATUS_BADGE[v.selectionStatus]}`}>
                          {v.selectionStatus}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-1">
                          {v.selectionStatus !== 'Distributed' && (
                            <button
                              type="button"
                              onClick={() => updateDisasterVictim(v.id, { selectionStatus: 'Distributed' })}
                              className="p-1.5 text-blue-700 hover:bg-blue-50 rounded-lg cursor-pointer"
                              title="Mark Distributed"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => openEditModal(v)}
                            className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-lg cursor-pointer"
                            title="Edit"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteDisasterVictim(v.id)}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
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

      {/* Add / Edit Victim Modal */}
      {isFormOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/45 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setIsFormOpen(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-md w-full p-5 border border-gray-200 shadow-2xl space-y-3.5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2.5 border-b border-gray-100">
              <div>
                <h2 className="text-base font-extrabold text-gray-900">
                  {editingVictim ? 'Edit Victim' : 'Add Victim'}
                </h2>
                {program && <p className="text-[11px] text-gray-500">{program.title}</p>}
              </div>
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="text-gray-400 hover:text-gray-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-semibold">
                {formError}
              </div>
            )}

            <form onSubmit={handleSaveVictim} className="space-y-3 text-xs">
              {/* Disaster & Prone Zone */}
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Disaster</label>
                  <select
                    value={lockedDisasterCategory && !editingVictim ? lockedDisasterCategory : form.disasterType}
                    disabled={Boolean(lockedDisasterCategory && !editingVictim)}
                    onChange={(e) => setForm({ ...form, disasterType: e.target.value as DisasterCategory })}
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-2.5 py-2 font-semibold outline-none focus:ring-2 focus:ring-[#0c532b] disabled:opacity-75 disabled:cursor-not-allowed"
                  >
                    {DISASTER_TYPES.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                {!editingVictim ? (
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Prone Zone</label>
                    <select
                      value={proneZoneFilter}
                      onChange={(e) => {
                        setProneZoneFilter(e.target.value);
                        setForm(prev => ({ ...prev, residentId: '' }));
                      }}
                      className="w-full bg-gray-50 border border-gray-300 rounded-xl px-2.5 py-2 font-semibold outline-none focus:ring-2 focus:ring-[#0c532b]"
                    >
                      <option value="All">All Zones</option>
                      {proneZoneOptions.map(opt => (
                        <option key={opt.purok} value={opt.purok}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Damage</label>
                    <select
                      value={form.damageLevel}
                      onChange={(e) => setForm({ ...form, damageLevel: e.target.value as DamageSeverity })}
                      className="w-full bg-gray-50 border border-gray-300 rounded-xl px-2.5 py-2 font-semibold outline-none focus:ring-2 focus:ring-[#0c532b]"
                    >
                      {DAMAGE_LEVELS.map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Resident Selector with Search Bar (existing profile data) */}
              {editingVictim ? (
                <div className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5">
                  <p className="font-bold text-gray-900 text-sm">{editingVictim.fullName}</p>
                  <p className="text-[11px] text-gray-500">
                    {editingVictim.purok.split(' - ')[0]} • {editingVictim.contactNumber}
                  </p>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-gray-700">Select Resident *</label>
                    {proneZoneFilter !== 'All' && (
                      <button
                        type="button"
                        onClick={() => setProneZoneFilter('All')}
                        className="text-[11px] font-semibold text-[#0c532b] hover:underline cursor-pointer"
                      >
                        Show all zones
                      </button>
                    )}
                  </div>

                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={residentSearch}
                      onChange={(e) => setResidentSearch(e.target.value)}
                      placeholder="Search resident name..."
                      className="w-full pl-8 pr-3 py-2 bg-gray-50 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-[#0c532b]"
                    />
                  </div>

                  <div className="max-h-36 overflow-y-auto border border-gray-200 rounded-xl divide-y divide-gray-100 bg-white">
                    {modalFilteredResidents.length === 0 ? (
                      <p className="py-4 text-center text-[11px] text-gray-400">
                        {selectableResidents.length > 0 && !residentSearch.trim() && proneZoneFilter === 'All'
                          ? 'All residents are already added.'
                          : 'No matching residents found.'}
                      </p>
                    ) : (
                      modalFilteredResidents.map(r => {
                        const active = form.residentId === r.id;
                        return (
                          <button
                            key={r.id}
                            type="button"
                            onClick={() => setForm({ ...form, residentId: r.id })}
                            className={`w-full text-left px-3 py-2 flex items-center justify-between gap-2 cursor-pointer transition ${
                              active ? 'bg-emerald-50 text-emerald-950' : 'hover:bg-gray-50'
                            }`}
                          >
                            <span className="font-bold text-gray-900 truncate">{r.name}</span>
                            <span className="text-[11px] text-gray-500 shrink-0">
                              {r.purok.split(' - ')[0]}
                            </span>
                          </button>
                        );
                      })
                    )}
                  </div>

                  {selectedResident && (
                    <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl px-3 py-2 text-[11px] text-emerald-900">
                      <span className="font-bold">{selectedResident.name}</span>
                      {' • '}
                      {selectedResident.purok.split(' - ')[0]}
                      {' • '}
                      {selectedResident.contactNumber}
                      {selectedResident.familyMembersCount ? ` • Household of ${selectedResident.familyMembersCount}` : ''}
                    </div>
                  )}
                </div>
              )}

              {/* Damage / Date / Status */}
              <div className="grid grid-cols-2 gap-2.5">
                {!editingVictim && (
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Damage</label>
                    <select
                      value={form.damageLevel}
                      onChange={(e) => setForm({ ...form, damageLevel: e.target.value as DamageSeverity })}
                      className="w-full bg-gray-50 border border-gray-300 rounded-xl px-2.5 py-2 font-semibold outline-none focus:ring-2 focus:ring-[#0c532b]"
                    >
                      {DAMAGE_LEVELS.map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Incident Date</label>
                  <input
                    type="date"
                    value={form.incidentDate}
                    onChange={(e) => setForm({ ...form, incidentDate: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-2.5 py-2 outline-none focus:ring-2 focus:ring-[#0c532b]"
                  />
                </div>

                {editingVictim && (
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Status</label>
                    <select
                      value={form.selectionStatus}
                      onChange={(e) => setForm({ ...form, selectionStatus: e.target.value as VictimSelectionStatus })}
                      className="w-full bg-gray-50 border border-gray-300 rounded-xl px-2.5 py-2 font-semibold outline-none focus:ring-2 focus:ring-[#0c532b]"
                    >
                      {SELECTION_STATUSES.map(st => (
                        <option key={st} value={st}>{st}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 py-2.5 bg-[#0c532b] hover:bg-[#094222] text-white font-bold rounded-xl cursor-pointer disabled:opacity-60"
                >
                  {isSaving ? 'Saving...' : editingVictim ? 'Save' : 'Save Victim'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Program-Scoped Import Modal (Admin Only) */}
      {isImportOpen && isAdmin && (
        <div
          className="fixed inset-0 z-50 bg-black/45 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setIsImportOpen(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-sm w-full p-5 border border-gray-200 shadow-2xl space-y-3.5 text-xs"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2.5 border-b border-gray-100">
              <div>
                <h2 className="text-base font-extrabold text-gray-900">Import Victims</h2>
                {program && <p className="text-[11px] text-gray-500">{program.title}</p>}
              </div>
              <button
                type="button"
                onClick={() => setIsImportOpen(false)}
                className="text-gray-400 hover:text-gray-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">Import Mode</label>
              <select
                value={importMode}
                onChange={(e) => setImportMode(e.target.value as 'merge' | 'replace')}
                className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 font-semibold outline-none"
              >
                <option value="merge">Merge with current list</option>
                <option value="replace">Replace list for this program</option>
              </select>
            </div>

            <label className="block border-2 border-dashed border-gray-300 hover:border-[#0c532b] rounded-2xl p-4 text-center cursor-pointer bg-gray-50/70">
              <input
                type="file"
                accept=".csv,.json,application/json,text/csv"
                onChange={handleImportFile}
                className="hidden"
              />
              <Upload className="w-5 h-5 text-gray-400 mx-auto mb-1" />
              <p className="font-bold text-gray-800">{importFileName || 'Choose .CSV or .JSON file'}</p>
              <p className="text-[11px] text-gray-500 mt-0.5">
                {importRows.length > 0 ? `${importRows.length} rows ready` : 'Existing resident profiles auto-match by name'}
              </p>
            </label>

            {importMsg && (
              <p className="p-2 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl font-semibold">
                {importMsg}
              </p>
            )}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setIsImportOpen(false)}
                className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={importRows.length === 0 || isImporting}
                onClick={handleConfirmImport}
                className="flex-1 py-2.5 bg-[#0c532b] hover:bg-[#094222] text-white font-bold rounded-xl cursor-pointer disabled:opacity-50"
              >
                {isImporting ? 'Importing...' : 'Import'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
