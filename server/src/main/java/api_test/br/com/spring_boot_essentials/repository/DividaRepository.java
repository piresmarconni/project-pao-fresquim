package api_test.br.com.spring_boot_essentials.repository;

import api_test.br.com.spring_boot_essentials.model.DividaModel;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DividaRepository  extends JpaRepository<DividaModel, Integer> {

    @Override
    @EntityGraph(attributePaths = {"cliente", "venda", "notificacoes"})
    List<DividaModel> findAll();
}
