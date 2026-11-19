package br.senai.cantina.repository;

import br.senai.cantina.model.Pedido;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PedidoRepository extends JpaRepository<Pedido, Long> {

    List<Pedido> findAllByOrderByIdDesc();

    List<Pedido> findByIdInOrderByIdDesc(List<Long> ids);
}
