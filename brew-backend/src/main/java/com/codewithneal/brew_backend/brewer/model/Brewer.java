package com.codewithneal.brew_backend.brewer.model;

import java.util.UUID;

import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;

public class Brewer {
    @Id
    private UUID id;

    private String email;
    private String password;

    @OneToOne
    @JoinColumn(name = "brewery_id")
    private Brewery brewery;

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String password() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}


/*
 *  Supabase Project Setup (brew-auth)
 * 
 *  URL: https://qvqrsdiqhwwciqnncoft.supabase.co
 *  Anon/Public Key:
 *  JWT Secret: 3VsvtNn55isDIuRHahFkXGVJoR/15/l+cF/SQ1rwpq+igQmQSx0GBsT2N3kgI0AUolfo7nWaCaZA6fuiVZErpA==
 * 
 */