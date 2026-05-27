package api_test.br.com.spring_boot_essentials.controller;

import api_test.br.com.spring_boot_essentials.model.PontoModel;
import api_test.br.com.spring_boot_essentials.service.PontoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/pontos")
@RequiredArgsConstructor
public class PontoController {

    private final PontoService pontoService;

    @GetMapping("/funcionario/{idFuncionario}")
    @ResponseStatus(HttpStatus.OK)
    public List<PontoModel> listarPorFuncionario(@PathVariable Integer idFuncionario) {
        return pontoService.listarPorFuncionario(idFuncionario);
    }

    @PostMapping("/funcionario/{idFuncionario}/registrar/{tipo}")
    @ResponseStatus(HttpStatus.CREATED)
    public PontoModel registrarPonto(
            @PathVariable Integer idFuncionario,
            @PathVariable String tipo) {
        return pontoService.registrar(idFuncionario, tipo);
    }
}
