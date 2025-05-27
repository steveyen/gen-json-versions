import { Phase4Data, Phase4Location, Phase4DefinedShift, Phase3Employee, Phase2Schedule, Phase2Assignment } from '../types';
import { generateId, generateDate, generateFullName, generatePhoneNumber, generateRandomElements, generateAddress } from '../utils/helpers';

const ROLES = [
  'Baker',
  'Lead Baker',
  'Cake Decorator',
  'Cashier',
  'Barista',
  'Utility'
];

const LOCATIONS = [
  {
    name: 'Main Bakery',
    address: '123 Main St'
  },
  {
    name: 'Farmer\'s Market Kiosk',
    address: 'Green Park, Stall 15'
  },
  {
    name: 'Downtown Cafe',
    address: '456 Market St'
  }
];

const SHIFT_DEFINITIONS = [
  {
    name: 'Morning Baker - Main',
    startTime: '06:00',
    endTime: '14:00',
    description: 'Primary baking shift for breads and morning pastries at the main bakery.',
    eligibleRoles: ['Baker', 'Lead Baker'],
    locationType: 'Main Bakery'
  },
  {
    name: 'Afternoon Cashier - Main',
    startTime: '12:00',
    endTime: '20:00',
    description: 'Customer service and sales at the counter of the main bakery.',
    eligibleRoles: ['Cashier', 'Barista'],
    locationType: 'Main Bakery'
  },
  {
    name: 'Morning Kiosk Seller',
    startTime: '08:00',
    endTime: '13:00',
    description: 'Selling pastries and coffee at the market kiosk.',
    eligibleRoles: ['Cashier', 'Barista'],
    locationType: 'Farmer\'s Market Kiosk'
  },
  {
    name: 'Cafe Morning Shift',
    startTime: '07:00',
    endTime: '15:00',
    description: 'Morning shift at the downtown cafe.',
    eligibleRoles: ['Cashier', 'Barista'],
    locationType: 'Downtown Cafe'
  },
  {
    name: 'Cafe Evening Shift',
    startTime: '15:00',
    endTime: '23:00',
    description: 'Evening shift at the downtown cafe.',
    eligibleRoles: ['Cashier', 'Barista'],
    locationType: 'Downtown Cafe'
  }
];

export class Phase4Generator {
  private startDate: Date;
  private numRecords: number;
  private employees: Phase3Employee[];
  private locations: Phase4Location[];
  private definedShifts: Phase4DefinedShift[];

  constructor(startDate: Date = new Date(), numRecords: number = 10, numEmployees: number = 12) {
    this.startDate = startDate;
    this.numRecords = numRecords;
    this.employees = this.generateEmployees(numEmployees);
    this.locations = this.generateLocations();
    this.definedShifts = this.generateDefinedShifts();
  }

  private generateEmployees(count: number): Phase3Employee[] {
    const employees: Phase3Employee[] = [];
    for (let i = 0; i < count; i++) {
      const numRoles = Math.floor(Math.random() * 2) + 1; // 1-2 roles per employee
      const roles = generateRandomElements(ROLES, numRoles);

      const employee: Phase3Employee = {
        id: generateId('emp'),
        fullName: generateFullName(),
        contactNumber: generatePhoneNumber(),
        roles
      };

      // Add unavailability for some employees
      if (Math.random() < 0.3) { // 30% chance of having unavailability
        employee.unavailability = this.generateUnavailability();
      }

      employees.push(employee);
    }
    return employees;
  }

  private generateLocations(): Phase4Location[] {
    return LOCATIONS.map(location => ({
      id: generateId('loc'),
      ...location
    }));
  }

  private generateDefinedShifts(): Phase4DefinedShift[] {
    return SHIFT_DEFINITIONS.map(shift => {
      const location = this.locations.find(loc => loc.name === shift.locationType);
      if (!location) {
        throw new Error(`Location not found for shift: ${shift.name}`);
      }
      return {
        id: generateId('shift'),
        locationId: location.id,
        name: shift.name,
        startTime: shift.startTime,
        endTime: shift.endTime,
        description: shift.description,
        eligibleRoles: shift.eligibleRoles
      };
    });
  }

  private generateUnavailability() {
    const types = ['Time Off', 'Recurring Unavailability'];
    const reasons = ['Vacation', 'Doctor\'s Appointment', 'Class', 'Family Event'];
    const statuses = ['Requested', 'Approved', 'Denied'];

    const type = types[Math.floor(Math.random() * types.length)];
    const baseUnavailability = {
      requestId: generateId('to'),
      type: type as 'Time Off' | 'Recurring Unavailability',
      startDate: generateDate(this.startDate, Math.floor(Math.random() * 30)),
      endDate: generateDate(this.startDate, Math.floor(Math.random() * 30) + 1),
      reason: reasons[Math.floor(Math.random() * reasons.length)],
      status: statuses[Math.floor(Math.random() * statuses.length)] as 'Requested' | 'Approved' | 'Denied'
    };

    if (type === 'Recurring Unavailability') {
      return [{
        ...baseUnavailability,
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'][Math.floor(Math.random() * 5)],
        startTime: '09:00',
        endTime: '12:00'
      }];
    }

    return [baseUnavailability];
  }

  private generateAssignment() {
    const employee = this.employees[Math.floor(Math.random() * this.employees.length)];
    const shift = this.definedShifts[Math.floor(Math.random() * this.definedShifts.length)];

    // Ensure employee has at least one eligible role for the shift
    const hasEligibleRole = employee.roles.some((role: string) => shift.eligibleRoles.includes(role));

    if (!hasEligibleRole) {
      // If no eligible role, find a shift that matches their roles
      const eligibleShifts = this.definedShifts.filter(s =>
        s.eligibleRoles.some((role: string) => employee.roles.includes(role))
      );
      if (eligibleShifts.length <= 0) {
        return null;
      }
      return {
        empId: employee.id,
        shiftId: eligibleShifts[Math.floor(Math.random() * eligibleShifts.length)].id
      };
    }

    return {
      empId: employee.id,
      shiftId: shift.id
    };
  }

  private generateSchedule(date: string): Phase2Schedule {
    const numAssignments = Math.floor(Math.random() * 3) + 1; // 1-3 assignments per day
    const assignments: Phase2Assignment[] = [];

    for (let i = 0; i < numAssignments; i++) {
      const assignment = this.generateAssignment();
      if (assignment) {
        assignments.push(assignment);
      }
    }

    return {
      id: generateId('sched'),
      date,
      assignments
    };
  }

  public generate(): Phase4Data {
    const schedules: Phase2Schedule[] = [];

    for (let i = 0; i < this.numRecords; i++) {
      const date = generateDate(this.startDate, i);
      schedules.push(this.generateSchedule(date));
    }

    return {
      emp: this.employees,
      loc: this.locations,
      definedShifts: this.definedShifts,
      sched: schedules
    };
  }
}