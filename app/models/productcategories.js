'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ProductCategories extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      ProductCategories.hasMany(models.Products, {foreignKey: 'productCategoryId', as:'products'})
    }
  };
  ProductCategories.init({
    productCategory: {
      allowNull: false,
      type: DataTypes.STRING,
      validate: {
        notNull: {msg: 'please enter product category'}
      }
    }
  }, {
    sequelize,
    modelName: 'ProductCategories',
  });
  return ProductCategories;
};