import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import {
  UserRole,
  ResidentUser,
  AssistanceProgram,
  AssistanceApplication,
  ApplicationStatus,
  AnnouncementItem,
  NotificationItem,
  ActivityLogItem,
  ArchiveItem,
  CensusData,
  UploadedDocument,
  NotificationDocumentData,
  EditableResidentProfileFields,
  ProfileChangeRequest,
  DisasterVictimRecord,
  BugoHazardZone
} from '../types';
import {
  DEMO_ADMIN_USER,
  DEMO_RESIDENT_USER,
  INITIAL_PROGRAMS,
  INITIAL_APPLICATIONS,
  INITIAL_RESIDENT_RECORDS,
  INITIAL_ANNOUNCEMENTS,
  INITIAL_NOTIFICATIONS,
  INITIAL_ACTIVITY_LOGS,
  INITIAL_ARCHIVED_ITEMS,
  DEFAULT_BUGO_CENSUS
} from '../data/mockData';
import { DEFAULT_BUGO_HAZARD_ZONES } from '../data/hazardDefaults';
import { evaluateApplicantEligibility, evaluateResidentForProgram } from '../utils/eligibilityEngine';

export type AdminTabType = 'dashboard' | 'residents' | 'programs' | 'status-tracking' | 'disaster-aid' | 'hazard-map' | 'records-io' | 'announcements' | 'archives' | 'help' | 'settings';
export type ResidentTabType = 'dashboard' | 'services' | 'hazard-map' | 'announcements' | 'settings' | 'help' | 'profile';
export type AuthViewType = 'welcome' | 'login' | 'register' | 'guest';

interface AppContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  authView: AuthViewType;
  setAuthView: (view: AuthViewType) => void;
  currentUser: ResidentUser | null;
  setCurrentUser: (user: ResidentUser | null) => void;

  // Navigation Tabs
  adminTab: AdminTabType;
  setAdminTab: (tab: AdminTabType) => void;
  residentTab: ResidentTabType;
  setResidentTab: (tab: ResidentTabType) => void;
  selectedZoneForRegistry: string | null;
  setSelectedZoneForRegistry: (zone: string | null) => void;

  // Search & Global Modals
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  isNotificationsOpen: boolean;
  setIsNotificationsOpen: (open: boolean) => void;
  isProfileDrawerOpen: boolean;
  setIsProfileDrawerOpen: (open: boolean) => void;

  // Session Timeout State
  isSessionTimedOut: boolean;
  dismissSessionTimeout: () => void;

  // Data Collections
  programs: AssistanceProgram[];
  applications: AssistanceApplication[];
  residentsList: ResidentUser[];
  announcements: AnnouncementItem[];
  notifications: NotificationItem[];
  activityLogs: ActivityLogItem[];
  archivedItems: ArchiveItem[];
  disasterVictims: DisasterVictimRecord[];
  hazardZones: BugoHazardZone[];

  // Auth Operations
  loginWithCredentials: (email: string, pass: string) => Promise<{ success: boolean; message?: string }>;
  loginAsDemoAdmin: () => void;
  loginAsDemoResident: () => void;
  loginAsGuest: () => void;
  logout: () => void;
  registerResidentAccount: (data: any) => Promise<{ success: boolean; message?: string; residentId?: string; residentIdNumber?: string }>;
  updateUserProfile: (updates: Partial<ResidentUser>) => void;
  submitProfileChangeRequest: (changes: Partial<EditableResidentProfileFields>) => Promise<{ success: boolean; message: string }>;
  cancelProfileChangeRequest: () => Promise<void>;
  reviewProfileChangeRequest: (residentId: string, decision: 'approve' | 'reject', rejectionReason?: string) => Promise<{ success: boolean; message: string }>;
  changePassword: (
    optionsOrCurrentPassword: { currentPassword?: string; verificationCode?: string; verificationToken?: string; newPassword: string } | string,
    maybeNewPassword?: string
  ) => Promise<{ success: boolean; message: string }>;
  sendPasswordVerificationCode: () => Promise<{ success: boolean; message: string; code?: string; contactMasked?: string }>;
  verifyPasswordCode: (code: string) => Promise<{ success: boolean; message: string; verificationToken?: string }>;
  verifyCurrentPassword: (currentPassword: string) => Promise<{ success: boolean; message: string; verificationToken?: string }>;
  incrementAnnouncementViews: (id: string) => Promise<void>;

  // Admin Approval, Verification & Banning Operations
  approveResidentRegistration: (residentId: string) => void;
  rejectResidentRegistration: (residentId: string, reason?: string) => void;
  banResidentAccount: (residentId: string, reason: string) => void;
  unbanResidentAccount: (residentId: string) => void;
  verifyResidentAccount: (residentId: string) => void;
  addNewResidentRecord: (data: Partial<ResidentUser>) => void;

  // Activity Logs & Archive Operations
  logActivity: (log: Omit<ActivityLogItem, 'id' | 'timestamp'>) => void;
  archiveRecord: (item: Omit<ArchiveItem, 'id' | 'deletedAt' | 'status'>) => void;
  restoreArchivedItem: (id: string) => void;
  deleteArchivedItemPermanently: (id: string) => void;

  // Service Application & Status Tracking Operations
  submitAssistanceApplication: (data: any) => Promise<string>;
  verifyApplicationDocument: (appId: string, docId: string, isVerified: boolean) => void;
  updateApplicationStatus: (
    appId: string,
    newStatus: ApplicationStatus,
    officerName?: string,
    remarks?: string,
    approvedAmount?: string
  ) => void;
  resubmitApplicationRequirements: (
    appId: string,
    documents: UploadedDocument[],
    note?: string
  ) => Promise<{ success: boolean; message?: string; application?: AssistanceApplication }>;
  deleteApplication: (appIdOrRef: string) => Promise<boolean>;

  // Programs, Announcements & Targeted Releases
  addProgram: (data: Omit<AssistanceProgram, 'id'>) => Promise<{ success: boolean; program?: AssistanceProgram; message?: string }>;
  deleteProgram: (programId: string) => Promise<{ success: boolean; message?: string }>;
  addAnnouncement: (data: Omit<AnnouncementItem, 'id' | 'viewsCount'>) => void;
  broadcastProgramQualificationAlerts: (
    programId: string,
    programTitle: string,
    targetResidentId?: string
  ) => Promise<{
    success: boolean;
    count: number;
    alreadyNotifiedCount: number;
    qualifiedTotal: number;
    recipients: string[];
    alreadyNotifiedRecipients: string[];
  }>;
  notifyAllQualifiedUsers: (
    programId?: string,
    residentIds?: string[]
  ) => Promise<{
    success: boolean;
    sentCount: number;
    residentsNotifiedCount: number;
    alreadyNotifiedCount: number;
    message?: string;
  }>;
  // Notification Operations
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  deleteNotification: (id: string) => void;
  clearAllNotifications: (userId?: string) => void;
  addNotification: (
    title: string,
    message: string,
    userId?: string,
    type?: NotificationItem['type'],
    applicationRef?: string,
    targetArea?: NotificationItem['targetArea'],
    documentData?: NotificationDocumentData
  ) => void;

  // Selection state for viewing/editing
  selectedApplicationForReview: AssistanceApplication | null;
  setSelectedApplicationForReview: (app: AssistanceApplication | null) => void;

  // Community Census (Realistic & Adjustable)
  censusData: CensusData;
  updateCensusData: (updated: Partial<CensusData>) => void;
  resetCensusToBenchmark: () => void;

  // Disaster Victim Records
  addDisasterVictim: (data: Partial<DisasterVictimRecord>) => Promise<{ success: boolean; victim?: DisasterVictimRecord; message?: string }>;
  updateDisasterVictim: (id: string, updates: Partial<DisasterVictimRecord>) => Promise<{ success: boolean; victim?: DisasterVictimRecord; message?: string }>;
  deleteDisasterVictim: (id: string) => Promise<{ success: boolean; message?: string }>;

  // Bugo Disaster Hazard Map Zones
  addHazardZone: (data: Omit<BugoHazardZone, 'id' | 'updatedAt'>) => Promise<{ success: boolean; zone?: BugoHazardZone; message?: string }>;
  updateHazardZone: (id: string, updates: Partial<BugoHazardZone>) => Promise<{ success: boolean; zone?: BugoHazardZone; message?: string }>;
  deleteHazardZone: (id: string) => Promise<{ success: boolean; message?: string }>;

  // Admin Import / Export
  downloadExportedRecords: (type: 'all' | 'victims' | 'hazards' | 'applications' | 'programs', format: 'json' | 'csv', programId?: string) => Promise<{ success: boolean; message?: string }>;
  importRecords: (recordType: 'victims' | 'hazards' | 'programs', mode: 'merge' | 'replace', records: any[], programId?: string) => Promise<{ success: boolean; importedCount?: number; message?: string }>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Inactivity threshold: 15 minutes (in ms)
const INACTIVITY_TIMEOUT_MS = 15 * 60 * 1000;

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Navigation & Role State
  const [role, setRole] = useState<UserRole>('guest');
  const [authView, setAuthView] = useState<AuthViewType>('welcome');
  const [currentUser, setCurrentUser] = useState<ResidentUser | null>(null);

  const [adminTab, setAdminTab] = useState<AdminTabType>('dashboard');
  const [residentTab, setResidentTab] = useState<ResidentTabType>('dashboard');

  const [searchQuery, setSearchQuery] = useState('');
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isSessionTimedOut, setIsSessionTimedOut] = useState(false);

  // Core Data
  const [programs, setPrograms] = useState<AssistanceProgram[]>(INITIAL_PROGRAMS);
  const [applications, setApplications] = useState<AssistanceApplication[]>(INITIAL_APPLICATIONS);
  const [residentsList, setResidentsList] = useState<ResidentUser[]>(INITIAL_RESIDENT_RECORDS);
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [activityLogs, setActivityLogs] = useState<ActivityLogItem[]>(INITIAL_ACTIVITY_LOGS);
  const [archivedItems, setArchivedItems] = useState<ArchiveItem[]>(INITIAL_ARCHIVED_ITEMS);
  const [disasterVictims, setDisasterVictims] = useState<DisasterVictimRecord[]>([]);
  const [hazardZones, setHazardZones] = useState<BugoHazardZone[]>(DEFAULT_BUGO_HAZARD_ZONES);

  const [selectedApplicationForReview, setSelectedApplicationForReview] = useState<AssistanceApplication | null>(null);
  const [selectedZoneForRegistry, setSelectedZoneForRegistry] = useState<string | null>(null);
  const [isProfileDrawerOpen, setIsProfileDrawerOpen] = useState(false);

  const AUTH_TOKEN_STORAGE_KEY = 'bugo_auth_token';
  const authTokenRef = useRef<string | null>((() => {
    try {
      return sessionStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
    } catch {
      return null;
    }
  })());

  const setStoredAuthToken = (token: string | null) => {
    authTokenRef.current = token;
    try {
      if (token) {
        sessionStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token);
      } else {
        sessionStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
      }
    } catch { }
  };

  const getAuthHeaders = (extra?: Record<string, string>): Record<string, string> => {
    const headers: Record<string, string> = { ...(extra || {}) };
    if (authTokenRef.current) {
      headers.Authorization = `Bearer ${authTokenRef.current}`;
    }
    return headers;
  };

  // Helper to safely retrieve user-chosen avatar across sessions
  const getSavedAvatarForUser = (email?: string, id?: string): string | null => {
    try {
      if (email) {
        const byEmail = localStorage.getItem(`bugo_avatar_${email.toLowerCase().trim()}`);
        if (byEmail) return byEmail;
      }
      if (id) {
        const byId = localStorage.getItem(`bugo_avatar_${id}`);
        if (byId) return byId;
      }
    } catch { }
    return null;
  };

  // Realistic & Adjustable Community Census Data State
  const [censusData, setCensusData] = useState<CensusData>(() => {
    try {
      const saved = localStorage.getItem('bugo_census_data');
      if (saved) return JSON.parse(saved);
    } catch { }
    return DEFAULT_BUGO_CENSUS;
  });

  const updateCensusData = (updated: Partial<CensusData>) => {
    setCensusData(prev => {
      const next: CensusData = {
        ...prev,
        ...updated,
        lastUpdated: new Date().toISOString().split('T')[0]
      };
      try {
        localStorage.setItem('bugo_census_data', JSON.stringify(next));
      } catch { }
      fetch('/api/census', {
        method: 'POST',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ census: next })
      }).catch(() => { });
      return next;
    });
  };

  const resetCensusToBenchmark = () => {
    setCensusData(DEFAULT_BUGO_CENSUS);
    try {
      localStorage.setItem('bugo_census_data', JSON.stringify(DEFAULT_BUGO_CENSUS));
    } catch { }
    fetch('/api/census', {
      method: 'POST',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ census: DEFAULT_BUGO_CENSUS })
    }).catch(() => { });
  };

  // Inactivity tracking
  const lastActiveRef = useRef<number>(Date.now());

  // ----------------------------------------------------
  // Sync with Persistent Express Database on Mount
  // ----------------------------------------------------
  useEffect(() => {
    fetch('/api/data')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (!data) return;
        if (data.users && data.users.length > 0) {
          const mergedUsers = data.users.map((u: ResidentUser) => {
            const savedAvatar = getSavedAvatarForUser(u.email, u.id);
            return savedAvatar ? { ...u, avatarUrl: savedAvatar } : u;
          });
          setResidentsList(mergedUsers);
        }
        if (data.programs && data.programs.length > 0) setPrograms(data.programs);
        if (Array.isArray(data.applications)) setApplications(data.applications);
        if (Array.isArray(data.announcements)) setAnnouncements(data.announcements);
        if (Array.isArray(data.activityLogs)) setActivityLogs(data.activityLogs);
        if (data.archivedItems) setArchivedItems(data.archivedItems);
        if (Array.isArray(data.notifications)) setNotifications(data.notifications);
        if (Array.isArray(data.disasterVictims)) setDisasterVictims(data.disasterVictims);
        if (Array.isArray(data.hazardZones)) setHazardZones(data.hazardZones);
        if (data.census) setCensusData(data.census);
      })
      .catch(() => {
        // Standalone fallback: in-memory mock data already active
      });

    // Restore authenticated JWT session across page reloads if valid
    const existingToken = authTokenRef.current;
    if (existingToken) {
      fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${existingToken}` }
      })
        .then(res => (res.ok ? res.json() : null))
        .then(data => {
          if (data?.success && data.user) {
            const u: ResidentUser = data.user;
            const savedAvatar = getSavedAvatarForUser(u.email, u.id);
            if (savedAvatar) u.avatarUrl = savedAvatar;
            setCurrentUser(u);
            setRole(u.role);
            lastActiveRef.current = Date.now();
          } else {
            setStoredAuthToken(null);
          }
        })
        .catch(() => { });
    }
  }, []);

  // ----------------------------------------------------
  // Inactivity Session Timeout Monitor (15 mins idle)
  // ----------------------------------------------------
  useEffect(() => {
    const recordUserActivity = () => {
      lastActiveRef.current = Date.now();
    };

    window.addEventListener('mousemove', recordUserActivity, { passive: true });
    window.addEventListener('keydown', recordUserActivity, { passive: true });
    window.addEventListener('click', recordUserActivity, { passive: true });
    window.addEventListener('touchstart', recordUserActivity, { passive: true });

    const interval = setInterval(() => {
      if (role !== 'guest' && currentUser) {
        const idleDuration = Date.now() - lastActiveRef.current;
        if (idleDuration >= INACTIVITY_TIMEOUT_MS) {
          // Trigger automatic secure logout
          setStoredAuthToken(null);
          setRole('guest');
          setCurrentUser(null);
          setAuthView('login');
          setIsSessionTimedOut(true);
        }
      }
    }, 15000); // Check every 15s

    return () => {
      window.removeEventListener('mousemove', recordUserActivity);
      window.removeEventListener('keydown', recordUserActivity);
      window.removeEventListener('click', recordUserActivity);
      window.removeEventListener('touchstart', recordUserActivity);
      clearInterval(interval);
    };
  }, [role, currentUser]);

  const dismissSessionTimeout = () => {
    setIsSessionTimedOut(false);
  };

  const formatExactNotificationDate = (d = new Date()): string => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[d.getMonth()];
    const day = d.getDate();
    const year = d.getFullYear();
    let hours = d.getHours();
    const minutes = d.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    return `${month} ${day}, ${year} • ${hours}:${minutes} ${ampm}`;
  };

  const addNotification = (
    title: string,
    message: string,
    userId: string = 'all',
    type: NotificationItem['type'] = 'status_update',
    applicationRef?: string,
    targetArea?: NotificationItem['targetArea'],
    documentData?: NotificationDocumentData
  ) => {
    // Non-repetitive check: do not insert duplicate notification if already exists
    setNotifications(prev => {
      const isDuplicate = prev.some(n =>
        (userId === 'all' || n.userId === userId) &&
        n.title === title &&
        n.message === message
      );
      if (isDuplicate) return prev;

      const exactTime = formatExactNotificationDate();
      const newNotif: NotificationItem = {
        id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        userId,
        title,
        message,
        timestamp: exactTime,
        createdAt: new Date().toISOString(),
        read: false,
        type,
        applicationRef,
        targetArea,
        documentData
      };
      return [newNotif, ...prev];
    });
  };

  // Log activity
  const logActivity = (entry: Omit<ActivityLogItem, 'id' | 'timestamp'>) => {
    const now = new Date();
    const formatted = `${now.toISOString().split('T')[0]} ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    const newLog: ActivityLogItem = {
      ...entry,
      id: `act-${Date.now()}`,
      timestamp: formatted
    };
    setActivityLogs(prev => [newLog, ...prev]);

    // Send to server
    fetch('/api/logs', {
      method: 'POST',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(entry)
    }).catch(() => { });
  };

  // Archive a record
  const archiveRecord = (item: Omit<ArchiveItem, 'id' | 'deletedAt' | 'status'>) => {
    const now = new Date();
    const formatted = `${now.toISOString().split('T')[0]} ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    const newArch: ArchiveItem = {
      ...item,
      id: `arch-${Date.now()}`,
      deletedAt: formatted,
      status: 'Archived'
    };
    setArchivedItems(prev => [newArch, ...prev]);

    fetch('/api/archives', {
      method: 'POST',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(item)
    }).catch(() => { });

    logActivity({
      residentName: item.deletedBy || 'Admin Juan Dela Cruz',
      residentIdNumber: 'BG-ADMIN-001',
      purok: 'Administrative Office',
      actionType: 'Status Updated',
      locationOrService: 'Archives & Records Unit',
      officerInCharge: item.deletedBy || 'Admin Secretary',
      status: 'Completed',
      details: `Archived record "${item.title}" (${item.originalCategory}).`
    });
  };

  const restoreArchivedItem = (id: string) => {
    const item = archivedItems.find(a => a.id === id);
    if (!item) return;

    setArchivedItems(prev => prev.filter(a => a.id !== id));
    fetch(`/api/archives/${id}?restore=true`, { method: 'DELETE', headers: getAuthHeaders() }).catch(() => { });

    logActivity({
      residentName: currentUser?.name || 'Admin',
      residentIdNumber: 'BG-ADMIN-001',
      purok: 'Administrative Office',
      actionType: 'Status Updated',
      locationOrService: 'Archives & Records Unit',
      officerInCharge: 'Admin Staff',
      status: 'Completed',
      details: `Restored archived item "${item.title}".`
    });
  };

  const deleteArchivedItemPermanently = (id: string) => {
    setArchivedItems(prev => prev.filter(a => a.id !== id));
    fetch(`/api/archives/${id}`, { method: 'DELETE', headers: getAuthHeaders() }).catch(() => { });
  };

  const submitProfileChangeRequest = async (
    changes: Partial<EditableResidentProfileFields>
  ): Promise<{ success: boolean; message: string }> => {
    if (!currentUser) {
      return { success: false, message: 'You must be signed in.' };
    }

    const diffEntries = (Object.entries(changes) as Array<[keyof EditableResidentProfileFields, any]>).filter(
      ([key, val]) => val !== undefined && val !== (currentUser as any)[key]
    );
    if (diffEntries.length === 0) {
      return { success: false, message: 'No changes detected.' };
    }

    const filteredChanges = Object.fromEntries(diffEntries) as Partial<EditableResidentProfileFields>;
    const pendingRequest: ProfileChangeRequest = {
      requestedAt: formatExactNotificationDate(),
      status: 'Pending',
      changes: filteredChanges
    };

    try {
      const res = await fetch(`/api/residents/${currentUser.id}/profile-change-request`, {
        method: 'POST',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ changes: filteredChanges })
      });
      const data = await res.json();
      if (res.ok && data.success && data.user) {
        const updatedUser = { ...currentUser, ...data.user };
        setCurrentUser(updatedUser);
        setResidentsList(prev => prev.map(r => r.id === currentUser.id ? { ...r, ...data.user } : r));
        return { success: true, message: data.message || 'Submitted for admin approval.' };
      }
      if (!res.ok) {
        return { success: false, message: data.message || 'Could not submit profile changes.' };
      }
    } catch {
      // Fallback to local state if offline
    }

    const updatedUser: ResidentUser = { ...currentUser, pendingProfileUpdate: pendingRequest };
    setCurrentUser(updatedUser);
    setResidentsList(prev => prev.map(r => r.id === currentUser.id ? { ...r, pendingProfileUpdate: pendingRequest } : r));
    addNotification(
      'Profile Edit Approval Required',
      `${currentUser.name} requested changes to their profile details.`,
      'admin-juan-delacruz',
      'status_update',
      undefined,
      'residents'
    );
    return { success: true, message: 'Submitted for admin approval.' };
  };

  const cancelProfileChangeRequest = async (): Promise<void> => {
    if (!currentUser) return;
    setCurrentUser(prev => {
      if (!prev) return null;
      const copy = { ...prev };
      delete copy.pendingProfileUpdate;
      return copy;
    });
    setResidentsList(prev => prev.map(r => {
      if (r.id !== currentUser.id) return r;
      const copy = { ...r };
      delete copy.pendingProfileUpdate;
      return copy;
    }));
    fetch(`/api/residents/${currentUser.id}/profile-change-request`, { method: 'DELETE', headers: getAuthHeaders() }).catch(() => { });
  };

  const reviewProfileChangeRequest = async (
    residentId: string,
    decision: 'approve' | 'reject',
    rejectionReason?: string
  ): Promise<{ success: boolean; message: string }> => {
    // Strictly only Admin can approve or reject profile changes
    if (role !== 'admin' || currentUser?.role !== 'admin') {
      return { success: false, message: 'Only administrators can approve profile changes.' };
    }

    const target = residentsList.find(r => r.id === residentId);
    if (!target || !target.pendingProfileUpdate || target.pendingProfileUpdate.status !== 'Pending') {
      return { success: false, message: 'No pending profile changes found.' };
    }

    try {
      const res = await fetch(`/api/residents/${residentId}/profile-change-decision`, {
        method: 'POST',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({
          adminId: currentUser.id,
          decision,
          rejectionReason
        })
      });
      const data = await res.json();
      if (res.ok && data.success && data.user) {
        setResidentsList(prev => prev.map(r => r.id === residentId ? { ...r, ...data.user, pendingProfileUpdate: data.user.pendingProfileUpdate } : r));
        if (currentUser.id === residentId) {
          setCurrentUser(data.user);
        }
        return { success: true, message: data.message };
      }
      if (!res.ok) {
        return { success: false, message: data.message || 'Action failed.' };
      }
    } catch {
      // Offline fallback
    }

    if (decision === 'approve') {
      const applied: ResidentUser = { ...target, ...target.pendingProfileUpdate.changes };
      delete applied.pendingProfileUpdate;
      setResidentsList(prev => prev.map(r => r.id === residentId ? applied : r));
      addNotification(
        'Profile Changes Approved',
        'Your requested profile information changes have been approved by the Barangay Administrator.',
        residentId,
        'registration_approved',
        undefined,
        'settings'
      );
      return { success: true, message: 'Profile changes approved.' };
    }

    const rejectedReq: ProfileChangeRequest = {
      ...target.pendingProfileUpdate,
      status: 'Rejected',
      reviewedAt: formatExactNotificationDate(),
      reviewedBy: currentUser.name,
      rejectionReason: rejectionReason || 'Submitted profile changes could not be verified.'
    };
    setResidentsList(prev => prev.map(r => r.id === residentId ? { ...r, pendingProfileUpdate: rejectedReq } : r));
    addNotification(
      'Profile Changes Not Approved',
      `Your profile edit request was declined. Reason: ${rejectedReq.rejectionReason}`,
      residentId,
      'status_update',
      undefined,
      'settings'
    );
    return { success: true, message: 'Profile changes rejected.' };
  };

  const updateUserProfile = (updates: Partial<ResidentUser>) => {
    if (!currentUser) return;

    const { avatarUrl, ...otherUpdates } = updates;

    // Avatar updates apply directly across sessions
    if (avatarUrl !== undefined) {
      setCurrentUser(prev => prev ? { ...prev, avatarUrl } : null);
      setResidentsList(prev => prev.map(r => r.id === currentUser.id ? { ...r, avatarUrl } : r));
      try {
        if (currentUser.email) {
          localStorage.setItem(`bugo_avatar_${currentUser.email.toLowerCase().trim()}`, avatarUrl);
        }
        localStorage.setItem(`bugo_avatar_${currentUser.id}`, avatarUrl);
      } catch { }
      fetch(`/api/residents/${currentUser.id}`, {
        method: 'PATCH',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ avatarUrl })
      }).catch(() => { });
    }

    // Non-avatar profile info updates by residents MUST go through Admin approval
    if (Object.keys(otherUpdates).length > 0) {
      if (currentUser.role !== 'admin') {
        void submitProfileChangeRequest(otherUpdates as Partial<EditableResidentProfileFields>);
        return;
      }

      setCurrentUser(prev => prev ? { ...prev, ...otherUpdates } : null);
      setResidentsList(prev => prev.map(r => r.id === currentUser.id ? { ...r, ...otherUpdates } : r));
      fetch(`/api/residents/${currentUser.id}`, {
        method: 'PATCH',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ adminId: currentUser.id, ...otherUpdates })
      }).catch(() => { });
    }
  };

  const sendPasswordVerificationCode = async (): Promise<{ success: boolean; message: string; code?: string; contactMasked?: string }> => {
    if (!currentUser) {
      return { success: false, message: 'You must be signed in to request a verification code.' };
    }
    try {
      const response = await fetch('/api/auth/send-verification-code', {
        method: 'POST',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({
          userId: currentUser.id,
          email: currentUser.email
        })
      });
      const data = await response.json();
      return data;
    } catch (err: any) {
      return { success: false, message: err.message || 'Network error while requesting verification code.' };
    }
  };

  const verifyPasswordCode = async (code: string): Promise<{ success: boolean; message: string; verificationToken?: string }> => {
    if (!currentUser) {
      return { success: false, message: 'You must be signed in to verify code.' };
    }
    try {
      const response = await fetch('/api/auth/verify-code', {
        method: 'POST',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({
          userId: currentUser.id,
          email: currentUser.email,
          code
        })
      });
      const data = await response.json();
      return data;
    } catch (err: any) {
      return { success: false, message: err.message || 'Network error while verifying code.' };
    }
  };

  const verifyCurrentPassword = async (currentPassword: string): Promise<{ success: boolean; message: string; verificationToken?: string }> => {
    if (!currentUser) {
      return { success: false, message: 'You must be signed in to verify password.' };
    }
    try {
      const response = await fetch('/api/auth/verify-current-password', {
        method: 'POST',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({
          userId: currentUser.id,
          email: currentUser.email,
          currentPassword
        })
      });
      const data = await response.json();
      return data;
    } catch (err: any) {
      return { success: false, message: err.message || 'Network error while verifying current password.' };
    }
  };

  const changePassword = async (
    optionsOrCurrentPassword: { currentPassword?: string; verificationCode?: string; verificationToken?: string; newPassword: string } | string,
    maybeNewPassword?: string
  ): Promise<{ success: boolean; message: string }> => {
    if (!currentUser) {
      return { success: false, message: 'You must be signed in to change your password.' };
    }

    let payload: any;
    if (typeof optionsOrCurrentPassword === 'object') {
      payload = {
        userId: currentUser.id,
        email: currentUser.email,
        ...optionsOrCurrentPassword
      };
    } else {
      payload = {
        userId: currentUser.id,
        email: currentUser.email,
        currentPassword: optionsOrCurrentPassword,
        newPassword: maybeNewPassword
      };
    }

    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        return {
          success: false,
          message: data.message || 'Failed to update password. Please check your verification credentials.'
        };
      }

      // Update current session user password
      if (payload.newPassword) {
        setCurrentUser(prev => prev ? { ...prev, password: payload.newPassword } : null);
      }

      // Add alert notification to resident/admin
      addNotification(
        'Security Password Updated',
        'Your account credentials have been changed successfully. Use your new strong password for subsequent logins.',
        currentUser.id,
        'system_alert',
        undefined,
        'settings'
      );

      return {
        success: true,
        message: data.message || 'Password updated successfully!'
      };
    } catch (err: any) {
      return {
        success: false,
        message: err.message || 'Network error while attempting to change password.'
      };
    }
  };

  const loginAsGuest = () => {
    setAuthView('guest');
  };

  // Auth: Real Backend Authentication with Rate Limiting & PBKDF2 Password Hashing
  const loginWithCredentials = async (email: string, pass: string): Promise<{ success: boolean; message?: string }> => {
    const cleanEmail = email.trim().toLowerCase();

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, password: pass })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        return {
          success: false,
          message: data.message || 'Invalid email or password.'
        };
      }

      // Successful server-side authentication with JWT token
      if (data.token || data.sessionToken) {
        setStoredAuthToken(data.token || data.sessionToken);
      }
      const user: ResidentUser = data.user;
      const savedAvatar = getSavedAvatarForUser(user.email, user.id);
      if (savedAvatar) {
        user.avatarUrl = savedAvatar;
      }
      setCurrentUser(user);
      setRole(user.role);
      lastActiveRef.current = Date.now();
      setIsSessionTimedOut(false);

      if (user.role === 'admin') {
        setAdminTab('dashboard');
      } else {
        setResidentTab('dashboard');
      }

      return { success: true };
    } catch {
      // Fallback to local check if offline
      if (cleanEmail === 'admin@bugo.gov.ph' || cleanEmail === 'admin') {
        const savedAvatar = getSavedAvatarForUser(DEMO_ADMIN_USER.email, DEMO_ADMIN_USER.id);
        const adminUser = {
          ...DEMO_ADMIN_USER,
          ...(savedAvatar ? { avatarUrl: savedAvatar } : {})
        };
        setCurrentUser(adminUser);
        setRole('admin');
        setAdminTab('dashboard');
        return { success: true };
      }

      const found = residentsList.find(r => r.email.toLowerCase() === cleanEmail);
      if (found) {
        if (found.isBanned) {
          return { success: false, message: `Account is banned: ${found.banReason || 'Policy violation.'}` };
        }
        const savedAvatar = getSavedAvatarForUser(found.email, found.id);
        const resUser = {
          ...found,
          ...(savedAvatar ? { avatarUrl: savedAvatar } : {})
        };
        setCurrentUser(resUser);
        setRole('resident');
        setResidentTab('dashboard');
        return { success: true };
      }

      return { success: false, message: 'Invalid credentials. Please verify your email and password.' };
    }
  };

  const loginAsDemoAdmin = () => {
    const latestAdmin = residentsList.find(r => r.id === DEMO_ADMIN_USER.id || r.email === DEMO_ADMIN_USER.email) || DEMO_ADMIN_USER;
    const savedAvatar = getSavedAvatarForUser(latestAdmin.email, latestAdmin.id);
    const user: ResidentUser = {
      ...latestAdmin,
      ...(savedAvatar ? { avatarUrl: savedAvatar } : {})
    };
    setCurrentUser(user);
    setRole('admin');
    setAdminTab('dashboard');
    lastActiveRef.current = Date.now();
    setIsSessionTimedOut(false);
  };

  const loginAsDemoResident = () => {
    const latestResident = residentsList.find(r => r.id === DEMO_RESIDENT_USER.id || r.email === DEMO_RESIDENT_USER.email) || DEMO_RESIDENT_USER;
    const savedAvatar = getSavedAvatarForUser(latestResident.email, latestResident.id);
    const user: ResidentUser = {
      ...latestResident,
      ...(savedAvatar ? { avatarUrl: savedAvatar } : {})
    };
    setCurrentUser(user);
    setRole('resident');
    setResidentTab('dashboard');
    lastActiveRef.current = Date.now();
    setIsSessionTimedOut(false);
  };

  const logout = () => {
    setStoredAuthToken(null);
    setRole('guest');
    setAuthView('welcome');
    setCurrentUser(null);
    setSelectedApplicationForReview(null);
  };

  // Register with backend password hashing & JWT token
  const registerResidentAccount = async (data: any): Promise<{ success: boolean; message?: string; residentId?: string; residentIdNumber?: string }> => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      const resData = await response.json();

      if (!response.ok || !resData.success) {
        return { success: false, message: resData.message || 'Registration failed.' };
      }

      if (resData.token || resData.sessionToken) {
        setStoredAuthToken(resData.token || resData.sessionToken);
      }

      const newUser: ResidentUser = resData.user;
      setResidentsList(prev => [newUser, ...prev]);
      setCurrentUser(newUser);
      setRole('resident');
      setResidentTab('dashboard');
      lastActiveRef.current = Date.now();

      return {
        success: true,
        residentId: newUser.id,
        residentIdNumber: resData.residentIdNumber || newUser.residentIdNumber
      };
    } catch {
      // Local fallback
      const newId = `user-${Date.now()}`;
      const generatedResidentIdNumber = `BG-2026-${Math.floor(1000 + Math.random() * 9000)}`;
      const newResident: ResidentUser = {
        id: newId,
        name: data.name,
        email: data.email,
        username: data.email.split('@')[0],
        role: 'resident',
        contactNumber: data.contactNumber,
        purok: data.purok,
        address: data.address,
        residentIdNumber: generatedResidentIdNumber,
        isVerified: false,
        registrationStatus: 'Pending Approval',
        registeredDate: new Date().toISOString().split('T')[0],
        householdIncome: data.householdIncome || '₱8,500.00',
        familyMembersCount: Number(data.familyMembersCount) || 4,
        nationality: data.nationality || 'Filipino',
        voterStatus: data.voterStatus || 'Registered',
        occupation: data.occupation || 'Resident',
        employmentStatus: data.employmentStatus || 'Self-Employed',
        civilStatus: data.civilStatus || 'Single',
        age: Number(data.age) || 28,
        gender: data.gender || 'Female',
        idType: data.idType,
        idNumber: data.idNumber,
        frontIdUrl: data.frontIdUrl,
        backIdUrl: data.backIdUrl,
        idPhotoAnalysis: data.idPhotoAnalysis,
        backIdPhotoAnalysis: data.backIdPhotoAnalysis,
        avatarUrl: data.avatarUrl,
        isPwd: Boolean(data.isPwd),
        isSoloParent: Boolean(data.isSoloParent),
        isSenior: Boolean(data.isSenior),
        isStudent: Boolean(data.isStudent),
        isTeenager: Boolean(data.isTeenager)
      };

      setResidentsList(prev => [newResident, ...prev]);
      setCurrentUser(newResident);
      setRole('resident');
      setResidentTab('dashboard');
      return { success: true, residentId: newId, residentIdNumber: generatedResidentIdNumber };
    }
  };

  // Admin approves resident registration
  const approveResidentRegistration = (residentId: string) => {
    setResidentsList(prev => prev.map(res => {
      if (res.id === residentId) {
        return { ...res, isVerified: true, registrationStatus: 'Verified', isBanned: false, banReason: undefined };
      }
      return res;
    }));

    fetch(`/api/residents/${residentId}`, {
      method: 'PATCH',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ adminId: currentUser?.id || 'admin-juan-delacruz', isVerified: true, registrationStatus: 'Verified', isBanned: false })
    }).catch(() => { });

    addNotification('Resident Account Verified', `Account verified and approved.`, residentId, 'registration_approved');
  };

  const verifyResidentAccount = approveResidentRegistration;

  // Admin bans resident account
  const banResidentAccount = (residentId: string, reason: string) => {
    setResidentsList(prev => prev.map(res => {
      if (res.id === residentId) {
        return {
          ...res,
          isVerified: false,
          isBanned: true,
          registrationStatus: 'Banned',
          banReason: reason || 'Administrative decision',
          bannedDate: new Date().toISOString().split('T')[0]
        };
      }
      return res;
    }));

    fetch(`/api/residents/${residentId}`, {
      method: 'PATCH',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ adminId: currentUser?.id || 'admin-juan-delacruz', isVerified: false, isBanned: true, registrationStatus: 'Banned', banReason: reason })
    }).catch(() => { });
  };

  const unbanResidentAccount = (residentId: string) => {
    setResidentsList(prev => prev.map(res => {
      if (res.id === residentId) {
        return { ...res, isVerified: true, isBanned: false, registrationStatus: 'Verified', banReason: undefined };
      }
      return res;
    }));

    fetch(`/api/residents/${residentId}`, {
      method: 'PATCH',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ adminId: currentUser?.id || 'admin-juan-delacruz', isVerified: true, isBanned: false, registrationStatus: 'Verified' })
    }).catch(() => { });
  };

  const rejectResidentRegistration = (residentId: string, reason?: string) => {
    setResidentsList(prev => prev.map(res => {
      if (res.id === residentId) {
        return { ...res, isVerified: false, registrationStatus: 'Rejected' };
      }
      return res;
    }));

    fetch(`/api/residents/${residentId}`, {
      method: 'PATCH',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ adminId: currentUser?.id || 'admin-juan-delacruz', isVerified: false, registrationStatus: 'Rejected' })
    }).catch(() => { });
  };

  const addNewResidentRecord = (data: Partial<ResidentUser>) => {
    const newRecord: ResidentUser = {
      id: `res-${Date.now()}`,
      name: data.name || 'New Resident',
      email: data.email || 'resident@bugo.gov.ph',
      username: (data.name || 'user').toLowerCase().replace(/\s+/g, ''),
      role: 'resident',
      contactNumber: data.contactNumber || '0917 000 0000',
      purok: data.purok || 'Zone 1 - Centro Riverside',
      address: data.address || 'Barangay Bugo, CDO',
      residentIdNumber: `BG-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      isVerified: true,
      registrationStatus: 'Verified',
      registeredDate: new Date().toISOString().split('T')[0],
      householdIncome: data.householdIncome || '₱8,500.00',
      familyMembersCount: 4,
      voterStatus: 'Registered',
      occupation: data.occupation || 'Resident',
      nationality: 'Filipino'
    };
    setResidentsList(prev => [newRecord, ...prev]);
  };

  // Submit Assistance Application with Automated Boundary & Capability Brain
  const submitAssistanceApplication = async (applicationData: any): Promise<string> => {
    const randomCode = `BUG-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date().toISOString().split('T')[0];

    const frontDoc = (applicationData.documents || []).find(
      (d: any) => d.docCategory === 'Front ID' || d.name?.includes('Front')
    );
    const backDoc = (applicationData.documents || []).find(
      (d: any) => d.docCategory === 'Back ID' || d.name?.includes('Back')
    );
    const hasFrontId = Boolean(frontDoc) || (applicationData.documents || []).some((d: any) => d.name?.includes('ID'));
    const hasBackId = Boolean(backDoc);
    const hasSupportingDoc = (applicationData.documents || []).length > 2;

    // The Assistance Brain: Detect strict boundaries, income ceilings, and rules
    const evaluation = evaluateApplicantEligibility({
      programId: applicationData.programId || 'prog-barangay-clearance',
      programTitle: applicationData.programTitle || 'Barangay Service Request',
      applicantName: applicationData.applicantName || currentUser?.name || 'Resident Applicant',
      purok: applicationData.purok || currentUser?.purok || 'Zone 1 - Centro Riverside',
      address: applicationData.address || currentUser?.address || 'Barangay Bugo, CDO',
      householdIncome: applicationData.householdMonthlyIncome || '₱8,500.00',
      familyCount: Number(applicationData.familyMembersCount) || 4,
      occupation: applicationData.occupation || currentUser?.occupation || 'Resident',
      purpose: applicationData.purposeOrDiagnosis || applicationData.purpose || 'Official service request.',
      hasFrontId,
      hasBackId,
      hasSupportingDoc,
      idAnalysis: frontDoc?.analysis || (applicationData.documents || []).find((d: any) => d.analysis)?.analysis,
      backIdAnalysis: backDoc?.analysis
    });

    const isCapable = evaluation.isCapable;
    const finalStatus: ApplicationStatus = isCapable ? 'Submitted' : 'Disqualified';

    const newApp: AssistanceApplication = {
      id: `app-${Date.now()}`,
      referenceCode: randomCode,
      programId: applicationData.programId || 'prog-barangay-clearance',
      programTitle: applicationData.programTitle || 'Barangay Service Request',
      programCategory: applicationData.programCategory || 'Clearance & Certification',
      applicantId: applicationData.applicantId || currentUser?.id || 'user-maria-santos',
      applicantName: applicationData.applicantName || currentUser?.name || 'Resident Applicant',
      contactNumber: applicationData.contactNumber || currentUser?.contactNumber || '0917 555 4321',
      email: applicationData.email || currentUser?.email || 'resident@bugo.gov.ph',
      purok: applicationData.purok || currentUser?.purok || 'Zone 1 - Centro Riverside',
      address: applicationData.address || currentUser?.address || 'Barangay Bugo, CDO',
      householdMonthlyIncome: applicationData.householdMonthlyIncome || '₱8,500.00',
      familyMembersCount: Number(applicationData.familyMembersCount) || 4,
      occupation: applicationData.occupation || currentUser?.occupation || 'Resident',
      purposeOrDiagnosis: applicationData.purposeOrDiagnosis || applicationData.purpose || 'Official service request.',
      requestedAmount: applicationData.requestedAmount || '',
      approvedAmount: applicationData.approvedAmount,
      status: finalStatus,
      submissionDate: now,
      lastUpdated: now,
      eligibilityEvaluation: evaluation,
      rejectionReason: isCapable ? undefined : evaluation.disqualifiedReason,
      priorityScore: applicationData.priorityScore || 'Normal',
      documents: (applicationData.documents || []).map((d: any, index: number) => ({
        id: d.id || `doc-${Date.now()}-${index}`,
        name: d.name || 'Submitted_Document.pdf',
        type: d.type || 'PDF',
        size: d.size || '1.2 MB',
        uploadDate: now,
        verified: isCapable,
        fileUrl: d.url || '#'
      })),
      timeline: [
        {
          status: finalStatus,
          timestamp: 'Just now',
          officerName: isCapable ? 'Online Portal Pre-Check' : 'Eligibility Evaluation System',
          remarks: isCapable
            ? 'Application passed initial boundary check and queued for Barangay evaluation.'
            : `DISQUALIFIED: ${evaluation.disqualifiedReason || 'Applicant does not meet program eligibility boundaries.'}`
        }
      ]
    };

    setApplications(prev => [newApp, ...prev]);

    // Send to backend
    fetch('/api/applications', {
      method: 'POST',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(newApp)
    }).catch(() => { });

    addNotification(
      isCapable ? 'New Service Application Submitted' : 'Application Flagged: Ineligible / Disqualified',
      isCapable
        ? `Request ${newApp.referenceCode} for "${newApp.programTitle}" submitted by ${newApp.applicantName}.`
        : `Request ${newApp.referenceCode} by ${newApp.applicantName} does not meet eligibility boundaries (${evaluation.disqualifiedReason || 'Ineligible'}).`,
      'admin-juan-delacruz',
      'status_update',
      newApp.referenceCode
    );

    return randomCode;
  };

  // Admin updates Application Status
  const updateApplicationStatus = (
    appId: string,
    newStatus: ApplicationStatus,
    officerName: string = 'Hon. Juan Dela Cruz (Brgy. Admin)',
    remarks?: string,
    approvedAmount?: string
  ) => {
    const formattedDate = new Date().toISOString().split('T')[0];

    setApplications(prev => prev.map(app => {
      if (app.id === appId) {
        const newTimelineEntry = {
          status: newStatus,
          timestamp: 'Just now',
          officerName,
          remarks: remarks || `Status updated to ${newStatus}`
        };

        const updatedApp: AssistanceApplication = {
          ...app,
          status: newStatus,
          lastUpdated: formattedDate,
          approvedAmount: approvedAmount || app.approvedAmount,
          timeline: [newTimelineEntry, ...app.timeline],
          evaluatorNotes: remarks || app.evaluatorNotes
        };

        return updatedApp;
      }
      return app;
    }));

    fetch(`/api/applications/${appId}/status`, {
      method: 'PATCH',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ status: newStatus, officerName, remarks, approvedAmount })
    }).catch(() => { });
  };

  const verifyApplicationDocument = (appId: string, docId: string, isVerified: boolean) => {
    setApplications(prev => prev.map(app => {
      if (app.id === appId) {
        return {
          ...app,
          documents: app.documents.map(doc => doc.id === docId ? { ...doc, verified: isVerified } : doc)
        };
      }
      return app;
    }));
  };

  // Resident Resubmit Missing Requirements
  const resubmitApplicationRequirements = async (appId: string, documents: UploadedDocument[], note?: string) => {
    try {
      const response = await fetch(`/api/applications/${appId}/resubmit`, {
        method: 'POST',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({
          documents,
          note,
          applicantName: currentUser?.name || 'Resident Applicant'
        })
      });
      const data = await response.json();
      if (data.success && data.application) {
        setApplications(prev => prev.map(a => (a.id === appId || a.referenceCode === appId) ? data.application : a));
        return { success: true, message: data.message, application: data.application };
      }
      return { success: false, message: data.message || 'Resubmission failed.' };
    } catch {
      const now = new Date().toISOString().split('T')[0];
      let updatedApp: AssistanceApplication | undefined;
      setApplications(prev => prev.map(a => {
        if (a.id === appId || a.referenceCode === appId) {
          const mergedDocs = [
            ...documents,
            ...a.documents.filter(d => !documents.some(nd => nd.name === d.name || nd.id === d.id))
          ];
          updatedApp = {
            ...a,
            status: 'Re-submitted',
            lastUpdated: now,
            resubmittedAt: now,
            resubmittedNote: note,
            documents: mergedDocs,
            timeline: [
              {
                status: 'Re-submitted',
                timestamp: 'Just now',
                officerName: currentUser?.name || 'Resident Applicant',
                remarks: `Updated requirements uploaded: ${note || 'Additional documents provided'}`
              },
              ...a.timeline
            ]
          };
          return updatedApp;
        }
        return a;
      }));
      return { success: true, message: 'Requirements updated successfully.', application: updatedApp };
    }
  };

  // Delete an Application permanently
  const deleteApplication = async (appIdOrRef: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/applications/${encodeURIComponent(appIdOrRef)}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      if (response.ok) {
        setApplications(prev => prev.filter(a => a.id !== appIdOrRef && a.referenceCode !== appIdOrRef));
        setNotifications(prev => prev.filter(n => n.applicationRef !== appIdOrRef && !n.message?.includes(appIdOrRef)));
        return true;
      }
    } catch (err) {
      console.error('Failed to delete application on server:', err);
    }
    setApplications(prev => prev.filter(a => a.id !== appIdOrRef && a.referenceCode !== appIdOrRef));
    setNotifications(prev => prev.filter(n => n.applicationRef !== appIdOrRef && !n.message?.includes(appIdOrRef)));
    return true;
  };

  // Announcements & Targeted Releases
  const addAnnouncement = (data: Omit<AnnouncementItem, 'id' | 'viewsCount'>) => {
    const newAnn: AnnouncementItem = {
      ...data,
      id: `ann-${Date.now()}`,
      viewsCount: 1,
      date: 'Today',
      status: 'Published'
    };
    setAnnouncements(prev => [newAnn, ...prev]);
    fetch('/api/announcements', {
      method: 'POST',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(newAnn)
    }).catch(() => { });

    // If targeted to qualified beneficiaries only, dispatch targeted notifications & simulated SMS
    if (data.targetAudienceType === 'Qualified Beneficiaries Only' && data.targetProgramId) {
      const qualified = residentsList.filter(res => {
        const evalResult = evaluateResidentForProgram(res, data.targetProgramId!, data.targetProgramTitle);
        return evalResult.isQualified;
      });

      const exactTime = formatExactNotificationDate();
      const createdIso = new Date().toISOString();
      qualified.forEach(res => {
        const notifTitle = `Release Schedule: ${data.title}`;
        const notifMessage = `Official Bugo Notice for Qualified Beneficiaries of ${data.targetProgramTitle || 'the program'}. Release Date: ${data.releaseDate || 'Upcoming Date'} • Time: ${data.meetingTime || 'TBA'} at ${data.meetingVenue || 'Barangay Bugo Complex'}. Instructions: ${data.instructions || 'Please bring your valid ID.'}`;
        const notif: NotificationItem = {
          id: `notif-ann-${Date.now()}-${res.id}`,
          userId: res.id,
          title: notifTitle,
          message: notifMessage,
          timestamp: exactTime,
          createdAt: createdIso,
          read: false,
          type: 'announcement',
          targetArea: 'announcements'
        };
        setNotifications(prev => {
          const isDup = prev.some(n => n.userId === res.id && n.title === notifTitle && n.message === notifMessage);
          return isDup ? prev : [notif, ...prev];
        });
        fetch('/api/notifications', {
          method: 'POST',
          headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
          body: JSON.stringify(notif)
        }).catch(() => { });
      });
    }
  };

  // Broadcast Qualification Alerts (Admin triggered App Notification with accurate persistence & deduplication)
  const broadcastProgramQualificationAlerts = async (
    programId: string,
    programTitle: string,
    targetResidentId?: string
  ): Promise<{
    success: boolean;
    count: number;
    alreadyNotifiedCount: number;
    qualifiedTotal: number;
    recipients: string[];
    alreadyNotifiedRecipients: string[];
  }> => {
    const qualified = residentsList.filter(res => {
      if (res.role !== 'resident' || res.isBanned) return false;
      if (targetResidentId && res.id !== targetResidentId) return false;
      const evalResult = evaluateResidentForProgram(res, programId, programTitle);
      return evalResult.isQualified;
    });

    const exactTime = formatExactNotificationDate();
    const createdIso = new Date().toISOString();
    const notifTitle = `Qualified: ${programTitle}`;
    const legacyTitle = `🟢 Qualified: ${programTitle}`;
    const notifMessage = `Your resident profile qualifies for "${programTitle}". Watch for the upcoming release schedule announcement or apply under Services when ready.`;

    const recipientNames: string[] = [];
    const alreadyNotifiedNames: string[] = [];
    const newlyCreatedNotifications: NotificationItem[] = [];
    let hadServerError = false;

    await Promise.all(
      qualified.map(async res => {
        const alreadyExistsLocally = notifications.some(
          n =>
            n.userId === res.id &&
            (n.title === notifTitle || n.title === legacyTitle) &&
            (n.message === notifMessage || n.message.includes(`"${programTitle}"`))
        );

        if (alreadyExistsLocally) {
          alreadyNotifiedNames.push(res.name);
          return;
        }

        const notif: NotificationItem = {
          id: `notif-qual-${Date.now()}-${programId}-${res.id}-${Math.random().toString(36).slice(2, 6)}`,
          userId: res.id,
          title: notifTitle,
          message: notifMessage,
          timestamp: exactTime,
          createdAt: createdIso,
          read: false,
          type: 'status_update',
          targetArea: 'dashboard'
        };

        try {
          const response = await fetch('/api/notifications', {
            method: 'POST',
            headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
            body: JSON.stringify(notif)
          });
          if (!response.ok) {
            hadServerError = true;
            return;
          }
          const data = await response.json();
          if (data.duplicate || !data.notification) {
            alreadyNotifiedNames.push(res.name);
            return;
          }
          const savedNotif: NotificationItem = data.notification;
          newlyCreatedNotifications.push(savedNotif);
          recipientNames.push(res.name);
        } catch {
          hadServerError = true;
        }
      })
    );

    if (newlyCreatedNotifications.length > 0) {
      setNotifications(prev => {
        const existingIds = new Set(prev.map(n => n.id));
        const toAdd = newlyCreatedNotifications.filter(n => !existingIds.has(n.id));
        return [...toAdd, ...prev];
      });
    }

    return {
      success: !hadServerError,
      count: recipientNames.length,
      alreadyNotifiedCount: alreadyNotifiedNames.length,
      qualifiedTotal: qualified.length,
      recipients: recipientNames,
      alreadyNotifiedRecipients: alreadyNotifiedNames
    };
  };

  const notifyAllQualifiedUsers = async (
    programId?: string,
    residentIds?: string[]
  ): Promise<{
    success: boolean;
    sentCount: number;
    residentsNotifiedCount: number;
    alreadyNotifiedCount: number;
    message?: string;
  }> => {
    try {
      const res = await fetch('/api/notifications/notify-all-qualified', {
        method: 'POST',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ programId: programId || 'all', residentIds })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        return {
          success: false,
          sentCount: 0,
          residentsNotifiedCount: 0,
          alreadyNotifiedCount: 0,
          message: data?.message || 'Could not notify qualified users.'
        };
      }
      if (Array.isArray(data.createdNotifications) && data.createdNotifications.length > 0) {
        setNotifications(prev => {
          const existingIds = new Set(prev.map(n => n.id));
          const toAdd = data.createdNotifications.filter((n: NotificationItem) => !existingIds.has(n.id));
          return [...toAdd, ...prev];
        });
      }
      return {
        success: true,
        sentCount: Number(data.sentCount) || 0,
        residentsNotifiedCount: Number(data.residentsNotifiedCount) || 0,
        alreadyNotifiedCount: Number(data.alreadyNotifiedCount) || 0
      };
    } catch {
      return {
        success: false,
        sentCount: 0,
        residentsNotifiedCount: 0,
        alreadyNotifiedCount: 0,
        message: 'Network error while sending qualification notices.'
      };
    }
  };


  // Notifications (Real event synchronization & read state persistence)
  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    fetch('/api/notifications/read', {
      method: 'PATCH',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ id })
    }).catch(() => { });
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    fetch('/api/notifications/read', {
      method: 'PATCH',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ all: true, userId: currentUser?.id })
    }).catch(() => { });
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    fetch(`/api/notifications/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    }).catch(() => { });
  };

  const clearAllNotifications = (userId?: string) => {
    setNotifications(prev => {
      if (userId) {
        return prev.filter(n => n.userId !== userId);
      }
      return [];
    });
    const url = userId ? `/api/notifications?userId=${encodeURIComponent(userId)}` : '/api/notifications';
    fetch(url, {
      method: 'DELETE',
      headers: getAuthHeaders()
    }).catch(() => { });
  };

  const incrementAnnouncementViews = async (id: string) => {
    setAnnouncements(prev => prev.map(a => a.id === id ? { ...a, viewsCount: (a.viewsCount || 0) + 1 } : a));
    try {
      const res = await fetch(`/api/announcements/${id}/view`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        if (data.viewsCount) {
          setAnnouncements(prev => prev.map(a => a.id === id ? { ...a, viewsCount: data.viewsCount } : a));
        }
      }
    } catch { }
  };

  const addProgram = async (
    data: Omit<AssistanceProgram, 'id'>
  ): Promise<{ success: boolean; program?: AssistanceProgram; message?: string }> => {
    try {
      const res = await fetch('/api/programs', {
        method: 'POST',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(data)
      });
      const json = await res.json();
      if (!res.ok || !json.success || !json.program) {
        return { success: false, message: json.message || 'Failed to add program.' };
      }
      setPrograms(prev => [json.program, ...prev]);
      if (Array.isArray(json.disasterVictims)) {
        setDisasterVictims(json.disasterVictims);
      }
      return { success: true, program: json.program };
    } catch {
      return { success: false, message: 'Network error while saving program.' };
    }
  };

  const deleteProgram = async (
    programId: string
  ): Promise<{ success: boolean; message?: string }> => {
    try {
      const res = await fetch(`/api/programs/${encodeURIComponent(programId)}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        return { success: false, message: json.message || 'Failed to delete program.' };
      }
      setPrograms(prev => prev.filter(p => p.id !== programId));
      setDisasterVictims(prev =>
        prev.map(v => ({
          ...v,
          enrolledProgramIds: (v.enrolledProgramIds || []).filter(pid => pid !== programId),
          enrolledProgramTitles: (v.enrolledProgramTitles || []).filter(t => t !== json.deletedTitle)
        }))
      );
      return { success: true };
    } catch {
      return { success: false, message: 'Network error while deleting program.' };
    }
  };

  const addDisasterVictim = async (
    data: Partial<DisasterVictimRecord>
  ): Promise<{ success: boolean; victim?: DisasterVictimRecord; message?: string }> => {
    try {
      const res = await fetch('/api/disaster-victims', {
        method: 'POST',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(data)
      });
      const json = await res.json();
      if (!res.ok || !json.success || !json.victim) {
        return { success: false, message: json.message || 'Failed to save victim record.' };
      }
      setDisasterVictims(prev => {
        const exists = prev.some(v => v.id === json.victim.id);
        return exists
          ? prev.map(v => (v.id === json.victim.id ? json.victim : v))
          : [json.victim, ...prev];
      });
      return { success: true, victim: json.victim };
    } catch {
      return { success: false, message: 'Network error while saving victim record.' };
    }
  };

  const updateDisasterVictim = async (
    id: string,
    updates: Partial<DisasterVictimRecord>
  ): Promise<{ success: boolean; victim?: DisasterVictimRecord; message?: string }> => {
    try {
      const res = await fetch(`/api/disaster-victims/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(updates)
      });
      const json = await res.json();
      if (!res.ok || !json.success || !json.victim) {
        return { success: false, message: json.message || 'Failed to update victim record.' };
      }
      setDisasterVictims(prev => prev.map(v => v.id === id ? json.victim : v));
      return { success: true, victim: json.victim };
    } catch {
      return { success: false, message: 'Network error while updating victim record.' };
    }
  };

  const deleteDisasterVictim = async (id: string): Promise<{ success: boolean; message?: string }> => {
    try {
      const res = await fetch(`/api/disaster-victims/${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        return { success: false, message: json.message || 'Failed to delete victim record.' };
      }
      setDisasterVictims(prev => prev.filter(v => v.id !== id));
      return { success: true };
    } catch {
      return { success: false, message: 'Network error while deleting victim record.' };
    }
  };

  const addHazardZone = async (
    data: Omit<BugoHazardZone, 'id' | 'updatedAt'>
  ): Promise<{ success: boolean; zone?: BugoHazardZone; message?: string }> => {
    try {
      const res = await fetch('/api/hazard-zones', {
        method: 'POST',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(data)
      });
      const json = await res.json();
      if (!res.ok || !json.success || !json.zone) {
        return { success: false, message: json.message || 'Failed to add hazard zone.' };
      }
      setHazardZones(prev => [json.zone, ...prev]);
      return { success: true, zone: json.zone };
    } catch {
      return { success: false, message: 'Network error while saving hazard zone.' };
    }
  };

  const updateHazardZone = async (
    id: string,
    updates: Partial<BugoHazardZone>
  ): Promise<{ success: boolean; zone?: BugoHazardZone; message?: string }> => {
    try {
      const res = await fetch(`/api/hazard-zones/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(updates)
      });
      const json = await res.json();
      if (!res.ok || !json.success || !json.zone) {
        return { success: false, message: json.message || 'Failed to update hazard zone.' };
      }
      setHazardZones(prev => prev.map(z => z.id === id ? json.zone : z));
      return { success: true, zone: json.zone };
    } catch {
      return { success: false, message: 'Network error while updating hazard zone.' };
    }
  };

  const deleteHazardZone = async (id: string): Promise<{ success: boolean; message?: string }> => {
    try {
      const res = await fetch(`/api/hazard-zones/${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        return { success: false, message: json.message || 'Failed to delete hazard zone.' };
      }
      setHazardZones(prev => prev.filter(z => z.id !== id));
      return { success: true };
    } catch {
      return { success: false, message: 'Network error while deleting hazard zone.' };
    }
  };

  const downloadExportedRecords = async (
    type: 'all' | 'victims' | 'hazards' | 'applications' | 'programs',
    format: 'json' | 'csv',
    programId?: string
  ): Promise<{ success: boolean; message?: string }> => {
    try {
      const qs = new URLSearchParams({ type, format });
      if (programId) qs.set('programId', programId);
      const res = await fetch(`/api/admin/export-records?${qs.toString()}`, {
        headers: getAuthHeaders()
      });
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        return { success: false, message: err?.message || 'Export failed.' };
      }
      const blob = await res.blob();
      const disposition = res.headers.get('content-disposition') || '';
      const match = disposition.match(/filename="([^"]+)"/i);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = match?.[1] || `bugo_${type}_${new Date().toISOString().slice(0, 10)}.${format}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      return { success: true };
    } catch {
      return { success: false, message: 'Network error during export.' };
    }
  };

  const importRecords = async (
    recordType: 'victims' | 'hazards' | 'programs',
    mode: 'merge' | 'replace',
    records: any[],
    programId?: string
  ): Promise<{ success: boolean; importedCount?: number; message?: string }> => {
    try {
      const res = await fetch('/api/admin/import-records', {
        method: 'POST',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ recordType, mode, records, ...(programId ? { programId } : {}) })
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        return { success: false, message: json.message || 'Import failed.' };
      }
      if (Array.isArray(json.disasterVictims)) setDisasterVictims(json.disasterVictims);
      if (Array.isArray(json.hazardZones)) setHazardZones(json.hazardZones);
      if (Array.isArray(json.programs)) setPrograms(json.programs);
      return { success: true, importedCount: json.importedCount };
    } catch {
      return { success: false, message: 'Network error during import.' };
    }
  };

  return (
    <AppContext.Provider
      value={{
        role,
        setRole,
        authView,
        setAuthView,
        currentUser,
        setCurrentUser,
        adminTab,
        setAdminTab,
        residentTab,
        setResidentTab,
        selectedZoneForRegistry,
        setSelectedZoneForRegistry,
        searchQuery,
        setSearchQuery,
        isNotificationsOpen,
        setIsNotificationsOpen,
        isProfileDrawerOpen,
        setIsProfileDrawerOpen,
        isSessionTimedOut,
        dismissSessionTimeout,
        programs,
        applications,
        residentsList,
        announcements,
        notifications,
        activityLogs,
        archivedItems,
        disasterVictims,
        hazardZones,
        loginWithCredentials,
        loginAsDemoAdmin,
        loginAsDemoResident,
        loginAsGuest,
        logout,
        registerResidentAccount,
        updateUserProfile,
        submitProfileChangeRequest,
        cancelProfileChangeRequest,
        reviewProfileChangeRequest,
        changePassword,
        sendPasswordVerificationCode,
        verifyPasswordCode,
        verifyCurrentPassword,
        approveResidentRegistration,
        rejectResidentRegistration,
        banResidentAccount,
        unbanResidentAccount,
        verifyResidentAccount,
        addNewResidentRecord,
        logActivity,
        archiveRecord,
        restoreArchivedItem,
        deleteArchivedItemPermanently,
        submitAssistanceApplication,
        verifyApplicationDocument,
        updateApplicationStatus,
        resubmitApplicationRequirements,
        deleteApplication,
        addProgram,
        deleteProgram,
        addAnnouncement,
        broadcastProgramQualificationAlerts,
        notifyAllQualifiedUsers,
        incrementAnnouncementViews,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        deleteNotification,
        clearAllNotifications,
        addNotification,
        selectedApplicationForReview,
        setSelectedApplicationForReview,
        censusData,
        updateCensusData,
        resetCensusToBenchmark,
        addDisasterVictim,
        updateDisasterVictim,
        deleteDisasterVictim,
        addHazardZone,
        updateHazardZone,
        deleteHazardZone,
        downloadExportedRecords,
        importRecords
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
