import { Phase3Data, Phase3Employee, Phase3DefinedShift } from '../types';
import { generateId, generateDate, generateFullName, generatePhoneNumber, generateRandomElements } from '../utils/helpers';

const ROLES = [
  'Baker',
  'Lead Baker',
  'Cake Decorator',
  'Cashier',
  'Barista',
  'Utility'
];

const SHIFT_DEFINITIONS = [
  {
    name: 'Morning Baker',
    startTime: '06:00',
    endTime: '14:00',
    description: 'Primary baking shift for breads and morning pastries.',
    eligibleRoles: ['Baker', 'Lead Baker']
  },
  {
    name: 'Afternoon Cashier',
    startTime: '12:00',
    endTime: '20:00',
    description: 'Customer service and sales at the counter.',
    eligibleRoles: ['Cashier', 'Barista']
  },
  {
    name: 'Evening Prep',
    startTime: '16:00',
    endTime: '22:00',
    description: 'Preparing ingredients and doughs for the next day.',
    eligibleRoles: ['Baker', 'Utility']
  },
  {
    name: 'Cake Decorating',
    startTime: '08:00',
    endTime: '16:00',
    description: 'Specialized shift for cake decoration and custom orders.',
    eligibleRoles: ['Cake Decorator', 'Lead Baker']
  },
  {
    name: 'Weekend Morning',
    startTime: '07:00',
    endTime: '15:00',
    description: 'Weekend morning shift covering both baking and sales.',
    eligibleRoles: ['Baker', 'Cashier', 'Barista']
  }
];

export class Phase3Generator {
  private startDate: Date;
  private numRecords: number;
  private employees: Phase3Employee[];
  private definedShifts: Phase3DefinedShift[];

  constructor(startDate: Date = new Date(), numRecords: number = 10, numEmployees: number = 8) {
    this.startDate = startDate;
    this.numRecords = numRecords;
    this.employees = this.generateEmployees(numEmployees);
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

  private generateDefinedShifts(): Phase3DefinedShift[] {
    return SHIFT_DEFINITIONS.map(shift => ({
      id: generateId('shift'),
      ...shift
    }));
  }

  private generateAssignment() {
    const employee = this.employees[Math.floor(Math.random() * this.employees.length)];
    const shift = this.definedShifts[Math.floor(Math.random() * this.definedShifts.length)];

    // Ensure employee has at least one eligible role for the shift
    const hasEligibleRole = employee.roles.some(role => shift.eligibleRoles.includes(role));

    if (!hasEligibleRole) {
      // If no eligible role, find a shift that matches their roles
      const eligibleShifts = this.definedShifts.filter(s =>
        s.eligibleRoles.some(role => employee.roles.includes(role))
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

  private generateSchedule(date: string) {
    const numAssignments = Math.floor(Math.random() * 3) + 1; // 1-3 assignments per day
    const assignments = [];

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

  public generate(): Phase3Data {
    const schedules = [];

    for (let i = 0; i < this.numRecords; i++) {
      const date = generateDate(this.startDate, i);
      schedules.push(this.generateSchedule(date));
    }

    return {
      emp: this.employees,
      definedShifts: this.definedShifts,
      sched: schedules
    };
  }
}