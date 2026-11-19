package br.senai.cantina.controller;

import br.senai.cantina.model.Item;
import br.senai.cantina.repository.ItemRepository;
import java.util.List;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/menu")
public class MenuController {

    private final ItemRepository itens;

    public MenuController(ItemRepository itens) {
        this.itens = itens;
    }

    @GetMapping
    public List<Item> cardapio() {
        return itens.findAllByOrderByIdAsc();
    }

    @PostMapping("/{id}/esgotado")
    public Item marcarEsgotado(@PathVariable Long id, @RequestBody Map<String, Boolean> corpo) {
        Item item = itens.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Item não encontrado."));
        item.esgotado = Boolean.TRUE.equals(corpo.get("esgotado"));
        return itens.save(item);
    }
}
