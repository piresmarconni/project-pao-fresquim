package api_test.br.com.spring_boot_essentials.service;

import api_test.br.com.spring_boot_essentials.dto.*;
import api_test.br.com.spring_boot_essentials.model.DividaModel;
import api_test.br.com.spring_boot_essentials.model.VendaItemModel;
import api_test.br.com.spring_boot_essentials.model.VendaModel;
import api_test.br.com.spring_boot_essentials.repository.DividaRepository;
import api_test.br.com.spring_boot_essentials.repository.VendaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class RelatorioService {

    @Autowired
    private VendaRepository vendaRepository;

    @Autowired
    private DividaRepository dividaRepository;

    @Transactional(readOnly = true)
    public RelatorioResponseDTO gerarResumo(LocalDate inicio, LocalDate fim, Integer produtoId) {
        List<VendaModel> vendas = vendaRepository.findDistinctByDataVendaBetween(inicio, fim);

        List<VendaModel> vendasFiltradas = vendas.stream()
                .filter(venda -> produtoId == null || vendaContemProduto(venda, produtoId))
                .toList();

        List<VendaItemModel> itensFiltrados = vendasFiltradas.stream()
                .flatMap(venda -> venda.getItens().stream())
                .filter(item -> produtoId == null || item.getProduto().getId().equals(produtoId))
                .toList();

        double totalVendido = vendasFiltradas.stream()
                .mapToDouble(venda -> totalVendaConsiderandoFiltro(venda, produtoId))
                .sum();

        int quantidadeItens = vendasFiltradas.stream()
                .mapToInt(venda -> quantidadeItensConsiderandoFiltro(venda, produtoId))
                .sum();

        long quantidadeVendas = vendasFiltradas.size();

        double ticketMedio = quantidadeVendas > 0 ? totalVendido / quantidadeVendas : 0;

        return new RelatorioResponseDTO(
                inicio,
                fim,
                produtoId,
                totalVendido,
                quantidadeVendas,
                quantidadeItens,
                ticketMedio,
                montarVendasPorDia(vendasFiltradas, produtoId),
                montarProdutosMaisVendidos(vendasFiltradas, itensFiltrados, produtoId),
                montarDividas()
        );
    }

    private boolean vendaContemProduto(VendaModel venda, Integer produtoId) {
        if (venda.getItens() != null && !venda.getItens().isEmpty()) {
            return venda.getItens().stream().anyMatch(item -> item.getProduto().getId().equals(produtoId));
        }

        return venda.getProdutos() != null && venda.getProdutos().stream()
                .anyMatch(produto -> produto.getId().equals(produtoId));
    }

    private double totalVendaConsiderandoFiltro(VendaModel venda, Integer produtoId) {
        if (venda.getItens() != null && !venda.getItens().isEmpty()) {
            return venda.getItens().stream()
                    .filter(item -> produtoId == null || item.getProduto().getId().equals(produtoId))
                    .mapToDouble(item -> item.getSubtotal() != null ? item.getSubtotal() : 0)
                    .sum();
        }

        if (produtoId != null && venda.getProdutos() != null) {
            return venda.getProdutos().stream()
                    .filter(produto -> produto.getId().equals(produtoId))
                    .mapToDouble(produto -> produto.getPreco() != null ? produto.getPreco() : 0)
                    .sum();
        }

        if (produtoId == null) {
            return venda.getValorTotal() != null ? venda.getValorTotal() : 0;
        }

        return 0;
    }

    private int quantidadeItensConsiderandoFiltro(VendaModel venda, Integer produtoId) {
        if (venda.getItens() != null && !venda.getItens().isEmpty()) {
            return venda.getItens().stream()
                    .filter(item -> produtoId == null || item.getProduto().getId().equals(produtoId))
                    .mapToInt(item -> item.getQuantidade() != null ? item.getQuantidade() : 0)
                    .sum();
        }

        if (venda.getProdutos() == null) {
            return 0;
        }

        return (int) venda.getProdutos().stream()
                .filter(produto -> produtoId == null || produto.getId().equals(produtoId))
                .count();
    }

    private List<VendaPorDiaDTO> montarVendasPorDia(List<VendaModel> vendas, Integer produtoId) {
        Map<LocalDate, List<VendaModel>> porDia = vendas.stream()
                .collect(Collectors.groupingBy(VendaModel::getDataVenda, TreeMap::new, Collectors.toList()));

        return porDia.entrySet().stream()
                .map(entry -> new VendaPorDiaDTO(
                        entry.getKey(),
                        entry.getValue().stream().mapToDouble(venda -> totalVendaConsiderandoFiltro(venda, produtoId)).sum(),
                        entry.getValue().stream().mapToInt(venda -> quantidadeItensConsiderandoFiltro(venda, produtoId)).sum()
                ))
                .toList();
    }

    private List<ProdutoVendidoDTO> montarProdutosMaisVendidos(
            List<VendaModel> vendas,
            List<VendaItemModel> itens,
            Integer produtoId
    ) {
        List<ProdutoVendidoDTO> produtosPorItem = itens.stream()
                .collect(Collectors.groupingBy(item -> item.getProduto().getId()))
                .values()
                .stream()
                .map(lista -> {
                    VendaItemModel primeiro = lista.get(0);
                    int quantidade = lista.stream().mapToInt(item -> item.getQuantidade() != null ? item.getQuantidade() : 0).sum();
                    double total = lista.stream().mapToDouble(item -> item.getSubtotal() != null ? item.getSubtotal() : 0).sum();
                    return new ProdutoVendidoDTO(primeiro.getProduto().getId(), primeiro.getNomeProduto(), quantidade, total);
                })
                .sorted(Comparator.comparing(ProdutoVendidoDTO::total).reversed())
                .limit(8)
                .toList();

        if (!produtosPorItem.isEmpty()) {
            return produtosPorItem;
        }

        return vendas.stream()
                .filter(venda -> venda.getProdutos() != null)
                .flatMap(venda -> venda.getProdutos().stream()
                        .filter(produto -> produtoId == null || produto.getId().equals(produtoId))
                        .map(produto -> new ProdutoVendidoDTO(
                                produto.getId(),
                                produto.getNome(),
                                1,
                                produto.getPreco() != null ? produto.getPreco() : 0
                        )))
                .collect(Collectors.groupingBy(ProdutoVendidoDTO::produtoId))
                .values()
                .stream()
                .map(lista -> new ProdutoVendidoDTO(
                        lista.get(0).produtoId(),
                        lista.get(0).nome(),
                        lista.stream().mapToInt(ProdutoVendidoDTO::quantidade).sum(),
                        lista.stream().mapToDouble(ProdutoVendidoDTO::total).sum()
                ))
                .sorted(Comparator.comparing(ProdutoVendidoDTO::total).reversed())
                .limit(8)
                .toList();
    }

    private List<DividaRelatorioDTO> montarDividas() {
        List<DividaModel> dividas = dividaRepository.findAll();

        return dividas.stream()
                .map(divida -> new DividaRelatorioDTO(
                        divida.getId(),
                        divida.getCliente() != null ? divida.getCliente().getNome() : "Cliente nao informado",
                        divida.getCliente() != null ? divida.getCliente().getEmail() : "",
                        divida.getValor(),
                        divida.getData(),
                        Boolean.TRUE.equals(divida.getPaga()),
                        divida.getDataPagamento(),
                        divida.getVenda() != null
                                ? divida.getVenda().getItens().stream().map(VendaItemModel::getNomeProduto).toList()
                                : List.of(),
                        divida.getNotificacoes() != null
                                ? divida.getNotificacoes().stream().map(notificacao -> notificacao.getDataEnvio()).toList()
                                : List.of()
                ))
                .toList();
    }
}
