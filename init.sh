#!/bin/bash

MODE="$1"

if [ "$MODE" != "dev" ] && [ "$MODE" != "prod" ]; then
    echo "Uso: $0 [dev|prod]"
    exit 1
fi

# Arquivos de ambiente
BASE_ENV=".env"
SPECIFIC_ENV=".env.$MODE"

# Valida existência
if [[ -z "$MYSQL_USER" || -z "$DB_HOST" ]]; then
    echo "Variáveis de ambiente não encontradas."
    exit 1
fi

# Carrega variáveis
export $(grep -v '^#' "$BASE_ENV" | xargs)
export $(grep -v '^#' "$SPECIFIC_ENV" | xargs)

echo "Ambiente: $MODE"
echo "Banco: $MYSQL_DATABASE"
echo "User: $MYSQL_USER"
echo ""

mariadb --version >/dev/null 2>&1
if [ $? -ne 0 ]; then
    apt update
    apt install mariadb-client -y
    if [ $? -ne 0 ]; then
        echo "Erro ao instalar client do mariadb"
        exit 1
    fi
fi

# Testa se existe alguma tabela no banco
TABLE_COUNT=$(mariadb -h "$DB_HOST" -u "$MYSQL_USER" -p"$MYSQL_PASSWORD" -N -e "
    SELECT COUNT(*) 
    FROM information_schema.tables 
    WHERE table_schema = '$MYSQL_DATABASE';
")

if [ "$TABLE_COUNT" -gt 0 ]; then
    echo "Tabelas já existem. Migração não necessária."
else
    echo "Nenhuma tabela encontrada. Executando migração..."
    node src/database/migration.js
fi

node server.js
