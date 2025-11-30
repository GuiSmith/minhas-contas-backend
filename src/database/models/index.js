import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import database from '../database.js';

// Conserta __dirname em ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Carrega todos os models
const models = {};

const files = fs.readdirSync(__dirname).filter(
    file => file.endsWith('Model.js')
);

for (const file of files) {
    const model = (await import(path.join(__dirname, file))).default;
    models[model.name] = model;
}

// Aplica associações
Object.values(models).forEach(model => {
    if (typeof model.associate === 'function') {
        model.associate(models);
    }
});

export default models;
