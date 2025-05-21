import { v4 as uuidv4 } from 'uuid';
import { addDays, format, parseISO } from 'date-fns';
import faker from 'faker';

export const generateId = (prefix: string): string => {
  return `${prefix}-${uuidv4().slice(0, 6)}`;
};

export const generateDate = (startDate: Date, daysToAdd: number): string => {
  return format(addDays(startDate, daysToAdd), 'yyyy-MM-dd');
};

export const generateTime = (hour: number, minute: number): string => {
  return format(new Date().setHours(hour, minute), 'HH:mm');
};

export const generatePhoneNumber = (): string => {
  return faker.phone.phoneNumber('###-####');
};

export const generateAddress = (): string => {
  return faker.address.streetAddress();
};

export const generateFullName = (): string => {
  return faker.name.findName();
};

export const calculateHoursWorked = (startTime: string, endTime: string): number => {
  const start = parseISO(`2000-01-01T${startTime}`);
  const end = parseISO(`2000-01-01T${endTime}`);
  return (end.getTime() - start.getTime()) / (1000 * 60 * 60);
};

export const calculateCost = (hoursWorked: number, hourlyRate: number): number => {
  return Number((hoursWorked * hourlyRate).toFixed(2));
};

export const generateTimestamp = (date: Date): string => {
  return format(date, "yyyy-MM-dd'T'HH:mm:ss'Z'");
};

export const generateRandomElement = <T>(array: T[]): T => {
  return array[Math.floor(Math.random() * array.length)];
};

export const generateRandomElements = <T>(array: T[], count: number): T[] => {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

export const generateRandomNumber = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

export const generateRandomDecimal = (min: number, max: number, decimals: number = 2): number => {
  const num = Math.random() * (max - min) + min;
  return Number(num.toFixed(decimals));
};

export const generateRandomBoolean = (probability: number = 0.5): boolean => {
  return Math.random() < probability;
};