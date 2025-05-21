// Phase 1: Basic Schedule
export interface Phase1Assignment {
  employeeName: string;
  shift: string;
}

export interface Phase1Schedule {
  id: string;
  date: string;
  assignments: Phase1Assignment[];
}

export interface Phase1Data {
  sched: Phase1Schedule[];
}

// Phase 2: Employee Management
export interface Phase2Employee {
  id: string;
  fullName: string;
  contactNumber: string;
}

export interface Phase2DefinedShift {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  description: string;
}

export interface Phase2Assignment {
  empId: string;
  shiftId: string;
}

export interface Phase2Schedule {
  id: string;
  date: string;
  assignments: Phase2Assignment[];
}

export interface Phase2Data {
  emp: Phase2Employee[];
  definedShifts: Phase2DefinedShift[];
  sched: Phase2Schedule[];
}

// Phase 3: Roles and Availability
export interface Phase3Employee extends Phase2Employee {
  roles: string[];
  unavailability?: {
    requestId: string;
    type: 'Time Off' | 'Recurring Unavailability';
    startDate: string;
    endDate: string;
    startTime?: string;
    endTime?: string;
    dayOfWeek?: string;
    reason: string;
    status: 'Requested' | 'Approved' | 'Denied';
  }[];
}

export interface Phase3DefinedShift extends Phase2DefinedShift {
  eligibleRoles: string[];
}

export interface Phase3Data {
  emp: Phase3Employee[];
  definedShifts: Phase3DefinedShift[];
  sched: Phase2Schedule[]; // Schedule structure remains the same
}

// Phase 4: Multiple Locations
export interface Phase4Location {
  id: string;
  name: string;
  address: string;
}

export interface Phase4DefinedShift extends Phase3DefinedShift {
  locationId: string;
}

export interface Phase4Data {
  emp: Phase3Employee[];
  loc: Phase4Location[];
  definedShifts: Phase4DefinedShift[];
  sched: Phase2Schedule[]; // Schedule structure remains the same
}

// Phase 5: Labor Cost Tracking
export interface Phase5EmployeeRole {
  name: string;
  maxHourlyRate: number;
  effectiveDate: string;
}

export interface Phase5Employee extends Omit<Phase3Employee, 'roles'> {
  roles: Phase5EmployeeRole[];
}

export interface Phase5Location extends Phase4Location {
  laborBudget: {
    weekly: number;
    effectiveDate: string;
  };
}

export interface Phase5Assignment extends Phase2Assignment {
  hoursWorked: number;
  calculatedCost: number;
  status: 'Scheduled' | 'Completed';
}

export interface Phase5Schedule extends Omit<Phase2Schedule, 'assignments'> {
  actualCost: number;
  assignments: Phase5Assignment[];
}

export interface Phase5Data {
  emp: Phase5Employee[];
  loc: Phase5Location[];
  definedShifts: Phase4DefinedShift[];
  sched: Phase5Schedule[];
}

// Phase 6-7: Schema Refinements (snake_case)
export interface Phase7EmployeeRole {
  name: string;
  max_hourly_rate: number;
  effective_date: string;
}

export interface Phase7Employee {
  id: string;
  full_name: string;
  contact_number: string;
  roles: Phase7EmployeeRole[];
  unavailability?: {
    request_id: string;
    type: 'Time Off' | 'Recurring Unavailability';
    start_date: string;
    end_date: string;
    start_time?: string;
    end_time?: string;
    day_of_week?: string;
    reason: string;
    status: 'Requested' | 'Approved' | 'Denied';
  }[];
}

export interface Phase7Location {
  id: string;
  name: string;
  address: string;
  labor_budget: {
    weekly: number;
    effective_date: string;
  };
}

export interface Phase7DefinedShift {
  id: string;
  location_id: string;
  name: string;
  start_time: string;
  end_time: string;
  description: string;
  eligible_roles: string[];
}

export interface Phase7Assignment {
  emp_id: string;
  shift_id: string;
  hours_worked: number;
  calculated_cost: number;
  status: 'Scheduled' | 'Completed';
  original_emp_id: string;
  change_history: {
    timestamp: string;
    action: string;
    emp_id: string;
    changed_by_emp_id: string;
    version: number;
    request_details?: {
      type: string;
      proposed_swap_with?: string;
      reason: string;
    };
  }[];
}

export interface Phase7Schedule {
  id: string;
  date: string;
  version: number;
  status: 'Draft' | 'Published' | 'Confirmed';
  published_at: string;
  confirmed_at: string | null;
  location_id: string;
  actual_cost: number;
  assignments: Phase7Assignment[];
}

export interface Phase7Data {
  emp: Phase7Employee[];
  loc: Phase7Location[];
  defined_shifts: Phase7DefinedShift[];
  sched: Phase7Schedule[];
}

// Phase 8: Multi-Currency Support
export interface Phase8Location extends Omit<Phase7Location, 'labor_budget'> {
  currency: string;
  labor_budget: {
    weekly: number;
    effective_date: string;
  };
}

export interface Phase8ExchangeRate {
  from_currency: string;
  to_currency: string;
  rate: number;
  effective_date: string;
  end_date: string | null;
}

export interface Phase8Cost {
  local_amount: number;
  local_currency: string;
  converted_amount: number;
  converted_currency: string;
  exchange_rate: number;
  exchange_rate_date: string;
}

export interface Phase8Assignment extends Omit<Phase7Assignment, 'calculated_cost'> {
  calculated_cost: Phase8Cost;
}

export interface Phase8Schedule extends Omit<Phase7Schedule, 'actual_cost' | 'assignments'> {
  actual_cost: Phase8Cost;
  assignments: Phase8Assignment[];
}

export interface Phase8Data {
  emp: Phase7Employee[];
  loc: Phase8Location[];
  defined_shifts: Phase7DefinedShift[];
  exchange_rates: Phase8ExchangeRate[];
  sched: Phase8Schedule[];
}

// Phase 9-10: Status Management
export interface Phase10Assignment extends Omit<Phase8Assignment, 'status'> {
  status: 'Scheduled' | 'Completed';
  pending_changes?: {
    type: 'SwapRequest' | 'CoverRequest';
    requested_by: string;
    requested_at: string;
    proposed_swap_with?: string;
    status: 'PendingApproval' | 'Approved' | 'Denied';
  };
}

export interface Phase10Schedule extends Omit<Phase8Schedule, 'assignments'> {
  assignments: Phase10Assignment[];
}

export interface Phase10Data {
  emp: Phase7Employee[];
  loc: Phase8Location[];
  defined_shifts: Phase7DefinedShift[];
  exchange_rates: Phase8ExchangeRate[];
  sched: Phase10Schedule[];
}