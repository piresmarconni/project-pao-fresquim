package api_test.br.com.spring_boot_essentials.controller;

import api_test.br.com.spring_boot_essentials.dto.VendaResumoDTO;
import api_test.br.com.spring_boot_essentials.model.VendaModel;
import api_test.br.com.spring_boot_essentials.service.VendaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/vendas")
@RequiredArgsConstructor
public class VendaController {

    private final VendaService vendaService;

    @GetMapping
    @ResponseStatus(HttpStatus.OK)
    public List<VendaResumoDTO> listarVendas() {
        return vendaService.listarTodas();
    }

    @PostMapping("/calcular-total")
    @ResponseStatus(HttpStatus.OK)
    public VendaModel calcularTotal(@Valid @RequestBody VendaModel vendaModel) {
        return vendaService.calcularTotal(vendaModel);
    }

    @PostMapping("/nota-fiscal")
    public ResponseEntity<String> emitirNotaFiscal(@Valid @RequestBody VendaModel vendaModel) {
        String notaFiscal = vendaService.emitirNotaFiscal(vendaModel);
        return ResponseEntity.ok(notaFiscal);
    }
}
