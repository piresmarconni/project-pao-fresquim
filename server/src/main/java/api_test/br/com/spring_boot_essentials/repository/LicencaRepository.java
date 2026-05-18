package api_test.br.com.spring_boot_essentials.repository;

import api_test.br.com.spring_boot_essentials.model.LicencaModel;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LicencaRepository extends JpaRepository<LicencaModel, Integer> {

    List<LicencaModel> findByFuncionarioId(Integer funcionarioId);
}