import { DataTypes } from 'sequelize';
import database from '../database.js';

const CategoryModel = database.define('categoria', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    descricao: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    id_user: {
        type: DataTypes.INTEGER,
        allowNull: true,
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
    },
    id_categoria: {
        type: DataTypes.INTEGER,
        allowNull: true,
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
    }
});

CategoryModel.associate = (models) => {
    CategoryModel.belongsTo(models.categoria, {
        foreignKey: {
            name: 'id_categoria',
            allowNull: false,
        }
    });

    CategoryModel.belongsTo(models.user, {
        foreignKey: {
            name: 'id_user',
            allowNull: false,
        }
    });
};

export default CategoryModel;