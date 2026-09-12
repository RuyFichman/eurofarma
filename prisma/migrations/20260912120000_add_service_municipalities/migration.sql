-- A área de atuação do Lactare passa a ser administrada por município.
-- A tabela `units` permanece intacta como legado para preservar histórico e
-- relações existentes; ela deixa de alimentar as superfícies públicas.

CREATE TYPE "ServiceRegion" AS ENUM (
    'CAPITAL',
    'WEST',
    'SOUTHWEST',
    'ABC',
    'NORTH',
    'EAST_ALTO_TIETE'
);

CREATE TABLE "service_municipalities" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "state" CHAR(2) NOT NULL DEFAULT 'SP',
    "country" TEXT NOT NULL DEFAULT 'Brazil',
    "region" "ServiceRegion" NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "service_municipalities_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "service_municipalities_slug_key"
    ON "service_municipalities"("slug");

CREATE UNIQUE INDEX "service_municipalities_name_state_country_key"
    ON "service_municipalities"("name", "state", "country");

CREATE INDEX "service_municipalities_is_active_name_idx"
    ON "service_municipalities"("is_active", "name");

CREATE INDEX "service_municipalities_region_is_active_idx"
    ON "service_municipalities"("region", "is_active");

INSERT INTO "service_municipalities"
    ("id", "slug", "name", "state", "country", "region", "is_active", "updated_at")
SELECT
    gen_random_uuid()::text,
    seed."slug",
    seed."name",
    seed."state",
    seed."country",
    seed."region"::"ServiceRegion",
    seed."is_active",
    seed."updated_at"
FROM (VALUES
    ('sao-paulo', 'São Paulo', 'SP', 'Brazil', 'CAPITAL', true, CURRENT_TIMESTAMP),
    ('aruja', 'Arujá', 'SP', 'Brazil', 'EAST_ALTO_TIETE', true, CURRENT_TIMESTAMP),
    ('barueri', 'Barueri', 'SP', 'Brazil', 'WEST', true, CURRENT_TIMESTAMP),
    ('caieiras', 'Caieiras', 'SP', 'Brazil', 'NORTH', true, CURRENT_TIMESTAMP),
    ('cajamar', 'Cajamar', 'SP', 'Brazil', 'NORTH', true, CURRENT_TIMESTAMP),
    ('carapicuiba', 'Carapicuíba', 'SP', 'Brazil', 'WEST', true, CURRENT_TIMESTAMP),
    ('cotia', 'Cotia', 'SP', 'Brazil', 'WEST', true, CURRENT_TIMESTAMP),
    ('diadema', 'Diadema', 'SP', 'Brazil', 'ABC', true, CURRENT_TIMESTAMP),
    ('embu-das-artes', 'Embu das Artes', 'SP', 'Brazil', 'SOUTHWEST', true, CURRENT_TIMESTAMP),
    ('embu-guacu', 'Embu-Guaçu', 'SP', 'Brazil', 'SOUTHWEST', true, CURRENT_TIMESTAMP),
    ('ferraz-de-vasconcelos', 'Ferraz de Vasconcelos', 'SP', 'Brazil', 'EAST_ALTO_TIETE', true, CURRENT_TIMESTAMP),
    ('francisco-morato', 'Francisco Morato', 'SP', 'Brazil', 'NORTH', true, CURRENT_TIMESTAMP),
    ('guarulhos', 'Guarulhos', 'SP', 'Brazil', 'EAST_ALTO_TIETE', true, CURRENT_TIMESTAMP),
    ('itapecerica-da-serra', 'Itapecerica da Serra', 'SP', 'Brazil', 'SOUTHWEST', true, CURRENT_TIMESTAMP),
    ('itapevi', 'Itapevi', 'SP', 'Brazil', 'WEST', true, CURRENT_TIMESTAMP),
    ('itaquaquecetuba', 'Itaquaquecetuba', 'SP', 'Brazil', 'EAST_ALTO_TIETE', true, CURRENT_TIMESTAMP),
    ('jandira', 'Jandira', 'SP', 'Brazil', 'WEST', true, CURRENT_TIMESTAMP),
    ('maua', 'Mauá', 'SP', 'Brazil', 'ABC', true, CURRENT_TIMESTAMP),
    ('osasco', 'Osasco', 'SP', 'Brazil', 'WEST', true, CURRENT_TIMESTAMP),
    ('pirapora-do-bom-jesus', 'Pirapora do Bom Jesus', 'SP', 'Brazil', 'WEST', true, CURRENT_TIMESTAMP),
    ('poa', 'Poá', 'SP', 'Brazil', 'EAST_ALTO_TIETE', true, CURRENT_TIMESTAMP),
    ('ribeirao-pires', 'Ribeirão Pires', 'SP', 'Brazil', 'ABC', true, CURRENT_TIMESTAMP),
    ('rio-grande-da-serra', 'Rio Grande da Serra', 'SP', 'Brazil', 'ABC', true, CURRENT_TIMESTAMP),
    ('santana-de-parnaiba', 'Santana de Parnaíba', 'SP', 'Brazil', 'WEST', true, CURRENT_TIMESTAMP),
    ('santo-andre', 'Santo André', 'SP', 'Brazil', 'ABC', true, CURRENT_TIMESTAMP),
    ('sao-bernardo-do-campo', 'São Bernardo do Campo', 'SP', 'Brazil', 'ABC', true, CURRENT_TIMESTAMP),
    ('sao-caetano-do-sul', 'São Caetano do Sul', 'SP', 'Brazil', 'ABC', true, CURRENT_TIMESTAMP),
    ('suzano', 'Suzano', 'SP', 'Brazil', 'EAST_ALTO_TIETE', true, CURRENT_TIMESTAMP),
    ('taboao-da-serra', 'Taboão da Serra', 'SP', 'Brazil', 'SOUTHWEST', true, CURRENT_TIMESTAMP),
    ('vargem-grande-paulista', 'Vargem Grande Paulista', 'SP', 'Brazil', 'WEST', true, CURRENT_TIMESTAMP)
) AS seed("slug", "name", "state", "country", "region", "is_active", "updated_at");
