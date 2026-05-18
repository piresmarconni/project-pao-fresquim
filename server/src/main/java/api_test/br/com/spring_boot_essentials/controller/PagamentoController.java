package api_test.br.com.spring_boot_essentials.controller;

import api_test.br.com.spring_boot_essentials.model.PagamentoModel;
import api_test.br.com.spring_boot_essentials.service.PagamentoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/pagamentos")
@RequiredArgsConstructor
public class PagamentoController {

    private final PagamentoService pagamentoService;

    // LISTAR PAGAMENTOS
    @GetMapping
    @ResponseStatus(HttpStatus.OK)
    public List<PagamentoModel> listar() {
        return pagamentoService.listar();
    }

    // BUSCAR PAGAMENTO POR ID
    @GetMapping("/{id}")
    @ResponseStatus(HttpStatus.OK)
    public PagamentoModel buscarPorId(@PathVariable Integer id) {
        return pagamentoService.buscarPorId(id);
    }

    // REGISTRAR PAGAMENTO
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public PagamentoModel registrar(@RequestBody PagamentoModel pagamentoModel) {
        return pagamentoService.registrar(pagamentoModel);
    }

    // DELETAR PAGAMENTO
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deletar(@PathVariable Integer id) {
        pagamentoService.deletar(id);
    }

    // PROCESSAR PAGAMENTO
    @PostMapping("/processar")
    @ResponseStatus(HttpStatus.OK)
    public String processarPagamento(@RequestBody PagamentoModel pagamentoModel) {
        return pagamentoService.processarPagamento(pagamentoModel);
    }

    // VALIDAR PAGAMENTO
    @PostMapping("/validar")
    @ResponseStatus(HttpStatus.OK)
    public Boolean validarPagamento(@RequestBody PagamentoModel pagamentoModel) {
        return pagamentoService.validarPagamento(pagamentoModel);
    }
}