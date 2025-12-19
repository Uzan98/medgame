import type { DetectiveCase } from '../lib/detectiveTypes';

// Base cases removed - all cases are now stored in Supabase
// Use the admin panel to create and manage cases
export const DETECTIVE_CASES: DetectiveCase[] = [];

export const getAllCases = () => DETECTIVE_CASES;
