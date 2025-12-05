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

const recursiveDescription = async (id_categoria) => {
    const category = await CategoryModel.findByPk(id_categoria);
    if (category) {
        if (category.id_categoria) {
            return await recursiveDescription(category.id_categoria) + " > " + category.descricao;
        } else {
            return category.descricao;
        }
    }

    return "";
};

const select = async (req, res) => {
    try {
        const { id } = req.params.id ?? 0;

        if(id === 0){
            return res.status(400).json({ message: `ID de categoria inválido!` })
        }

        const category = await CategoryModel.findByPk(id,{
            raw: true,
        });

        if(!category){
            return res.status(400).json({ message: "Categoria não encontrada!" });
        }

        category.descricao = recursiveDescription(category.id);

        return res.status(200).json(category);
    } catch (error) {
        console.log('Erro ao selecionar categoria!');
        console.log(error);
        return res.status(500).json({ message: "Erro desconhecido, por favor contate o suporte!" });
    }
};

const list = async (req, res) => {
    try {
        const categories = await CategoryModel.findAll({
            where: { id_user: req.user.id },
            raw: true
        });

        for (const category of categories) {
            category.descricao = await recursiveDescription(category.id);
        }

        return res.status(200).json(categories);
    } catch (error) {
        console.log('Erro ao listar categorias');
        console.log(error);
        return res.status(500).json({ message: 'Erro ao listar categorias. Contate o suporte!' });
    }
};

const create = async (req, res) => {
    try {

        const requiredColumns = ['descricao'];
        const permittedColumns = ['descricao', 'id_categoria'];

        const data = req.body ?? {};

        // Checking required data
        for (const requiredColumn of requiredColumns) {
            if (!data[requiredColumn]) {
                return res.status(400).json({ message: "Informe pelo menos a descrição" });
            }
        }

        // Checking excessive data
        for (const column in data) {
            if (!permittedColumns.includes(column)) {
                return res.status(400).json({ message: "Chaves desnecessárias informadas, informe apenas descrição ou ID de categoria" });
            }
        }

        // Descrição
        if (typeof data.descricao !== 'string' || data.descricao.trim().length == 0 || data.descricao == '') {
            return res.status(400).json({ message: 'Descrição deve ser texto e não vazia' });
        }

        // Define o usuário da descrição como o da requisição
        data.id_user = req.user.id;

        // Categoria
        const category = await CategoryModel.findByPk(data.id_categoria);
        if (category) {
            const recursiveOk = await recursiveCheckCategory(category.id, category.id_categoria);
            if (!recursiveOk) {
                return res.status(400).json({ message: "Recursividade de categoria detectada, escolha outra!" });
            }
        }

        const createdCategory = await CategoryModel.create(data);
        return res.status(201).json(createdCategory);
    } catch (error) {
        console.log('Erro ao listar categorias');
        console.log(error);
        return res.status(500).json({ message: 'Erro ao criar categoria. Contate o suporte!' });
    }
};

const update = async (req, res) => {
    try {
        const permittedColumns = ['descricao', 'id_categoria'];

        // ID Params
        const id = req.params.id ?? null;
        if (!id) {
            return res.status(400).json({ message: "Informe o ID de categoria nos params para continuar! " });
        }

        // Sanitizing data
        const data = req.body ?? {};

        if (Object.keys(data).length == 0) {
            return res.status(200).json({ message: "Nada para atualizar!" });
        }

        for (const column in data) {
            if (!permittedColumns.includes(column)) {
                return res.status(400).json({ message: "Chaves desnecessárias informadas, informe apenas descrição ou ID de categoria" });
            }
        }

        // Description
        if (data.hasOwnProperty('descricao')) {
            if (typeof data.descricao !== 'string' || data.descricao.trim().length == 0 || data.descricao == '') {
                return res.status(400).json({ message: 'Descrição deve ser texto e não vazia' });
            }
        }

        // Category
        if (data.hasOwnProperty('id_categoria')) {
            // Checking recursive status
            const relatedCategory = await CategoryModel.findByPk(data.id_categoria);
            if (relatedCategory) {
                const recursiveOk = await recursiveCheckCategory(relatedCategory.id, relatedCategory.id_categoria);
                if (!recursiveOk) {
                    return res.status(400).json({ message: "Recursividade de categoria detectada, escolha outra!" });
                }
            } else {
                return res.status(400).json({ message: "Categoria pai não encontrada!" });
            }
        }

        // Existing category
        const category = await CategoryModel.findByPk(id);
        if (!category) {
            return res.status(400).json({ message: "Categoria não encontrada" });
        }

        await category.update(data);

        return res.status(200).json({ message: "Atualizado com sucesso!" });

    } catch (error) {
        console.log('Erro ao atualizar categoria');
        console.log(error);
        return res.status(500).json({ message: "Erro desconhecido. Contate o suporte!" });
    }
};

export default { select, list, create, update };