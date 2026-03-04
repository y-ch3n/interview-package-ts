import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import { Student as StudentAttributes } from 'Student';

type StudentCreationAttributes = Optional<StudentAttributes, 'id'>;

class Student extends Model<StudentAttributes, StudentCreationAttributes> implements StudentAttributes {
  public id!: number;
  public email!: string;
  public name!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public readonly deletedAt!: Date | null;
}

Student.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'students',
    timestamps: true,
    paranoid: true,
  }
);

export default Student;
