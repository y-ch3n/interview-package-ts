export interface Teacher {
  id: number;
  email: string;
  name: string;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
}
