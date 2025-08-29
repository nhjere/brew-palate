// dto/PageDTO.java
package com.codewithneal.brew_backend.brewer.dto;

import java.util.List;

public record PageDTO<T>(
    List<T> content,
    int page,
    int size,
    long totalElements,
    int totalPages
) {
    public static <T> PageDTO<T> from(org.springframework.data.domain.Page<T> p) {
        return new PageDTO<>(p.getContent(), p.getNumber(), p.getSize(), p.getTotalElements(), p.getTotalPages());
    }
}
