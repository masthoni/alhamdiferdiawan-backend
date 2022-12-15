'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class SubmissionCategories extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      SubmissionCategories.hasMany(models.Submissions, {foreignKey: 'categoryId', as:'submissions'})
    }
  };
  SubmissionCategories.init({
    submissionCategory: {
      allowNull: false,
      type: DataTypes.STRING,
      validate: {
        notNull: {msg: 'please enter submission category'}
      }
    },
    submissionType: {
      allowNull: false,
      type: DataTypes.ENUM('PEMASUKAN', 'PENGELUARAN'),
      validate: {
        notNull: {msg: 'please enter submission type'},
        isIn: {
          args: [['PEMASUKAN', 'PENGELUARAN']],
          msg: "submission type must be PEMASUKAN OR PENGELUARAN"
        }
      }
    },
    maximumSubmission:{
      defaultValue: 0,
      type: DataTypes.INTEGER,
      validate: {
        min: 0,
      }
    }
  }, {
    sequelize,
    modelName: 'SubmissionCategories',
  });
  return SubmissionCategories;
};