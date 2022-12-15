'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Wallets extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Wallets.hasMany(models.Transactions, {foreignKey: 'walletId', as:'transactions'})
    }
  };
  Wallets.init({
    walletName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {msg: 'please enter wallet name'}
      }
    }
  }, {
    sequelize,
    modelName: 'Wallets',
  });
  return Wallets;
};