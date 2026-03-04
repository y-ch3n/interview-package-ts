import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import { Class as ClassAttributes } from 'Class';

type ClassCreationAttributes = Optional<ClassAttributes, 'id'>;

class Class extends Model<ClassAttributes, ClassCreationAttributes> implements ClassAttributes {
  public id!: number;
  public classCode!: string;
  public name!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public readonly deletedAt!: Date | null;
}

Class.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    classCode: {
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
    tableName: 'classes',
    timestamps: true,
    paranoid: true,
  }
);

export default Class;
