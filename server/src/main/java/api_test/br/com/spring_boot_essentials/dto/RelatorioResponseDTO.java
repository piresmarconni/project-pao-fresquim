package api_test.br.com.spring_boot_essentials.dto;

import java.time.LocalDate;
import java.util.List;

public record RelatorioResponseDTO(
        LocalDate inicio,
        LocalDate fim,
        Integer produtoId,
        Double totalVendido,
        Long quantidadeVendas,
        Integer quantidadeItens,
        Double ticketMedio,
        List<VendaPorDiaDTO> vendasPorDia,
        List<ProdutoVendidoDTO> produtosMaisVendidos,
        List<DividaRelatorioDTO> dividas
) {}
