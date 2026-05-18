package api_test.br.com.spring_boot_essentials.service;

import api_test.br.com.spring_boot_essentials.model.NotificacaoModel;
import api_test.br.com.spring_boot_essentials.repository.NotificacaoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificacaoService {

    private final NotificacaoRepository notificacaoRepository;

    public List<NotificacaoModel> listar() {
        return notificacaoRepository.findAll();
    }

    public NotificacaoModel buscarPorId(Integer id) {
        return notificacaoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notificação não encontrada com o ID: " + id));
    }

    public NotificacaoModel registrar(NotificacaoModel notificacaoModel) {
        return notificacaoRepository.save(notificacaoModel);
    }

    public void deletar(Integer id) {
        NotificacaoModel notificacao = buscarPorId(id);
        notificacaoRepository.delete(notificacao);
    }
}