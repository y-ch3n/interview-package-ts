export interface Subject {
  id: number;
  subjectCode: string;
  name: string;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
}
