'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Transactions extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Transactions.belongsTo(models.Submissions, {foreignKey: 'submissionId', as:'submission'})
      Transactions.belongsTo(models.Wallets, {foreignKey: 'walletId', as:'wallet'})
    }
  };
  Transactions.init({
    submissionId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notNull: {msg: 'Please enter your submission id'},
      }
    },
    walletId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notNull: {msg: 'Please enter your wallet id'},
      }
    },
    amount: {
      type: DataTypes.FLOAT,
      allowNull: false,
      validate: {
        min: 1,
        notNull: {msg: 'Please enter your amount'},
      }
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false,
      validate: {
        notNull: {msg: 'Please enter your date'},
      }
    },
    attachmentTransaction: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'Transactions',
  });
  return Transactions;
};