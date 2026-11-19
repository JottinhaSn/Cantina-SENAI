package br.senai.cantina.service;

import br.senai.cantina.dto.NovoPedido;
import br.senai.cantina.model.Item;
import br.senai.cantina.model.Pedido;
import br.senai.cantina.model.PedidoItem;
import br.senai.cantina.repository.ItemRepository;
import br.senai.cantina.repository.PedidoRepository;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class PedidoService {

    private static final List<String> FLUXO = List.of("recebido", "em preparo", "pronto", "retirado");

    private final PedidoRepository pedidos;
    private final ItemRepository itens;

    public PedidoService(PedidoRepository pedidos, ItemRepository itens) {
        this.pedidos = pedidos;
        this.itens = itens;
    }

    public List<Pedido> listar(String ids) {
        if (ids == null || ids.isBlank()) {
            return pedidos.findAllByOrderByIdDesc();
        }
        List<Long> lista = Arrays.stream(ids.split(","))
                .map(String::trim)
                .filter(texto -> !texto.isEmpty())
                .map(Long::valueOf)
                .toList();
        return pedidos.findByIdInOrderByIdDesc(lista);
    }

    public Pedido criar(NovoPedido novo) {
        String nome = novo.nome() == null ? "" : novo.nome().trim();
        if (nome.isEmpty()) {
            throw erro(HttpStatus.BAD_REQUEST, "Digite seu nome para confirmar o pedido.");
        }
        if (nome.length() > 30) {
            nome = nome.substring(0, 30);
        }
        if (novo.itens() == null || novo.itens().isEmpty()) {
            throw erro(HttpStatus.BAD_REQUEST, "Seu pedido está vazio. Escolha ao menos um item.");
        }

        Pedido pedido = new Pedido();
        pedido.nomeCliente = nome;
        pedido.status = "recebido";
        pedido.criadoEm = LocalDateTime.now();

        BigDecimal total = BigDecimal.ZERO;
        for (NovoPedido.Linha linha : novo.itens()) {
            if (linha.itemId() == null || linha.quantidade() < 1 || linha.quantidade() > 10) {
                throw erro(HttpStatus.BAD_REQUEST, "Item ou quantidade inválida.");
            }
            Item item = itens.findById(linha.itemId())
                    .orElseThrow(() -> erro(HttpStatus.BAD_REQUEST, "Item ou quantidade inválida."));
            if (item.esgotado) {
                throw erro(HttpStatus.CONFLICT, item.nome + " esgotou hoje. Escolha outro item.");
            }
            PedidoItem pedidoItem = new PedidoItem();
            pedidoItem.item = item;
            pedidoItem.quantidade = linha.quantidade();
            pedidoItem.precoUnitario = item.preco;
            pedido.itens.add(pedidoItem);
            total = total.add(item.preco.multiply(BigDecimal.valueOf(linha.quantidade())));
        }
        pedido.total = total;
        return pedidos.save(pedido);
    }

    public Pedido avancar(Long id) {
        Pedido pedido = buscar(id);
        int posicao = FLUXO.indexOf(pedido.status);
        if (posicao < 0 || posicao >= FLUXO.size() - 1) {
            throw erro(HttpStatus.CONFLICT, "Este pedido não pode mais avançar.");
        }
        pedido.status = FLUXO.get(posicao + 1);
        return pedidos.save(pedido);
    }

    public Pedido cancelar(Long id) {
        Pedido pedido = buscar(id);
        if (!pedido.status.equals("recebido")) {
            throw erro(HttpStatus.CONFLICT, "Seu pedido já está sendo preparado e não pode mais ser cancelado.");
        }
        pedido.status = "cancelado";
        return pedidos.save(pedido);
    }

    public Pedido retirar(Long id) {
        Pedido pedido = buscar(id);
        if (!pedido.status.equals("pronto")) {
            throw erro(HttpStatus.CONFLICT, "O pedido ainda não está pronto.");
        }
        pedido.status = "retirado";
        return pedidos.save(pedido);
    }

    private Pedido buscar(Long id) {
        return pedidos.findById(id).orElseThrow(() -> erro(HttpStatus.NOT_FOUND, "Pedido não encontrado."));
    }

    private ResponseStatusException erro(HttpStatus status, String mensagem) {
        return new ResponseStatusException(status, mensagem);
    }
}
