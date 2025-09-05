/**
 * HospitalFiltering Component
 * ---------------------------
 * A reusable component for selecting a hospital and department with search functionality.
 * Designed to work with react-hook-form.
 *
 * Automatically sets the following form fields:
 *    - `hospital_name`: string
 *    - `department_needed`: string
 *
 * To use:
 *
 * 1. Make sure Zod schema includes:
 *
 *    ```ts
 *    hospital_name: z.string(),
 *    department_needed: z.string(),
 *    ```
 *
 * 2. Initialize your form using `useForm` with the schema:
 *
 *    const form = useForm<FormSchema>({ ... });
 *
 * 3. Import and include the HospitalFiltering component inside your form:
 *
 *    import HospitalFiltering from './HospitalFiltering';
 *
 *    <HospitalFiltering form={form} />
 *
 * This component handles:
 *    - Hospital dropdown selection
 *    - Department filtering based on hospital
 *    - Search input to filter department list
 *    - Setting values in the form via `form.setValue(...)`
 *
 * Ensure the form uses `react-hook-form` and passes the `form` object as a prop.
 */

import { useState } from "react";
import { FieldValues, UseFormReturn } from "react-hook-form";

const depts20Patriot = [
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

const depts22Patriot = [
  "Allergy",
  "Blood Draw/Phlebotomy",
  "Cardiac Arrhythmia",
  "Community Room",
  "Dermatology",
  "Endocrinology",
  "Gastroenterology",
  "Kidney (Renal) Medicine",
  "Neurology",
  "Neurosurgery",
  "Ophthalmology",
  "Optometry",
  "Patient Financial Services",
  "Primary Care",
  "Pulmonology",
  "Rheumatology",
  "Vein Care Services",
  "Women's Health",
];

const deptsChestnut = [
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

const allDepartments = [
  ...depts20Patriot.map((dept) => ({
    label: dept,
    location: "Patriot Place",
  })),
  ...depts22Patriot.map((dept) => ({
    label: dept,
    location: "Patriot Place",
  })),
  ...deptsChestnut.map((dept) => ({ label: dept, location: "Chestnut Hill" })),
];

type HospitalFilteringProps<T extends FieldValues> = {
  form: UseFormReturn<T>;
  setSelectedDepartment: React.Dispatch<
    React.SetStateAction<{
      label: string;
      location: string;
    } | null>
  >;
  setSelectedHospital: React.Dispatch<React.SetStateAction<string>>;
  deptSearchTerm: string;
  setDeptSearchTerm: React.Dispatch<React.SetStateAction<string>>;
};

function hospitalFiltering<T extends FieldValues>({
  form,
  setSelectedDepartment,
  setSelectedHospital,
  deptSearchTerm,
  setDeptSearchTerm,
}: HospitalFilteringProps<T>) {
  const [hospitalFilter, setHospitalFilter] = useState<string | null>(null);

  const filteredDepartments = allDepartments.filter((dept) => {
    const matchesSearch = dept.label.toLowerCase().includes(deptSearchTerm.toLowerCase());
    const matchesHospital = hospitalFilter === null || dept.location === hospitalFilter;
    return matchesSearch && matchesHospital;
  });
  const [showDeptList, setShowDeptList] = useState(true);

  return (
    <div className={"space-y-4"}>
      {/* Hospital Filter */}
      <div className="space-y-2 flex flex-col text-md">
        <label className="block font-semibold flex gap-1">
          Filter by Hospital<p className={"text-red-500"}>*</p>
        </label>
        <select
          value={hospitalFilter ?? ""}
          onChange={(e) => {
            const value = e.target.value || null;
            setHospitalFilter(value);
            setSelectedDepartment(null);
            setDeptSearchTerm("");
            setShowDeptList(true);
          }}
          className="w-full border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
        >
          <option value="">All Hospitals</option>
          <option value="Patriot Place">Patriot Place</option>
          <option value="Chestnut Hill">Chestnut Hill</option>
        </select>
      </div>

      {/* Department Search */}
      <div className="space-y-2 text-md">
        <label className="block font-semibold flex gap-1">
          Search Department<p className={"text-red-500"}>*</p>
        </label>
        <input
          type="text"
          placeholder="Start typing..."
          className="w-full border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          value={deptSearchTerm}
          onChange={(e) => {
            const input = e.target.value;
            setDeptSearchTerm(input);
            setShowDeptList(true);
            if (input.trim() === "") {
              setSelectedDepartment(null);
            }
          }}
        ></input>
        {showDeptList && (
          <ul className="max-h-40 overflow-y-auto border border-gray-300 rounded-md bg-white">
            {filteredDepartments.map((dept, idx) => (
              <li
                key={idx}
                className="cursor-pointer hover:bg-blue-100 px-2 py-1 text-sm"
                onClick={() => {
                  setSelectedDepartment(dept);
                  setSelectedHospital(dept.location);
                  setDeptSearchTerm(dept.label);
                  setShowDeptList(false);
                }}
              >
                {dept.label} <span className="text-xs text-gray-500">({dept.location})</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default hospitalFiltering;
