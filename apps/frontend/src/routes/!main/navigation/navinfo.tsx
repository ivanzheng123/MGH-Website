export const depts20Patriot = [
  "Arthroplasty",
  "Audiology",
  "Blood Draw/Phlebotomy",
  "Cardiac Rehab",
  "Cardiovascular Services",
  "Clinical Lab",
  "Day Surgery Center",
  "Electromyography (EMG)",
  "ENT",
  "General and Gastrointestinal Surgery",
  "Hand and Upper Extremity",
  "Hand Therapy",
  "Nutrition",
  "Occupational Therapy",
  "Pain Medicine",
  "Pediatric Trauma",
  "Pharmacy",
  "Physical Therapy",
  "Physiatry",
  "Plastic Surgery",
  "Podiatry",
  "Pulmonary Function Testing",
  "Radiology",
  "Speech-Language",
  "Surgi-Care",
  "Thoracic Surgery",
  "Upper Extremity",
  "Urgent Care Center",
  "Urology",
  "Vascular Surgery",
  "Weight Management and Wellness",
  "X-Ray Suite",
];

export const mapPatriot22_floor3 = [
  "Allergy",
  "Cardiac Arrhythmia",
  "Dermatology",
  "Endocrinology",
  "Gastroenterology",
  "Kidney (Renal) Medicine",
  "Neurology",
  "Neurosurgery",
  "Ophthalmology",
  "Optometry",
  "Patient Financial Services",
  "Pulmonology",
  "Rheumatology",
  "Vein Care Services",
  "Women's Health",
];

export const mapPatriot22_floor4 = ["Blood Draw/Phlebotomy", "Community Room", "Primary Care"];

export const patriot22_floor4 = new Set<string>(["Blood Draw/Phlebotomy", "Community Room", "Primary Care"]);

export const deptsChestnut = [
  "Allergy and Clinical Immunology",
  "Backup Child Care Center",
  "Brigham Dermatology Associates (BDA)",
  "Brigham Obstetrics and Gynecology Group (BOGG)",
  "Brigham Physicians Group (BPG)",
  "Brigham Psychiatric Specialties",
  "Center for Pain Medicine",
  "Crohn’s and Colitis Center",
  "Endoscopy Center",
  "Gretchen S. and Edward A. Fish Center for Women’s Health",
  "Laboratory",
  "Multi-Specialty Clinic",
  "Osher Clinical Center for Integrative Health",
  "Patient Financial Services",
  "Pharmacy",
  "Radiology",
  "Radiology, MRI/CT scan",
  "Rehabilitation Services",
];

export const deptsFaulknerFloor1 = [
  "Admitting/Registration",
  "Atrium Café",
  "Audiology",
  "Blood Drawing Lab",
  "Cardiac Rehab",
  "Dialysis Clinic",
  "Emergency Department",
  "Emergency Entrance",
  "GI Endoscopy",
  "Information",
  "MRI/CT",
  "Patient Finances",
  "Pre-Admittance Screening",
  "Pulmonary Lab",
  "Radiology",
  "Special Testing",
  "Starbucks",
  "Taiclet Family Center",
  "Valet Parking",
  "Vascular Lab",
];

export const deptsFaulknerFloor2 = [
  "Biomedical Engineering",
  "Food Services",
  "Morgue",
  "Occupational Therapy",
  "Otolaryngology",
  "Pharmacy",
  "Physical Therapy",
  "Plastic Surgery",
  "Psychiatric Inpatient Care",
  "Psychiatric/Addiction Recovery",
  "Rehabilitation Services",
];
export const deptsFaulknerFloor3 = [
  "Cafeteria",
  "Chapel",
  "Family/Patient Resources",
  "Gift Shop",
  "Gynocology & Oncology",
  "Huvos Auditorium",
  "Obstetrics and Gynecology Associates",
  "Outdoor Dining Terrace",
  "Roslindale Pediatric Associates",
  "Shuttle Pickup",
  "Volunteer Services",
];
export const deptsFaulknerFloor4 = [
  "Cardiology",
  "Foot and Ankle Center",
  "Gastroenterology Associates",
  "HVMA Internal Medicine",
  "HVMA Neurology",
  "Medical Library",
  "Medical Records",
  "MOHS Clinic",
  "Neurology",
  "Primary Care Physicians",
  "Pulmonary Services",
  "Rheumatology Center",
  "Sadowsky Conference Room",
  "Social Work",
  "Tynan Conference Room",
  "Urology",
];
export const deptsFaulknerFloor5 = [
  "Boston ENT Associates",
  "Endocrinology/Diabetes/Hemotology",
  "Headache",
  "ICU",
  "Internal Medicine",
  "Oncology Clinic",
  "Orthopaedics Associates",
  "Outpatient Infusion Center",
  "Primary Care Physicians", // duplicate
  "Surgical Specialties",
  "X-Ray",
  "X-Ray Waiting Room",
];

export const deptsMainFloorL1: string[] = [
  "Cross-Sectional Interventional Radiology",
  "Day Surgery Check-in / Pre-Op",
  "Cardiovascular Imaging Center",
  "Nuclear Medicine & Molecular Imaging",
  "PACU",
  "Medical Records / Film Library",
];

export const deptsMainFloorG: string[] = ["Infusion", "Phlebotomy, Outpatient"];

export const deptsMainFloor1: string[] = [
  "Emergency (75 Francis)",
  "Obstetrics Admitting (75 Francis)",
  "Sharf Admitting Center (75 Francis)",
  "Bridge Clinic, Dushku-Palandjian",
  "Bretholtz Family Center",
  "Patient Financial Registration",
  "Chapel, Multi-Faith",
];

export const deptsMainFloor2: string[] = [
  "Ambulatory Radiology (X-ray & CT scan)",
  "Endoscopy",
  "Bornstein Amphitheater",
  "Boston Children's Hospital, Bridge to",
  "Cafeteria",
  "Carrie Hall Conference Room",
  "Comprehensive Breast Health Center",
  "Dental Group / Oral Medicine",
  "Ear, Nose and Throat (ENT)",
  "Echocardiography Lab (ECHO)",
  "Electrophysiology",
  "Plastic & Reconstructive Surgery",
  "Podiatry",
  "Pharmacy",
  "Radiation Procedural Check-in",
  "Watkins Cardiovascular Clinic",
  "Weiner Center for Pre-Op Evaluation",
  "Wound Care Center",
];

export const deptsMainFloor3: string[] = [
  "Dialysis",
  "Breast Imaging, Lee Bell Center",
  "High Risk Obstetric Ultrasound",
  "Ultrasound",
  "Gynecologic Oncology",
  "Infertility & Reproductive Surgery",
  "Maternal Fetal Medicine",
  "Minimally Invasive Gynecologic Surgery",
  "Neurology",
  "Neurosurgery",
  "Orthopedics",
  "Urology",
  "Dana-Farber Cancer Institute, Bridge to",
  "Kraft Blood Donor Center",
];

export const deptsMainFloor4: string[] = ["Infectious Disease"];

export const deptsMainFloor6: string[] = ["Dana-Farber Cancer Center Inpatient Hospital"];

export const allDepartments = [
  ...depts20Patriot.map((dept) => ({
    label: dept,
    location: "20 Patriot Place",
    floor: "Floor 1",
  })),
  ...mapPatriot22_floor3.map((dept) => ({
    label: dept,
    location: "22 Patriot Place",
    floor: "Floor 3",
  })),
  ...mapPatriot22_floor4.map((dept) => ({
    label: dept,
    location: "22 Patriot Place",
    floor: "Floor 4",
  })),
  ...deptsChestnut.map((dept) => ({
    label: dept,
    location: "Chestnut Hill",
    floor: "Floor 1",
  })),
  ...deptsFaulknerFloor1.map((dept) => ({
    label: dept,
    location: "Faulkner",
    floor: "Floor 1",
  })),
  ...deptsFaulknerFloor2.map((dept) => ({
    label: dept,
    location: "Faulkner",
    floor: "Floor 2",
  })),
  ...deptsFaulknerFloor3.map((dept) => ({
    label: dept,
    location: "Faulkner",
    floor: "Floor 3",
  })),
  ...deptsFaulknerFloor4.map((dept) => ({
    label: dept,
    location: "Faulkner",
    floor: "Floor 4",
  })),
  ...deptsFaulknerFloor5.map((dept) => ({
    label: dept,
    location: "Faulkner",
    floor: "Floor 5",
  })),
  ...deptsMainFloorL1.map((dept) => ({
    label: dept,
    location: "Main",
    floor: "Floor L1",
  })),
  ...deptsMainFloorG.map((dept) => ({
    label: dept,
    location: "Main",
    floor: "Floor G",
  })),
  ...deptsMainFloor1.map((dept) => ({
    label: dept,
    location: "Main",
    floor: "Floor 1",
  })),
  ...deptsMainFloor2.map((dept) => ({
    label: dept,
    location: "Main",
    floor: "Floor 2",
  })),
  ...deptsMainFloor3.map((dept) => ({
    label: dept,
    location: "Main",
    floor: "Floor 3",
  })),
  ...deptsMainFloor4.map((dept) => ({
    label: dept,
    location: "Main",
    floor: "Floor 4",
  })),
  ...deptsMainFloor6.map((dept) => ({
    label: dept,
    location: "Main",
    floor: "Floor 6",
  })),
];

export const hospitalDestinations: Record<string, string> = {
  "Patriot Place": "42.09160243516948, -71.26628149240888",
  "20 Patriot Place": "42.09160243516948, -71.26628149240888",
  "22 Patriot Place": "42.09160243516948, -71.26628149240888",
  "Chestnut Hill": "42.32643937672144, -71.14987648897093",
  Faulkner: "42.30193634002973, -71.12918619759894",
  Main: "42.33526049649554, -71.10604604739288",
};

export const hospitalHandicapDestinations: Record<string, string> = {
  "Patriot Place": "42.09222153695333, -71.26655172375872", // updated
  "20 Patriot Place": "42.09222153695333, -71.26655172375872", // updated
  "22 Patriot Place": "42.09222153695333, -71.26655172375872", // updated
  "Chestnut Hill": "42.32629382268971, -71.14937131193413", // updated
  Faulkner: "42.30073309429105,-71.12811748767065", // updated
  Main: "42.33526049649554, -71.10604604739288",
};

export const departmentsByHospital: { [key: string]: string[] } = {
  "Patriot Place": depts20Patriot,
  "Chestnut Hill": deptsChestnut,
  Faulkner: [
    ...deptsFaulknerFloor1,
    ...deptsFaulknerFloor2,
    ...deptsFaulknerFloor3,
    ...deptsFaulknerFloor4,
    ...deptsFaulknerFloor5,
  ],
  "Main Campus": [
    ...deptsMainFloorL1,
    ...deptsMainFloorG,
    ...deptsMainFloor1,
    ...deptsMainFloor2,
    ...deptsMainFloor3,
    ...deptsMainFloor4,
    ...deptsMainFloor6,
  ],
};
