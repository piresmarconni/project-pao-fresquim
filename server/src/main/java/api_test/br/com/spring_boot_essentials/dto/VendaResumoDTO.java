package api_test.br.com.spring_boot_essentials.dto;

import java.time.LocalDate;

public record VendaResumoDTO(
        Integer id,
        LocalDate dataVenda,
        Double valorTotal,
        Integer quantidadeProdutos,
        String tipoPagamento
) {}
