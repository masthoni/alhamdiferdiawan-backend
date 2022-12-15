'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Products extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Products.belongsTo(models.ProductCategories, {foreignKey: 'productCategoryId', as:'product_category'})
      Products.hasMany(models.Items, {foreignKey: 'productId', as:'item'})
    }
  };
  Products.init({
    productCategoryId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notNull: {msg: 'please enter product category id'}
      }
    },
    productName: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: {
        args: true,
        msg: 'the product has been made'
      },
      validate: {
        notNull: {msg: 'please enter product name'}
      }
    },
    stock: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min:1,
        notNull: {msg: 'please enter stock'}
      }
    },
    sellingPrice: {
      type: DataTypes.FLOAT,
      allowNull: false,
      validate: {
        min:1,
        notNull: {msg: 'please enter selling price'}
      }
    },
    buyingPrice: {
      type: DataTypes.FLOAT,
      allowNull: false,
      validate: {
        min:1,
        notNull: {msg: 'please enter buying price'}
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type:  DataTypes.ENUM('PENDING', 'PARTIAL APPROVED','APPROVED')
      ,
      allowNull: false,
      validate:{
        isIn: {
          args: [['PENDING', 'PARTIAL APPROVED','APPROVED']],
          msg: "product type must be PENDING OR PARTIAL APPROVED OR APPROVED"
        }
      }
    },
    photoProduct: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  }, {
    sequelize,
    modelName: 'Products',
  });
  return Products;
};