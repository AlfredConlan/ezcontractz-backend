const { Model } = require("sequelize");
import sequelize from "./db";
import { STRING } from "sequelize";
import { userPhoto } from "./attachments";

module.exports = (sequelize, DataTypes) => {
  class Users extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Users.init(
    {
      firstName: DataTypes.STRING,
      lastName: DataTypes.STRING,
      email: DataTypes.STRING,
      location: DataTypes.STRING,
      userName: DataTypes.STRING,
      role: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Users",
    }
  );
  userPhoto.addTo(Users);

  return Users;
};
