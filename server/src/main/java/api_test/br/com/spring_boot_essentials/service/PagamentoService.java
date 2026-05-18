package api_test.br.com.spring_boot_essentials.service;

import api_test.br.com.spring_boot_essentials.model.PagamentoModel;
import api_test.br.com.spring_boot_essentials.repository.PagamentoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PagamentoService {

    private final PagamentoRepository pagamentoRepository;

    // LISTAR PAGAMENTOS
    public List<PagamentoModel> listar() {
        return pagamentoRepository.findAll();
    }

    // BUSCAR PAGAMENTO POR ID
    public PagamentoModel buscarPorId(Integer id) {
        return pagamentoRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Pagamento não encontrado com o ID: " + id)
                );
    }

    // REGISTRAR PAGAMENTO
    public PagamentoModel registrar(PagamentoModel pagamentoModel) {
        return pagamentoRepository.save(pagamentoModel);
    }

    // DELETAR PAGAMENTO
    public void deletar(Integer id) {

        PagamentoModel pagamento = buscarPorId(id);

        pagamentoRepository.delete(pagamento);
    }

    // PROCESSAR PAGAMENTO
    public String processarPagamento(PagamentoModel pagamentoModel) {

        String status = "Pagamento processado com sucesso.";

        if (pagamentoModel.getValor() <= 0) {
            status = "Pagamento inválido.";
        }

        return status;
    }

    // VALIDAR PAGAMENTO
    public Boolean validarPagamento(PagamentoModel pagamentoModel) {

        return pagamentoModel.getValor() > 0;
    }
}