// Models
import CategoryModel from "../database/models/categoryModel.js";
import UserModel from "../database/models/userModel.js";

// Funções utilitárias
const recursiveCheckCategory = async (intended_id_categoria, id_categoria) => {
    // If category doesn't depend on anyone, return OK
    if (!id_categoria) {
        return true;
    }

    // If a category wasn't found with that ID, return OK
    const category = await CategoryModel.findByPk(id_categoria);
    if (!category) {
        return true;
    }

    // If the category found is the exact indented, recursiveness found
    if (category.id == intended_id_categoria) {
        return false;
    }

    // Else, try again
    return recursiveCheckCategory(intended_id_categoria, category.id_categoria);
};

const list = async (req, res) => {
    try {
        const categories = await CategoryModel.findAll({
            where: { id_user: req.user.id },
            raw: true,
        });

        return res.status(200).json(categories);
    } catch (error) {
        console.log('Erro ao listar categorias');
        console.log(error);
        return res.status(500).json({ message: 'Erro ao listar categorias. Contate o suporte!' });
    }
};

const create = async (req, res) => {
    try {

        const { descricao, id_user, id_categoria } = req.body ?? {};

        // Descrição
        if (descricao.length == 0 || descricao == '') {
            return res.status(400).json({ message: 'Descrição vazia ou inválida' });
        }

        // Usuário
        const user = UserModel.findByPk(id_user);
        if (!user) {
            return res.status(400).json({ message: `Usuário de ID ${id_user} não encontrado` });
        }

        // Categoria
        const category = await CategoryModel.findByPk(id_categoria);
        if (category) {
            const recursiveOk = await recursiveCheckCategory(category.id, category.id_categoria);
            if (!recursiveOk) {
                return res.status(400).json({ message: "Recursividade de categoria detectada, escolha outra!" });
            }
        }

        const createdCategory = await CategoryModel.create({descricao, id_user, id_categoria });
        return res.status(201).json(createdCategory);
    } catch (error) {
        console.log('Erro ao listar categorias');
        console.log(error);
        return res.status(500).json({ message: 'Erro ao criar categoria. Contate o suporte!' });
    }
};

export default { list, create };