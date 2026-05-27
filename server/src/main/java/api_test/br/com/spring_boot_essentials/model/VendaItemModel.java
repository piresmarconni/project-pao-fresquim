package api_test.br.com.spring_boot_essentials.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "venda_itens")
public class VendaItemModel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @JsonIgnore
    @ManyToOne
    @JoinColumn(name = "venda_id")
    private VendaModel venda;

    @ManyToOne
    @JoinColumn(name = "produto_id")
    private ProdutoModel produto;

    private String nomeProduto;
    private Integer quantidade;
    private Double precoUnitario;
    private Double subtotal;
}
