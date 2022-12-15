'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Companies', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      ownerName: {
        type: Sequelize.STRING,
        allowNull: false
      },
      companyName: {
        type: Sequelize.STRING,
        allowNull: false
      },
      companyAddress:{
        type: Sequelize.STRING,
        allowNull: false
      },
      companyNumber:{
        type: Sequelize.STRING,
        allowNull: false
      },
      companyEmail:{
        type: Sequelize.STRING,
        allowNull: false
      },
      companyTelp:{
        type: Sequelize.STRING(15)
      },
      companyLogo:{
        type: Sequelize.STRING,
        allowNull: true
      },
      description:{
        type: Sequelize.TEXT,
        allowNull: true
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
    await queryInterface.dropTable('Companies');
  }
};