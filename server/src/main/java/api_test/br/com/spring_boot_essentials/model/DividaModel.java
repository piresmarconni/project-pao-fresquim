package api_test.br.com.spring_boot_essentials.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@Entity
@Table(name = "dividas")
public class DividaModel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    private Double valor;

    @Column(nullable = false)
    private LocalDate data;

    @Column(columnDefinition = "boolean default false")
    private Boolean paga = false;

    private LocalDate dataPagamento;

    @JsonIgnore
    @ManyToOne
    @JoinColumn(name = "cliente_id")
    private ClienteModel cliente;

    @JsonIgnore
    @OneToOne
    @JoinColumn(name = "venda_id")
    private VendaModel venda;

    @OneToMany(mappedBy = "divida", cascade = CascadeType.ALL)
    private List<NotificacaoModel> notificacoes = new ArrayList<>();

    public DividaModel(Integer id, Double valor, LocalDate data) {
        this.id = id;
        this.valor = valor;
        this.data = data;
    }

    public DividaModel() {}
}
