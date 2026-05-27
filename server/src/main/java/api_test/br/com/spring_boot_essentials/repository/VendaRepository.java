package api_test.br.com.spring_boot_essentials.repository;

import api_test.br.com.spring_boot_essentials.model.VendaModel;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface VendaRepository extends JpaRepository<VendaModel, Integer> {

    List<VendaModel> findByDataVendaBetween(LocalDate inicio, LocalDate fim);

    @EntityGraph(attributePaths = {"itens", "itens.produto", "pagamento"})
    List<VendaModel> findDistinctByDataVendaBetween(LocalDate inicio, LocalDate fim);
}
