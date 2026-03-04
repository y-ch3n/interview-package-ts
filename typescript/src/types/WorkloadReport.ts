import { WorkloadItem } from 'WorkloadItem';
export interface WorkloadReport {
  [teacherName: string]: WorkloadItem[];
}
