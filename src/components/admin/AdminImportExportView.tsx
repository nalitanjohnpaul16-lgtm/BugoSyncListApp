import React, { useState } from 'react';
import {
  Download,
  Upload,
  Printer,
  FileSpreadsheet,
  FileJson,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { parseCsvText } from '../../utils/csvParser';

type ExportDataset = 'victims' | 'hazards' | 'applications' | 'programs' | 'all';
type ImportDataset = 'victims' | 'hazards' | 'programs';
type ReportType = 'victims' | 'hazards' | 'programs';

export const AdminImportExportView: React.FC = () => {
  const {
    disasterVictims,
    hazardZones,
    programs,
    applications,
    downloadExportedRecords,
    importRecords
  } = useApp();

  const [exportStatus, setExportStatus] = useState('');
  const [selectedVictimProgramId, setSelectedVictimProgramId] = useState<string>('');
  const [importType, setImportType] = useState<ImportDataset>('victims');
  const [importProgramId, setImportProgramId] = useState<string>('');
  const [importMode, setImportMode] = useState<'merge' | 'replace'>('merge');
  const [parsedRows, setParsedRows] = useState<any[]>([]);
  const [importFileName, setImportFileName] = useState('');
  const [importFeedback, setImportFeedback] = useState<{ ok: boolean; msg: string } | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  const [reportType, setReportType] = useState<ReportType>('victims');

  const scopedVictimsCount = selectedVictimProgramId
    ? disasterVictims.filter(v => (v.enrolledProgramIds || []).includes(selectedVictimProgramId)).length
    : disasterVictims.length;

  const exportRows: Array<{ id: ExportDataset; label: string; count: number }> = [
    { id: 'victims', label: 'Disaster Victims', count: scopedVictimsCount },
    { id: 'hazards', label: 'Bugo Hazard Zones', count: hazardZones.length },
    { id: 'applications', label: 'Service Applications', count: applications.length },
    { id: 'programs', label: 'Assistance Programs', count: programs.length }
  ];

  const handleExport = async (type: ExportDataset, format: 'json' | 'csv') => {
    setExportStatus('');
    const programId = type === 'victims' && selectedVictimProgramId ? selectedVictimProgramId : undefined;
    const res = await downloadExportedRecords(type, format, programId);
    if (!res.success) {
      setExportStatus(res.message || 'Export failed.');
    } else {
      setExportStatus(`Downloaded ${type} (${format.toUpperCase()}).`);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportFileName(file.name);
    setImportFeedback(null);

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
              : Array.isArray(parsed[importType])
                ? parsed[importType]
                : [];
          setParsedRows(list);
          if (list.length === 0) {
            setImportFeedback({ ok: false, msg: 'No records array found in JSON file.' });
          }
        } else {
          const rows = parseCsvText(text);
          setParsedRows(rows);
          if (rows.length === 0) {
            setImportFeedback({ ok: false, msg: 'CSV file has no data rows.' });
          }
        }
      } catch {
        setParsedRows([]);
        setImportFeedback({ ok: false, msg: 'Could not read file. Use valid CSV or JSON.' });
      }
    };
    reader.readAsText(file);
  };

  const handleConfirmImport = async () => {
    if (parsedRows.length === 0) return;
    setIsImporting(true);
    setImportFeedback(null);
    const programId = importType === 'victims' && importProgramId ? importProgramId : undefined;
    const res = await importRecords(importType, importMode, parsedRows, programId);
    setIsImporting(false);
    if (!res.success) {
      setImportFeedback({ ok: false, msg: res.message || 'Import failed.' });
      return;
    }
    setImportFeedback({ ok: true, msg: `Imported ${res.importedCount} ${importType} records.` });
    setParsedRows([]);
    setImportFileName('');
  };

  return (
    <div className="space-y-6">
      <div className="no-print">
        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
          Import, Export & Printable Reports
        </h1>
        <p className="text-xs text-gray-500 mt-0.5">
          Download system records, import CSV/JSON batches, and print official Barangay Bugo reports.
        </p>
      </div>

      {/* Section 1 & 2: Export & Import */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 no-print">
        {/* Export Card */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-extrabold text-gray-900 flex items-center gap-2">
              <Download className="w-4 h-4 text-[#0c532b]" />
              <span>Export Records</span>
            </h2>
            <button
              type="button"
              onClick={() => handleExport('all', 'json')}
              className="px-3 py-1.5 bg-[#0c532b] hover:bg-[#094222] text-white text-xs font-bold rounded-xl cursor-pointer"
            >
              Full Backup (JSON)
            </button>
          </div>

          <div className="divide-y divide-gray-100 text-xs">
            {exportRows.map(row => (
              <div key={row.id} className="py-2.5 flex items-center justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-gray-800">{row.label}</p>
                  <p className="text-[11px] text-gray-400">{row.count} records</p>
                  {row.id === 'victims' && (
                    <select
                      value={selectedVictimProgramId}
                      onChange={(e) => setSelectedVictimProgramId(e.target.value)}
                      className="mt-1.5 w-full max-w-[220px] bg-gray-50 border border-gray-200 rounded-lg px-2 py-1 text-[11px] font-semibold text-gray-700 outline-none"
                    >
                      <option value="">All Programs</option>
                      {programs.map(p => (
                        <option key={p.id} value={p.id}>{p.title}</option>
                      ))}
                    </select>
                  )}
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleExport(row.id, 'csv')}
                    className="px-2.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
                    <span>CSV</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleExport(row.id, 'json')}
                    className="px-2.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <FileJson className="w-3.5 h-3.5 text-blue-700" />
                    <span>JSON</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {exportStatus && (
            <p className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-2 rounded-xl border border-emerald-200">
              {exportStatus}
            </p>
          )}
        </div>

        {/* Import Card */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-4">
          <h2 className="text-sm font-extrabold text-gray-900 flex items-center gap-2">
            <Upload className="w-4 h-4 text-[#0c532b]" />
            <span>Import Records (CSV / JSON)</span>
          </h2>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block font-bold text-gray-700 mb-1">Target Table</label>
              <select
                value={importType}
                onChange={(e) => {
                  setImportType(e.target.value as ImportDataset);
                  setParsedRows([]);
                  setImportFileName('');
                }}
                className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 font-semibold outline-none"
              >
                <option value="victims">Disaster Victims</option>
                <option value="hazards">Bugo Hazard Zones</option>
                <option value="programs">Assistance Programs</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-gray-700 mb-1">Import Mode</label>
              <select
                value={importMode}
                onChange={(e) => setImportMode(e.target.value as 'merge' | 'replace')}
                className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 font-semibold outline-none"
              >
                <option value="merge">Merge (Keep Existing)</option>
                <option value="replace">Replace Current List</option>
              </select>
            </div>
          </div>

          {importType === 'victims' && (
            <div className="text-xs">
              <label className="block font-bold text-gray-700 mb-1">Program (Optional)</label>
              <select
                value={importProgramId}
                onChange={(e) => setImportProgramId(e.target.value)}
                className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 font-semibold outline-none"
              >
                <option value="">All / Auto Programs</option>
                {programs.map(p => (
                  <option key={p.id} value={p.id}>{p.title}</option>
                ))}
              </select>
            </div>
          )}

          <label className="block border-2 border-dashed border-gray-300 hover:border-[#0c532b] rounded-2xl p-5 text-center cursor-pointer bg-gray-50/70 transition">
            <input
              type="file"
              accept=".csv,.json,application/json,text/csv"
              onChange={handleFileUpload}
              className="hidden"
            />
            <Upload className="w-6 h-6 text-gray-400 mx-auto mb-1.5" />
            <p className="text-xs font-bold text-gray-800">
              {importFileName || 'Click to choose a .CSV or .JSON file'}
            </p>
            <p className="text-[11px] text-gray-500 mt-0.5">
              {parsedRows.length > 0 ? `${parsedRows.length} rows ready to import` : 'Export any dataset first to see column format'}
            </p>
          </label>

          {importFeedback && (
            <div className={`p-2.5 rounded-xl border text-xs font-bold flex items-center gap-2 ${
              importFeedback.ok
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}>
              {importFeedback.ok ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              <span>{importFeedback.msg}</span>
            </div>
          )}

          <button
            type="button"
            disabled={parsedRows.length === 0 || isImporting}
            onClick={handleConfirmImport}
            className="w-full py-2.5 bg-[#0c532b] hover:bg-[#094222] text-white text-xs font-bold rounded-xl cursor-pointer disabled:opacity-50"
          >
            {isImporting ? 'Importing...' : `Import ${parsedRows.length || ''} Records`}
          </button>
        </div>
      </div>

      {/* Section 3: Printable Report */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 no-print">
          <div className="flex items-center gap-2">
            <Printer className="w-4 h-4 text-[#0c532b]" />
            <h2 className="text-sm font-extrabold text-gray-900">Printable Official Report</h2>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value as ReportType)}
              className="bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 font-semibold outline-none"
            >
              <option value="victims">Disaster Victims Roster</option>
              <option value="hazards">Bugo Disaster Hazard Zones Report</option>
              <option value="programs">Assistance Programs Summary</option>
            </select>
            <button
              type="button"
              onClick={() => window.print()}
              className="px-4 py-2 bg-[#0c532b] hover:bg-[#094222] text-white font-bold rounded-xl flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
            >
              <Printer className="w-4 h-4" />
              <span>Print Report</span>
            </button>
          </div>
        </div>

        {/* Printable Document Container */}
        <div className="printable-document border border-gray-200 rounded-2xl p-6 space-y-4 bg-white">
          <div className="text-center border-b border-gray-200 pb-3">
            <p className="text-[11px] font-bold uppercase tracking-widest text-gray-500">
              Republic of the Philippines • Barangay Bugo, Cagayan de Oro City
            </p>
            <h3 className="text-base font-extrabold text-gray-900 mt-1">
              {reportType === 'victims'
                ? 'Disaster Victim Roster'
                : reportType === 'hazards'
                  ? 'Barangay Bugo Disaster Hazard Zones Summary'
                  : 'Barangay Bugo Active Assistance Programs'}
            </h3>
            <p className="text-[11px] text-gray-500 mt-0.5">
              Generated on {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>

          {reportType === 'victims' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-gray-300 text-[11px] text-gray-600 uppercase">
                    <th className="py-2 pr-3">Code</th>
                    <th className="py-2 pr-3">Name</th>
                    <th className="py-2 pr-3">Zone</th>
                    <th className="py-2 pr-3">Disaster / Damage</th>
                    <th className="py-2 pr-3">Programs</th>
                    <th className="py-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {disasterVictims.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-6 text-center text-gray-400">No victim records available.</td>
                    </tr>
                  ) : (
                    disasterVictims.map(v => (
                      <tr key={v.id}>
                        <td className="py-2 pr-3 font-mono text-[11px]">{v.victimCode}</td>
                        <td className="py-2 pr-3 font-bold">{v.fullName}</td>
                        <td className="py-2 pr-3">{v.purok.split(' - ')[0]}</td>
                        <td className="py-2 pr-3">{v.disasterType} ({v.damageLevel})</td>
                        <td className="py-2 pr-3">{(v.enrolledProgramTitles || []).join(', ') || '—'}</td>
                        <td className="py-2 font-bold">{v.selectionStatus}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {reportType === 'hazards' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-gray-300 text-[11px] text-gray-600 uppercase">
                    <th className="py-2 pr-3">Location Name</th>
                    <th className="py-2 pr-3">Category</th>
                    <th className="py-2 pr-3">Risk</th>
                    <th className="py-2 pr-3">Zone</th>
                    <th className="py-2 pr-3">Radius</th>
                    <th className="py-2">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {hazardZones.map(z => (
                    <tr key={z.id}>
                      <td className="py-2 pr-3 font-bold">{z.name}</td>
                      <td className="py-2 pr-3">{z.disasterType}</td>
                      <td className="py-2 pr-3 font-bold">{z.riskLevel}</td>
                      <td className="py-2 pr-3">{z.purok.split(' - ')[0]}</td>
                      <td className="py-2 pr-3">{z.radiusMeters}m</td>
                      <td className="py-2">{z.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {reportType === 'programs' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-gray-300 text-[11px] text-gray-600 uppercase">
                    <th className="py-2 pr-3">Program Title</th>
                    <th className="py-2 pr-3">Category</th>
                    <th className="py-2 pr-3">Status</th>
                    <th className="py-2">Target Audience</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {programs.map(p => (
                    <tr key={p.id}>
                      <td className="py-2 pr-3 font-bold">{p.title}</td>
                      <td className="py-2 pr-3">{p.category}</td>
                      <td className="py-2 pr-3">{p.status}</td>
                      <td className="py-2">{p.targetAudience}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
