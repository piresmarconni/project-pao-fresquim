package api_test.br.com.spring_boot_essentials.service;

import api_test.br.com.spring_boot_essentials.model.PontoModel;
import api_test.br.com.spring_boot_essentials.repository.PontoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PontoService {

    private final PontoRepository pontoRepository;

    // LISTAR PONTOS
    public List<PontoModel> listar() {
        return pontoRepository.findAll();
    }

    // BUSCAR PONTO POR ID
    public PontoModel buscarPorId(Integer id) {
        return pontoRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Ponto não encontrado com o ID: " + id)
                );
    }

    // REGISTRAR PONTO
    public PontoModel registrar(PontoModel pontoModel) {
        return pontoRepository.save(pontoModel);
    }

    // DELETAR PONTO
    public void deletar(Integer id) {

        PontoModel ponto = buscarPorId(id);

        pontoRepository.delete(ponto);
    }

    // REGISTRAR ENTRADA
    public PontoModel registrarEntrada(PontoModel pontoModel) {

        pontoModel.setData(LocalDate.now());

        pontoModel.setHoraEntrada(LocalTime.now());

        return pontoRepository.save(pontoModel);
    }

    // REGISTRAR SAÍDA
    public PontoModel registrarSaida(Integer id) {

        PontoModel ponto = buscarPorId(id);

        ponto.setHoraSaida(LocalTime.now());

        return pontoRepository.save(ponto);
    }
}