'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Submissions', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      submissionName: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      amount: {
        type: Sequelize.DECIMAL,
        allowNull: false,
        default: 0
      },
      date: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      dueDate: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        default: 0
      },
      customerName: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      categoryId: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      fullfilment: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
        default: null
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
        default: null
      },
      status: {
        type: Sequelize.ENUM('DRAFT','PENDING','PARTIAL APPROVED','APPROVED','FAILED','PARTIAL PAID','PAID','CANCELLED','REFUND','COMPLETE')
        ,
        allowNull: false,
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
    await queryInterface.dropTable('Submissions');
  }
};