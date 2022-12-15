'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Submissions extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
        Submissions.hasMany(models.Items, {foreignKey: 'submissionId', as:'items'})
        Submissions.belongsTo(models.SubmissionCategories, {foreignKey: 'categoryId', as:'submission_category'})
        Submissions.hasMany(models.Transactions, {foreignKey: 'submissionId', as:'transactions'})
        Submissions.hasMany(models.AttachmentSubmissions, {foreignKey: 'submissionId', as:'submission_attachments'})
    }
  };
  Submissions.init({
    submissionName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {msg: 'Please enter your submission name'},
      }
    },
    amount: {
        type: DataTypes.DECIMAL,
        allowNull: false,
        validate: {
            notNull: {msg: 'Please enter your amount'},
        }
    },
    date: {
        type: DataTypes.DATE,
        allowNull: false,
        validate: {
            notNull: {msg: 'Please enter your date'},
        }
    },
    dueDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        validate: {
            notNull: {msg: 'Please enter your due date'},
        }
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            notNull: {msg: 'Please enter your user id'},
        }
    },
    customerName: {
        type: DataTypes.STRING(50),
        allowNull: false,
        validate: {
            notNull: {msg: 'Please enter your customer name'},
        }
    },
    categoryId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            notNull: {msg: 'Please enter your category id'},
        }
    },
    fullfilment: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: null
    },
    status: {
        type: DataTypes.ENUM('DRAFT','PENDING','PARTIAL APPROVED','APPROVED','FAILED','PARTIAL PAID','PAID','CANCELLED','REFUND','COMPLETE'),
        allowNull: false,
        notNull: {msg: 'Please choose a status '},
        isIn: {
          args: [['DRAFT', 'PENDING', 'PARTIAL APPROVED', 'APPROVED', 'FAILED', 'PARTIAL PAID', 'PAID', 'CANCELLED', 'REFUND', 'COMPLETE']],
          msg: "status must be DRAFT or PENDING or PARTIAL APPROVED or FAILED or PARTIAL PAID or PAID or CANCELLED or REFUND or COMPLETE"
        }
    },
    createdAt: {
        allowNull: false,
        type: DataTypes.DATE
    },
    updatedAt: {
        allowNull: false,
        type: DataTypes.DATE
    }
  }, {
    sequelize,
    modelName: 'Submissions',
  });
  return Submissions;
};