import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import { Subject as SubjectAttributes } from 'Subject';

type SubjectCreationAttributes = Optional<SubjectAttributes, 'id'>;

class Subject extends Model<SubjectAttributes, SubjectCreationAttributes> implements SubjectAttributes {
  public id!: number;
  public subjectCode!: string;
  public name!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public readonly deletedAt!: Date | null;
}

Subject.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    subjectCode: {
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
    tableName: 'subjects',
    timestamps: true,
    paranoid: true,
  }
);

export default Subject;
