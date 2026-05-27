package api_test.br.com.spring_boot_essentials.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@Entity
@Table(name = "funcionarios")
public class FuncionarioModel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Integer id;

    @NotBlank(message = "Nome é obrigatório")
    @Size(min = 3, max = 50, message = "Nome deve ter entre 3 e 50 caracteres")
    private String nome;

    @NotBlank(message = "Cargo é obrigatório")
    private String cargo;

    @Size(min = 11, max = 11, message = "CPF deve ter exatamente 11 dÃ­gitos")
    private String cpf;

    private String telefone;

    private LocalDate dataAdmissao;

    private String contatoEmergenciaNome;

    private String contatoEmergenciaTelefone;

    private Double salario;

    private String status;

    @JsonIgnore
    @OneToMany(mappedBy = "funcionario", cascade = CascadeType.ALL)
    private List<PontoModel> pontos = new ArrayList<>();

    @Embedded
    private EnderecoModel endereco;

    @OneToMany(mappedBy = "funcionario", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<LicencaModel> licencas = new ArrayList<>();

    public FuncionarioModel(Integer id, String nome, String cargo) {
        this.id = id;
        this.nome = nome;
        this.cargo = cargo;
    }

    public FuncionarioModel() {}
}
