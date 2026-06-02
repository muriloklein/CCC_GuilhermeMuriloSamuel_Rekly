-- Adiciona campo data_ref em notificacoes para controle de não-duplicação
ALTER TABLE "notificacoes" ADD COLUMN IF NOT EXISTS "data_ref" TEXT;

-- Adiciona campo dias_antecedencia em preferencias_notificacao
ALTER TABLE "preferencias_notificacao" ADD COLUMN IF NOT EXISTS "dias_antecedencia" INTEGER NOT NULL DEFAULT 7;
