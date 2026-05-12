package api_test.br.com.spring_boot_essentials.exception;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class ManipuladorGlobalException {

    @ExceptionHandler(RecursoNaoEncontradoException.class)
    public ResponseEntity<RespostaErro> tratarRecursoNaoEncontrado(
            RecursoNaoEncontradoException ex,
            HttpServletRequest requisicao) {

        RespostaErro erro = new RespostaErro(
                LocalDateTime.now(),
                HttpStatus.NOT_FOUND.value(),
                "Recurso não encontrado",
                ex.getMessage(),
                requisicao.getRequestURI()
        );

        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(erro);
    }

    @ExceptionHandler(RegraNegocioException.class)
    public ResponseEntity<RespostaErro> tratarRegraNegocio(
            RegraNegocioException ex,
            HttpServletRequest requisicao) {

        RespostaErro erro = new RespostaErro(
                LocalDateTime.now(),
                HttpStatus.BAD_REQUEST.value(),
                "Erro de regra de negócio",
                ex.getMessage(),
                requisicao.getRequestURI()
        );

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(erro);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> tratarValidacoes(
            MethodArgumentNotValidException ex) {

        Map<String, String> erros = new HashMap<>();

        ex.getBindingResult()
                .getFieldErrors()
                .forEach(erro ->
                        erros.put(
                                erro.getField(),
                                erro.getDefaultMessage()
                        )
                );

        return ResponseEntity
                .badRequest()
                .body(erros);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<RespostaErro> tratarErroGenerico(
            Exception ex,
            HttpServletRequest requisicao) {

        RespostaErro erro = new RespostaErro(
                LocalDateTime.now(),
                HttpStatus.INTERNAL_SERVER_ERROR.value(),
                "Erro interno do servidor",
                ex.getMessage(),
                requisicao.getRequestURI()
        );

        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(erro);
    }
}