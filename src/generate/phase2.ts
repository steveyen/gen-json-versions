import { Phase2Data, Phase2Employee, Phase2DefinedShift, Phase2Schedule, Phase2Assignment } from '../types';
import { generateId, generateDate, generateFullName, generatePhoneNumber } from '../utils/helpers';

const SHIFT_DEFINITIONS = [
  {
    name: 'Morning Baker',
    startTime: '06:00',
    endTime: '14:00',
    description: 'Primary baking shift for breads and morning pastries.'
  },
  {
    name: 'Afternoon Cashier',
    startTime: '12:00',
    endTime: '20:00',
    description: 'Customer service and sales at the counter.'
  },
  {
    name: 'Evening Prep',
    startTime: '16:00',
    endTime: '22:00',
    description: 'Preparing ingredients and doughs for the next day.'
  },
  {
    name: 'Weekend Morning',
    startTime: '07:00',
    endTime: '15:00',
    description: 'Weekend morning shift covering both baking and sales.'
  },
  {
    name: 'Weekend Evening',
    startTime: '15:00',
    endTime: '23:00',
    description: 'Weekend evening shift covering both sales and prep.'
  }
];

export class Phase2Generator {
  private startDate: Date;
  private numRecords: number;
  private employees: Phase2Employee[];
  private definedShifts: Phase2DefinedShift[];

  constructor(startDate: Date = new Date(), numRecords: number = 10, numEmployees: number = 5) {
    this.startDate = startDate;
    this.numRecords = numRecords;
    this.employees = this.generateEmployees(numEmployees);
    this.definedShifts = this.generateDefinedShifts();
  }

  private generateEmployees(count: number): Phase2Employee[] {
    const employees: Phase2Employee[] = [];
    for (let i = 0; i < count; i++) {
      employees.push({
        id: generateId('emp'),
        fullName: generateFullName(),
        contactNumber: generatePhoneNumber()
      });
    }
    return employees;
  }

  private generateDefinedShifts(): Phase2DefinedShift[] {
    return SHIFT_DEFINITIONS.map(shift => ({
      id: generateId('shift'),
      ...shift
    }));
  }

  private generateAssignment(): Phase2Assignment {
    return {
      empId: this.employees[Math.floor(Math.random() * this.employees.length)].id,
      shiftId: this.definedShifts[Math.floor(Math.random() * this.definedShifts.length)].id
    };
  }

  private generateSchedule(date: string): Phase2Schedule {
    const numAssignments = Math.floor(Math.random() * 3) + 1; // 1-3 assignments per day
    const assignments: Phase2Assignment[] = [];

    for (let i = 0; i < numAssignments; i++) {
      assignments.push(this.generateAssignment());
    }

    return {
      id: generateId('sched'),
      date,
      assignments
    };
  }

  public generate(): Phase2Data {
    const schedules: Phase2Schedule[] = [];

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