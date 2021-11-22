"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Tasks extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Tasks.init(
    {
      userName: DataTypes.STRING,
      taskName: DataTypes.STRING,
      category: DataTypes.STRING,
      description: DataTypes.STRING,
      assignedContractor: DataTypes.STRING,
      scheduled: DataTypes.BOOLEAN,
      date: DataTypes.DATE,
      maxBudet: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "Tasks",
    }
  );
  return Tasks;
};
