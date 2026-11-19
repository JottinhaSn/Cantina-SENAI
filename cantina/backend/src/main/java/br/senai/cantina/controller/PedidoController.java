package br.senai.cantina.controller;

import br.senai.cantina.dto.NovoPedido;
import br.senai.cantina.model.Pedido;
import br.senai.cantina.service.PedidoService;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/pedidos")
public class PedidoController {

    private final PedidoService service;

    public PedidoController(PedidoService service) {
        this.service = service;
    }

    @GetMapping
    public List<Pedido> listar(@RequestParam(required = false) String ids) {
        return service.listar(ids);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Pedido criar(@RequestBody NovoPedido novo) {
        return service.criar(novo);
    }

    @PostMapping("/{id}/avancar")
    public Pedido avancar(@PathVariable Long id) {
        return service.avancar(id);
    }

    @PostMapping("/{id}/cancelar")
    public Pedido cancelar(@PathVariable Long id) {
        return service.cancelar(id);
    }

    @PostMapping("/{id}/retirar")
    public Pedido retirar(@PathVariable Long id) {
        return service.retirar(id);
    }
}
