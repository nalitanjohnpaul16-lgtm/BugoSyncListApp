import {
  AssistanceApplication,
  DisasterVictimRecord,
  ResidentUser
} from '../types';

const ACTIVE_OR_RECEIVED_APP_STATUSES = new Set([
  'Submitted',
  'Under Review',
  'Documents Verified',
  'Approved',
  'Ready for Release',
  'Re-submitted',
  'Disbursed',
  'Completed'
]);

const RECEIVED_AID_APP_STATUSES = new Set([
  'Approved',
  'Ready for Release',
  'Disbursed',
  'Completed'
]);

export function normalizeHouseholdKey(purok?: string, address?: string): string {
  const p = (purok || '').trim().toLowerCase().split(' - ')[0].trim();
  const a = (address || '').trim().toLowerCase().replace(/\s+/g, ' ');
  if (!a || a === 'barangay bugo' || a === 'barangay bugo, cagayan de oro city') {
    return '';
  }
  return `${p}::${a}`;
}

export interface ResidentAidSummary {
  totalAidCount: number;
  receivedProgramIds: Set<string>;
  householdKey: string;
}

export function getResidentAidSummary(
  resident: Pick<ResidentUser, 'id' | 'name' | 'purok' | 'address'>,
  applications: AssistanceApplication[] = [],
  disasterVictims: DisasterVictimRecord[] = []
): ResidentAidSummary {
  const normName = (resident.name || '').trim().toLowerCase();
  const receivedProgramIds = new Set<string>();
  let totalAidCount = 0;

  for (const app of applications) {
    if (!app) continue;
    const isSamePerson =
      (app.applicantId && app.applicantId === resident.id) ||
      (normName && (app.applicantName || '').trim().toLowerCase() === normName);
    if (!isSamePerson) continue;

    if (ACTIVE_OR_RECEIVED_APP_STATUSES.has(app.status)) {
      receivedProgramIds.add(app.programId);
    }
    if (RECEIVED_AID_APP_STATUSES.has(app.status)) {
      totalAidCount++;
    }
  }

  for (const v of disasterVictims) {
    if (!v) continue;
    const isSamePerson = Boolean(normName && (v.fullName || '').trim().toLowerCase() === normName);
    if (!isSamePerson) continue;

    if (v.selectionStatus === 'Selected' || v.selectionStatus === 'Distributed') {
      totalAidCount++;
      for (const pid of v.enrolledProgramIds || []) {
        receivedProgramIds.add(pid);
      }
    }
  }

  return {
    totalAidCount,
    receivedProgramIds,
    householdKey: normalizeHouseholdKey(resident.purok, resident.address)
  };
}
