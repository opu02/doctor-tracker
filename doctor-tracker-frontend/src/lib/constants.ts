export const SORT_OPTIONS = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "name_asc", label: "Name A–Z" },
  { value: "name_desc", label: "Name Z–A" },
];

export const PATIENT_SORT_OPTIONS = [
  { value: "newest", label: "Latest admission" },
  { value: "oldest", label: "Earliest admission" },
  { value: "name_asc", label: "Name A–Z" },
  { value: "name_desc", label: "Name Z–A" },
];

export const GENDER_OPTIONS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
];

export const PAGE_SIZES = [10, 20, 50];

// Bangladesh mobile number: 01XXXXXXXXX, optionally with +88 / 88 prefix (same rule as the API)
export const BD_PHONE = /^(?:\+?88)?01[3-9]\d{8}$/;
