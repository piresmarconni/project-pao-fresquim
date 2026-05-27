package api_test.br.com.spring_boot_essentials.service;

import api_test.br.com.spring_boot_essentials.exception.RegraNegocioException;
import api_test.br.com.spring_boot_essentials.dto.VendaResumoDTO;
import api_test.br.com.spring_boot_essentials.model.DividaModel;
import api_test.br.com.spring_boot_essentials.model.NotificacaoModel;
import api_test.br.com.spring_boot_essentials.model.ProdutoModel;
import api_test.br.com.spring_boot_essentials.model.VendaItemModel;
import api_test.br.com.spring_boot_essentials.model.VendaModel;
import api_test.br.com.spring_boot_essentials.repository.ClienteRepository;
import api_test.br.com.spring_boot_essentials.repository.DividaRepository;
import api_test.br.com.spring_boot_essentials.repository.ProdutoRepository;
import api_test.br.com.spring_boot_essentials.repository.VendaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
public class VendaService {

    @Autowired
    private VendaRepository vendaRepository;

    @Autowired
    private ProdutoRepository produtoRepository;

    @Autowired
    private ClienteRepository clienteRepository;

    @Autowired
    private DividaRepository dividaRepository;

    @Transactional(readOnly = true)
    public List<VendaResumoDTO> listarTodas() {
        return vendaRepository.findAll().stream()
                .map(venda -> new VendaResumoDTO(
                        venda.getId(),
                        venda.getDataVenda(),
                        venda.getValorTotal(),
                        venda.getItens() != null && !venda.getItens().isEmpty()
                                ? venda.getItens().stream()
                                        .mapToInt(item -> item.getQuantidade() != null ? item.getQuantidade() : 0)
                                        .sum()
                                : venda.getProdutos() != null ? venda.getProdutos().size() : 0,
                        venda.getPagamento() != null ? venda.getPagamento().getTipo() : null
                ))
                .toList();
    }

    @Transactional
    public VendaModel calcularTotal(VendaModel vendaModel) {

        List<ProdutoModel> produtos = vendaModel.getProdutos();

        if(produtos == null || produtos.isEmpty()) {
            throw new RegraNegocioException("A venda deve conter pelo menos um produto.");
        }

        double valorTotal = 0;
        List<VendaItemModel> itensDaVenda = new ArrayList<>();
        List<ProdutoModel> produtosDaVenda = new ArrayList<>();

        if (vendaModel.getCliente() != null && vendaModel.getCliente().getId() != null) {
            vendaModel.setCliente(clienteRepository.findById(vendaModel.getCliente().getId())
                    .orElseThrow(() -> new RegraNegocioException("Cliente nao encontrado: " + vendaModel.getCliente().getId())));
        }

        boolean vendaFiada = vendaModel.getPagamento() != null
                && "Fiado".equalsIgnoreCase(vendaModel.getPagamento().getTipo());

        if (vendaFiada && vendaModel.getCliente() == null) {
            throw new RegraNegocioException("Venda fiada precisa de um cliente cadastrado.");
        }

        if (vendaFiada && vendaModel.getCliente().isBloqueado()) {
            throw new RegraNegocioException("Cliente negativado nao pode comprar fiado.");
        }

        for (ProdutoModel produto : produtos) {
            int quantidadeVendida = produto.getQuantidade() != null && produto.getQuantidade() > 0
                    ? produto.getQuantidade()
                    : 1;
            ProdutoModel produtoCadastrado = produtoRepository.findById(produto.getId())
                    .orElseThrow(() -> new RegraNegocioException("Produto nao encontrado: " + produto.getId()));

            if (produtoCadastrado.getQuantidade() < quantidadeVendida) {
                throw new RegraNegocioException("Estoque insuficiente para " + produtoCadastrado.getNome());
            }

            double subtotal = produtoCadastrado.getPreco() * quantidadeVendida;
            valorTotal += subtotal;

            produtoCadastrado.setQuantidade(produtoCadastrado.getQuantidade() - quantidadeVendida);
            produtosDaVenda.add(produtoCadastrado);

            VendaItemModel item = new VendaItemModel();
            item.setVenda(vendaModel);
            item.setProduto(produtoCadastrado);
            item.setNomeProduto(produtoCadastrado.getNome());
            item.setQuantidade(quantidadeVendida);
            item.setPrecoUnitario(produtoCadastrado.getPreco());
            item.setSubtotal(subtotal);
            itensDaVenda.add(item);
        }

        vendaModel.setProdutos(produtosDaVenda);
        vendaModel.setItens(itensDaVenda);
        vendaModel.setValorTotal(valorTotal);

        VendaModel vendaSalva = vendaRepository.save(vendaModel);

        if (vendaFiada) {
            registrarDivida(vendaSalva);
        }

        return vendaSalva;
    }

    private void registrarDivida(VendaModel venda) {
        DividaModel divida = new DividaModel();
        divida.setCliente(venda.getCliente());
        divida.setVenda(venda);
        divida.setData(venda.getDataVenda() != null ? venda.getDataVenda() : LocalDate.now());
        divida.setValor(venda.getValorTotal());

        NotificacaoModel notificacao = new NotificacaoModel();
        notificacao.setDataEnvio(LocalDate.now());
        notificacao.setStatusEntrega(true);
        notificacao.setDivida(divida);
        divida.getNotificacoes().add(notificacao);

        dividaRepository.save(divida);
    }

    public String emitirNotaFiscal(VendaModel vendaModel) {

        List<ProdutoModel> produtos = vendaModel.getProdutos();

        if(produtos == null || produtos.isEmpty()) {
            throw new RegraNegocioException("Não é possível emitir nota fiscal para venda sem produtos.");
        }

        StringBuilder sb = new StringBuilder();
        sb.append("NOTA FISCAL\n");

        for(ProdutoModel produto : vendaModel.getProdutos()) {
            sb.append("Produto: ").append(produto.getNome())
                    .append("\n Preco: ").append(produto.getPreco())
                    .append("\nQuantidade: ").append(produto.getQuantidade());
        }

        sb.append("\n\n Valor total da compra: R$ ").append(vendaModel.getValorTotal());

        return sb.toString();

    }
}
