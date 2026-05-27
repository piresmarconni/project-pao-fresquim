package api_test.br.com.spring_boot_essentials.dto;

public record ProdutoVendidoDTO(
        Integer produtoId,
        String nome,
        Integer quantidade,
        Double total
) {}
