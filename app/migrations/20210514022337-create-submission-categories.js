'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('SubmissionCategories', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      submissionCategory: {
        allowNull: false,
        type: Sequelize.STRING
      },
      submissionType: {
        allowNull: false,
        type: Sequelize.ENUM('PEMASUKAN', 'PENGELUARAN'),
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
    await queryInterface.dropTable('SubmissionCategories');
  }
};