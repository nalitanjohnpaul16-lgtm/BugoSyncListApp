import React, { useState, useRef, useEffect } from 'react';
import { 
  ShieldCheck, 
  ArrowLeft, 
  CheckCircle2, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Lock, 
  AlertCircle, 
  FileText,
  Eye,
  EyeOff,
  Check,
  X,
  ShieldAlert,
  Accessibility,
  HeartHandshake,
  GraduationCap,
  Sparkles,
  CreditCard,
  Briefcase,
  Users,
  Camera,
  Upload,
  ScanLine,
  Loader2,
  Trash2
} from 'lucide-react';
import { BugoLogo, BugoSealEmblem } from '../BugoLogo';
import { useApp } from '../../context/AppContext';
import { 
  BUGO_PUROKS, 
  MONTHLY_INCOME_OPTIONS, 
  CARTOON_AVATAR_PRESETS, 
  MALE_CARTOON_AVATARS, 
  FEMALE_CARTOON_AVATARS, 
  detectUserGender 
} from '../../data/mockData';
import { evaluatePasswordStrength } from '../../utils/passwordStrength';
import { getQualifiedProgramsForResident } from '../../utils/eligibilityEngine';
import { IdPhotoAnalysis } from '../../types';

const GOV_ID_TYPES = [
  'PhilSys National ID',
  'UMID (Unified Multi-Purpose ID)',
  'Driver’s License',
  'COMELEC Voter’s ID / Certificate',
  'Senior Citizen OSCA ID',
  'Person with Disability (PWD) ID',
  'Solo Parent ID Card',
  'Student School ID Card',
  'Postal ID',
  'Barangay Resident ID Card',
  'PRC Professional License'
];

const DISABILITY_TYPES = [
  'Physical / Mobility Impairment',
  'Visual Impairment / Low Vision / Blindness',
  'Hearing Impairment / Deafness',
  'Speech and Language Impairment',
  'Psychosocial / Mental Health Disability',
  'Intellectual Disability',
  'Learning Disability',
  'Chronic Illness / Multiple Disabilities'
];

const LIVELIHOOD_OPTIONS = [
  'Agricultural Farmer / Planter',
  'Fisherman / Coastal Fisherfolk',
  'Daily Wage Earner / Laborer',
  'Construction Worker / Carpenter / Mason',
  'Tricycle / PUV / Delivery Driver',
  'Market Vendor / Retail Merchant',
  'Sari-Sari Store / Micro-Entrepreneur',
  'Food Vendor / Eatery Operator',
  'Handicraft / Home-Based Artisan',
  'Domestic Helper / Caregiver',
  'Factory / Industrial Worker',
  'Private Sector Employee',
  'Government Employee / Public Servant',
  'Self-Employed / Freelancer',
  'Housewife / Homemaker',
  'College / University Student',
  'High School Student',
  'Fresh Graduate / First-Time Jobseeker',
  'Unemployed / Actively Seeking Work',
  'Retired / Senior Pensioner'
];

export const RegisterPage: React.FC = () => {
  const { setAuthView, registerResidentAccount, programs } = useApp();

  const [occupationChoice, setOccupationChoice] = useState<string>('');
  const [customOccupation, setCustomOccupation] = useState<string>('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    contactNumber: '',
    purok: BUGO_PUROKS[0],
    address: '',
    age: 28,
    civilStatus: 'Single' as 'Single' | 'Married' | 'Widowed' | 'Separated',
    occupation: '',
    employmentStatus: 'Self-Employed' as 'Employed (Full-Time)' | 'Employed (Part-Time)' | 'Self-Employed' | 'Unemployed' | 'Student' | 'Retired',
    idType: 'PhilSys National ID',
    idNumber: '',
    householdIncome: MONTHLY_INCOME_OPTIONS[2],
    familyMembersCount: 4,
    yearsOfResidency: 5,
    // Special Profiling Categories
    isPwd: false,
    pwdDisabilityType: DISABILITY_TYPES[0],
    pwdIdNumber: '',
    isSoloParent: false,
    soloParentIdNumber: '',
    isSenior: false,
    seniorIdNumber: '',
    isStudent: false,
    schoolName: '',
    studentLevel: 'College/University' as 'Elementary' | 'High School' | 'College/University' | 'Vocational',
    isTeenager: false,
    // Security & Policy
    password: '',
    confirmPassword: '',
    agreeTerms: false,
    agreePrivacy: false,
    agreeTruthfulness: false
  });

  const autoDetectedGender = detectUserGender(null, formData.name.trim());
  const [avatarGenderManual, setAvatarGenderManual] = useState<'male' | 'female' | null>(null);
  const effectiveGender = avatarGenderManual || autoDetectedGender;
  const currentPresets = effectiveGender === 'male' ? MALE_CARTOON_AVATARS : FEMALE_CARTOON_AVATARS;
  const defaultMatchedAvatar = currentPresets[0]?.url || '';
  const [selectedAvatarUrl, setSelectedAvatarUrl] = useState<string>('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Scan ID & Attachment State (Front & Back Required)
  const [frontIdUrl, setFrontIdUrl] = useState<string>('');
  const [frontIdFileName, setFrontIdFileName] = useState<string>('');
  const [idAnalysis, setIdAnalysis] = useState<IdPhotoAnalysis | null>(null);
  const [isScanningFrontId, setIsScanningFrontId] = useState(false);

  const [backIdUrl, setBackIdUrl] = useState<string>('');
  const [backIdFileName, setBackIdFileName] = useState<string>('');
  const [backIdAnalysis, setBackIdAnalysis] = useState<IdPhotoAnalysis | null>(null);
  const [isScanningBackId, setIsScanningBackId] = useState(false);

  const [scanNotice, setScanNotice] = useState<string>('');
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraTargetSide, setCameraTargetSide] = useState<'front' | 'back'>('front');
  const [cameraError, setCameraError] = useState<string>('');

  const frontFileInputRef = useRef<HTMLInputElement | null>(null);
  const backFileInputRef = useRef<HTMLInputElement | null>(null);
  const cameraFallbackInputRef = useRef<HTMLInputElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const isScanningId = isScanningFrontId || isScanningBackId;

  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [registeredResidentId, setRegisteredResidentId] = useState<string | null>(null);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraOpen(false);
  };

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const compressImageFile = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error('Could not read selected file.'));
      reader.onload = () => {
        const img = new Image();
        img.onerror = () => resolve(String(reader.result || ''));
        img.onload = () => {
          const maxDim = 1000;
          const scale = img.width > maxDim ? maxDim / img.width : 1;
          const canvas = document.createElement('canvas');
          canvas.width = Math.round(img.width * scale);
          canvas.height = Math.round(img.height * scale);
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(String(reader.result || ''));
            return;
          }
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL('image/jpeg', 0.82));
        };
        img.src = String(reader.result || '');
      };
      reader.readAsDataURL(file);
    });
  };

  const scanAndAttachId = async (side: 'front' | 'back', dataUrl: string, fileName: string) => {
    if (side === 'front') {
      setFrontIdUrl(dataUrl);
      setFrontIdFileName(fileName);
      setFrontIdAnalysisPending();
    } else {
      setBackIdUrl(dataUrl);
      setBackIdFileName(fileName);
      setIsScanningBackId(true);
    }
    setScanNotice('');
    setTouched(prev => ({ ...prev, [side === 'front' ? 'frontIdUrl' : 'backIdUrl']: true }));

    function setFrontIdAnalysisPending() {
      setIsScanningFrontId(true);
    }

    try {
      const res = await fetch('/api/ai/validate-id-photo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: dataUrl,
          mimeType: 'image/jpeg',
          fileName,
          side
        })
      });
      const json = await res.json();
      const analysis: IdPhotoAnalysis =
        res.ok && json.analysis
          ? json.analysis
          : {
              isId: true,
              isClear: true,
              detectedDocType: `${side === 'front' ? 'Front' : 'Back'} ID`,
              warning: null,
              advice: 'ID attached.',
              score: 85
            };

      if (side === 'front') {
        setIdAnalysis(analysis);
      } else {
        setBackIdAnalysis(analysis);
      }

      if (analysis.isId && analysis.isClear) {
        const applied: string[] = [];
        const updates: Partial<typeof formData> = {};

        if (analysis.extractedIdType && GOV_ID_TYPES.includes(analysis.extractedIdType)) {
          updates.idType = analysis.extractedIdType;
          applied.push('ID Type');
        }
        if (analysis.extractedIdNumber && !formData.idNumber.trim()) {
          updates.idNumber = analysis.extractedIdNumber;
          applied.push('ID Number');
        }
        if (analysis.extractedName && !formData.name.trim()) {
          updates.name = analysis.extractedName;
          applied.push('Full Name');
        }
        if (analysis.extractedAddress && !formData.address.trim()) {
          updates.address = analysis.extractedAddress;
          applied.push('Address');
        }
        if (analysis.extractedAge && analysis.extractedAge > 0 && formData.age === 28) {
          updates.age = analysis.extractedAge;
          if (analysis.extractedAge >= 60) updates.isSenior = true;
          if (analysis.extractedAge >= 13 && analysis.extractedAge <= 19) updates.isTeenager = true;
          applied.push('Age');
        }
        if (analysis.detectedFlags?.isSenior) {
          updates.isSenior = true;
          applied.push('Senior Citizen');
        }
        if (analysis.detectedFlags?.isPwd) {
          updates.isPwd = true;
          applied.push('PWD');
        }
        if (analysis.detectedFlags?.isSoloParent) {
          updates.isSoloParent = true;
          applied.push('Solo Parent');
        }
        if (analysis.detectedFlags?.isStudent) {
          updates.isStudent = true;
          updates.employmentStatus = 'Student';
          applied.push('Student');
        }

        if (Object.keys(updates).length > 0) {
          setFormData(prev => ({ ...prev, ...updates }));
        }
        if (analysis.extractedGender === 'Male') setAvatarGenderManual('male');
        if (analysis.extractedGender === 'Female') setAvatarGenderManual('female');
        if (applied.length > 0) {
          setScanNotice(`Auto-filled from ID: ${applied.join(', ')}`);
        }
      }
    } catch {
      const fallbackAnalysis: IdPhotoAnalysis = {
        isId: true,
        isClear: true,
        detectedDocType: `${side === 'front' ? 'Front' : 'Back'} ID`,
        warning: null,
        advice: 'ID attached.',
        score: 85
      };
      if (side === 'front') setIdAnalysis(fallbackAnalysis);
      else setBackIdAnalysis(fallbackAnalysis);
    } finally {
      if (side === 'front') setIsScanningFrontId(false);
      else setIsScanningBackId(false);
    }
  };

  const handleIdFileSelect = async (side: 'front' | 'back', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    try {
      const dataUrl = await compressImageFile(file);
      await scanAndAttachId(side, dataUrl, file.name);
    } catch {
      setScanNotice('Unable to process selected image. Please try again.');
    }
  };

  const openCameraScanner = async (side: 'front' | 'back') => {
    setCameraTargetSide(side);
    setCameraError('');
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      cameraFallbackInputRef.current?.click();
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      streamRef.current = stream;
      setIsCameraOpen(true);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }
      }, 60);
    } catch {
      setCameraError('Camera unavailable. Please attach a photo instead.');
      cameraFallbackInputRef.current?.click();
    }
  };

  const captureFromCamera = async () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const width = video.videoWidth || 960;
    const height = video.videoHeight || 600;
    const maxDim = 1000;
    const scale = width > maxDim ? maxDim / width : 1;
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(width * scale);
    canvas.height = Math.round(height * scale);
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    const target = cameraTargetSide;
    stopCamera();
    await scanAndAttachId(target, dataUrl, `scanned-${target}-id-${Date.now()}.jpg`);
  };

  // Password Strength Evaluation
  const passwordStrength = evaluatePasswordStrength(formData.password);

  // Automated Age Profiling Sync
  const handleAgeChange = (val: number) => {
    const ageNum = Math.max(0, Math.min(120, val || 0));
    const isSen = ageNum >= 60;
    const isTeen = ageNum >= 13 && ageNum <= 19;
    setFormData(prev => ({
      ...prev,
      age: ageNum,
      isSenior: isSen,
      isTeenager: isTeen,
      ...(isSen && !prev.idType ? { idType: 'Senior Citizen OSCA ID' } : {})
    }));
  };

  // Automated Occupation & Student Profiling Sync
  const handleOccupationChange = (val: string) => {
    const lower = val.toLowerCase();
    const isStud = lower.includes('student');
    const isUnemployed = lower.includes('unemployed') || lower.includes('jobseeker') || lower.includes('fresh graduate');
    const isRet = lower.includes('retired') || lower.includes('pensioner');
    const isFullTime = lower.includes('private sector') || lower.includes('government') || lower.includes('factory');
    const isPartTime = lower.includes('daily wage') || lower.includes('construction') || lower.includes('domestic');
    const isSelfEmp = lower.includes('vendor') || lower.includes('store') || lower.includes('entrepreneur') || lower.includes('self-employed') || lower.includes('farmer') || lower.includes('fisher') || lower.includes('artisan') || lower.includes('driver');

    setFormData(prev => ({
      ...prev,
      occupation: val,
      employmentStatus: isStud
        ? 'Student'
        : isUnemployed
          ? 'Unemployed'
          : isRet
            ? 'Retired'
            : isFullTime
              ? 'Employed (Full-Time)'
              : isPartTime
                ? 'Employed (Part-Time)'
                : isSelfEmp
                  ? 'Self-Employed'
                  : prev.employmentStatus,
      ...(isStud ? { isStudent: true } : {})
    }));
  };

  const handleOccupationSelectChange = (selected: string) => {
    setOccupationChoice(selected);
    setTouched(prev => ({ ...prev, occupation: true }));
    if (selected === 'Others') {
      handleOccupationChange(customOccupation);
    } else {
      setCustomOccupation('');
      handleOccupationChange(selected);
    }
  };

  // Validation rules
  const errors: Record<string, string> = {};

  const cleanName = formData.name.trim();
  if (!cleanName) {
    errors.name = 'Full legal name is required.';
  } else if (cleanName.split(/\s+/).length < 2) {
    errors.name = 'Must contain both first name and surname.';
  } else if (/[0-9]/.test(cleanName)) {
    errors.name = 'Name cannot contain numbers.';
  }

  const cleanEmail = formData.email.trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!cleanEmail) {
    errors.email = 'Email address is required.';
  } else if (!emailRegex.test(cleanEmail)) {
    errors.email = 'Enter a valid email address.';
  }

  const cleanPhone = formData.contactNumber.replace(/\D/g, '');
  if (!cleanPhone) {
    errors.contactNumber = 'Philippine mobile number is required.';
  } else if (!/^(09\d{9}|639\d{9})$/.test(cleanPhone)) {
    errors.contactNumber = 'Must be an 11-digit mobile starting with 09 (e.g. 09171234567).';
  }

  if (!formData.address.trim()) {
    errors.address = 'Residential street address is required.';
  } else if (formData.address.trim().length < 6) {
    errors.address = 'Address is too short. Specify house/street details.';
  }

  if (!formData.idNumber.trim()) {
    errors.idNumber = 'Government / Resident ID Number is required for identity records.';
  }

  if (!frontIdUrl) {
    errors.frontIdUrl = 'Attach Front ID photo.';
  } else if (idAnalysis && idAnalysis.isId === false) {
    errors.frontIdUrl = 'Front photo is not a valid ID.';
  } else if (idAnalysis && idAnalysis.isClear === false) {
    errors.frontIdUrl = 'Front ID is not clear. Please try again.';
  }

  if (!backIdUrl) {
    errors.backIdUrl = 'Attach Back ID photo.';
  } else if (backIdAnalysis && backIdAnalysis.isId === false) {
    errors.backIdUrl = 'Back photo is not a valid ID.';
  } else if (backIdAnalysis && backIdAnalysis.isClear === false) {
    errors.backIdUrl = 'Back ID is not clear. Please try again.';
  }

  if (!occupationChoice) {
    errors.occupation = 'Please select your occupation / livelihood.';
  } else if (occupationChoice === 'Others' && !formData.occupation.trim()) {
    errors.occupation = 'Please specify your occupation / livelihood.';
  }

  if (formData.isPwd && !formData.pwdIdNumber.trim()) {
    errors.pwdIdNumber = 'PWD ID or medical control number is required.';
  }

  if (formData.isSoloParent && !formData.soloParentIdNumber.trim()) {
    errors.soloParentIdNumber = 'Solo Parent ID or DSWD Case control number is required.';
  }

  if (!formData.password) {
    errors.password = 'Password is required.';
  } else if (!passwordStrength.isValid) {
    errors.password = passwordStrength.errorMessage || 'Password must meet all strong security criteria.';
  }

  if (!formData.confirmPassword) {
    errors.confirmPassword = 'Confirm your password.';
  } else if (formData.password !== formData.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match.';
  }

  if (!formData.agreeTerms) {
    errors.agreeTerms = 'You must agree to the Terms of Service.';
  }
  if (!formData.agreePrivacy) {
    errors.agreePrivacy = 'You must consent to the Data Privacy Act.';
  }
  if (!formData.agreeTruthfulness) {
    errors.agreeTruthfulness = 'You must certify the truthfulness of your submission.';
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length > 11) val = val.slice(0, 11);
    setFormData(prev => ({ ...prev, contactNumber: val }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({
      name: true,
      email: true,
      contactNumber: true,
      address: true,
      idNumber: true,
      frontIdUrl: true,
      backIdUrl: true,
      occupation: true,
      pwdIdNumber: true,
      soloParentIdNumber: true,
      password: true,
      confirmPassword: true,
      agreeTerms: true,
      agreePrivacy: true,
      agreeTruthfulness: true
    });

    if (Object.keys(errors).length > 0) {
      setErrorMsg('Please review the form and complete all required profiling fields.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const finalAvatar = selectedAvatarUrl || defaultMatchedAvatar;

      const res = await registerResidentAccount({
        name: formData.name.trim(),
        email: formData.email.trim(),
        contactNumber: formData.contactNumber.trim(),
        nationality: 'Filipino',
        purok: formData.purok,
        address: formData.address.trim(),
        householdIncome: formData.householdIncome,
        familyMembersCount: Number(formData.familyMembersCount) || 4,
        occupation: formData.occupation.trim(),
        employmentStatus: formData.employmentStatus,
        age: Number(formData.age) || 28,
        gender: effectiveGender === 'male' ? 'Male' : 'Female',
        civilStatus: formData.civilStatus,
        idType: formData.idType,
        idNumber: formData.idNumber.trim(),
        frontIdUrl,
        backIdUrl,
        idPhotoAnalysis: idAnalysis || undefined,
        backIdPhotoAnalysis: backIdAnalysis || undefined,
        idDocumentUrl: frontIdUrl,
        avatarUrl: finalAvatar,
        voterStatus: 'Registered',
        // Household Profiling Categories
        isPwd: formData.isPwd,
        pwdIdNumber: formData.pwdIdNumber.trim(),
        pwdDisabilityType: formData.pwdDisabilityType,
        isSoloParent: formData.isSoloParent,
        soloParentIdNumber: formData.soloParentIdNumber.trim(),
        isSenior: formData.isSenior,
        seniorIdNumber: formData.seniorIdNumber.trim(),
        isStudent: formData.isStudent,
        schoolName: formData.schoolName.trim(),
        studentLevel: formData.studentLevel,
        isTeenager: formData.isTeenager,
        yearsOfResidency: Number(formData.yearsOfResidency) || 1,
        password: formData.password
      });

      if (res.success && res.residentIdNumber) {
        setRegisteredResidentId(res.residentIdNumber);
        setSuccess(true);
      } else {
        setErrorMsg(res.message || 'Registration failed. Please try again.');
      }
    } catch {
      setErrorMsg('Network error occurred during registration.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFrontIdQualified = Boolean(frontIdUrl && idAnalysis && idAnalysis.isId && idAnalysis.isClear);
  const isBackIdQualified = Boolean(backIdUrl && backIdAnalysis && backIdAnalysis.isId && backIdAnalysis.isClear);
  const isBothIdsQualified = isFrontIdQualified && isBackIdQualified;
  const hasInvalidIdSide = idAnalysis?.isId === false || backIdAnalysis?.isId === false;
  const hasUnclearIdSide =
    (idAnalysis?.isId !== false && idAnalysis?.isClear === false) ||
    (backIdAnalysis?.isId !== false && backIdAnalysis?.isClear === false);

  const liveSegregatedPrograms = isBothIdsQualified
    ? getQualifiedProgramsForResident(
        {
          purok: formData.purok,
          householdIncome: formData.householdIncome,
          familyMembersCount: formData.familyMembersCount,
          occupation: formData.occupation,
          employmentStatus: formData.employmentStatus,
          age: formData.age,
          gender: effectiveGender === 'male' ? 'Male' : 'Female',
          civilStatus: formData.civilStatus,
          idType: formData.idType,
          idNumber: formData.idNumber,
          frontIdUrl,
          backIdUrl,
          idPhotoAnalysis: idAnalysis || undefined,
          backIdPhotoAnalysis: backIdAnalysis || undefined,
          isPwd: formData.isPwd,
          pwdIdNumber: formData.pwdIdNumber,
          pwdDisabilityType: formData.pwdDisabilityType,
          isSoloParent: formData.isSoloParent,
          soloParentIdNumber: formData.soloParentIdNumber,
          isSenior: formData.isSenior,
          seniorIdNumber: formData.seniorIdNumber,
          isStudent: formData.isStudent,
          schoolName: formData.schoolName,
          studentLevel: formData.studentLevel,
          isTeenager: formData.isTeenager,
          isVerified: true
        },
        programs
      )
    : [];

  const getFieldClass = (field: string) => {
    const isRed = touched[field] && Boolean(errors[field]);
    if (isRed) {
      return 'w-full bg-rose-50/50 border-2 border-rose-500 text-rose-950 rounded-xl px-3.5 py-2.5 font-medium outline-none ring-2 ring-rose-200 placeholder-rose-400 text-xs sm:text-sm transition';
    }
    return 'w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-xl px-3.5 py-2.5 font-medium outline-none focus:ring-2 focus:ring-[#0c532b] focus:bg-white text-xs sm:text-sm transition';
  };

  return (
    <div className="min-h-screen bg-[#f0f4f9] flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8">
      {/* Top Header Logo & Left-aligned Back Button */}
      <div className="sm:mx-auto sm:w-full sm:max-w-xl mb-6">
        <div className="flex items-center justify-between mb-2">
          <button
            onClick={() => setAuthView('welcome')}
            className="p-2.5 rounded-full bg-white hover:bg-emerald-50 text-gray-700 hover:text-[#0c532b] border border-gray-200 shadow-xs transition-all cursor-pointer"
            title="Back to Portal Home"
            aria-label="Back to Portal Home"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="w-10" /> {/* Spacer for balance */}
        </div>

        <div className="text-center">
          <div className="flex justify-center mb-2">
            <BugoSealEmblem sizePx={56} />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            Create Resident Account
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">
            Barangay Bugo, Cagayan de Oro City Citizen Portal
          </p>
        </div>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-xl border border-gray-200 rounded-3xl space-y-6">
          {success ? (
            <div className="text-center space-y-4 py-4 animate-in fade-in zoom-in-95">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-[#0c532b] flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-extrabold text-gray-900">
                Account Created Successfully!
              </h3>
              <p className="text-xs text-gray-600 max-w-md mx-auto leading-relaxed">
                Your resident portal account has been created. You can now log in to request clearances, access barangay assistance, and track community services.
              </p>
              {registeredResidentId && (
                <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 inline-block font-mono text-sm font-bold text-[#0c532b]">
                  Assigned ID: {registeredResidentId}
                </div>
              )}
              <div className="pt-4">
                <button
                  onClick={() => setAuthView('login')}
                  className="w-full py-3 bg-[#0c532b] hover:bg-[#094222] text-white font-bold rounded-xl text-sm transition shadow-md cursor-pointer"
                >
                  Proceed to Sign In
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              {errorMsg && (
                <div className="p-3.5 bg-rose-50 border border-rose-300 rounded-2xl text-xs text-rose-800 font-semibold flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Full Legal Name */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-bold text-gray-700">
                    Full Legal Name <span className="text-rose-500">*</span>
                  </label>
                  {touched.name && errors.name && (
                    <span className="text-[11px] font-bold text-rose-600">{errors.name}</span>
                  )}
                </div>
                <div className="relative">
                  <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={formData.name}
                    placeholder="e.g. Joshua Abella Laurio"
                    onBlur={() => setTouched(prev => ({ ...prev, name: true }))}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={`${getFieldClass('name')} pl-10`}
                  />
                </div>
              </div>

              {/* Email Address */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-bold text-gray-700">
                    Email Address <span className="text-rose-500">*</span>
                  </label>
                  {touched.email && errors.email && (
                    <span className="text-[11px] font-bold text-rose-600">{errors.email}</span>
                  )}
                </div>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="email"
                    value={formData.email}
                    placeholder="e.g. resident@example.com"
                    onBlur={() => setTouched(prev => ({ ...prev, email: true }))}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className={`${getFieldClass('email')} pl-10`}
                  />
                </div>
              </div>

              {/* Philippine Mobile Number */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-bold text-gray-700">
                    Philippine Mobile Number <span className="text-rose-500">*</span>
                  </label>
                  {touched.contactNumber && errors.contactNumber && (
                    <span className="text-[11px] font-bold text-rose-600">{errors.contactNumber}</span>
                  )}
                </div>
                <div className="relative">
                  <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="tel"
                    maxLength={11}
                    value={formData.contactNumber}
                    placeholder="09171234567"
                    onBlur={() => setTouched(prev => ({ ...prev, contactNumber: true }))}
                    onChange={handlePhoneChange}
                    className={`${getFieldClass('contactNumber')} pl-10`}
                  />
                </div>
              </div>

              {/* Purok / Zone Dropdown */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Purok / Zone of Residence <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <select
                    value={formData.purok}
                    onChange={(e) => setFormData({ ...formData, purok: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-xl pl-10 pr-4 py-2.5 font-semibold outline-none focus:ring-2 focus:ring-[#0c532b] text-xs sm:text-sm"
                  >
                    {BUGO_PUROKS.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Complete Address */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-bold text-gray-700">
                    Complete Residential Address <span className="text-rose-500">*</span>
                  </label>
                  {touched.address && errors.address && (
                    <span className="text-[11px] font-bold text-rose-600">{errors.address}</span>
                  )}
                </div>
                <input
                  type="text"
                  value={formData.address}
                  placeholder="House No., Street Name, Sitio/Zone, Bugo"
                  onBlur={() => setTouched(prev => ({ ...prev, address: true }))}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className={getFieldClass('address')}
                />
              </div>

              {/* Household Profiling & Citizen Status Section */}
              <div className="pt-4 border-t border-gray-200">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Age with Auto-Profiling */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-xs font-bold text-gray-700">
                        Age <span className="text-rose-500">*</span>
                      </label>
                      <div className="flex items-center gap-1">
                        {formData.age >= 60 && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-300">
                            Senior (60+)
                          </span>
                        )}
                        {formData.age >= 13 && formData.age <= 19 && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 border border-blue-300">
                            Teen / Youth
                          </span>
                        )}
                      </div>
                    </div>
                    <input
                      type="number"
                      min={0}
                      max={120}
                      value={formData.age}
                      onChange={(e) => handleAgeChange(parseInt(e.target.value) || 0)}
                      className={getFieldClass('age')}
                    />
                  </div>

                  {/* Civil Status */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Civil Status <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Users className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <select
                        value={formData.civilStatus}
                        onChange={(e) => setFormData({ ...formData, civilStatus: e.target.value as any })}
                        className="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-xl pl-10 pr-4 py-2.5 font-semibold outline-none focus:ring-2 focus:ring-[#0c532b] text-xs sm:text-sm"
                      >
                        <option value="Single">Single</option>
                        <option value="Married">Married</option>
                        <option value="Widowed">Widowed</option>
                        <option value="Separated">Separated</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Occupation & Employment */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-xs font-bold text-gray-700">
                        Occupation / Livelihood <span className="text-rose-500">*</span>
                      </label>
                      {touched.occupation && errors.occupation && (
                        <span className="text-[11px] font-bold text-rose-600">{errors.occupation}</span>
                      )}
                    </div>
                    <div className="relative">
                      <Briefcase className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <select
                        value={occupationChoice}
                        onBlur={() => setTouched(prev => ({ ...prev, occupation: true }))}
                        onChange={(e) => handleOccupationSelectChange(e.target.value)}
                        className={`${getFieldClass('occupation')} pl-10 font-semibold`}
                      >
                        <option value="">Select Occupation / Livelihood</option>
                        {LIVELIHOOD_OPTIONS.map(occ => (
                          <option key={occ} value={occ}>{occ}</option>
                        ))}
                        <option value="Others">Others (Specify)</option>
                      </select>
                    </div>
                    {occupationChoice === 'Others' && (
                      <div className="mt-2">
                        <input
                          type="text"
                          value={customOccupation}
                          placeholder="Specify your occupation / livelihood"
                          onBlur={() => setTouched(prev => ({ ...prev, occupation: true }))}
                          onChange={(e) => {
                            const val = e.target.value;
                            setCustomOccupation(val);
                            handleOccupationChange(val);
                          }}
                          className={getFieldClass('occupation')}
                        />
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Employment Classification <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={formData.employmentStatus}
                      onChange={(e) => {
                        const val = e.target.value as any;
                        setFormData(prev => ({
                          ...prev,
                          employmentStatus: val,
                          isStudent: val === 'Student' ? true : prev.isStudent
                        }));
                      }}
                      className="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-xl px-3.5 py-2.5 font-semibold outline-none focus:ring-2 focus:ring-[#0c532b] text-xs sm:text-sm"
                    >
                      <option value="Employed (Full-Time)">Employed (Full-Time)</option>
                      <option value="Employed (Part-Time)">Employed (Part-Time)</option>
                      <option value="Self-Employed">Self-Employed / Freelancer</option>
                      <option value="Unemployed">Unemployed / Jobseeker</option>
                      <option value="Student">Student</option>
                      <option value="Retired">Retired / Pensioner</option>
                    </select>
                  </div>
                </div>

                {/* Household Monthly Income & Household Members */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Household Monthly Income <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={formData.householdIncome}
                      onChange={(e) => setFormData({ ...formData, householdIncome: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-xl px-3.5 py-2.5 font-semibold outline-none focus:ring-2 focus:ring-[#0c532b] text-xs sm:text-sm"
                    >
                      {MONTHLY_INCOME_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Household Members <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={20}
                      value={formData.familyMembersCount}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          familyMembersCount: Math.max(1, Math.min(20, parseInt(e.target.value, 10) || 1))
                        })
                      }
                      className={getFieldClass('familyMembersCount')}
                    />
                  </div>
                </div>

                {/* Valid ID (Front & Back Required) */}
                <div className="mt-3 p-4 rounded-2xl border border-gray-200 bg-gray-50/70 space-y-3">
                  <div>
                    <span className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                      <ScanLine className="w-4 h-4 text-[#0c532b]" />
                      Valid ID (Front &amp; Back) <span className="text-rose-500">*</span>
                    </span>
                    <p className="text-[11px] text-gray-500">
                      Attach clear Front and Back photos of your ID.
                    </p>
                  </div>

                  {cameraError && (
                    <p className="text-[11px] text-amber-700 font-medium">{cameraError}</p>
                  )}
                  {scanNotice && (
                    <p className="text-[11px] text-emerald-700 font-medium">{scanNotice}</p>
                  )}

                  <input
                    ref={frontFileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleIdFileSelect('front', e)}
                    className="hidden"
                  />
                  <input
                    ref={backFileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleIdFileSelect('back', e)}
                    className="hidden"
                  />
                  <input
                    ref={cameraFallbackInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={(e) => handleIdFileSelect(cameraTargetSide, e)}
                    className="hidden"
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* FRONT ID CARD */}
                    <div className={`p-3 rounded-xl border bg-white space-y-2 ${
                      idAnalysis && (!idAnalysis.isId || !idAnalysis.isClear)
                        ? 'border-rose-300 bg-rose-50/30'
                        : isFrontIdQualified
                          ? 'border-emerald-300'
                          : 'border-gray-200'
                    }`}>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-gray-900">
                          Front of ID <span className="text-rose-500">*</span>
                        </span>
                        {isFrontIdQualified && (
                          <span className="text-[10px] font-bold text-emerald-700">Valid ID</span>
                        )}
                      </div>

                      {frontIdUrl ? (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2.5">
                            <img
                              src={frontIdUrl}
                              alt="Front ID"
                              className="w-16 h-11 object-cover rounded-lg border border-gray-200 shrink-0"
                            />
                            <div className="min-w-0 flex-1">
                              <p className="text-[11px] font-medium text-gray-700 truncate">{frontIdFileName}</p>
                              {isScanningFrontId ? (
                                <p className="text-[11px] text-[#0c532b] font-semibold flex items-center gap-1">
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                  Checking ID...
                                </p>
                              ) : idAnalysis?.isId === false ? (
                                <p className="text-[11px] text-rose-600 font-bold">
                                  Not an ID — Not qualified
                                </p>
                              ) : idAnalysis?.isClear === false ? (
                                <p className="text-[11px] text-amber-700 font-bold">
                                  Not clear — Please try again
                                </p>
                              ) : (
                                <p className="text-[11px] text-emerald-700 font-semibold truncate">
                                  {idAnalysis?.detectedDocType || 'Valid ID'}
                                </p>
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setFrontIdUrl('');
                                setFrontIdFileName('');
                                setIdAnalysis(null);
                              }}
                              title="Remove Front ID"
                              className="p-1 text-gray-400 hover:text-rose-600 rounded cursor-pointer shrink-0"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {idAnalysis && (!idAnalysis.isId || !idAnalysis.isClear) && (
                            <button
                              type="button"
                              onClick={() => frontFileInputRef.current?.click()}
                              className="w-full py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-[11px] font-bold cursor-pointer"
                            >
                              Try Again
                            </button>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => openCameraScanner('front')}
                            disabled={isScanningFrontId}
                            className="flex-1 py-2 bg-[#0c532b] hover:bg-[#094222] text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                          >
                            <Camera className="w-3.5 h-3.5" />
                            <span>Scan</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => frontFileInputRef.current?.click()}
                            disabled={isScanningFrontId}
                            className="flex-1 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-300 text-gray-700 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                          >
                            <Upload className="w-3.5 h-3.5" />
                            <span>Attach</span>
                          </button>
                        </div>
                      )}

                      {!frontIdUrl && touched.frontIdUrl && errors.frontIdUrl && (
                        <p className="text-[11px] font-bold text-rose-600">{errors.frontIdUrl}</p>
                      )}
                    </div>

                    {/* BACK ID CARD */}
                    <div className={`p-3 rounded-xl border bg-white space-y-2 ${
                      backIdAnalysis && (!backIdAnalysis.isId || !backIdAnalysis.isClear)
                        ? 'border-rose-300 bg-rose-50/30'
                        : isBackIdQualified
                          ? 'border-emerald-300'
                          : 'border-gray-200'
                    }`}>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-gray-900">
                          Back of ID <span className="text-rose-500">*</span>
                        </span>
                        {isBackIdQualified && (
                          <span className="text-[10px] font-bold text-emerald-700">Valid ID</span>
                        )}
                      </div>

                      {backIdUrl ? (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2.5">
                            <img
                              src={backIdUrl}
                              alt="Back ID"
                              className="w-16 h-11 object-cover rounded-lg border border-gray-200 shrink-0"
                            />
                            <div className="min-w-0 flex-1">
                              <p className="text-[11px] font-medium text-gray-700 truncate">{backIdFileName}</p>
                              {isScanningBackId ? (
                                <p className="text-[11px] text-[#0c532b] font-semibold flex items-center gap-1">
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                  Checking ID...
                                </p>
                              ) : backIdAnalysis?.isId === false ? (
                                <p className="text-[11px] text-rose-600 font-bold">
                                  Not an ID — Not qualified
                                </p>
                              ) : backIdAnalysis?.isClear === false ? (
                                <p className="text-[11px] text-amber-700 font-bold">
                                  Not clear — Please try again
                                </p>
                              ) : (
                                <p className="text-[11px] text-emerald-700 font-semibold truncate">
                                  {backIdAnalysis?.detectedDocType || 'Valid Back ID'}
                                </p>
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setBackIdUrl('');
                                setBackIdFileName('');
                                setBackIdAnalysis(null);
                              }}
                              title="Remove Back ID"
                              className="p-1 text-gray-400 hover:text-rose-600 rounded cursor-pointer shrink-0"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {backIdAnalysis && (!backIdAnalysis.isId || !backIdAnalysis.isClear) && (
                            <button
                              type="button"
                              onClick={() => backFileInputRef.current?.click()}
                              className="w-full py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-[11px] font-bold cursor-pointer"
                            >
                              Try Again
                            </button>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => openCameraScanner('back')}
                            disabled={isScanningBackId}
                            className="flex-1 py-2 bg-[#0c532b] hover:bg-[#094222] text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                          >
                            <Camera className="w-3.5 h-3.5" />
                            <span>Scan</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => backFileInputRef.current?.click()}
                            disabled={isScanningBackId}
                            className="flex-1 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-300 text-gray-700 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                          >
                            <Upload className="w-3.5 h-3.5" />
                            <span>Attach</span>
                          </button>
                        </div>
                      )}

                      {!backIdUrl && touched.backIdUrl && errors.backIdUrl && (
                        <p className="text-[11px] font-bold text-rose-600">{errors.backIdUrl}</p>
                      )}
                    </div>
                  </div>

                  {/* Government / Resident ID Fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Valid Government / Resident ID Type <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <CreditCard className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <select
                          value={formData.idType}
                          onChange={(e) => setFormData({ ...formData, idType: e.target.value })}
                          className="w-full bg-white border border-gray-300 text-gray-900 rounded-xl pl-10 pr-4 py-2.5 font-semibold outline-none focus:ring-2 focus:ring-[#0c532b] text-xs sm:text-sm"
                        >
                          {GOV_ID_TYPES.map(t => (
                            <option key={t} value={t}>{t}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="block text-xs font-bold text-gray-700">
                          ID Number / Control No. <span className="text-rose-500">*</span>
                        </label>
                        {touched.idNumber && errors.idNumber && (
                          <span className="text-[11px] font-bold text-rose-600">{errors.idNumber}</span>
                        )}
                      </div>
                      <input
                        type="text"
                        value={formData.idNumber}
                        placeholder="e.g. 1234-5678-9012-3456"
                        onBlur={() => setTouched(prev => ({ ...prev, idNumber: true }))}
                        onChange={(e) => setFormData({ ...formData, idNumber: e.target.value })}
                        className={getFieldClass('idNumber')}
                      />
                    </div>
                  </div>
                </div>

                {/* Special Demographics & Assistance Categories */}
                <div className="mt-4 space-y-3">
                  <div className="text-[11px] font-bold text-gray-600 uppercase tracking-wider">
                    Special Assistance & Vulnerability Profiling
                  </div>

                  {/* PWD Category */}
                  <div className={`p-3 rounded-2xl border transition-all ${formData.isPwd ? 'bg-purple-50/70 border-purple-300' : 'bg-gray-50 border-gray-200'}`}>
                    <label className="flex items-start gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.isPwd}
                        onChange={(e) => setFormData({ ...formData, isPwd: e.target.checked })}
                        className="mt-0.5 w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-1.5 font-bold text-xs text-gray-900">
                          <Accessibility className="w-3.5 h-3.5 text-purple-600" />
                          Person with Disability (PWD)
                        </div>
                        <p className="text-[11px] text-gray-500">
                          Check if registered PWD for prioritized disability benefits and certificate fee exemptions.
                        </p>
                      </div>
                    </label>

                    {formData.isPwd && (
                      <div className="mt-3 pt-3 border-t border-purple-200 grid grid-cols-1 sm:grid-cols-2 gap-3 animate-in fade-in">
                        <div>
                          <label className="block text-[11px] font-bold text-gray-700 mb-1">
                            Disability Type
                          </label>
                          <select
                            value={formData.pwdDisabilityType}
                            onChange={(e) => setFormData({ ...formData, pwdDisabilityType: e.target.value })}
                            className="w-full bg-white border border-purple-200 text-gray-900 rounded-xl px-2.5 py-1.5 text-xs font-medium"
                          >
                            {DISABILITY_TYPES.map(d => (
                              <option key={d} value={d}>{d}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-gray-700 mb-1">
                            PWD ID / Control No. <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={formData.pwdIdNumber}
                            placeholder="e.g. 10-4305-PWD-2024"
                            onChange={(e) => setFormData({ ...formData, pwdIdNumber: e.target.value })}
                            className="w-full bg-white border border-purple-200 text-gray-900 rounded-xl px-2.5 py-1.5 text-xs font-medium"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Solo Parent Category */}
                  <div className={`p-3 rounded-2xl border transition-all ${formData.isSoloParent ? 'bg-pink-50/70 border-pink-300' : 'bg-gray-50 border-gray-200'}`}>
                    <label className="flex items-start gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.isSoloParent}
                        onChange={(e) => setFormData({ ...formData, isSoloParent: e.target.checked })}
                        className="mt-0.5 w-4 h-4 text-pink-600 rounded focus:ring-pink-500"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-1.5 font-bold text-xs text-gray-900">
                          <HeartHandshake className="w-3.5 h-3.5 text-pink-600" />
                          Solo Parent (RA 11861 Beneficiary)
                        </div>
                        <p className="text-[11px] text-gray-500">
                          Check if registered solo parent raising dependents under the Solo Parents Welfare Act.
                        </p>
                      </div>
                    </label>

                    {formData.isSoloParent && (
                      <div className="mt-3 pt-3 border-t border-pink-200 animate-in fade-in">
                        <label className="block text-[11px] font-bold text-gray-700 mb-1">
                          Solo Parent ID / DSWD ID Number <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={formData.soloParentIdNumber}
                          placeholder="e.g. SP-BUGO-2024-0089"
                          onChange={(e) => setFormData({ ...formData, soloParentIdNumber: e.target.value })}
                          className="w-full bg-white border border-pink-200 text-gray-900 rounded-xl px-2.5 py-1.5 text-xs font-medium"
                        />
                      </div>
                    )}
                  </div>

                  {/* Senior Citizen Category */}
                  <div className={`p-3 rounded-2xl border transition-all ${formData.isSenior ? 'bg-amber-50/70 border-amber-300' : 'bg-gray-50 border-gray-200'}`}>
                    <label className="flex items-start gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.isSenior}
                        onChange={(e) => setFormData({ ...formData, isSenior: e.target.checked })}
                        className="mt-0.5 w-4 h-4 text-amber-600 rounded focus:ring-amber-500"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-1.5 font-bold text-xs text-gray-900">
                          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                          Senior Citizen (OSCA Member - 60 years or older)
                        </div>
                        <p className="text-[11px] text-gray-500">
                          Automatically enabled for residents aged 60 and above for pension and senior privileges.
                        </p>
                      </div>
                    </label>

                    {formData.isSenior && (
                      <div className="mt-3 pt-3 border-t border-amber-200 animate-in fade-in">
                        <label className="block text-[11px] font-bold text-gray-700 mb-1">
                          OSCA Senior Citizen ID Number
                        </label>
                        <input
                          type="text"
                          value={formData.seniorIdNumber}
                          placeholder="e.g. OSCA-CDO-2023-4412"
                          onChange={(e) => setFormData({ ...formData, seniorIdNumber: e.target.value })}
                          className="w-full bg-white border border-amber-200 text-gray-900 rounded-xl px-2.5 py-1.5 text-xs font-medium"
                        />
                      </div>
                    )}
                  </div>

                  {/* Student Category */}
                  <div className={`p-3 rounded-2xl border transition-all ${formData.isStudent ? 'bg-blue-50/70 border-blue-300' : 'bg-gray-50 border-gray-200'}`}>
                    <label className="flex items-start gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.isStudent}
                        onChange={(e) => setFormData({ ...formData, isStudent: e.target.checked })}
                        className="mt-0.5 w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-1.5 font-bold text-xs text-gray-900">
                          <GraduationCap className="w-3.5 h-3.5 text-blue-600" />
                          Enrolled Student (Academic Assistance & Fee Waivers)
                        </div>
                        <p className="text-[11px] text-gray-500">
                          Qualifies for student barangay clearance fee exemptions and educational subsidies.
                        </p>
                      </div>
                    </label>

                    {formData.isStudent && (
                      <div className="mt-3 pt-3 border-t border-blue-200 grid grid-cols-1 sm:grid-cols-2 gap-3 animate-in fade-in">
                        <div>
                          <label className="block text-[11px] font-bold text-gray-700 mb-1">
                            Educational Level
                          </label>
                          <select
                            value={formData.studentLevel}
                            onChange={(e) => setFormData({ ...formData, studentLevel: e.target.value as any })}
                            className="w-full bg-white border border-blue-200 text-gray-900 rounded-xl px-2.5 py-1.5 text-xs font-medium"
                          >
                            <option value="Elementary">Elementary</option>
                            <option value="High School">High School / Senior High</option>
                            <option value="College/University">College / University</option>
                            <option value="Vocational">TESDA / Vocational</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-gray-700 mb-1">
                            School / University Name
                          </label>
                          <input
                            type="text"
                            value={formData.schoolName}
                            placeholder="e.g. Bugo National High School / USTP"
                            onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
                            className="w-full bg-white border border-blue-200 text-gray-900 rounded-xl px-2.5 py-1.5 text-xs font-medium"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Qualified Programs Preview */}
                <div className="mt-3 p-3.5 bg-emerald-50/60 border border-emerald-200 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-extrabold text-emerald-900 uppercase tracking-wider">
                      Qualified Programs
                    </span>
                    <span className="text-xs font-bold text-[#0c532b] tabular-nums">
                      {isBothIdsQualified
                        ? `${liveSegregatedPrograms.length} matched`
                        : hasInvalidIdSide
                          ? 'Not qualified'
                          : hasUnclearIdSide
                            ? 'ID not clear'
                            : 'ID required'}
                    </span>
                  </div>

                  {hasInvalidIdSide ? (
                    <p className="text-[11px] font-semibold text-rose-600">
                      Not qualified — Both Front and Back must be valid IDs.
                    </p>
                  ) : hasUnclearIdSide ? (
                    <p className="text-[11px] font-semibold text-amber-700">
                      Photo is not clear — Please attach a clearer ID photo and try again.
                    </p>
                  ) : !isBothIdsQualified ? (
                    <p className="text-[11px] text-gray-600">
                      Attach clear Front and Back ID photos above to check qualified programs.
                    </p>
                  ) : liveSegregatedPrograms.length === 0 ? (
                    <p className="text-[11px] text-gray-600">
                      No targeted programs matched. Standard barangay services remain available.
                    </p>
                  ) : (
                    <div className="bg-white rounded-xl border border-emerald-100 divide-y divide-gray-100 max-h-44 overflow-y-auto">
                      {liveSegregatedPrograms.map(prog => (
                        <div key={prog.id} className="px-3 py-2 flex items-center justify-between gap-2 text-xs">
                          <div className="min-w-0">
                            <p className="font-semibold text-gray-900 truncate">{prog.title}</p>
                            <p className="text-[11px] text-gray-500 truncate">{prog.category}</p>
                          </div>
                          <span className="text-[11px] font-semibold text-emerald-700 shrink-0">
                            Qualified
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

                {/* Password & Confirm Password */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-gray-500">
                      Security Credentials
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" />
                      Strong Password Mandatory
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="block text-xs font-bold text-gray-700">
                          Create Password <span className="text-rose-500">*</span>
                        </label>
                        {touched.password && errors.password && (
                          <span className="text-[11px] font-bold text-rose-600">{errors.password}</span>
                        )}
                      </div>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={formData.password}
                          placeholder="Create strong password"
                          onBlur={() => setTouched(prev => ({ ...prev, password: true }))}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          className={`${getFieldClass('password')} pl-10 pr-10`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                          title={showPassword ? 'Hide password' : 'Show password'}
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="block text-xs font-bold text-gray-700">
                          Confirm Password <span className="text-rose-500">*</span>
                        </label>
                        {touched.confirmPassword && errors.confirmPassword && (
                          <span className="text-[11px] font-bold text-rose-600">{errors.confirmPassword}</span>
                        )}
                      </div>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={formData.confirmPassword}
                          placeholder="Re-type password"
                          onBlur={() => setTouched(prev => ({ ...prev, confirmPassword: true }))}
                          onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                          className={`${getFieldClass('confirmPassword')} pl-10 pr-10`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                          title={showConfirmPassword ? 'Hide password' : 'Show password'}
                        >
                          {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Password Strength Meter & Real-time Security Checklist */}
                  <div className="p-3.5 bg-gray-50 border border-gray-200 rounded-2xl space-y-2.5 text-xs">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-gray-600 flex items-center gap-1.5">
                        <span>Password Strength:</span>
                        {!formData.password && (
                          <span className="text-gray-400 font-normal">(Start typing to evaluate)</span>
                        )}
                      </span>
                      <span className={`font-extrabold ${
                        !formData.password ? 'text-gray-400' :
                        passwordStrength.strengthLabel === 'Strong' ? 'text-emerald-700' :
                        passwordStrength.strengthLabel === 'Good' ? 'text-blue-700' :
                        passwordStrength.strengthLabel === 'Fair' ? 'text-yellow-700' :
                        passwordStrength.strengthLabel === 'Weak' ? 'text-amber-700' : 'text-rose-700'
                      }`}>
                        {formData.password ? `${passwordStrength.strengthLabel} (${passwordStrength.score}/5 criteria)` : '0/5 criteria'}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${formData.password ? passwordStrength.strengthColor : 'bg-gray-300'} transition-all duration-300`} 
                        style={{ width: formData.password ? passwordStrength.strengthWidth : '0%' }}
                      />
                    </div>

                    {/* Checklist Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1 text-[11px]">
                      {passwordStrength.requirements.map(req => (
                        <div 
                          key={req.id} 
                          className={`flex items-center gap-1.5 ${req.met ? 'text-emerald-700 font-semibold' : 'text-gray-400'}`}
                        >
                          {req.met ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                          ) : (
                            <div className="w-3.5 h-3.5 rounded-full border border-gray-300 flex-shrink-0" />
                          )}
                          <span>{req.label}</span>
                        </div>
                      ))}
                      <div className={`flex items-center gap-1.5 ${
                        formData.confirmPassword && formData.password === formData.confirmPassword 
                          ? 'text-emerald-700 font-semibold' 
                          : 'text-gray-400'
                      }`}>
                        {formData.confirmPassword && formData.password === formData.confirmPassword ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                        ) : (
                          <div className="w-3.5 h-3.5 rounded-full border border-gray-300 flex-shrink-0" />
                        )}
                        <span>Both passwords match</span>
                      </div>
                    </div>
                  </div>
                </div>

              {/* Choose Avatar */}
              <div className="pt-2 border-t border-gray-100 space-y-2">
                <div className="flex items-center justify-end">
                  <div className="flex items-center bg-gray-100 p-0.5 rounded-lg border border-gray-200 text-[10px] font-bold">
                    <button
                      type="button"
                      onClick={() => setAvatarGenderManual('male')}
                      className={`px-2 py-0.5 rounded-md transition-all cursor-pointer ${
                        effectiveGender === 'male'
                          ? 'bg-[#0c532b] text-white shadow-xs'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      Male
                    </button>
                    <button
                      type="button"
                      onClick={() => setAvatarGenderManual('female')}
                      className={`px-2 py-0.5 rounded-md transition-all cursor-pointer ${
                        effectiveGender === 'female'
                          ? 'bg-[#0c532b] text-white shadow-xs'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      Female
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                  {(effectiveGender === 'male' ? MALE_CARTOON_AVATARS : FEMALE_CARTOON_AVATARS).map((preset) => {
                    const isSelected = (selectedAvatarUrl || defaultMatchedAvatar) === preset.url;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => setSelectedAvatarUrl(preset.url)}
                        className={`p-1 rounded-xl border-2 transition transform hover:scale-105 flex flex-col items-center gap-1 cursor-pointer ${
                          isSelected
                            ? 'border-[#0c532b] bg-emerald-50 ring-2 ring-emerald-300'
                            : 'border-gray-200 hover:border-emerald-500 bg-gray-50/50'
                        }`}
                        title={preset.name}
                      >
                        <div className="w-9 h-9 rounded-full overflow-hidden bg-white shadow-xs">
                          <img src={preset.url} alt={preset.name} className="w-full h-full object-cover" />
                        </div>
                        <span className="text-[8px] font-bold text-gray-700 truncate max-w-[45px] block text-center">
                          {preset.name.split(' ')[0]}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Policy Agreements Checklist */}
              <div className="pt-2 border-t border-gray-100 space-y-2.5">
                <span className="block text-xs font-bold text-gray-900">
                  Required Policy Agreements:
                </span>

                <label className="flex items-start gap-2.5 text-xs text-gray-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.agreeTerms}
                    onChange={(e) => setFormData({ ...formData, agreeTerms: e.target.checked })}
                    className="mt-0.5 rounded text-[#0c532b] focus:ring-[#0c532b] h-4 w-4"
                  />
                  <span>
                    I agree to the <strong>Barangay Bugo Citizen Portal Terms of Service</strong> and official portal usage guidelines.
                  </span>
                </label>
                {touched.agreeTerms && errors.agreeTerms && (
                  <p className="text-[11px] text-rose-600 font-bold pl-6">{errors.agreeTerms}</p>
                )}

                <label className="flex items-start gap-2.5 text-xs text-gray-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.agreePrivacy}
                    onChange={(e) => setFormData({ ...formData, agreePrivacy: e.target.checked })}
                    className="mt-0.5 rounded text-[#0c532b] focus:ring-[#0c532b] h-4 w-4"
                  />
                  <span>
                    I consent to the collection and processing of my information under the <strong>Data Privacy Act of 2012 (RA 10173)</strong> for barangay record-keeping.
                  </span>
                </label>
                {touched.agreePrivacy && errors.agreePrivacy && (
                  <p className="text-[11px] text-rose-600 font-bold pl-6">{errors.agreePrivacy}</p>
                )}

                <label className="flex items-start gap-2.5 text-xs text-gray-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.agreeTruthfulness}
                    onChange={(e) => setFormData({ ...formData, agreeTruthfulness: e.target.checked })}
                    className="mt-0.5 rounded text-[#0c532b] focus:ring-[#0c532b] h-4 w-4"
                  />
                  <span>
                    I certify under penalty of administrative rules that all information provided is true, correct, and belongs to a bonafide resident.
                  </span>
                </label>
                {touched.agreeTruthfulness && errors.agreeTruthfulness && (
                  <p className="text-[11px] text-rose-600 font-bold pl-6">{errors.agreeTruthfulness}</p>
                )}
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting || isScanningId}
                  className="w-full py-3 px-4 bg-[#0c532b] hover:bg-[#094222] text-white font-bold rounded-xl text-sm transition shadow-md disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isSubmitting ? (
                    <span>Creating Citizen Account...</span>
                  ) : isScanningId ? (
                    <span>Scanning Attached ID...</span>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>Complete Account Registration</span>
                    </>
                  )}
                </button>
              </div>

              <div className="text-center pt-2">
                <p className="text-xs text-gray-500">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => setAuthView('login')}
                    className="text-[#0c532b] font-bold hover:underline cursor-pointer"
                  >
                    Sign In
                  </button>
                </p>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Live Camera Scan ID Modal */}
      {isCameraOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={stopCamera}
        >
          <div
            className="bg-white rounded-2xl max-w-md w-full p-5 border border-gray-200 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Camera className="w-4 h-4 text-[#0c532b]" />
                <h3 className="text-sm font-bold text-gray-900">
                  Scan {cameraTargetSide === 'back' ? 'Back' : 'Front'} of ID
                </h3>
              </div>
              <button
                type="button"
                onClick={stopCamera}
                className="p-1 text-gray-400 hover:text-gray-700 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="relative rounded-xl overflow-hidden bg-black aspect-video flex items-center justify-center">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              <div className="pointer-events-none absolute inset-4 border-2 border-dashed border-emerald-400/80 rounded-lg" />
            </div>

            <p className="text-[11px] text-gray-500 text-center">
              Align your ID card inside the frame and ensure text is clear and well-lit.
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={stopCamera}
                className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={captureFromCamera}
                className="flex-1 py-2.5 bg-[#0c532b] hover:bg-[#094222] text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Camera className="w-4 h-4" />
                <span>Capture &amp; Scan ID</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
