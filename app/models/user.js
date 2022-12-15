'use strict';
const bcrypt = require('bcryptjs');
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      User.hasMany(models.AttachmentSubmissions, {foreignKey: 'userId', as:'submission_attachments'})
    }
  };
  User.init({
    fullName: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        notNull: {msg: 'Please enter your full name'},
      }
    },
    email: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: {
        args: true,
        msg: 'Email address already in use!'
      },
      validate: {
        notNull: {msg : 'Please enter your email'},
        isEmail: {msg: 'Email not valid !'},
      }
    },
    username: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: {
        args: true,
        msg: 'Username already in use!'
      },
      validate: {
        notNull: {msg : 'Please enter your username'},
      }
    },
    password: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notNull: {msg: 'Please enter your password'}
      }
    },
    role: {
      type: DataTypes.ENUM('admin', 'karyawan'),
      allowNull: false,
      validate: {
        notNull: {msg: 'Please choose a role '},
        isIn: {
          args: [['admin', 'karyawan']],
          msg: "Role must be admin or karyawan"
        }
      }
    },
    imageUser: DataTypes.STRING,
    token: {
      type: DataTypes.ARRAY(DataTypes.TEXT)
    }
  }, {
    sequelize,
    hooks: {
      beforeCreate: (user, options) => {
        user.password = bcrypt.hashSync(user.password, 10)
      },
    },
    modelName: 'User',
  });
  return User;
};
