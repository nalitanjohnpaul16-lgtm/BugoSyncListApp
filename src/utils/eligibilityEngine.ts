import { EligibilityEvaluation, EligibilityRuleResult, IdPhotoAnalysis } from '../types';

export function parseMonthlyIncome(incomeStr: string): number {
  if (!incomeStr) return 0;
  // Match digits, handle standard Philippine peso strings like "₱8,500.00 (Informal / Low Income)" -> 8500
  const match = incomeStr.replace(/[^\d.]/g, '');
  const parsed = parseFloat(match);
  return isNaN(parsed) ? 0 : parsed;
}

export interface ProgramRuleConfig {
  id: string;
  title: string;
  category: string;
  maxMonthlyIncome: number;
  incomeLabel: string;
  allowedOccupations?: string[];
  disallowedOccupations?: string[];
  minAge?: number;
  maxAge?: number;
  mandatoryDocs: string[];
  description: string;
  specialRules?: string[];
}

export const PROGRAM_RULES: Record<string, ProgramRuleConfig> = {
  'prog-barangay-clearance': {
    id: 'prog-barangay-clearance',
    title: 'Barangay Clearance & Certification',
    category: 'Clearance & Certification',
    maxMonthlyIncome: Infinity,
    incomeLabel: 'Universal (No Income Limit)',
    mandatoryDocs: ['Valid Government ID / Proof of Identity', 'Community Tax Certificate (Cedula)'],
    minAge: 15,
    description: 'Universal administrative certification for all verified Barangay Bugo residents.'
  },
  'prog-admin-residency': {
    id: 'prog-admin-residency',
    title: 'Certificate of Residency',
    category: 'Clearance & Certification',
    maxMonthlyIncome: Infinity,
    incomeLabel: 'Universal (No Income Limit)',
    mandatoryDocs: ['Valid Government ID / Proof of Address', 'Zone Endorsement'],
    minAge: 0,
    description: 'Official certification certifying physical residence in a specific Zone/Purok of Bugo.'
  },
  'prog-admin-indigency': {
    id: 'prog-admin-indigency',
    title: 'Certificate of Indigency',
    category: 'Clearance & Certification',
    maxMonthlyIncome: 10000,
    incomeLabel: 'Maximum ₱10,000.00 / month (Indigent Bracket)',
    mandatoryDocs: ['Valid Resident ID or Voter Certification', 'Zone Endorsement'],
    minAge: 0,
    description: 'Affidavit of low income / indigent status for medical fee waivers, legal aid, and financial relief.'
  },
  'prog-admin-good-moral': {
    id: 'prog-admin-good-moral',
    title: 'Certificate of Good Moral Character',
    category: 'Clearance & Certification',
    maxMonthlyIncome: Infinity,
    incomeLabel: 'Universal (No Income Limit)',
    mandatoryDocs: ['Valid Government or Student ID', 'Barangay Clearance Copy'],
    minAge: 12,
    description: 'Attestation of exemplary community conduct, clean record, and civic standing.'
  },
  'prog-admin-first-job': {
    id: 'prog-admin-first-job',
    title: 'First-Time Job Seeker Certification (RA 11261)',
    category: 'Clearance & Certification',
    maxMonthlyIncome: Infinity,
    incomeLabel: 'Open to First-Time Entrants',
    allowedOccupations: ['Student', 'Unemployed', 'Jobseeker', 'Fresh Graduate', 'Seeking Work', 'Resident'],
    minAge: 18,
    mandatoryDocs: ['Diploma / Transcript / Graduation Proof', 'Valid Government ID', 'Signed Oath of Undertaking'],
    description: 'Republic Act 11261 waiver granting free government clearances for new jobseekers.'
  },
  'prog-cert-solo-parent': {
    id: 'prog-cert-solo-parent',
    title: 'Solo Parent Barangay Certification (RA 11861)',
    category: 'Clearance & Certification',
    maxMonthlyIncome: 35000,
    incomeLabel: 'Maximum ₱35,000.00 / month',
    mandatoryDocs: ['Solo Parent ID or Sworn Affidavit of Solo Parenting', 'Birth Certificate of Dependents', 'Barangay Indigency / Proof of Income'],
    minAge: 18,
    description: 'Official endorsement certifying Solo Parent status under Republic Act 11861 for monthly subsidies and education aid.'
  },
  'prog-cert-senior-citizen': {
    id: 'prog-cert-senior-citizen',
    title: 'Senior Citizen Barangay Endorsement & Certification',
    category: 'Clearance & Certification',
    maxMonthlyIncome: Infinity,
    incomeLabel: 'Universal for Seniors (60+)',
    minAge: 60,
    mandatoryDocs: ['PSA Birth Certificate or Proof of Age 60+', 'Barangay Resident ID', '2x2 Recent Photos'],
    description: 'Official barangay certification for elderly residents (aged 60+) for OSCA ID, 20% discounts, and social pensions.'
  },
  'prog-cert-pwd': {
    id: 'prog-cert-pwd',
    title: 'PWD Barangay Endorsement & Certification (RA 10754)',
    category: 'Clearance & Certification',
    maxMonthlyIncome: Infinity,
    incomeLabel: 'Universal for Persons with Disabilities',
    mandatoryDocs: ['Medical Certificate / Clinical Disability Assessment', 'Barangay Resident ID', '2x2 ID Photos'],
    minAge: 0,
    description: 'Official barangay certification endorsing PWD benefits, discounts, and assistive device grants.'
  },
  'prog-cert-student-grant': {
    id: 'prog-cert-student-grant',
    title: 'Student Barangay Certification & Fee Waiver Endorsement',
    category: 'Clearance & Certification',
    maxMonthlyIncome: 20000,
    incomeLabel: 'Maximum ₱20,000.00 / month',
    allowedOccupations: ['Student', 'College Student', 'Senior High Student', 'Vocational Student', 'Scholar'],
    minAge: 12,
    maxAge: 30,
    mandatoryDocs: ['Valid Student School ID', 'Certificate of Registration (COR) / Enrollment Form', 'Certificate of Indigency'],
    description: 'Official student certification endorsing government scholarships, student fare discounts, and tuition aid.'
  },
  'prog-admin-business-permit': {
    id: 'prog-admin-business-permit',
    title: 'Barangay Business Clearance / Commercial Permit',
    category: 'Clearance & Certification',
    maxMonthlyIncome: Infinity,
    incomeLabel: 'Commercial Enterprise',
    minAge: 18,
    mandatoryDocs: ['DTI / SEC Registration', 'Proof of Business Location in Bugo', 'Valid ID of Enterprise Owner'],
    description: 'Commercial business clearance required for City Hall Mayor’s Business Permit in Cagayan de Oro.'
  },
  'prog-educational-assistance': {
    id: 'prog-educational-assistance',
    title: 'Tertiary Education Student Financial Aid',
    category: 'Education',
    maxMonthlyIncome: 15000,
    incomeLabel: 'Maximum ₱15,000.00 / month',
    allowedOccupations: ['Student', 'College Student', 'Vocational Student', 'Scholar', 'Unemployed Student', 'Working Student'],
    disallowedOccupations: [
      'Manager', 'Director', 'Engineer', 'Lawyer', 'Accountant', 
      'Corporate Executive', 'Supervisor', 'Business Owner', 'Government Official'
    ],
    minAge: 16,
    maxAge: 32,
    mandatoryDocs: [
      'Valid Student ID or Government ID',
      'Certificate of Registration (COR) / Enrollment Form',
      'Certificate of Indigency'
    ],
    description: 'Semester cash subsidy restricted strictly to students from indigent Bugo families (Income <= ₱15,000.00).'
  },
  'prog-youth-scholarship': {
    id: 'prog-youth-scholarship',
    title: 'Barangay Educational Scholarship Grant',
    category: 'Education',
    maxMonthlyIncome: 15000,
    incomeLabel: 'Maximum ₱15,000.00 / month',
    allowedOccupations: ['Student', 'College Student', 'Senior High Student', 'Scholar', 'Working Student'],
    disallowedOccupations: [
      'Manager', 'Director', 'Engineer', 'Lawyer', 'Accountant', 
      'Corporate Executive', 'Supervisor', 'Business Owner'
    ],
    minAge: 16,
    maxAge: 30,
    mandatoryDocs: [
      'Valid Student ID',
      'Certificate of Registration (COR)',
      'Certificate of Indigency'
    ],
    description: 'Educational scholarship grant for students from low-income Bugo households.'
  },
  'prog-medical-aid': {
    id: 'prog-medical-aid',
    title: 'Emergency Medical & Prescription Subsidy',
    category: 'Medical',
    maxMonthlyIncome: 10000,
    incomeLabel: 'Maximum ₱10,000.00 / month (Indigent Bracket)',
    mandatoryDocs: [
      'Valid Government ID',
      'Medical Abstract / Doctor Prescription',
      'Hospital Billing Statement / Pharmacy Quotation',
      'Certificate of Indigency'
    ],
    description: 'Urgent hospitalization and prescription subsidy reserved for indigent patients, seniors, and PWDs.'
  },
  'prog-medical-subsidy': {
    id: 'prog-medical-subsidy',
    title: 'Medical Assistance & Health Subsidy',
    category: 'Medical',
    maxMonthlyIncome: 10000,
    incomeLabel: 'Maximum ₱10,000.00 / month (Indigent Bracket)',
    mandatoryDocs: [
      'Valid Government ID',
      'Medical Abstract / Prescription',
      'Hospital Billing or Pharmacy Quotation',
      'Certificate of Indigency'
    ],
    description: 'Medical assistance reserved for indigent patients, senior citizens, and PWDs earning ₱10,000/month or below.'
  }
};

export interface CertificateQualificationResult {
  isQualified: boolean;
  score: number;
  badgeLabel: 'QUALIFIED' | 'NOT QUALIFIED / REQUIREMENTS INCOMPLETE';
  badgeColor: 'emerald' | 'rose';
  passedCriteria: string[];
  failedCriteria: string[];
  passedRules: string[];
  failureReasons: string[];
  failedRules: string[];
  summary: string;
}

/**
 * Automates the qualification evaluation of a resident's household profiling data
 * against any requested Certificate or Clearance service.
 */
export function evaluateCertificateQualification(
  resident: Partial<import('../types').ResidentUser> | null | undefined,
  serviceId: string
): CertificateQualificationResult {
  if (!resident) {
    const defaultFail = ['No resident account profile found in session. Please sign in or create an account.'];
    return {
      isQualified: false,
      score: 0,
      badgeLabel: 'NOT QUALIFIED / REQUIREMENTS INCOMPLETE',
      badgeColor: 'rose',
      passedCriteria: [],
      failedCriteria: defaultFail,
      passedRules: [],
      failureReasons: defaultFail,
      failedRules: defaultFail,
      summary: 'Sign in to evaluate automated qualification.'
    };
  }

  const passedCriteria: string[] = [];
  const failedCriteria: string[] = [];
  const incomeVal = parseMonthlyIncome(resident.householdIncome || '');
  const residentAge = resident.age || 0;
  const occ = (resident.occupation || '').toLowerCase();
  const civil = resident.civilStatus || 'Single';

  // Rule 0: Bugo Zone Residency
  const hasValidPurok = Boolean(resident.purok && resident.purok.toLowerCase().includes('zone'));
  if (hasValidPurok) {
    passedCriteria.push(`Verified Territorial Residency: Bona fide resident of ${resident.purok}`);
  } else {
    failedCriteria.push('Territorial Residency: Must be a resident residing within Bugo Zones 1 to 10');
  }

  // Rule 1: Identification on file (Front & Back validity + clarity)
  const frontInvalid = resident.idPhotoAnalysis?.isId === false;
  const backInvalid = resident.backIdPhotoAnalysis?.isId === false;
  const frontBlurry = resident.idPhotoAnalysis?.isClear === false;
  const backBlurry = resident.backIdPhotoAnalysis?.isClear === false;
  const missingFrontOrBackOnNewAccount = !resident.isVerified && (!resident.frontIdUrl || !resident.backIdUrl);
  const hasIdOnFile = Boolean(resident.idType || resident.idNumber || resident.frontIdUrl || resident.residentIdNumber);

  if (frontInvalid || backInvalid) {
    failedCriteria.push('Invalid ID: Attached Front or Back image is not a valid ID');
  } else if (frontBlurry || backBlurry) {
    failedCriteria.push('Photo Not Clear: Please attach a clearer Front/Back ID photo and try again');
  } else if (missingFrontOrBackOnNewAccount) {
    failedCriteria.push('Missing ID: Both Front and Back ID photos are required');
  } else if (hasIdOnFile) {
    passedCriteria.push(`ID Verification: Official identity credentials on file (${resident.idType || 'Barangay Resident ID'})`);
  } else {
    failedCriteria.push('Identity Credentials: Valid government, student, or resident ID must be registered on account');
  }

  // Certificate-Specific Rules:
  switch (serviceId) {
    case 'prog-cert-solo-parent': {
      // Must be Solo Parent under RA 11861 or widowed/separated with dependents
      const isSolo = Boolean(resident.isSoloParent);
      const isWidowedOrSeparatedWithKids = (civil === 'Widowed' || civil === 'Separated') && (resident.familyMembersCount || 0) >= 2;
      
      if (isSolo || isWidowedOrSeparatedWithKids) {
        passedCriteria.push(
          isSolo 
            ? `Solo Parent Status: Verified registered solo parent under RA 11861 (${resident.soloParentIdNumber ? `ID #${resident.soloParentIdNumber}` : 'Declared'})`
            : `Civil Status & Dependents: Registered as ${civil} sole head with ${(resident.familyMembersCount || 1) - 1} dependent child/children`
        );
      } else {
        failedCriteria.push(
          civil === 'Married'
            ? 'Solo Parent Criteria: Registered as Married with co-parenting spouse; does not qualify under RA 11861 Solo Parents Act'
            : 'Solo Parent Criteria: Must be registered as a Solo Parent or single head with minor dependents'
        );
      }

      if (incomeVal <= 35000) {
        passedCriteria.push(`Income Ceiling: Household income of ₱${incomeVal.toLocaleString()} is within the RA 11861 subsidy bracket (<= ₱35,000)`);
      } else {
        failedCriteria.push(`Income Ceiling: Household income exceeds RA 11861 threshold of ₱35,000/month`);
      }
      break;
    }

    case 'prog-cert-senior-citizen': {
      // Must be Senior Citizen (60+ yrs old)
      const isSeniorFlag = Boolean(resident.isSenior) || residentAge >= 60;
      if (isSeniorFlag) {
        passedCriteria.push(`Senior Age Criteria: Applicant age is ${residentAge > 0 ? `${residentAge} years old` : '60+ (Senior)'}, qualifying for OSCA endorsement`);
        if (resident.seniorIdNumber) {
          passedCriteria.push(`Senior OSCA ID: Documented Senior ID #${resident.seniorIdNumber}`);
        }
      } else {
        failedCriteria.push(`Age Requirement: Applicant is ${residentAge > 0 ? `${residentAge} years old` : 'under 60'}; Senior Citizen certification requires age 60 and above`);
      }
      break;
    }

    case 'prog-cert-pwd': {
      // Must be PWD
      const isPwd = Boolean(resident.isPwd);
      if (isPwd) {
        passedCriteria.push(`PWD Verification: Documented Person with Disability status (${resident.pwdDisabilityType || 'Registered Impairment'}) under RA 10754`);
        if (resident.pwdIdNumber) {
          passedCriteria.push(`PWD ID Card: Registered PWD ID #${resident.pwdIdNumber}`);
        }
      } else {
        failedCriteria.push('Disability Status: Requires registered Person with Disability (PWD) status under Republic Act 10754');
      }
      break;
    }

    case 'prog-cert-student-grant': {
      // Must be Student
      const isStudent = Boolean(resident.isStudent) || occ.includes('student') || occ.includes('scholar') || Boolean(resident.isTeenager);
      if (isStudent) {
        passedCriteria.push(`Student Enrolment: Verified active student (${resident.schoolName || resident.studentLevel || 'Academic enrollee'})`);
      } else {
        failedCriteria.push('Academic Status: Applicant must be an active enrolled student or youth scholar');
      }

      if (incomeVal <= 20000) {
        passedCriteria.push(`Income Bracket: Household income (₱${incomeVal.toLocaleString()}) qualifies for educational fee waiver support`);
      } else {
        failedCriteria.push(`Income Bracket: Household income exceeds educational fee waiver ceiling (<= ₱20,000)`);
      }
      break;
    }

    case 'prog-admin-indigency': {
      // Low income <= 10,000
      if (incomeVal <= 10000) {
        passedCriteria.push(`Economic Need: Monthly income (₱${incomeVal.toLocaleString()}) is at or below the statutory indigency threshold (<= ₱10,000)`);
      } else {
        failedCriteria.push(`Economic Need: Household monthly income (₱${incomeVal.toLocaleString()}) exceeds the ₱10,000.00 indigency threshold`);
      }
      break;
    }

    case 'prog-admin-first-job': {
      // First-time jobseeker
      const isJobseeker = occ.includes('unemployed') || occ.includes('student') || occ.includes('jobseeker') || occ.includes('resident') || occ.includes('graduate');
      if (residentAge >= 18) {
        passedCriteria.push(`Legal Age: Applicant is ${residentAge} years old (meets statutory legal employment age >= 18)`);
      } else if (residentAge > 0 && residentAge < 18) {
        failedCriteria.push(`Legal Age: Applicant must be at least 18 years of age (currently ${residentAge} years old)`);
      }

      if (isJobseeker) {
        passedCriteria.push(`Job Market Status: Applicant qualifies as first-time labor market entrant under RA 11261`);
      } else {
        failedCriteria.push(`Employment Status: Occupation is currently recorded as '${resident.occupation || 'Employed'}'; RA 11261 applies to first-time jobseekers`);
      }
      break;
    }

    case 'prog-admin-business-permit': {
      if (residentAge >= 18) {
        passedCriteria.push(`Legal Age: Applicant is of legal age (${residentAge > 0 ? residentAge : '18+'} years old)`);
      } else {
        failedCriteria.push('Legal Age: Enterprise proprietor must be at least 18 years old');
      }
      passedCriteria.push('Commercial Zoning: Business clearance covers Bugo commercial & residential zones');
      break;
    }

    case 'prog-barangay-clearance':
    case 'prog-admin-residency':
    case 'prog-admin-good-moral':
    default: {
      // Universal resident certificates
      if (resident.isBanned) {
        failedCriteria.push(`Barangay Standing: Account is currently restricted/banned: ${resident.banReason || 'Policy dispute'}`);
      } else {
        passedCriteria.push('Barangay Standing: Clean community record with no unresolved blotters or sanctions');
      }
      break;
    }
  }

  const isQualified = failedCriteria.length === 0;
  const totalChecks = passedCriteria.length + failedCriteria.length;
  const score = totalChecks > 0 ? Math.round((passedCriteria.length / totalChecks) * 100) : 100;

  const summary = isQualified
    ? `Automatically Qualified: Your citizen profile meets all requirements for this Certificate (${passedCriteria.length}/${totalChecks} verified criteria).`
    : `Requirements Incomplete: Profile does not satisfy ${failedCriteria.length} qualification requirement${failedCriteria.length > 1 ? 's' : ''} for this Certificate.`;

  return {
    isQualified,
    score,
    badgeLabel: isQualified ? 'QUALIFIED' : 'NOT QUALIFIED / REQUIREMENTS INCOMPLETE',
    badgeColor: isQualified ? 'emerald' : 'rose',
    passedCriteria,
    failedCriteria,
    passedRules: passedCriteria,
    failureReasons: failedCriteria,
    failedRules: failedCriteria,
    summary
  };
}

export interface ApplicantEvaluationInput {
  programId: string;
  programTitle?: string;
  applicantName: string;
  purok: string;
  address: string;
  householdIncome: string;
  familyCount?: number;
  occupation?: string;
  age?: number;
  purpose: string;
  hasFrontId: boolean;
  hasBackId?: boolean;
  hasSupportingDoc: boolean;
  idAnalysis?: IdPhotoAnalysis | null;
  backIdAnalysis?: IdPhotoAnalysis | null;
}

export function evaluateApplicantEligibility(input: ApplicantEvaluationInput): EligibilityEvaluation {
  // Find rule config or fallback
  let config = PROGRAM_RULES[input.programId];
  if (!config) {
    // Attempt match by title or category
    const titleLower = (input.programTitle || input.programId).toLowerCase();
    if (titleLower.includes('education') || titleLower.includes('scholarship') || titleLower.includes('student')) {
      config = PROGRAM_RULES['prog-educational-assistance'];
    } else if (titleLower.includes('medical') || titleLower.includes('health') || titleLower.includes('subsidy')) {
      config = PROGRAM_RULES['prog-medical-aid'];
    } else {
      config = PROGRAM_RULES['prog-barangay-clearance'];
    }
  }

  const rules: EligibilityRuleResult[] = [];
  const parsedIncome = parseMonthlyIncome(input.householdIncome);

  // 1. Income Boundary Check
  const incomePassed = parsedIncome <= config.maxMonthlyIncome;
  rules.push({
    ruleName: 'Income Ceiling Boundary',
    passed: incomePassed,
    actualValue: input.householdIncome || '₱0.00',
    limitValue: config.incomeLabel,
    explanation: incomePassed 
      ? `Income of ₱${parsedIncome.toLocaleString()} is within the allowable boundary (${config.incomeLabel}).`
      : `Household income of ₱${parsedIncome.toLocaleString()} exceeds the maximum allowable boundary of ${config.incomeLabel} for this assistance program.`
  });

  // 2. Demographic / Target Occupation Check
  let occupationPassed = true;
  let occupationExplanation = 'Applicant demographic qualifies for this service.';
  if (config.allowedOccupations && config.allowedOccupations.length > 0) {
    const occ = (input.occupation || '').trim().toLowerCase();
    const isExplicitlyAllowed = config.allowedOccupations.some(allowed => occ.includes(allowed.toLowerCase()));
    const isExplicitlyDisallowed = config.disallowedOccupations?.some(dis => occ.includes(dis.toLowerCase()));

    if (isExplicitlyDisallowed) {
      occupationPassed = false;
      occupationExplanation = `Occupation '${input.occupation}' is classified as regular professional employment, exceeding indigent eligibility criteria for student educational grants.`;
    } else if (!isExplicitlyAllowed && !occ.includes('student') && !occ.includes('scholar') && !occ.includes('unemployed') && !occ.includes('dependent')) {
      // If applying for student aid but not marked as student
      occupationPassed = false;
      occupationExplanation = `Applicant occupation '${input.occupation || 'Unspecified'}' does not match the required target group (${config.allowedOccupations.join(', ')}).`;
    } else {
      occupationExplanation = `Applicant occupation '${input.occupation || 'Student'}' is confirmed eligible.`;
    }
  }

  rules.push({
    ruleName: 'Target Demographic & Occupation',
    passed: occupationPassed,
    actualValue: input.occupation || 'Resident',
    limitValue: config.allowedOccupations ? config.allowedOccupations.join(', ') : 'All Bugo Residents',
    explanation: occupationExplanation
  });

  // 3. Bugo Residency Boundary Check
  const residencyPassed = Boolean(input.purok && input.purok.toLowerCase().includes('zone'));
  rules.push({
    ruleName: 'Bugo Territorial Residency',
    passed: residencyPassed,
    actualValue: input.purok || 'Unknown Purok',
    limitValue: 'Zones 1 - 10, Barangay Bugo',
    explanation: residencyPassed
      ? `Verified resident of ${input.purok}, within official Barangay Bugo boundaries.`
      : `Territorial residency could not be confirmed within Barangay Bugo zones.`
  });

  // 4. Identification & Document Authenticity Check (Front & Back)
  let idPassed = input.hasFrontId && input.hasBackId !== false;
  let idExplanation = 'Valid Front and Back ID photos attached.';
  if (!input.hasFrontId || input.hasBackId === false) {
    idPassed = false;
    idExplanation = 'Both Front and Back photos of a valid ID are required.';
  } else if (input.idAnalysis && !input.idAnalysis.isId) {
    idPassed = false;
    idExplanation = 'Front photo is not a valid ID. Not qualified.';
  } else if (input.backIdAnalysis && !input.backIdAnalysis.isId) {
    idPassed = false;
    idExplanation = 'Back photo is not a valid ID. Not qualified.';
  } else if (input.idAnalysis && !input.idAnalysis.isClear) {
    idPassed = false;
    idExplanation = 'Front ID photo is not clear. Please try again.';
  } else if (input.backIdAnalysis && !input.backIdAnalysis.isClear) {
    idPassed = false;
    idExplanation = 'Back ID photo is not clear. Please try again.';
  } else if (input.idAnalysis) {
    idExplanation = `Verified ${input.idAnalysis.detectedDocType || 'Official ID'} (Front & Back clear).`;
  }

  rules.push({
    ruleName: 'Identification & Document Authenticity',
    passed: idPassed,
    actualValue: !input.hasFrontId || input.hasBackId === false
      ? 'Missing Front/Back ID'
      : input.idAnalysis?.isId === false || input.backIdAnalysis?.isId === false
        ? 'Not a Valid ID'
        : input.idAnalysis?.isClear === false || input.backIdAnalysis?.isClear === false
          ? 'Photo Not Clear'
          : 'Front & Back Clear',
    limitValue: 'Clear Front & Back Official ID',
    explanation: idExplanation
  });

  // 5. Purpose & Supporting Proof Check
  const purposePassed = Boolean(input.purpose && input.purpose.trim().length >= 10);
  rules.push({
    ruleName: 'Justification & Purpose Statement',
    passed: purposePassed,
    actualValue: input.purpose ? `${input.purpose.slice(0, 30)}...` : 'Empty',
    limitValue: 'Detailed justification (Minimum 10 characters)',
    explanation: purposePassed
      ? 'Legitimate purpose and justification provided.'
      : 'Purpose statement is too brief or missing required details.'
  });

  // Determine overall capability
  const failedRules = rules.filter(r => !r.passed);
  const isCapable = failedRules.length === 0;
  const score = Math.round(((rules.length - failedRules.length) / rules.length) * 100);

  let verdict: 'ELIGIBLE' | 'INELIGIBLE' | 'REQUIRES_MANUAL_REVIEW' = isCapable ? 'ELIGIBLE' : 'INELIGIBLE';
  let summary = '';
  let disqualifiedReason = '';

  if (isCapable) {
    summary = `Verified Eligible: Applicant meets all income, demographic, territorial, and documentation boundaries for ${config.title}.`;
  } else {
    const reasons = failedRules.map(r => r.ruleName).join(', ');
    disqualifiedReason = failedRules.map(r => `${r.ruleName}: ${r.explanation}`).join(' | ');
    summary = `Applicant Disqualified: Does not satisfy program boundaries (${reasons}).`;
  }

  return {
    verdict,
    isCapable,
    score,
    summary,
    disqualifiedReason: isCapable ? undefined : disqualifiedReason,
    rules,
    evaluatedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
    idAudit: input.idAnalysis ? {
      isId: input.idAnalysis.isId,
      isClear: input.idAnalysis.isClear,
      detectedType: input.idAnalysis.detectedDocType,
      warning: input.idAnalysis.warning || undefined
    } : undefined
  };
}

/**
 * Heuristic client-side ID photo check to warn the user immediately upon selecting a photo
 */
export function inspectIdPhotoClientHeuristic(file: File): IdPhotoAnalysis {
  const fileName = file.name.toLowerCase();
  const isImage = file.type.startsWith('image/');
  const sizeMb = file.size / (1024 * 1024);

  // Check common non-ID hints in file names
  const nonIdKeywords = ['food', 'selfie', 'cat', 'dog', 'screenshot', 'wallpaper', 'meme', 'landscape', 'flower', 'party', 'vacation'];
  const isSuspiciousName = nonIdKeywords.some(kw => fileName.includes(kw));

  // If very small (< 15KB) it might be an icon or extremely blurry thumbnail
  const isTooSmall = file.size < 15 * 1024;
  
  // If user named it ID or similar
  const hasIdKeyword = fileName.includes('id') || fileName.includes('license') || fileName.includes('phil') || fileName.includes('voter') || fileName.includes('card') || fileName.includes('doc');

  if (!isImage) {
    return {
      isId: false,
      isClear: false,
      detectedDocType: 'Non-Image File',
      warning: 'Please select an image file (JPEG, PNG, or WEBP) for ID verification.',
      advice: 'Upload a clear photograph or scan of your physical identification card.',
      score: 10
    };
  }

  if (isSuspiciousName) {
    return {
      isId: false,
      isClear: true,
      detectedDocType: 'Unrecognized Image',
      warning: 'Uploaded photo appears to be a casual photo or non-ID image. Official government/student ID is strictly required.',
      advice: 'Please take a clear photo of your physical ID card against a neutral surface.',
      score: 25
    };
  }

  if (isTooSmall) {
    return {
      isId: true,
      isClear: false,
      detectedDocType: 'Low Resolution / Blurry Image',
      warning: 'Warning: Image resolution is very low and text may be unreadable. Please upload a sharper, higher-resolution photo.',
      advice: 'Ensure good lighting and make sure all text on the ID is crisp and legible.',
      score: 45
    };
  }

  return {
    isId: true,
    isClear: true,
    detectedDocType: hasIdKeyword ? 'Government / Student ID' : 'Identification Document',
    warning: null,
    advice: 'ID document ready for submission.',
    score: hasIdKeyword ? 95 : 85
  };
}

/**
 * Validates if a program is exclusively an Official Certificate / Clearance application
 */
export const OFFICIAL_CERTIFICATE_IDS = new Set([
  'prog-barangay-clearance',
  'prog-admin-residency',
  'prog-admin-indigency',
  'prog-admin-good-moral',
  'prog-admin-first-job',
  'prog-admin-business-permit',
  'prog-cert-solo-parent',
  'prog-cert-senior-citizen',
  'prog-cert-pwd',
  'prog-cert-student-grant'
]);

export function isCertificateProgram(programId: string, title?: string, category?: string): boolean {
  if (OFFICIAL_CERTIFICATE_IDS.has(programId)) return true;
  if (programId === 'prog-live-business-processing') return false;
  const combined = `${programId} ${title || ''} ${category || ''}`.toLowerCase();
  return (
    combined.includes('clearance') ||
    combined.includes('certificate') ||
    combined.includes('certification') ||
    combined.includes('permit')
  );
}

export interface ProgramQualificationEvaluation {
  isQualified: boolean;
  score: number;
  passedCriteria: string[];
  failedCriteria: string[];
  summary: string;
}

export const ON_DEMAND_WALKIN_SERVICE_IDS = new Set([
  'prog-admin-community-concerns',
  'prog-admin-incident-mediation',
  'prog-emergency-dispute-mediation',
  'prog-emergency-disaster-prep',
  'prog-emergency-evacuation',
  'prog-emergency-safety-tanod',
  'prog-legal-doc-assistance',
  'prog-civil-birth',
  'prog-civil-death'
]);

export function isWalkInOrOnDemandService(programId: string): boolean {
  return ON_DEMAND_WALKIN_SERVICE_IDS.has((programId || '').toLowerCase());
}

const SPECIFIC_DISASTER_CATEGORIES = new Set([
  'flood',
  'fire',
  'landslide',
  'earthquake',
  'typhoon / storm',
  'other'
]);

export function isDisasterProgram(program?: Partial<import('../types').AssistanceProgram> | null): boolean {
  if (!program) return false;
  if (program.programType === 'disaster') return true;
  if (program.programType === 'regular') return false;
  const idLower = (program.id || '').toLowerCase();
  const titleLower = (program.title || '').toLowerCase();
  const categoryLower = (program.category || '').trim().toLowerCase();
  return (
    program.autoEnrollVictims === true ||
    SPECIFIC_DISASTER_CATEGORIES.has(categoryLower) ||
    idLower === 'prog-emergency-disaster-prep' ||
    idLower === 'prog-emergency-evacuation' ||
    titleLower.includes('disaster') ||
    titleLower.includes('calamity') ||
    titleLower.includes('evacuation')
  );
}

export function doesVictimQualifyForDisasterProgram(
  victimDisasterType: string | undefined | null,
  program?: Partial<import('../types').AssistanceProgram> | null
): boolean {
  if (!program) return false;
  const victimLower = String(victimDisasterType || '').trim().toLowerCase();
  if (!victimLower) return false;
  const catLower = String(program.category || '').trim().toLowerCase();
  if (SPECIFIC_DISASTER_CATEGORIES.has(catLower)) {
    return victimLower === catLower;
  }
  return true;
}

const BARANGAY_SERVICE_IDS = new Set([
  'prog-barangay-clearance',
  'prog-admin-residency',
  'prog-admin-indigency',
  'prog-admin-good-moral',
  'prog-admin-first-job',
  'prog-admin-business-permit',
  'prog-cert-solo-parent',
  'prog-cert-senior-citizen',
  'prog-cert-pwd',
  'prog-cert-student-grant',
  'prog-civil-birth',
  'prog-civil-late-birth',
  'prog-civil-marriage',
  'prog-civil-death',
  'prog-live-business-processing'
]);

/**
 * Identifies Barangay Services (clearances, certificates, endorsements, civil registration)
 * that belong under Admin Applications rather than Assistance/Community Programs.
 */
export function isBarangayServiceApplicationItem(
  program?: Partial<import('../types').AssistanceProgram> | null
): boolean {
  if (!program) return false;
  if (isDisasterProgram(program)) return false;
  if (program.programType === 'regular') return false;
  if (BARANGAY_SERVICE_IDS.has(program.id || '')) return true;
  if (
    program.category === 'Barangay Administrative Services' ||
    program.category === 'Civil Registration Services'
  ) {
    return true;
  }
  return isCertificateProgram(program.id || '', program.title, program.category);
}

/**
 * Evaluates whether a resident's registered account and verified household profile
 * truly satisfies the qualification criteria for an LGU Assistance Program.
 */
export function evaluateResidentForProgram(
  resident: Partial<import('../types').ResidentUser> | null | undefined,
  programId: string,
  programTitle?: string,
  programMeta?: Partial<import('../types').AssistanceProgram>
): ProgramQualificationEvaluation {
  if (!resident) {
    return {
      isQualified: false,
      score: 0,
      passedCriteria: [],
      failedCriteria: ['No resident account found'],
      summary: 'Ineligible: Resident account not found.'
    };
  }

  const passedCriteria: string[] = [];
  const failedCriteria: string[] = [];
  const income = parseMonthlyIncome(resident.householdIncome || '');
  const age = resident.age || 0;
  const gender = (resident.gender || '').toLowerCase();
  const civilStatus = resident.civilStatus || 'Single';
  const occupation = (resident.occupation || '').toLowerCase();
  const employmentStatus = resident.employmentStatus || '';
  const idLower = (programId || '').toLowerCase();
  const titleLower = (programTitle || '').toLowerCase();
  const idCombined = `${idLower} ${titleLower}`;

  // Baseline Verification Rule
  const frontRejected = resident.idPhotoAnalysis?.isId === false;
  const backRejected = resident.backIdPhotoAnalysis?.isId === false;
  const frontUnclear = resident.idPhotoAnalysis?.isClear === false;
  const backUnclear = resident.backIdPhotoAnalysis?.isClear === false;
  const hasScannedId =
    Boolean(resident.frontIdUrl) &&
    Boolean(resident.backIdUrl) &&
    !frontRejected &&
    !backRejected &&
    !frontUnclear &&
    !backUnclear;

  if (resident.isBanned) {
    failedCriteria.push(`Account Status: Account is restricted (${resident.banReason || 'Administrative hold'})`);
  } else if (resident.registrationStatus === 'Rejected') {
    failedCriteria.push('Account Status: Registration was declined by Barangay administrator');
  } else if (frontRejected || backRejected) {
    failedCriteria.push('Not Qualified: Front or Back photo is not a valid ID');
  } else if (frontUnclear || backUnclear) {
    failedCriteria.push('Photo Not Clear: Please attach a clearer Front/Back ID photo and try again');
  } else if (!resident.isVerified && resident.registrationStatus === 'Pending Approval' && !hasScannedId) {
    failedCriteria.push('Account Verification: Clear Front and Back ID photos are required to qualify');
  } else if (!resident.isVerified && hasScannedId) {
    passedCriteria.push('ID Scan Attached: Clear Front & Back IDs verified');
  } else {
    passedCriteria.push('Account Verification: Verified Barangay Bugo resident');
  }

  // 1. Walk-in / On-Demand Desks & 24/7 Emergency Services (Not profile-matched benefit programs)
  if (isWalkInOrOnDemandService(idLower)) {
    failedCriteria.push('On-Demand / Event Service: Available walk-in or during emergencies rather than account-based program qualification');
  } else if (idLower === 'prog-civil-late-birth') {
    if (!resident.idNumber && !resident.isVerified) {
      passedCriteria.push('Registration Need: Resident lacks registered ID credentials');
    } else {
      failedCriteria.push('Identity On File: Account already has verified identity credentials');
    }
  } else if (idLower === 'prog-civil-marriage') {
    if (civilStatus === 'Single' && age >= 18) {
      passedCriteria.push(`Marital & Age Eligibility: Single adult (${age} yrs old) eligible for marriage registration`);
    } else {
      failedCriteria.push(`Marital Status: Civil status is '${civilStatus}'; intended for unmarried adults aged 18+`);
    }
  }

  // 2. Social Welfare Targeted Programs
  else if (idLower === 'prog-social-seniors' || idCombined.includes('senior') || idCombined.includes('pension')) {
    if (resident.isSenior || age >= 60) {
      passedCriteria.push(`Senior Citizen Status: Age requirement met (${age > 0 ? `${age} yrs old` : '60+ senior'})`);
    } else {
      failedCriteria.push(`Age Requirement: Must be 60 years or older (currently ${age || 'under 60'})`);
    }
  } else if (idLower === 'prog-social-wheelchair') {
    const disabilityLower = (resident.pwdDisabilityType || '').toLowerCase();
    const hasMobilityImpairment =
      Boolean(resident.isPwd) &&
      (!disabilityLower ||
        disabilityLower.includes('physical') ||
        disabilityLower.includes('mobility') ||
        disabilityLower.includes('orthopedic') ||
        disabilityLower.includes('parapleg') ||
        disabilityLower.includes('multiple'));
    const isFrailSenior = Boolean(resident.isSenior) || age >= 65;

    if (hasMobilityImpairment || isFrailSenior) {
      passedCriteria.push(
        hasMobilityImpairment
          ? `Mobility Need: Registered physical/mobility PWD (${resident.pwdDisabilityType || 'Verified PWD'})`
          : `Senior Mobility Support: Senior resident aged ${age || '65+'}`
      );
    } else {
      failedCriteria.push('Mobility Criteria: Reserved for residents with physical/mobility disabilities or frail seniors (65+)');
    }

    if (income <= 15000) {
      passedCriteria.push(`Income Bracket: Household income (₱${income.toLocaleString()}) qualifies for free mobility unit`);
    } else {
      failedCriteria.push(`Income Bracket: Household income ₱${income.toLocaleString()} exceeds ₱15,000 threshold`);
    }
  } else if (idLower === 'prog-social-pwd' || idCombined.includes('pwd') || idCombined.includes('disabilit')) {
    if (resident.isPwd || Boolean(resident.pwdIdNumber)) {
      passedCriteria.push(`PWD Registry: Verified PWD status (${resident.pwdDisabilityType || 'Registered PWD'})`);
    } else {
      failedCriteria.push('PWD Registry: Profile is not registered as a Person with Disability');
    }
  } else if (idLower === 'prog-social-solo-parent' || idCombined.includes('solo parent') || idCombined.includes('solo-parent')) {
    if (resident.isSoloParent || Boolean(resident.soloParentIdNumber)) {
      passedCriteria.push(`Solo Parent Registry: Verified under RA 11861 (${resident.soloParentIdNumber || 'Registered'})`);
    } else {
      failedCriteria.push('Solo Parent Registry: Profile is not registered as a Solo Parent under RA 11861');
    }
    if (income <= 35000) {
      passedCriteria.push(`Income Ceiling: ₱${income.toLocaleString()} satisfies RA 11861 subsidy threshold`);
    } else {
      failedCriteria.push('Income Ceiling: Income exceeds RA 11861 ₱35,000 threshold');
    }
  } else if (idLower === 'prog-educational-assistance' || idCombined.includes('scholarship') || idCombined.includes('educational')) {
    const isStudent =
      Boolean(resident.isStudent) ||
      employmentStatus === 'Student' ||
      occupation.includes('student') ||
      occupation.includes('scholar');
    const inSchoolAge = age === 0 || (age >= 15 && age <= 30);

    if (isStudent && inSchoolAge) {
      passedCriteria.push(`Academic Profile: Active student (${resident.studentLevel || resident.schoolName || 'Enrolled'})`);
    } else if (!isStudent) {
      failedCriteria.push('Academic Profile: Profile is not registered as an enrolled student');
    } else {
      failedCriteria.push(`Age Requirement: Scholarship grants are for students aged 15–30 (currently ${age})`);
    }

    if (income <= 15000) {
      passedCriteria.push(`Household Income: ₱${income.toLocaleString()} satisfies ₱15,000 scholarship limit`);
    } else {
      failedCriteria.push(`Household Income: ₱${income.toLocaleString()} exceeds ₱15,000 scholarship ceiling`);
    }
  } else if (idLower === 'prog-social-low-income' || idCombined.includes('low-income') || idCombined.includes('low income') || idCombined.includes('tupad')) {
    if (income <= 10000) {
      passedCriteria.push(`Income Bracket: Household income (₱${income.toLocaleString()}) qualifies as low-income / indigent`);
    } else {
      failedCriteria.push(`Income Bracket: Household income ₱${income.toLocaleString()} exceeds ₱10,000 low-income ceiling`);
    }
  } else if (idLower === 'prog-medical-aid') {
    if (income <= 10000 || resident.isSenior || age >= 60 || resident.isPwd) {
      passedCriteria.push('Priority Medical Need: Qualified indigent, senior, or PWD beneficiary');
    } else {
      failedCriteria.push(`Income Bracket: Medical referral grant prioritizes indigent households (<= ₱10,000), seniors, and PWDs`);
    }
  }

  // 3. Health & Medical Targeted Programs
  else if (idLower === 'prog-health-maternal') {
    failedCriteria.push(
      gender === 'male'
        ? 'Target Demographic: Exclusively for expectant mothers'
        : 'Clinical Status: Requires active pregnancy / prenatal enrollment at Barangay Health Center'
    );
  } else if (idLower === 'prog-health-tb-dots') {
    failedCriteria.push('Clinical Status: Requires presumptive or confirmed TB screening at Barangay Health Center');
  } else if (idLower === 'prog-health-circumcision') {
    if (gender === 'male' && age >= 9 && age <= 15) {
      passedCriteria.push(`Target Demographic: Male youth aged ${age} (eligible for Operation Tuli, ages 9–15)`);
    } else {
      failedCriteria.push('Target Demographic: Exclusively for boys aged 9 to 15 years old');
    }
  } else if (idLower === 'prog-health-nutrition') {
    if (age > 0 && age <= 5) {
      passedCriteria.push(`Child Nutrition: Age ${age} qualifies for Operation Timbang & feeding program`);
    } else {
      failedCriteria.push('Target Demographic: Exclusively for toddlers and children under 6 years old');
    }
  } else if (idLower === 'prog-health-immunization') {
    if (resident.isSenior || age >= 60 || (age > 0 && age <= 12)) {
      passedCriteria.push(
        resident.isSenior || age >= 60
          ? 'Senior Immunization: Eligible for annual Senior Flu & Pneumococcal vaccines'
          : 'Pediatric EPI: Eligible for childhood immunization schedule'
      );
    } else {
      failedCriteria.push('Age Requirement: Targeted for infants/children (<= 12 yrs) and senior citizens (60+)');
    }
  } else if (idLower === 'prog-health-family-planning') {
    if (civilStatus === 'Married' && age >= 18 && age <= 49) {
      passedCriteria.push(`Reproductive Health: Married resident (${age} yrs old) eligible for family planning services`);
    } else {
      failedCriteria.push('Target Demographic: Targeted for married couples and adults of reproductive age (18–49)');
    }
  } else if (idLower === 'prog-health-free-medicines' || idLower === 'prog-health-consultation' || idLower === 'prog-health-dental') {
    if (income <= 10000 || resident.isSenior || age >= 60 || resident.isPwd || resident.isSoloParent) {
      passedCriteria.push('Health Assistance Priority: Qualified indigent, senior, PWD, or solo parent beneficiary');
    } else {
      failedCriteria.push('Priority Bracket: Subsidized medicines and clinics prioritize indigent (<= ₱10,000), senior, PWD, and solo parent residents');
    }
  } else if (idLower === 'prog-health-checkup') {
    if (resident.isSenior || age >= 40 || resident.isPwd || income <= 10000) {
      passedCriteria.push('Preventive Health Screening: Eligible for routine BP and blood sugar monitoring');
    } else {
      failedCriteria.push('Priority Screening: Targeted for adults aged 40+, seniors, PWDs, and indigent residents');
    }
  }

  // 4. Livelihood, Employment & Agriculture Programs
  else if (idLower === 'prog-live-job-assistance' || idLower === 'prog-live-employment-referral') {
    const isSeekingWork =
      employmentStatus === 'Unemployed' ||
      (idLower === 'prog-live-employment-referral' && employmentStatus === 'Employed (Part-Time)') ||
      occupation.includes('unemployed') ||
      occupation.includes('jobseeker') ||
      occupation.includes('fresh graduate') ||
      occupation.includes('seeking');
    const isWorkingAge = age === 0 || (age >= 18 && age <= 60);

    if (isSeekingWork && isWorkingAge) {
      passedCriteria.push(`Employment Need: Registered as '${resident.occupation || employmentStatus}' (ages 18–60)`);
    } else if (!isWorkingAge) {
      failedCriteria.push(`Age Requirement: Employment programs target working-age residents (18–60 yrs)`);
    } else {
      failedCriteria.push(`Employment Status: Currently recorded as '${employmentStatus || resident.occupation}'; targeted for unemployed or job-seeking residents`);
    }
  } else if (idLower === 'prog-live-business-processing') {
    const isEntrepreneur =
      employmentStatus === 'Self-Employed' ||
      occupation.includes('vendor') ||
      occupation.includes('business') ||
      occupation.includes('entrepreneur') ||
      occupation.includes('merchant') ||
      occupation.includes('store') ||
      occupation.includes('self-employed');

    if (isEntrepreneur && (age === 0 || age >= 18)) {
      passedCriteria.push(`Enterprise Profile: Self-employed / vendor livelihood (${resident.occupation || employmentStatus})`);
    } else {
      failedCriteria.push('Enterprise Profile: Targeted for self-employed vendors, store owners, and micro-entrepreneurs aged 18+');
    }
  } else if (
    idLower === 'prog-live-agricultural-assistance' ||
    idLower === 'prog-live-seed-distribution' ||
    idCombined.includes('agricultur') ||
    idCombined.includes('seed')
  ) {
    const isAgri =
      occupation.includes('farm') ||
      occupation.includes('fish') ||
      occupation.includes('garden') ||
      occupation.includes('agri') ||
      occupation.includes('planter') ||
      occupation.includes('livestock');

    if (isAgri) {
      passedCriteria.push(`Agricultural Livelihood: Registered as '${resident.occupation}'`);
    } else {
      failedCriteria.push(`Livelihood Mismatch: Recorded occupation (${resident.occupation || 'Non-farmer'}) is not in farming, fishing, or agriculture`);
    }
  } else if (idLower === 'prog-live-farming-support') {
    const fitsLivelihood =
      employmentStatus === 'Unemployed' ||
      employmentStatus === 'Self-Employed' ||
      occupation.includes('farm') ||
      occupation.includes('fish') ||
      occupation.includes('agri') ||
      occupation.includes('vendor') ||
      occupation.includes('artisan') ||
      occupation.includes('earner');

    if (fitsLivelihood && income <= 12000 && (age === 0 || age >= 18)) {
      passedCriteria.push(`Livelihood Support: Qualified micro-earner / low-income livelihood applicant (₱${income.toLocaleString()})`);
    } else {
      failedCriteria.push('Livelihood Criteria: Reserved for low-income micro-earners, unemployed residents, and farmers (<= ₱12,000)');
    }
  }

  // 5. Legal Services
  else if (idLower === 'prog-legal-notarization') {
    if (income <= 10000 || resident.isStudent) {
      passedCriteria.push('Pro-Bono Eligibility: Indigent household (<= ₱10,000) or student beneficiary');
    } else {
      failedCriteria.push(`Income Ceiling: Pro-bono outreach notarization is reserved for indigent residents (<= ₱10,000) and students`);
    }
  } else if (idLower === 'prog-legal-consultation') {
    if (income <= 10000) {
      passedCriteria.push(`Indigent Legal Aid: Household income (₱${income.toLocaleString()}) qualifies for free legal counseling`);
    } else {
      failedCriteria.push(`Income Ceiling: Free legal clinic is reserved for indigent residents (<= ₱10,000)`);
    }
  }

  // 6. Youth / Community Activities
  else if (idLower === 'prog-emergency-community-activities' || idCombined.includes('sports') || idCombined.includes('youth')) {
    if (resident.isTeenager || (age >= 15 && age <= 30)) {
      passedCriteria.push(`Youth & SK Bracket: Age (${age || 'Youth'} yrs) qualifies for SK youth and community programs`);
    } else {
      failedCriteria.push(`Youth Bracket: SK youth programs target residents aged 15–30 (currently ${age || 'unspecified'})`);
    }
  }

  // 7. Fallback for custom/general programs
  else {
    const audienceText = `${programMeta?.targetAudience || ''} ${(programMeta?.eligibilityCriteria || []).join(' ')} ${programTitle || ''}`.toLowerCase();

    if (audienceText.includes('senior')) {
      if (resident.isSenior || age >= 60) {
        passedCriteria.push(`Senior Citizen Status: Qualified (${age > 0 ? `${age} yrs old` : '60+ senior'})`);
      } else {
        failedCriteria.push('Age Requirement: Program is for Senior Citizens (60+)');
      }
    } else if (audienceText.includes('pwd') || audienceText.includes('disabilit')) {
      if (resident.isPwd || Boolean(resident.pwdIdNumber)) {
        passedCriteria.push('PWD Registry: Verified Person with Disability status');
      } else {
        failedCriteria.push('PWD Registry: Program is for registered Persons with Disability');
      }
    } else if (audienceText.includes('solo parent') || audienceText.includes('solo-parent')) {
      if (resident.isSoloParent || Boolean(resident.soloParentIdNumber)) {
        passedCriteria.push('Solo Parent Registry: Verified Solo Parent status');
      } else {
        failedCriteria.push('Solo Parent Registry: Program is for registered Solo Parents');
      }
    } else if (audienceText.includes('student') || audienceText.includes('scholar')) {
      const isStudent = Boolean(resident.isStudent) || employmentStatus === 'Student' || occupation.includes('student');
      if (isStudent) {
        passedCriteria.push('Academic Profile: Verified enrolled student');
      } else {
        failedCriteria.push('Academic Profile: Program is for enrolled students');
      }
    } else if (audienceText.includes('unemployed') || audienceText.includes('job')) {
      const isJobseeker = employmentStatus === 'Unemployed' || occupation.includes('unemployed') || occupation.includes('job');
      if (isJobseeker) {
        passedCriteria.push('Employment Profile: Registered unemployed / jobseeker');
      } else {
        failedCriteria.push('Employment Profile: Program is for unemployed or jobseeking residents');
      }
    } else {
      const requiresIndigent = audienceText.includes('indigent') || audienceText.includes('low-income') || audienceText.includes('low income');
      const isUniversalCustom = idLower.startsWith('prog-custom-') && !requiresIndigent;

      if (isUniversalCustom && (!resident.purok || resident.purok.toLowerCase().includes('zone') || resident.purok.toLowerCase().includes('bugo'))) {
        passedCriteria.push(`Barangay Program Match: Eligible under ${programMeta?.targetAudience || 'Barangay Bugo Resident'} criteria`);
      } else if (income <= 10000) {
        passedCriteria.push(`Indigent Priority: Household income (₱${income.toLocaleString()}) qualifies for assistance`);
      } else {
        failedCriteria.push('Eligibility Criteria: Profile does not meet targeted assistance criteria for this program');
      }
    }
  }

  const isQualified = failedCriteria.length === 0;
  const total = passedCriteria.length + failedCriteria.length;
  const score = total > 0 ? Math.round((passedCriteria.length / total) * 100) : 0;
  const summary = isQualified
    ? `Automatically Qualified (${passedCriteria.length}/${total} criteria satisfied)`
    : `Ineligible (${failedCriteria.length} unmet requirement${failedCriteria.length > 1 ? 's' : ''})`;

  return {
    isQualified,
    score,
    passedCriteria,
    failedCriteria,
    summary
  };
}

/**
 * Returns all non-certificate assistance programs that a resident qualifies for automatically
 */
export function getQualifiedProgramsForResident(
  resident: Partial<import('../types').ResidentUser> | null | undefined,
  allPrograms: import('../types').AssistanceProgram[]
): import('../types').AssistanceProgram[] {
  if (!resident) return [];
  return allPrograms.filter(prog => {
    // Exclude certificates and closed programs
    if (prog.status === 'Closed') return false;
    if (isCertificateProgram(prog.id, prog.title, prog.category)) return false;
    const evalResult = evaluateResidentForProgram(resident, prog.id, prog.title, prog);
    return evalResult.isQualified;
  });
}

/**
 * Determines whether a resident can view an announcement.
 * Targeted announcements for specific programs are ONLY visible to qualified beneficiaries!
 */
export function canResidentViewAnnouncement(
  resident: Partial<import('../types').ResidentUser> | null | undefined,
  announcement: import('../types').AnnouncementItem
): boolean {
  // Public announcements are visible to everyone
  if (!announcement.targetAudienceType || announcement.targetAudienceType === 'All') {
    return true;
  }

  // If targeted to qualified beneficiaries:
  if (announcement.targetAudienceType === 'Qualified Beneficiaries Only') {
    if (!resident) return false;
    if (!announcement.targetProgramId) return true;
    const evalResult = evaluateResidentForProgram(resident, announcement.targetProgramId, announcement.targetProgramTitle);
    return evalResult.isQualified;
  }

  return true;
}

