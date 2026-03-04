export interface Student {
  id: number;
  email: string;
  name: string;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
}
