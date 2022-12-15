'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Items', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      itemName: {
        type: Sequelize.STRING
      },
      qty: {
        type: Sequelize.INTEGER
      },
      submissionId: {
        type: Sequelize.INTEGER,
      },
      productId: {
        type: Sequelize.INTEGER
      },
      userId: {
        type: Sequelize.INTEGER,
      },
      sellingPrice: {
        type: Sequelize.FLOAT
      },
      buyingPrice: {
        type: Sequelize.FLOAT
      },
      discount: {
        type: Sequelize.FLOAT
      },
      tax: {
        type: Sequelize.FLOAT
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
    await queryInterface.dropTable('Items');
  }
};