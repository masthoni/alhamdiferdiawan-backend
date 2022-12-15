'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Company extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  Company.init({
    ownerName: {
      allowNull: false,
      type: DataTypes.STRING,
      validate: {
        notNull: {msg: 'please enter Owner name'}
      }    
    },
    companyName: {
      allowNull: false,
      type: DataTypes.STRING,
      validate: {
        notNull:{msg: 'please enter company name'},
      }
    },
    companyAddress: {
      allowNull: false,
      type: DataTypes.STRING,
      validate: {
        notNull:{msg: 'please enter company address'},
      }
    },
    companyNumber: {
      allowNull: false,
      type: DataTypes.STRING,
      validate: {
        notNull:{msg: 'please enter company number'},
      }
    },
    companyEmail: {
      allowNull: false,
      type: DataTypes.STRING,
      validate: {
        notNull:{msg: 'please enter company email'},
        isEmail: {msg: 'email not valid'}
      }
    },
    companyTelp: {
      allowNull: false,
      type: DataTypes.STRING(15),
      validate: {
        notNull:{msg: 'please enter company telp'},
      }
    },
    companyLogo: {
      allowNull: true,
      type: DataTypes.STRING,
    },
    description: {
      allowNull: true,
      type: DataTypes.TEXT
    }
  }, {
    sequelize,
    modelName: 'Company',
  });
  return Company;
};