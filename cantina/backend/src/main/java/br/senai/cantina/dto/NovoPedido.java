package br.senai.cantina.dto;

import java.util.List;

public record NovoPedido(String nome, List<Linha> itens) {

    public record Linha(Long itemId, int quantidade) {
    }
}
