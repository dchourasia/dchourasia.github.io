import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import { DateRange } from '../types';

export const formatDate = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, 'yyyy-MM-dd');
};

export const formatDateTime = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, 'yyyy-MM-dd HH:mm:ss');
};

export const getDefaultDateRange = (days: number = 30): DateRange => {
  const end = endOfDay(new Date());
  const start = startOfDay(subDays(end, days));
  
  return { start, end };
};

export const isDateInRange = (date: Date | string, range: DateRange): boolean => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj >= range.start && dateObj <= range.end;
};