package api_test.br.com.spring_boot_essentials.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Entity
@Getter
@Setter
@NoArgsConstructor
@Table(name="notificacoes")
public class NotificacaoModel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_notificacao")
    private Integer id;

    @Column(name = "data_envio")
    private LocalDate dataEnvio;

    @Column(name = "status_entrega")
    private boolean statusEntrega;

    @ManyToOne(cascade = CascadeType.ALL)
    @JoinColumn(name="id_divida")
    @JsonIgnore
    private DividaModel divida;
}
