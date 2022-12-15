'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class AttachmentSubmissions extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      AttachmentSubmissions.belongsTo(models.Submissions, {foreignKey: 'submissionId', as:'submission'})
      AttachmentSubmissions.belongsTo(models.User, {foreignKey: 'userId', as:'user'})
    }
  };
  AttachmentSubmissions.init({
    attachmentSubmissoin: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull:{msg: 'please enter submission attachment'},
      }
    },
    submissionId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notNull:{msg: 'please enter submission id'},
      }
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notNull:{msg: 'please enter user id'},
      }
    },
  }, {
    sequelize,
    modelName: 'AttachmentSubmissions',
  });
  return AttachmentSubmissions;
};