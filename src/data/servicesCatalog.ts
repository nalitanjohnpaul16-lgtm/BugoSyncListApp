import { AssistanceProgram } from '../types';

export const ALL_BARANGAY_SERVICES: AssistanceProgram[] = [
  // ==========================================
  // 1. BARANGAY ADMINISTRATIVE SERVICES
  // ==========================================
  {
    id: 'prog-barangay-clearance',
    title: 'Issuance of Barangay Clearance',
    category: 'Barangay Administrative Services',
    tagline: 'Official certification certifying residency, good character, and clean barangay record.',
    description: 'Universal administrative document required for employment, passport application, bank account opening, postal ID, and government transactions in Cagayan de Oro City.',
    imageUrl: '/assets/services/brgy_clearance_cert_1794197711166.jpg',
    status: 'Active',
    badgeText: 'Instant Pipeline',
    deadline: 'Year-Round Service',
    targetAudience: 'All Registered Bugo Residents',
    processingTime: 'Same Day (1-2 Hours)',
    requirements: [
      'Valid Government ID or Student ID',
      'Community Tax Certificate (Cedula)',
      'Proof of Residency (Zone 1 to 10 of Bugo)'
    ],
    eligibilityCriteria: [
      'Bona fide resident of Barangay Bugo for at least 6 months',
      'Verified Barangay Bugo resident in good community standing'
    ],
    maxBenefitAmount: 'Standard Fee: ₱50.00 (Waived for Indigents)'
  },
  {
    id: 'prog-admin-residency',
    title: 'Certificate of Residency',
    category: 'Barangay Administrative Services',
    tagline: 'Formal proof of physical residence within the territorial jurisdiction of Barangay Bugo.',
    description: 'Official certification verifying that the individual currently resides in a specific Purok/Zone of Bugo. Commonly needed for court filings, electric/water utility meter applications, and school enrollments.',
    imageUrl: '/assets/services/brgy_clearance_cert_1794197711166.jpg',
    status: 'Active',
    badgeText: 'Express Release',
    deadline: 'Ongoing Availability',
    targetAudience: 'Homeowners, Renters, and Bugo Dwellers',
    processingTime: '1 - 2 Business Hours',
    requirements: [
      'Valid Government ID with Bugo address',
      'Purok Leader Endorsement / Sitio Clearance',
      'Proof of Billing or House Rental Contract'
    ],
    eligibilityCriteria: [
      'Currently living in Barangay Bugo',
      'Minimum residence duration of 3 months'
    ],
    maxBenefitAmount: 'Standard Certification'
  },
  {
    id: 'prog-admin-indigency',
    title: 'Certificate of Indigency',
    category: 'Barangay Administrative Services',
    tagline: 'Affidavit of indigent economic status for legal aid, medical fee waivers, and government relief.',
    description: 'Free official certification confirming that the family belongs to the low-income bracket. Used to request medical subsidy at Northern Mindanao Medical Center (NMMC), JR Borja General Hospital, PAO legal services, and DSWD assistance.',
    imageUrl: '/assets/services/brgy_senior_pension_1794197712463.jpg',
    status: 'Active',
    badgeText: '100% Free',
    deadline: 'Year-Round Service',
    targetAudience: 'Low-income and indigent families',
    processingTime: 'Within 24 Hours',
    requirements: [
      'Valid Resident ID or Voter Certification',
      'Endorsement from Purok / Zone Chairman',
      'Affidavit of Low Income or Certificate of Non-Filing of ITR'
    ],
    eligibilityCriteria: [
      'Household monthly income at or below statutory poverty threshold',
      'Resident of Barangay Bugo'
    ],
    maxBenefitAmount: 'Fee Exemption Granted'
  },
  {
    id: 'prog-admin-good-moral',
    title: 'Certificate of Good Moral Character',
    category: 'Barangay Administrative Services',
    tagline: 'Attestation of good civic behavior, community standing, and law-abiding citizenship.',
    description: 'Documentary proof required by universities, scholarship foundations, security agencies, and prospective employers confirming the applicant possesses exemplary community conduct.',
    imageUrl: '/assets/services/brgy_clearance_cert_1794197711166.jpg',
    status: 'Active',
    badgeText: 'Verified Conduct',
    deadline: 'Continuous',
    targetAudience: 'Students, Job Applicants, and Professionals',
    processingTime: '1 - 2 Business Days',
    requirements: [
      'Valid Government ID',
      'Barangay Clearance copy',
      '2 Character Reference sign-offs from neighbors or Purok Officer'
    ],
    eligibilityCriteria: [
      'Clean barangay record with no administrative sanctions or peace violations',
      'Verified resident of Barangay Bugo'
    ],
    maxBenefitAmount: 'Official Endorsement'
  },
  {
    id: 'prog-admin-first-job',
    title: 'First-Time Job Seeker Certification',
    category: 'Barangay Administrative Services',
    tagline: 'Republic Act 11261 waiver granting 100% free government clearances and certificates for new graduates.',
    description: 'Under the First-Time Jobseekers Assistance Act, this certification waives fees for NBI Clearance, Police Clearance, Barangay Clearance, Medical Certificates, and Birth Certificates when seeking first-time employment.',
    imageUrl: '/assets/services/brgy_clearance_cert_1794197711166.jpg',
    status: 'Active',
    badgeText: 'RA 11261 Mandated',
    deadline: 'Valid for 1 Year from Issuance',
    targetAudience: 'Recent Graduates & First-Time Job Seekers',
    processingTime: 'Same Day Issuance',
    requirements: [
      'School Diploma, Transcript, or Certificate of Graduation',
      'Barangay Resident ID or Proof of Bugo Address',
      'Signed Oath of Undertaking for First-Time Job Seekers'
    ],
    eligibilityCriteria: [
      'First-time entrant to the formal job market',
      'Resident of Barangay Bugo'
    ],
    maxBenefitAmount: 'Full Fee Exemption'
  },
  {
    id: 'prog-admin-business-permit',
    title: 'Business Permit Endorsement',
    category: 'Barangay Administrative Services',
    tagline: 'Barangay commercial clearance endorsement required for City Hall Mayor’s Business Permit.',
    description: 'Administrative assessment and environmental clearance inspection for sari-sari stores, retail enterprises, food stalls, and commercial establishments operating within Bugo.',
    imageUrl: '/assets/services/real_barangay_hall_1788172230992.jpg',
    status: 'Active',
    badgeText: 'Commercial Clearance',
    deadline: 'Annual Renewal & New Registrations',
    targetAudience: 'Micro, Small, & Medium Enterprise Owners',
    processingTime: '2 - 3 Business Days',
    requirements: [
      'DTI Business Name Registration or SEC Certificate',
      'Lease Contract or Proof of Property Ownership',
      'Fire Safety Inspection and Sanitation Endorsement'
    ],
    eligibilityCriteria: [
      'Business establishment located within Barangay Bugo',
      'Compliance with local zoning and environmental waste disposal ordinances'
    ],
    maxBenefitAmount: 'Official Regulatory Clearance'
  },
  {
    id: 'prog-cert-solo-parent',
    title: 'Solo Parent Barangay Certification (RA 11861)',
    category: 'Barangay Administrative Services',
    tagline: 'Official certification certifying Solo Parent status under the Expanded Solo Parents Welfare Act.',
    description: 'Mandatory certificate needed to claim the ₱1,000 monthly city cash subsidy, 7-day parental leave, education scholarship priorities, and government relief for solo mothers and fathers.',
    imageUrl: '/assets/services/brgy_senior_pension_1794197712463.jpg',
    status: 'Active',
    badgeText: 'RA 11861 Welfare',
    deadline: 'Year-Round Intake',
    targetAudience: 'Solo / Single Parents Parenting Dependents in Bugo',
    processingTime: 'Same Day Issuance',
    requirements: [
      'Affidavit of Solo Parenting (detailing abandonment, separation, or widowhood)',
      'Birth Certificate of dependent children (unmarried & below 22)',
      'Valid Government ID or Barangay Resident ID'
    ],
    eligibilityCriteria: [
      'Sole financial and physical custody of minor or dependent children',
      'Registered resident of Barangay Bugo',
      'Household income not exceeding statutory threshold'
    ],
    maxBenefitAmount: 'Official RA 11861 Certification'
  },
  {
    id: 'prog-cert-senior-citizen',
    title: 'Senior Citizen Barangay Endorsement & Certification',
    category: 'Barangay Administrative Services',
    tagline: 'Formal endorsement and certification of elderly status for OSCA ID and social pension benefits.',
    description: 'Barangay certification attesting that the resident is aged 60 and above, residing within Bugo. Used for OSCA Booklet issuance, PhilHealth senior lifetime membership, and local birthday cash gifts.',
    imageUrl: '/assets/services/brgy_senior_pension_1794197712463.jpg',
    status: 'Active',
    badgeText: 'Senior Citizen OSCA',
    deadline: 'Continuous Registration',
    targetAudience: 'Senior Citizens (Aged 60+)',
    processingTime: 'Same Day Issuance',
    requirements: [
      'PSA Birth Certificate or Proof of Age (60 years old and above)',
      'Barangay Resident ID Card or Voter Certification',
      '2 copies 2x2 recent ID photos'
    ],
    eligibilityCriteria: [
      'Filipino citizen residing in Barangay Bugo',
      'Must be 60 years of age or older'
    ],
    maxBenefitAmount: 'Official OSCA Endorsement'
  },
  {
    id: 'prog-cert-pwd',
    title: 'PWD Barangay Endorsement & Certification (RA 10754)',
    category: 'Barangay Administrative Services',
    tagline: 'Official certification endorsing Persons with Disabilities for National PWD ID and discounts.',
    description: 'Official attestation confirming the applicant has a permanent physical, sensory, or psychosocial impairment and resides in Bugo. Required for City Social Welfare PWD ID card issuance and 20% discount booklet.',
    imageUrl: '/assets/services/brgy_pwd_wheelchair_1794197737143.jpg',
    status: 'Active',
    badgeText: 'RA 10754 Mandated',
    deadline: 'Continuous Enrollment',
    targetAudience: 'Children and Adults with Disabilities',
    processingTime: 'Same Day (1-2 Hours)',
    requirements: [
      'Medical Certificate with Disability Assessment from a licensed physician',
      'Barangay Resident ID or Proof of Bugo Address',
      '2 copies 2x2 recent ID photos'
    ],
    eligibilityCriteria: [
      'Diagnosed with physical, sensory, cognitive, or psychological disability',
      'Resident of Barangay Bugo'
    ],
    maxBenefitAmount: 'Official PWD Certification'
  },
  {
    id: 'prog-cert-student-grant',
    title: 'Student Barangay Certification & Fee Waiver Endorsement',
    category: 'Barangay Administrative Services',
    tagline: 'Official certification certifying active student status for fee waivers and academic grants.',
    description: 'Documentary certification required by tertiary institutions, TESDA academies, and CHED scholarship boards to verify active student residency in Bugo for student fare discounts and educational stipends.',
    imageUrl: '/assets/services/brgy_daycare_learning_1794197756426.jpg',
    status: 'Active',
    badgeText: 'Student Clearance',
    deadline: 'Continuous Semester Processing',
    targetAudience: 'Elementary, High School, College, & Vocational Students',
    processingTime: 'Same Day Issuance',
    requirements: [
      'Valid School ID or Certificate of Registration (COR)',
      'Barangay Resident ID or Proof of Address',
      'Latest Report Card or Transcript of Records'
    ],
    eligibilityCriteria: [
      'Currently enrolled in an accredited public or private school/college',
      'Bona fide resident of Barangay Bugo'
    ],
    maxBenefitAmount: 'Free Student Endorsement'
  },

  // ==========================================
  // 2. HEALTH AND MEDICAL SERVICES
  // ==========================================
  {
    id: 'prog-health-consultation',
    title: 'Free Medical Consultations',
    category: 'Health and Medical Services',
    tagline: 'Walk-in and scheduled medical consultations with Bugo Health Center physicians and nurses.',
    description: 'Comprehensive general outpatient clinical consultations, physical examinations, vital checks, prescription generation, and diagnostic referrals provided at zero cost to residents.',
    imageUrl: '/assets/services/brgy_medical_clinic_1794197711940.jpg',
    status: 'Active',
    badgeText: 'Free Clinical Care',
    deadline: 'Mon-Fri 8:00 AM - 5:00 PM',
    targetAudience: 'All Bugo Residents & Dependents',
    processingTime: 'Same Day Consultation',
    requirements: [
      'Barangay Resident ID or Family Health Card',
      'Previous Medical Records / Prescriptions (if any)'
    ],
    eligibilityCriteria: [
      'Registered resident of Barangay Bugo',
      'Non-emergency outpatient medical needs'
    ],
    maxBenefitAmount: 'Free Consultation'
  },
  {
    id: 'prog-health-checkup',
    title: 'Basic Health Checkups',
    category: 'Health and Medical Services',
    tagline: 'Routine blood pressure monitoring, random blood sugar screening, and vital signs assessment.',
    description: 'Preventive cardiovascular and metabolic health screenings conducted by barangay health workers (BHWs). Early detection for hypertension, diabetes, and lifestyle illnesses.',
    imageUrl: '/assets/services/brgy_medical_clinic_1794197711940.jpg',
    status: 'Active',
    badgeText: 'Daily Walk-in',
    deadline: 'Daily Health Desk',
    targetAudience: 'Adults, Seniors, and High-Risk Patients',
    processingTime: '15 - 30 Minutes',
    requirements: [
      'Valid Resident ID or Senior Citizen ID',
      'Personal Health Monitoring Logbook (optional)'
    ],
    eligibilityCriteria: [
      'Open to all residents of Barangay Bugo'
    ],
    maxBenefitAmount: 'Free Screening'
  },
  {
    id: 'prog-health-free-medicines',
    title: 'Free Medicines (Subject to Availability)',
    category: 'Health and Medical Services',
    tagline: 'Free pharmacy dispensing of maintenance medicines, antibiotics, and vitamins.',
    description: 'Barangay Bugo health dispensary stocks vital medications for hypertension (Losartan, Amlodipine), diabetes (Metformin), pediatric antibiotics, paracetamol, and vitamins sourced from City Health Department.',
    imageUrl: '/assets/services/brgy_medical_clinic_1794197711940.jpg',
    status: 'Active',
    badgeText: 'City Health Stock',
    deadline: 'Continuous While Stocks Last',
    targetAudience: 'Seniors, Indigents, and Pediatric Patients',
    processingTime: 'Immediate Dispensing',
    requirements: [
      'Valid Doctor’s Prescription (issued within the last 60 days)',
      'Barangay Resident ID or Indigency Slip',
      'Senior Citizen OSCA ID or PWD ID (for maintenance)'
    ],
    eligibilityCriteria: [
      'Resident of Barangay Bugo',
      'Valid doctor prescription matching pharmacy inventory'
    ],
    maxBenefitAmount: 'Free Essential Medication'
  },
  {
    id: 'prog-health-immunization',
    title: 'Immunization and Vaccination',
    category: 'Health and Medical Services',
    tagline: 'National Expanded Program on Immunization (EPI) vaccines for infants, toddlers, and seniors.',
    description: 'Complete childhood vaccine protection including BCG, Hepatitis B, Pentavalent, Oral Polio, Measles-Rubella, as well as annual seasonal Flu and Pneumococcal vaccines for senior citizens.',
    imageUrl: '/assets/services/brgy_vaccine_child_1794197736182.jpg',
    status: 'Active',
    badgeText: 'DOH Certified Vaccines',
    deadline: 'Wednesdays: Infant EPI | Seasonal: Senior Flu',
    targetAudience: 'Infants (0-12 mos), Children, and Seniors',
    processingTime: 'Scheduled Clinic Sessions',
    requirements: [
      'Child Baby Health Book / Immunization Card',
      'Parent or Guardian Valid Resident ID',
      'Senior Citizen ID (for Senior Flu shots)'
    ],
    eligibilityCriteria: [
      'Age-appropriate vaccine schedule under DOH guidelines',
      'Resident of Barangay Bugo'
    ],
    maxBenefitAmount: '100% Free DOH Vaccines'
  },
  {
    id: 'prog-health-maternal',
    title: 'Maternal and Prenatal Care',
    category: 'Health and Medical Services',
    tagline: 'Safe motherhood prenatal checkups, tetanus toxoid, iron supplements, and birth planning.',
    description: 'Comprehensive maternal health services supporting expectant mothers through every trimester. Includes fetal heartbeat monitoring, prenatal vitamins, laboratory referrals, and delivery facility coordination.',
    imageUrl: '/assets/services/brgy_vaccine_child_1794197736182.jpg',
    status: 'Active',
    badgeText: 'Maternal Wellness',
    deadline: 'Weekly Prenatal Clinic',
    targetAudience: 'Expectant Mothers in Barangay Bugo',
    processingTime: 'Continuous Care Management',
    requirements: [
      'Mother & Child Health Book (Pink Card)',
      'Valid ID of Expectant Mother',
      'Previous ultrasound or laboratory findings (if available)'
    ],
    eligibilityCriteria: [
      'Pregnant resident residing in Bugo Zones 1-10',
      'Commitment to regular prenatal follow-ups'
    ],
    maxBenefitAmount: 'Free Prenatal Package'
  },
  {
    id: 'prog-health-family-planning',
    title: 'Family Planning Services',
    category: 'Health and Medical Services',
    tagline: 'Responsible parenthood counseling, oral contraceptives, DMPA injectables, and IUD insertion referrals.',
    description: 'Free reproductive health education, supply of oral contraceptive pills, condoms, quarterly injectable DMPA, and referrals for bilateral tubal ligation and vasectomy.',
    imageUrl: '/assets/services/brgy_medical_clinic_1794197711940.jpg',
    status: 'Active',
    badgeText: 'Reproductive Health',
    deadline: 'Year-Round Service',
    targetAudience: 'Couples and Individuals of Reproductive Age',
    processingTime: 'Immediate Consultation',
    requirements: [
      'Family Planning Client Card / Resident ID',
      'Brief health assessment with midwife'
    ],
    eligibilityCriteria: [
      'Resident of Barangay Bugo',
      'Voluntary enrollment in family planning methods'
    ],
    maxBenefitAmount: 'Free Contraceptives & Counseling'
  },
  {
    id: 'prog-health-nutrition',
    title: 'Nutrition Programs',
    category: 'Health and Medical Services',
    tagline: 'Supplementary feeding for malnourished children, micronutrient powders, and growth monitoring.',
    description: 'Barangay Nutrition Scholar (BNS) program conducting Operation Timbang Plus, hot nutritious daily meal feeding for wasted/stunted toddlers, and vitamin A supplementation.',
    imageUrl: '/assets/services/brgy_daycare_learning_1794197756426.jpg',
    status: 'Active',
    badgeText: 'Child Nutrition Grant',
    deadline: 'Ongoing 120-Day Feeding Cycles',
    targetAudience: 'Underweight Toddlers & Malnourished Children',
    processingTime: 'Intake Assessment',
    requirements: [
      'Child Growth Monitoring Record',
      'Parent Resident ID',
      'Barangay Health Center Indigency slip'
    ],
    eligibilityCriteria: [
      'Children aged 6 to 59 months identified as underweight or stunted',
      'Resident of Barangay Bugo'
    ],
    maxBenefitAmount: 'Free Supplementary Feeding'
  },
  {
    id: 'prog-health-tb-dots',
    title: 'Tuberculosis (TB-DOTS) Services',
    category: 'Health and Medical Services',
    tagline: 'Free sputum microscopy, GeneXpert testing, chest X-ray vouchers, and full 6-month anti-TB treatment.',
    description: 'Directly Observed Treatment Short-Course (TB-DOTS) clinic providing confidential diagnosis, daily medication management, and contact tracing to eradicate tuberculosis in the community.',
    imageUrl: '/assets/services/brgy_medical_clinic_1794197711940.jpg',
    status: 'Active',
    badgeText: 'DOH DOTS Accredited',
    deadline: 'Daily Treatment Monitoring',
    targetAudience: 'Presumptive & Diagnosed TB Patients',
    processingTime: 'Same Day Treatment Initiation',
    requirements: [
      'Sputum specimen for laboratory examination',
      'Valid Resident ID',
      'Chest X-Ray referral film (if existing)'
    ],
    eligibilityCriteria: [
      'Presumptive TB cases or confirmed positive TB patients',
      'Commitment to complete 6-month regimen'
    ],
    maxBenefitAmount: '100% Free Complete TB Regimen'
  },
  {
    id: 'prog-health-dental',
    title: 'Dental Services and Tooth Extraction',
    category: 'Health and Medical Services',
    tagline: 'Free tooth extraction, oral health consultation, fluoride treatment, and emergency relief.',
    description: 'Visiting City Health Dentist clinics providing dental checkups, tooth extractions for decayed teeth, pain relief medication, and pediatric fluoride varnishing for Bugo youth.',
    imageUrl: '/assets/services/brgy_dental_clinic_1794197757496.jpg',
    status: 'Active',
    badgeText: 'Free Dental Clinic',
    deadline: 'Weekly Scheduled Dental Missions',
    targetAudience: 'Children, Adults, and Senior Citizens',
    processingTime: 'Appointment / Queue on Dental Day',
    requirements: [
      'Valid Barangay Resident ID or School ID',
      'Blood pressure screening prior to extraction',
      'Signed Medical History / Consent Form'
    ],
    eligibilityCriteria: [
      'Resident of Barangay Bugo',
      'Clinically cleared for dental extraction'
    ],
    maxBenefitAmount: 'Free Oral Health Care'
  },
  {
    id: 'prog-health-circumcision',
    title: 'Circumcision Services',
    category: 'Health and Medical Services',
    tagline: 'Annual free minor surgical circumcision (Operation Tuli) with sterile equipment and antibiotic kit.',
    description: 'Safe clinical circumcision performed by registered medical doctors and nurses during summer breaks. Includes free local anesthesia, sterile surgical sets, post-op antibiotics, and dressing kits.',
    imageUrl: '/assets/services/brgy_dental_clinic_1794197757496.jpg',
    status: 'Active',
    badgeText: 'Annual Operation Tuli',
    deadline: 'Summer Season Outreach & Scheduled Slots',
    targetAudience: 'Young Boys & Adolescents (Ages 9-15)',
    processingTime: 'Scheduled Batch Outreaches',
    requirements: [
      'Signed Parental Consent and Waiver Form',
      'Child Birth Certificate or Student ID',
      'Parent / Guardian Valid Resident ID'
    ],
    eligibilityCriteria: [
      'Resident of Barangay Bugo aged 9 years old and above',
      'No bleeding disorders or contraindicating medical conditions'
    ],
    maxBenefitAmount: 'Free Minor Surgery & Med Kit'
  },

  // ==========================================
  // 3. SOCIAL WELFARE SERVICES
  // ==========================================
  {
    id: 'prog-social-seniors',
    title: 'Assistance for Senior Citizens',
    category: 'Social Welfare Services',
    tagline: 'Office of Senior Citizens Affairs (OSCA) booklet, social pensions, and centenarian benefits.',
    description: 'Comprehensive welfare facilitation for elderly residents aged 60 and above. Includes OSCA identification cards, 20% discount booklets, facilitation of DSWD Social Pension for indigent seniors, and annual local cash gifts.',
    imageUrl: '/assets/services/brgy_senior_pension_1794197712463.jpg',
    status: 'Active',
    badgeText: 'Senior Citizen OSCA',
    deadline: 'Continuous Registration',
    targetAudience: 'Senior Citizens (Aged 60+)',
    processingTime: '3 - 5 Business Days',
    requirements: [
      'PSA Birth Certificate or Valid ID showing Birthdate (Age 60+)',
      'Barangay Certificate of Residency in Bugo',
      '2 copies of 2x2 recent ID photos'
    ],
    eligibilityCriteria: [
      'Filipino citizen residing in Barangay Bugo',
      'Must be 60 years of age or older'
    ],
    maxBenefitAmount: 'Monthly Pension & Discount Privileges'
  },
  {
    id: 'prog-social-pwd',
    title: 'Assistance for Persons with Disabilities (PWD)',
    category: 'Social Welfare Services',
    tagline: 'PWD ID issuance, 20% discount booklets, assistive mobility devices, and quarterly welfare aid.',
    description: 'Advocacy and benefits program protecting Bugo residents with long-term physical, mental, intellectual, or sensory impairments under Republic Act 10754.',
    imageUrl: '/assets/services/brgy_pwd_wheelchair_1794197737143.jpg',
    status: 'Active',
    badgeText: 'RA 10754 Mandated',
    deadline: 'Continuous Enrollment',
    targetAudience: 'Children and Adults with Disabilities',
    processingTime: '3 - 5 Business Days',
    requirements: [
      'Medical Certificate with Disability Assessment from licensed physician',
      'Barangay Certificate of Residency in Bugo',
      '2 copies of 2x2 ID photos with white background'
    ],
    eligibilityCriteria: [
      'Diagnosed with permanent physical, cognitive, visual, hearing, or psychological disability',
      'Resident of Barangay Bugo'
    ],
    maxBenefitAmount: 'Disability ID & Welfare Subsidies'
  },
  {
    id: 'prog-social-solo-parent',
    title: 'Solo Parent Assistance',
    category: 'Social Welfare Services',
    tagline: 'Expanded Solo Parents Welfare Act (RA 11861) ID processing, ₱1,000 monthly cash subsidy, and leave benefits.',
    description: 'Registration and support for single mothers and fathers parenting dependents alone. Grants access to 7-day parental leave, education scholarships, and priority in government housing and livelihood assistance.',
    imageUrl: '/assets/services/brgy_senior_pension_1794197712463.jpg',
    status: 'Active',
    badgeText: 'RA 11861 Welfare',
    deadline: 'Year-Round Intake',
    targetAudience: 'Single Parents & Legal Guardians in Bugo',
    processingTime: '5 - 7 Business Days',
    requirements: [
      'Affidavit of Solo Parenting detailing circumstance (abandonment, separation, death)',
      'Birth Certificate of dependent child/children (below 22 years old if unmarried/unemployed)',
      'Death Certificate of spouse (if applicable)',
      'Barangay Indigency or Income Tax Return'
    ],
    eligibilityCriteria: [
      'Sole custody and financial provider for minor or dependent children',
      'Resident of Barangay Bugo for at least 6 months'
    ],
    maxBenefitAmount: 'Solo Parent ID & Monthly Grant'
  },
  {
    id: 'prog-medical-aid',
    title: 'Financial and Medical Assistance Referrals',
    category: 'Social Welfare Services',
    tagline: 'Official social case study and endorsement for DSWD AICS, City Mayor’s Office, and PCSO funds.',
    description: 'Fast-track endorsement for emergency cash assistance to cover hospitalization bills, dialysis sessions, chemotherapy, specialized laboratory scans, and funeral expenses through government safety nets.',
    imageUrl: '/assets/services/brgy_senior_pension_1794197712463.jpg',
    status: 'Active',
    badgeText: 'DSWD AICS Referral',
    deadline: 'Immediate Emergency Processing',
    targetAudience: 'Families Facing Medical Emergencies',
    processingTime: '24 - 48 Hours',
    requirements: [
      'Original Clinical Abstract or Doctor’s Prescription',
      'Hospital Billing Statement or Funeral Contract',
      'Barangay Certificate of Indigency',
      'Valid Government ID of Applicant & Patient'
    ],
    eligibilityCriteria: [
      'Indigent patient or dependent residing in Barangay Bugo',
      'Active medical treatment or recent bereavement'
    ],
    maxBenefitAmount: 'Referral for up to ₱50,000.00 Grant'
  },
  {
    id: 'prog-social-wheelchair',
    title: 'Wheelchair Assistance',
    category: 'Social Welfare Services',
    tagline: 'Free donation of orthopedic wheelchairs, walkers, and crutches for mobility-impaired residents.',
    description: 'Direct provision of mobility aids procured through barangay health development funds and civic organization donations to restore independence to bedridden, senior, and injured Bugo constituents.',
    imageUrl: '/assets/services/brgy_pwd_wheelchair_1794197737143.jpg',
    status: 'Active',
    badgeText: 'Mobility Equipment',
    deadline: 'Subject to Inventory Allocation',
    targetAudience: 'Paraplegic, Amputee, and Frail Elderly Residents',
    processingTime: '2 - 3 Business Days',
    requirements: [
      'Physician recommendation for mobility aid',
      'Barangay Indigency Certification',
      'PWD ID or Senior ID of recipient'
    ],
    eligibilityCriteria: [
      'Documented medical requirement for wheelchair or walking aid',
      'Low-income resident of Barangay Bugo unable to purchase privately'
    ],
    maxBenefitAmount: 'Free Wheelchair Unit'
  },
  {
    id: 'prog-educational-assistance',
    title: 'Scholarship Assistance and Inquiries',
    category: 'Social Welfare Services',
    tagline: 'Barangay Bugo College Financial Grant and facilitation of Cagayan de Oro City College scholarships.',
    description: 'Semester cash subsidy providing tuition and textbook support to deserving tertiary, vocational (TESDA), and senior high school students maintaining passing academic records.',
    imageUrl: '/assets/services/brgy_youth_sports_1794197737990.jpg',
    status: 'Active',
    badgeText: '₱5,000.00 Grant',
    deadline: 'December 15, 2026',
    targetAudience: 'College, University, & Vocational Students',
    processingTime: '3 - 5 Business Days',
    requirements: [
      'Certificate of Registration (COR) / Enrollment Form',
      'Certificate of Indigency from Barangay Bugo',
      'Valid School ID',
      'Latest Semester Grades (GWA 83% or above with no failing grades)'
    ],
    eligibilityCriteria: [
      'Enrolled in an accredited CHED/TESDA university or technical institute',
      'Household monthly income not exceeding ₱15,000.00',
      'Resident of Barangay Bugo for at least 1 year'
    ],
    maxBenefitAmount: '₱5,000.00 / Semester'
  },
  {
    id: 'prog-social-low-income',
    title: 'Assistance for Low-Income Families',
    category: 'Social Welfare Services',
    tagline: 'Emergency grocery subsidies, calamity relief packs, and social protection safety nets.',
    description: 'Direct distribution of staple foods (rice, canned goods, milk), seasonal assistance, and targeted interventions for ultra-poor families residing in informal settlements across Bugo.',
    imageUrl: '/assets/services/brgy_senior_pension_1794197712463.jpg',
    status: 'Active',
    badgeText: 'Relief & Subsidy',
    deadline: 'Continuous Monitoring & Distribution',
    targetAudience: 'Indigent Families & Informal Settlers',
    processingTime: 'Immediate Dispatch upon Verification',
    requirements: [
      'Barangay Indigency Certification',
      'Family Composition & Purok Registration',
      'Valid Resident ID'
    ],
    eligibilityCriteria: [
      'Household monthly income below ₱8,500.00',
      'Bona fide family resident of Bugo'
    ],
    maxBenefitAmount: 'Food Packs & Emergency Relief'
  },

  // ==========================================
  // 4. CIVIL REGISTRATION SERVICES
  // ==========================================
  {
    id: 'prog-civil-birth',
    title: 'Birth Certificate Registration Assistance',
    category: 'Civil Registration Services',
    tagline: 'Timely registration assistance for newborns born within Barangay Bugo to the City Civil Registry.',
    description: 'Guidance and document verification for Certificate of Live Birth (COLB) within the standard 30-day statutory period. Prevents late registration penalties and ensures accurate legal identity.',
    imageUrl: '/assets/services/brgy_vaccine_child_1794197736182.jpg',
    status: 'Active',
    badgeText: 'Timely Civil Registry',
    deadline: 'Within 30 Days of Delivery',
    targetAudience: 'Parents of Newborn Infants',
    processingTime: '1 - 2 Business Days',
    requirements: [
      'Certificate of Live Birth signed by Doctor or Midwife',
      'Marriage Certificate of Parents (if married)',
      'Affidavit of Admission of Paternity (if unmarried)',
      'Valid IDs of both Parents'
    ],
    eligibilityCriteria: [
      'Child born in Barangay Bugo or parents residing in Bugo',
      'Submitted within 30 days of child birth'
    ],
    maxBenefitAmount: 'Free Registration Assistance'
  },
  {
    id: 'prog-civil-late-birth',
    title: 'Late Birth Registration Assistance',
    category: 'Civil Registration Services',
    tagline: 'Delayed birth registration endorsements, negative PSA certificate verification, and affidavits.',
    description: 'Legal document assistance for individuals whose births were never registered with the Philippine Statistics Authority (PSA). Essential for obtaining National ID, passports, and school enrollment.',
    imageUrl: '/assets/services/brgy_clearance_cert_1794197711166.jpg',
    status: 'Active',
    badgeText: 'Delayed Registry Aid',
    deadline: 'Year-Round Service',
    targetAudience: 'Unregistered Youth and Adults',
    processingTime: '5 - 7 Business Days',
    requirements: [
      'PSA Negative Certification of Birth',
      'Joint Affidavit of Two Disinterested Persons who witnessed birth',
      'Baptismal Certificate or Elementary School Form 137',
      'Barangay Certificate of Residency'
    ],
    eligibilityCriteria: [
      'Born in Barangay Bugo without an existing PSA birth record',
      'Resident of Bugo'
    ],
    maxBenefitAmount: 'Document Packaging & Endorsement'
  },
  {
    id: 'prog-civil-marriage',
    title: 'Marriage Registration Assistance',
    category: 'Civil Registration Services',
    tagline: 'Pre-marriage counseling compliance, marriage license filing, and Kasalang Bayan coordination.',
    description: 'Assistance for engaged couples seeking civil marriage license documentation, compliance with Pre-Marriage Orientation and Counseling (PMOC), and enrollment in mass wedding ceremonies.',
    imageUrl: '/assets/services/brgy_civil_wedding_1794197758046.jpg',
    status: 'Active',
    badgeText: 'Marriage Registry',
    deadline: 'Ongoing & Kasalang Bayan Cycles',
    targetAudience: 'Engaged Couples Residing in Bugo',
    processingTime: '3 - 5 Business Days',
    requirements: [
      'PSA Birth Certificates of both partners',
      'Certificate of No Marriage Record (CENOMAR) from PSA',
      'Pre-Marriage Counseling (PMC) Certificate',
      'Barangay Certificate of Residency for both parties'
    ],
    eligibilityCriteria: [
      'At least one party must be a legal resident of Barangay Bugo',
      'Legal capacity to contract marriage under Philippine Family Code'
    ],
    maxBenefitAmount: 'Endorsement & Kasalang Bayan Access'
  },
  {
    id: 'prog-civil-death',
    title: 'Death Registration Assistance',
    category: 'Civil Registration Services',
    tagline: 'Certificate of Death processing, municipal cemetery burial clearance, and mortuary assistance.',
    description: 'Expedited processing of Certificate of Death with the local civil registrar, issuance of barangay burial permit, and coordination with local cemeteries and mortuary financial aid programs.',
    imageUrl: '/assets/services/brgy_clearance_cert_1794197711166.jpg',
    status: 'Active',
    badgeText: 'Immediate Civil Filing',
    deadline: 'Within 48 Hours of Passing',
    targetAudience: 'Bereaved Families in Bugo',
    processingTime: 'Same Day Expedited',
    requirements: [
      'Certificate of Death signed by attending physician or City Health Officer',
      'Valid ID of Informant / Immediate Family Member',
      'Barangay Certificate of Residency of the deceased'
    ],
    eligibilityCriteria: [
      'Deceased was a resident of Barangay Bugo or passing occurred in Bugo',
      'Authorized surviving relative filing report'
    ],
    maxBenefitAmount: 'Burial Permit & Mortuary Referral'
  },

  // ==========================================
  // 5. LIVELIHOOD AND EMPLOYMENT SERVICES
  // ==========================================
  {
    id: 'prog-live-job-assistance',
    title: 'Job Application Assistance',
    category: 'Livelihood and Employment Services',
    tagline: 'Free resume encoding and printing, PESO registration, and government clearance preparation.',
    description: 'Empower job hunters with professional CV formatting, digital portal applications, PhilJobNet profile registration, and document compilation to fast-track employment.',
    imageUrl: '/assets/services/brgy_clearance_cert_1794197711166.jpg',
    status: 'Active',
    badgeText: 'Free Career Help',
    deadline: 'Year-Round Service',
    targetAudience: 'Unemployed Youth & Job Seekers',
    processingTime: 'Same Day Desk Assistance',
    requirements: [
      'Draft biodata or educational records',
      'Barangay Resident ID',
      '2x2 Formal ID Picture'
    ],
    eligibilityCriteria: [
      'Resident of Barangay Bugo seeking active employment',
      'At least 18 years of age (or 15-17 with special permit)'
    ],
    maxBenefitAmount: 'Free Printing & Portal Registration'
  },
  {
    id: 'prog-live-employment-referral',
    title: 'Employment Referrals',
    category: 'Livelihood and Employment Services',
    tagline: 'Direct endorsement to Cagayan de Oro industrial locators, Del Monte cannery, and local businesses.',
    description: 'Barangay PESO coordinator endorsements connecting verified local residents directly with hiring managers at food processing plants, logistics centers, supermarkets, and industrial zones in Bugo.',
    imageUrl: '/assets/services/real_barangay_hall_1788172230992.jpg',
    status: 'Active',
    badgeText: 'Direct Industry Link',
    deadline: 'Ongoing Open Job Vacancies',
    targetAudience: 'Skilled, Semi-Skilled, & High School/College Grads',
    processingTime: '2 - 3 Business Days',
    requirements: [
      'Updated Resume / Curriculum Vitae',
      'Barangay Clearance for Employment',
      'Police or NBI Clearance',
      'TESDA NC II Certificate (for technical roles)'
    ],
    eligibilityCriteria: [
      'Bona fide resident of Barangay Bugo',
      'Meets educational and physical criteria of hiring partner'
    ],
    maxBenefitAmount: 'Official Barangay Employment Endorsement'
  },
  {
    id: 'prog-live-business-processing',
    title: 'Business Permit Processing Assistance',
    category: 'Livelihood and Employment Services',
    tagline: 'Technical guidance for micro-enterprises on DTI registration, BIR TIN, and business compliance.',
    description: 'Consultation desk helping local entrepreneurs, market vendors, and sari-sari store owners navigate regulatory permits, BMBE (Barangay Micro Business Enterprise) tax exemptions, and food handling certificates.',
    imageUrl: '/assets/services/real_barangay_hall_1788172230992.jpg',
    status: 'Active',
    badgeText: 'MSME Business Desk',
    deadline: 'Continuous Business Support',
    targetAudience: 'Sari-Sari Store Owners, Vendors, & Startups',
    processingTime: '1 - 2 Business Days',
    requirements: [
      'Proposed Business Name and Location',
      'Valid Resident ID of Business Owner',
      'Sketch of Business Location within Bugo'
    ],
    eligibilityCriteria: [
      'Business located within Barangay Bugo',
      'Filipino citizen enterprise owner'
    ],
    maxBenefitAmount: 'Free Technical Guidance & Forms'
  },
  {
    id: 'prog-live-agricultural-assistance',
    title: 'Agricultural Assistance',
    category: 'Livelihood and Employment Services',
    tagline: 'Technical farming extension, organic fertilizer access, and soil fertility advisory.',
    description: 'Programs supporting hillside and lowland farmers in Bugo Zones 3, 6, and 7 with sustainable farming techniques, pest management consultations, and organic compost distribution.',
    imageUrl: '/assets/services/brgy_agriculture_seeds_1794197712913.jpg',
    status: 'Active',
    badgeText: 'Agri-Extension',
    deadline: 'Planting Season Cycles',
    targetAudience: 'Smallholder Farmers & Urban Gardeners',
    processingTime: 'Scheduled Field Visits',
    requirements: [
      'RSBSA (Registry System for Basic Sectors in Agriculture) ID or Registration',
      'Barangay Certificate of Residency',
      'Proof of Farm Land Stewardship or Tillage'
    ],
    eligibilityCriteria: [
      'Active farmer or agrarian beneficiary in Bugo',
      'Practicing crop cultivation or livestock raising'
    ],
    maxBenefitAmount: 'Free Technical Agricultural Advisory'
  },
  {
    id: 'prog-live-seed-distribution',
    title: 'Distribution of Agricultural Seeds',
    category: 'Livelihood and Employment Services',
    tagline: 'Free high-yield certified vegetable seed packets for backyard gardening and food security.',
    description: 'Barangay and Department of Agriculture partnership providing seed packs of eggplant (talong), tomato (kamatis), bitter gourd (ampalaya), string beans (sitaw), and okra to promote household food self-sufficiency.',
    imageUrl: '/assets/services/brgy_agriculture_seeds_1794197712913.jpg',
    status: 'Active',
    badgeText: 'Free Seed Packets',
    deadline: 'Ongoing While Seed Stocks Last',
    targetAudience: 'Households, Schools, & Urban Gardeners',
    processingTime: 'Immediate Release at Agri Desk',
    requirements: [
      'Barangay Resident ID',
      'Backyard Food Security Pledge Commitment'
    ],
    eligibilityCriteria: [
      'Open to all Bugo households with space for gardening or container farming'
    ],
    maxBenefitAmount: 'Free Certified Seed Kits'
  },
  {
    id: 'prog-live-farming-support',
    title: 'Livelihood and Farming Support',
    category: 'Livelihood and Employment Services',
    tagline: 'Livelihood starter kits, food processing training, and cooperative financing linkups.',
    description: 'Empowers low-income families and women cooperatives with vocational livelihood skills (meat processing, pastry baking, soap making, swine raising) and small starter grants to achieve sustainable household incomes.',
    imageUrl: '/assets/services/brgy_agriculture_seeds_1794197712913.jpg',
    status: 'Active',
    badgeText: 'Cooperative Grants',
    deadline: 'Quarterly Cohort Enrollments',
    targetAudience: 'Women Associations, Fisherfolk, & Farmers',
    processingTime: '5 - 10 Business Days',
    requirements: [
      'Certificate of Indigency or Low Income',
      'Barangay Resident ID',
      'Livelihood Group or Cooperative Membership Form'
    ],
    eligibilityCriteria: [
      'Resident of Barangay Bugo',
      'Demonstrated willingness to maintain livelihood enterprise'
    ],
    maxBenefitAmount: 'Livelihood Starter Kit & Micro-Grant'
  },

  // ==========================================
  // 6. LEGAL SERVICES
  // ==========================================
  {
    id: 'prog-legal-notarization',
    title: 'Free Notarization During Government Outreach',
    category: 'Legal Services',
    tagline: 'Pro-bono notarization of affidavits of loss, indigency, parental consent, and undertakings.',
    description: 'Regular legal outreach clinics conducted in partnership with the Public Attorney’s Office (PAO) and the Integrated Bar of the Philippines (IBP) offering free notarial seals for low-income constituents.',
    imageUrl: '/assets/services/brgy_clearance_cert_1794197711166.jpg',
    status: 'Active',
    badgeText: 'Pro-Bono Notarization',
    deadline: 'Scheduled Outreach Days',
    targetAudience: 'Indigent Residents & Public Scholars',
    processingTime: 'Same Day on Outreach Date',
    requirements: [
      'Unsigned Document / Affidavit in 2 duplicate copies',
      'Two (2) Valid Government IDs with photo and signature',
      'Barangay Certificate of Indigency'
    ],
    eligibilityCriteria: [
      'Document strictly for personal or indigent assistance use',
      'Bona fide resident of Barangay Bugo'
    ],
    maxBenefitAmount: 'Free Notarial Seal & Signature'
  },
  {
    id: 'prog-legal-consultation',
    title: 'Legal Consultation',
    category: 'Legal Services',
    tagline: 'Confidential legal advice on civil disputes, family relations, property rights, and labor rights.',
    description: 'Free initial legal consultations with visiting volunteer attorneys and paralegals. Get expert counsel on land tenure issues, child custody, domestic violence, debt settlement, and labor exploitation.',
    imageUrl: '/assets/services/real_barangay_hall_1788172230992.jpg',
    status: 'Active',
    badgeText: 'Free Legal Advice',
    deadline: 'Every Thursday Legal Clinic',
    targetAudience: 'Residents with Unresolved Legal Questions',
    processingTime: 'Consultation by Appointment',
    requirements: [
      'Barangay Resident ID',
      'Summary narrative of legal issue',
      'Copies of relevant contracts, affidavits, or legal documents'
    ],
    eligibilityCriteria: [
      'Resident of Barangay Bugo',
      'Unable to afford private legal representation'
    ],
    maxBenefitAmount: 'Free 30-Minute Attorney Counseling'
  },
  {
    id: 'prog-legal-doc-assistance',
    title: 'Assistance with Legal Documents',
    category: 'Legal Services',
    tagline: 'Drafting assistance for Affidavits of Loss, Undertakings, Special Power of Attorney, and Certifications.',
    description: 'Barangay paralegal desk assists residents in properly formatting and drafting standard legal affidavits required for lost IDs, SIM registration, school undertakings, and senior pension claims.',
    imageUrl: '/assets/services/brgy_clearance_cert_1794197711166.jpg',
    status: 'Active',
    badgeText: 'Paralegal Drafting',
    deadline: 'Year-Round Service',
    targetAudience: 'All Residents in Need of Legal Templates',
    processingTime: '1 - 2 Business Hours',
    requirements: [
      'Valid Resident ID',
      'Details of lost item (ID number, date lost, circumstance) or transaction'
    ],
    eligibilityCriteria: [
      'Resident of Barangay Bugo',
      'Affidavit must be truthful and compliant with Philippine law'
    ],
    maxBenefitAmount: 'Free Legal Document Drafting'
  },

  // ==========================================
  // 7. COMMUNITY AND EMERGENCY SERVICES
  // ==========================================
  {
    id: 'prog-emergency-disaster-prep',
    title: 'Disaster Preparedness and Response',
    category: 'Community and Emergency Services',
    tagline: 'BDRRMC typhoon monitoring, flood alert sirens, emergency rescue dispatch, and risk mapping.',
    description: 'Barangay Disaster Risk Reduction and Management Council (BDRRMC) 24/7 command operation coordinating emergency communications, flood monitoring for Bugo river waterways, and swift water rescue dispatch.',
    imageUrl: '/assets/services/brgy_disaster_rescue_1794197713383.jpg',
    status: 'Active',
    badgeText: '24/7 BDRRMC Alert',
    deadline: '24/7 Emergency Dispatch',
    targetAudience: 'All Bugo Puroks, Coastal & Riverine Zones',
    processingTime: 'Immediate Response',
    requirements: [
      'Emergency location and contact person',
      'Nature of emergency (Flood, Landslide, Fire, Medical)'
    ],
    eligibilityCriteria: [
      'Any emergency or disaster incident within Barangay Bugo'
    ],
    maxBenefitAmount: 'Emergency Rescue & First Aid'
  },
  {
    id: 'prog-emergency-evacuation',
    title: 'Evacuation Assistance',
    category: 'Community and Emergency Services',
    tagline: 'Pre-emptive evacuation transport, shelter management, hot meals, and family reunification.',
    description: 'Organized emergency vehicles and designated Bugo evacuation shelters (Bugo Covered Court, Bugo Central School) equipped with emergency generator sets, sleeping cots, sanitation, and relief supply storage.',
    imageUrl: '/assets/services/brgy_disaster_rescue_1794197713383.jpg',
    status: 'Active',
    badgeText: 'Shelter & Transport',
    deadline: 'Active During Severe Weather & Calamities',
    targetAudience: 'Residents in Flood-Prone & High-Risk Zones',
    processingTime: 'Immediate Priority Dispatch',
    requirements: [
      'Purok location & number of vulnerable family members (Infants, PWD, Seniors)'
    ],
    eligibilityCriteria: [
      'Families threatened by floodwaters, typhoon storm surge, or fire'
    ],
    maxBenefitAmount: 'Safe Shelter, Hot Meals & Transport'
  },
  {
    id: 'prog-emergency-safety-tanod',
    title: 'Community Safety and Security Coordination',
    category: 'Community and Emergency Services',
    tagline: '24/7 Barangay Tanod patrols, night security escorts, curfew monitoring, and police coordination.',
    description: 'Barangay Peacekeeping Action Team (BPAT) conducting motorized mobile patrols, maintaining peace in commercial alleys, securing public transport hubs, and deterring nighttime criminal activity.',
    imageUrl: '/assets/services/brgy_disaster_rescue_1794197713383.jpg',
    status: 'Active',
    badgeText: '24/7 BPAT Tanod',
    deadline: 'Round-the-Clock Patrols',
    targetAudience: 'All Neighborhoods, Business Strips, & Puroks',
    processingTime: 'Immediate Field Dispatch',
    requirements: [
      'Incident location / Purok',
      'Caller identity or anonymous security alert details'
    ],
    eligibilityCriteria: [
      'Applies to all public and residential sectors of Barangay Bugo'
    ],
    maxBenefitAmount: 'Patrol & Law Enforcement Coordination'
  },
  {
    id: 'prog-emergency-community-activities',
    title: 'Community Programs and Activities',
    category: 'Community and Emergency Services',
    tagline: 'Youth SK basketball leagues, coastal clean-ups, tree planting, and cultural fiesta celebrations.',
    description: 'Civic enrichment activities promoting environmental sustainability, community solidarity, sports development, anti-drug awareness seminars, and vibrant cultural festivities in Barangay Bugo.',
    imageUrl: '/assets/services/brgy_youth_sports_1794197737990.jpg',
    status: 'Active',
    badgeText: 'Civic Programs',
    deadline: 'Seasonal & Event Calendars',
    targetAudience: 'Youth, SK Members, Families, & Civic Groups',
    processingTime: 'Open Registration per Event',
    requirements: [
      'Barangay Resident ID or SK Youth Registration Form',
      'Signed event participant waiver (for sports events)'
    ],
    eligibilityCriteria: [
      'Resident of Barangay Bugo',
      'Open to all community members'
    ],
    maxBenefitAmount: 'Community Sports, Medals & Participation'
  }
];

export const CERTIFICATE_SERVICES: AssistanceProgram[] = [
  ALL_BARANGAY_SERVICES.find(s => s.id === 'prog-barangay-clearance')!,
  ALL_BARANGAY_SERVICES.find(s => s.id === 'prog-admin-residency')!,
  ALL_BARANGAY_SERVICES.find(s => s.id === 'prog-admin-indigency')!,
  ALL_BARANGAY_SERVICES.find(s => s.id === 'prog-admin-good-moral')!,
  ALL_BARANGAY_SERVICES.find(s => s.id === 'prog-admin-first-job')!,
  ALL_BARANGAY_SERVICES.find(s => s.id === 'prog-cert-solo-parent')!,
  ALL_BARANGAY_SERVICES.find(s => s.id === 'prog-cert-senior-citizen')!,
  ALL_BARANGAY_SERVICES.find(s => s.id === 'prog-cert-pwd')!,
  ALL_BARANGAY_SERVICES.find(s => s.id === 'prog-cert-student-grant')!,
  ALL_BARANGAY_SERVICES.find(s => s.id === 'prog-admin-business-permit')!
].filter(Boolean);

