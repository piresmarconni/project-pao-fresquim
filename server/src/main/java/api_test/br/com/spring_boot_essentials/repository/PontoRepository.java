package api_test.br.com.spring_boot_essentials.repository;

import api_test.br.com.spring_boot_essentials.model.PontoModel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface PontoRepository extends JpaRepository<PontoModel, Integer> {

    Optional<PontoModel> findByFuncionarioIdAndData(Integer funcionarioId, LocalDate data);

    List<PontoModel> findByFuncionarioIdOrderByDataDescIdDesc(Integer funcionarioId);
}
