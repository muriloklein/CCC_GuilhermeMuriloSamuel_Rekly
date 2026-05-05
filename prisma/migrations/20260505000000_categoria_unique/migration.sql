-- Adiciona constraint unique em (nome, usuario_id) para categorias
-- Necessário para upsert seguro das categorias padrão
CREATE UNIQUE INDEX IF NOT EXISTS "categorias_nome_usuario_id_key"
  ON "categorias"("nome", "usuario_id");
