package api_test.br.com.spring_boot_essentials.controller;

import api_test.br.com.spring_boot_essentials.model.NotificacaoModel;
import api_test.br.com.spring_boot_essentials.service.NotificacaoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/notificacoes")
@RequiredArgsConstructor
public class NotificacaoController {

    private final NotificacaoService notificacaoService;

    @GetMapping
    @ResponseStatus(HttpStatus.OK)
    public List<NotificacaoModel> listar() {
        return notificacaoService.listar();
    }

    @GetMapping("/{id}")
    @ResponseStatus(HttpStatus.OK)
    public NotificacaoModel buscarPorId(@PathVariable Integer id) {
        return notificacaoService.buscarPorId(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public NotificacaoModel registrar(@RequestBody NotificacaoModel notificacaoModel) {
        return notificacaoService.registrar(notificacaoModel);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deletar(@PathVariable Integer id) {
        notificacaoService.deletar(id);
    }
}