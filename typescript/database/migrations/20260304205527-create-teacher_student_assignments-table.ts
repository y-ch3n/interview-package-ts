import { QueryInterface, DataTypes, Sequelize } from 'sequelize';

export default {
  async up(queryInterface: QueryInterface): Promise<void> {
    await queryInterface.createTable('teacher_student_assignments', {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      teacherId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'teachers',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      studentId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'students',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      classId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'classes',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      subjectId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'subjects',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
      },
      deletedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: null,
      },
    });

    // Unique constraint to prevent duplicate assignments
    await queryInterface.addIndex('teacher_student_assignments',
      ['teacherId', 'studentId', 'classId', 'subjectId'],
      { unique: true, name: 'unique_assignment' }
    );
  },

  async down(queryInterface: QueryInterface): Promise<void> {
    await queryInterface.dropTable('teacher_student_assignments');
  },
};
