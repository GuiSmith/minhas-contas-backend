import database from './database.js';

const createTriggers = async () => {
    // Trigger BEFORE INSERT
    await database.query(`
        CREATE TRIGGER categoria_bi
        BEFORE INSERT ON categoria
        FOR EACH ROW
        BEGIN
        IF NEW.id_categoria = NEW.id THEN
            SET NEW.id_categoria = NULL;
            SIGNAL SQLSTATE '01000'
            SET MESSAGE_TEXT = 'id_categoria não pode ser igual ao id. Valor foi ajustado para NULL.';
        END IF;
        END;
    `);

    // Trigger BEFORE UPDATE
    await database.query(`
        CREATE OR REPLACE TRIGGER categoria_bu
        BEFORE UPDATE ON categoria
        FOR EACH ROW
        BEGIN
        IF NEW.id_categoria = NEW.id THEN
            SET NEW.id_categoria = NULL;
            SIGNAL SQLSTATE '01000'
            SET MESSAGE_TEXT = 'id_categoria não pode ser igual ao id. Valor foi ajustado para NULL.';
        END IF;
        END;
    `);
};

export default createTriggers;