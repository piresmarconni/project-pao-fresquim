package api_test.br.com.spring_boot_essentials.exception;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
public class RespostaErro {

    private LocalDateTime dataHora;
    private int status;
    private String erro;
    private String mensagem;
    private String caminho;
}