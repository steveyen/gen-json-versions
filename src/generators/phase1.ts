import { Phase1Data, Phase1Schedule, Phase1Assignment } from '../types';
import { generateId, generateDate, generateFullName } from '../utils/helpers';

const SHIFTS = [
  'Morning Bake (6 AM - 2 PM)',
  'Afternoon Cashier (12 PM - 8 PM)',
  'Evening Prep (4 PM - 10 PM)',
  'Weekend Morning (7 AM - 3 PM)',
  'Weekend Evening (3 PM - 11 PM)'
];

export class Phase1Generator {
  private startDate: Date;
  private numRecords: number;

  constructor(startDate: Date = new Date(), numRecords: number = 10) {
    this.startDate = startDate;
    this.numRecords = numRecords;
  }

  private generateAssignment(): Phase1Assignment {
    return {
      employeeName: generateFullName(),
      shift: SHIFTS[Math.floor(Math.random() * SHIFTS.length)]
    };
  }

  private generateSchedule(date: string): Phase1Schedule {
    const numAssignments = Math.floor(Math.random() * 3) + 1; // 1-3 assignments per day
    const assignments: Phase1Assignment[] = [];

    for (let i = 0; i < numAssignments; i++) {
      assignments.push(this.generateAssignment());
    }

    return {
      id: generateId('sched'),
      date,
      assignments
    };
  }

  public generate(): Phase1Data {
    const schedules: Phase1Schedule[] = [];

    for (let i = 0; i < this.numRecords; i++) {
      const date = generateDate(this.startDate, i);
      schedules.push(this.generateSchedule(date));
    }

    return { sched: schedules };
  }
}