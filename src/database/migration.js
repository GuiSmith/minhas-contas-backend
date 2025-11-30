// Banco de dados
import database from './database.js';
import models from './models/index.js';

console.log("Criando tabelas...");

database.sync({ alter: true })
    .then(() => console.log("Sucesso na migração"))
    .catch(error => {
        console.log("Falha na migração");
        console.log(error);
    })
    .finally(() => console.log("Migração finalizada"));
