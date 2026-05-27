package api_test.br.com.spring_boot_essentials.config;

import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class PontoSchemaMigration implements ApplicationRunner {

    private final JdbcTemplate jdbcTemplate;

    public PontoSchemaMigration(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public void run(ApplicationArguments args) {
        jdbcTemplate.execute("ALTER TABLE pontos ALTER COLUMN hora_saida DROP NOT NULL");
        jdbcTemplate.execute("ALTER TABLE licencas ALTER COLUMN arquivo_atestado TYPE TEXT");
        jdbcTemplate.execute("ALTER TABLE dividas ADD COLUMN IF NOT EXISTS paga boolean DEFAULT false");
        jdbcTemplate.execute("UPDATE dividas SET paga = false WHERE paga IS NULL");
        jdbcTemplate.execute("ALTER TABLE dividas ALTER COLUMN paga SET DEFAULT false");
        jdbcTemplate.execute("ALTER TABLE dividas ADD COLUMN IF NOT EXISTS data_pagamento date");
    }
}
