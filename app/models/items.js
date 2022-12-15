'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Items extends Model {
    static associate(models) {
      Items.belongsTo(models.Submissions, {foreignKey: 'submissionId', as:'submissions'})
      Items.belongsTo(models.Products, {foreignKey: 'productId', as:'products'})
    }
  };
  Items.init({
    itemName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {msg: 'Please enter your item name'},
      }
    },
    qty: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notNull: {msg: 'Please enter your quantity'},
      }
    },
    submissionId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notNull: {msg: 'Please enter your submission Id'},
      }
    },
    productId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notNull: {msg: 'Please enter your product Id'},
      }
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notNull: {msg: 'Please enter your user Id'},
      }
    },
    sellingPrice: {
      type: DataTypes.FLOAT,
      allowNull: false,
      validate: {
        notNull: {msg: 'Please enter your selling price'},
      }
    },
    buyingPrice: {
      type: DataTypes.FLOAT,
      allowNull: false,
      validate: {
        notNull: {msg: 'Please enter your buying price'},
      }
    },
    discount: {
      type: DataTypes.FLOAT,
      allowNull: false,
      validate: {
        notNull: {msg: 'Please enter your discount'},
      }
    },
    tax: {
      type: DataTypes.FLOAT,
      allowNull: false,
      validate: {
        notNull: {msg: 'Please enter your tax'},
      }
    },

  }, {
    sequelize,
    hooks: {
      beforeCreate: (item, options) => {
      },
    },
    modelName: 'Items',
  });
  return Items;
};