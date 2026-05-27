package api_test.br.com.spring_boot_essentials.service;

import api_test.br.com.spring_boot_essentials.exception.RecursoNaoEncontradoException;
import api_test.br.com.spring_boot_essentials.exception.RegraNegocioException;
import api_test.br.com.spring_boot_essentials.model.FuncionarioModel;
import api_test.br.com.spring_boot_essentials.model.PontoModel;
import api_test.br.com.spring_boot_essentials.repository.FuncionarioRepository;
import api_test.br.com.spring_boot_essentials.repository.PontoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Service
public class PontoService {

    @Autowired
    private PontoRepository pontoRepository;

    @Autowired
    private FuncionarioRepository funcionarioRepository;

    public List<PontoModel> listarPorFuncionario(Integer idFuncionario) {
        validarFuncionario(idFuncionario);
        return pontoRepository.findByFuncionarioIdOrderByDataDescIdDesc(idFuncionario);
    }

    public PontoModel registrar(Integer idFuncionario, String tipo) {
        validarFuncionario(idFuncionario);

        String tipoNormalizado = tipo == null ? "" : tipo.trim().toUpperCase();

        return switch (tipoNormalizado) {
            case "ENTRADA" -> registrarEntrada(idFuncionario);
            case "SAIDA_ALMOCO" -> registrarSaidaAlmoco(idFuncionario);
            case "VOLTA_ALMOCO" -> registrarVoltaAlmoco(idFuncionario);
            case "SAIDA" -> registrarSaida(idFuncionario);
            default -> throw new RegraNegocioException("Tipo de registro de ponto invalido: " + tipo);
        };
    }

    public PontoModel registrarEntrada(Integer idFuncionario) {
        FuncionarioModel funcionario = validarFuncionario(idFuncionario);

        pontoRepository.findByFuncionarioIdAndData(idFuncionario, LocalDate.now())
                .ifPresent(ponto -> {
                    throw new RegraNegocioException("Entrada ja registrada para hoje.");
                });

        PontoModel ponto = new PontoModel();
        ponto.setFuncionario(funcionario);
        ponto.setData(LocalDate.now());
        ponto.setHoraEntrada(LocalTime.now());

        return pontoRepository.save(ponto);
    }

    public PontoModel registrarSaidaAlmoco(Integer idFuncionario) {
        PontoModel ponto = buscarPontoDeHoje(idFuncionario);

        if (ponto.getHoraSaidaAlmoco() != null) {
            throw new RegraNegocioException("Saida para almoco ja registrada para hoje.");
        }

        ponto.setHoraSaidaAlmoco(LocalTime.now());
        return pontoRepository.save(ponto);
    }

    public PontoModel registrarVoltaAlmoco(Integer idFuncionario) {
        PontoModel ponto = buscarPontoDeHoje(idFuncionario);

        if (ponto.getHoraSaidaAlmoco() == null) {
            throw new RegraNegocioException("Registre a saida para almoco antes da volta.");
        }

        if (ponto.getHoraVoltaAlmoco() != null) {
            throw new RegraNegocioException("Volta do almoco ja registrada para hoje.");
        }

        ponto.setHoraVoltaAlmoco(LocalTime.now());
        return pontoRepository.save(ponto);
    }

    public PontoModel registrarSaida(Integer idFuncionario) {
        PontoModel ponto = buscarPontoDeHoje(idFuncionario);

        if (ponto.getHoraSaida() != null) {
            throw new RegraNegocioException("Saida ja registrada para hoje.");
        }

        ponto.setHoraSaida(LocalTime.now());
        return pontoRepository.save(ponto);
    }

    public PontoModel registarSaida(Integer pontoId) {
        PontoModel ponto = pontoRepository.findById(pontoId).orElseThrow(() ->
                new RecursoNaoEncontradoException(
                        "Registro de ponto nao encontrado com ID: " + pontoId
                ));

        ponto.setHoraSaida(LocalTime.now());

        return pontoRepository.save(ponto);
    }

    private FuncionarioModel validarFuncionario(Integer idFuncionario) {
        return funcionarioRepository.findById(idFuncionario).orElseThrow(() ->
                new RecursoNaoEncontradoException(
                        "Funcionario nao encontrado com ID: " + idFuncionario
                ));
    }

    private PontoModel buscarPontoDeHoje(Integer idFuncionario) {
        return pontoRepository.findByFuncionarioIdAndData(idFuncionario, LocalDate.now())
                .orElseThrow(() -> new RegraNegocioException("Registre a entrada antes dos demais horarios."));
    }
}
