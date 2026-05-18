package api_test.br.com.spring_boot_essentials.service;

import api_test.br.com.spring_boot_essentials.model.LicencaModel;
import api_test.br.com.spring_boot_essentials.repository.LicencaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class LicencaService {

    private final LicencaRepository licencaRepository;

    public List<LicencaModel> listar() {
        return licencaRepository.findAll();
    }

    public LicencaModel buscarPorId(Integer id) {
        return licencaRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Licença não encontrada com o ID: " + id)
                );
    }

    public LicencaModel registrar(LicencaModel licencaModel) {
        return licencaRepository.save(licencaModel);
    }

    public void deletar(Integer id) {
        LicencaModel licenca = buscarPorId(id);
        licencaRepository.delete(licenca);
    }

    public List<LicencaModel> listarLicencasPorFuncionario(Integer funcionarioId) {
        return licencaRepository.findByFuncionarioId(funcionarioId);
    }
}