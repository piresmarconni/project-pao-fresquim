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

    @GetMapping
    @ResponseStatus(HttpStatus.OK)
    public List<PontoModel> listar() {
        return pontoService.listar();
    }

    @GetMapping("/{id}")
    @ResponseStatus(HttpStatus.OK)
    public PontoModel buscarPorId(@PathVariable Integer id) {
        return pontoService.buscarPorId(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public PontoModel registrar(@RequestBody PontoModel pontoModel) {
        return pontoService.registrar(pontoModel);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deletar(@PathVariable Integer id) {
        pontoService.deletar(id);
    }

    @PostMapping("/entrada")
    @ResponseStatus(HttpStatus.CREATED)
    public PontoModel registrarEntrada(@RequestBody PontoModel pontoModel) {
        return pontoService.registrarEntrada(pontoModel);
    }

    @PutMapping("/saida/{id}")
    @ResponseStatus(HttpStatus.OK)
    public PontoModel registrarSaida(@PathVariable Integer id) {
        return pontoService.registrarSaida(id);
    }
}