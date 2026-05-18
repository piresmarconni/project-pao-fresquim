package api_test.br.com.spring_boot_essentials.controller;

import api_test.br.com.spring_boot_essentials.model.LicencaModel;
import api_test.br.com.spring_boot_essentials.service.LicencaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/licencas")
@RequiredArgsConstructor
public class LicencaController {

    private final LicencaService licencaService;

    @GetMapping
    @ResponseStatus(HttpStatus.OK)
    public List<LicencaModel> listar() {
        return licencaService.listar();
    }

    @GetMapping("/{id}")
    @ResponseStatus(HttpStatus.OK)
    public LicencaModel buscarPorId(@PathVariable Integer id) {
        return licencaService.buscarPorId(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public LicencaModel registrar(@RequestBody LicencaModel licencaModel) {
        return licencaService.registrar(licencaModel);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deletar(@PathVariable Integer id) {
        licencaService.deletar(id);
    }

    @GetMapping("/funcionario/{funcionarioId}")
    @ResponseStatus(HttpStatus.OK)
    public List<LicencaModel> listarLicencasPorFuncionario(@PathVariable Integer funcionarioId) {
        return licencaService.listarLicencasPorFuncionario(funcionarioId);
    }
}