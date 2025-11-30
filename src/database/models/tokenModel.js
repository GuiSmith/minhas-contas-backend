import { DataTypes } from "sequelize";
import database from '../database.js';

import { v4 as uuidv4 } from "uuid";
import { validate as uuidValidate } from "uuid";

const tokenModel = database.define('token', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    id_user: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    token: {
        type: DataTypes.STRING,
        unique: true,
        validate: {
            notEmpty: true
        }
    },
    data_cadastro: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
});

tokenModel.beforeCreate(async (tokenInstance) => {
    const newToken = uuidv4();
    if (!uuidValidate(newToken)) {
        throw new Error("UUID gerado é inválido");
    }
    tokenInstance.token = newToken;
});

tokenModel.associate = (models) => {
    tokenModel.belongsTo(models.user, {
        foreignKey: {
            name: 'id_user',
            allowNull: false
        }
    });
};

export default tokenModel;