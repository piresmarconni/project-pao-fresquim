package api_test.br.com.spring_boot_essentials.dto;

import java.time.LocalDate;

public record VendaPorDiaDTO(
        LocalDate data,
        Double total,
        Integer quantidadeItens
) {}
