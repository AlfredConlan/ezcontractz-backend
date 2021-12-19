import SequelizeFile from "sequelize-file";

export const userPhoto = SequelizeFile({
  attribute: "picture",
  mimetype: /^image/,
  crop: true,
  sizes: {
    small: 64, //width 64
    big: 150, //width 150
  },
});
