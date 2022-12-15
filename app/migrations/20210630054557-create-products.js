'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Products', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      productCategoryId: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      productName: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      stock: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      sellingPrice: {
        type: Sequelize.FLOAT
      },
      buyingPrice: {
        type: Sequelize.FLOAT
      },
      description: {
        type: Sequelize.TEXT,
      },
      status: {
        type:  Sequelize.ENUM('PENDING', 'PARTIAL APPROVED','APPROVED')
        ,
        allowNull: false,
      },
      photoProduct: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Products');
  }
};