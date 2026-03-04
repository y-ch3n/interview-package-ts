import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import { Teacher as TeacherAttributes } from 'Teacher';

type TeacherCreationAttributes = Optional<TeacherAttributes, 'id'>;

class Teacher extends Model<TeacherAttributes, TeacherCreationAttributes> implements TeacherAttributes {
  public id!: number;
  public email!: string;
  public name!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public readonly deletedAt!: Date | null;
}

Teacher.init(
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
    tableName: 'teachers',
    timestamps: true,
    paranoid: true,
  }
);

export default Teacher;
