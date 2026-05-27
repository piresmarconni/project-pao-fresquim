package api_test.br.com.spring_boot_essentials.dto;

import java.time.LocalDate;
import java.util.List;

public record DividaRelatorioDTO(
        Integer id,
        String cliente,
        String email,
        Double valor,
        LocalDate dataCompra,
        boolean paga,
        LocalDate dataPagamento,
        List<String> produtos,
        List<LocalDate> datasNotificacoes
) {}
