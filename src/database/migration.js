// Banco de dados
import database from './database.js';
import models from './models/index.js';
import createTriggers from './triggers.js';

console.log("TABELAS: iniciando...");

database.sync({ alter: true })
    .then(async () => {
        console.log('TABELAS: OK');

        console.log('TRIGGERS: iniciando...');
        await createTriggers();
        console.log('TRIGGERS: OK');
    })
    .catch(error => {
        console.log("Falha na migração");
        console.log(error);
    })
    .finally(() => console.log("Migração finalizada"));
