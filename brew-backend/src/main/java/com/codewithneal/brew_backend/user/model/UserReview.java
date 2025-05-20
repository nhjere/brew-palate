package com.codewithneal.brew_backend.user.model;

public class UserReview {
    private String userId;
    private String beerId;
    private int sweetness;
    private int sourness;
    private int hoppiness;
    private String comment;

    public UserReview() {}

    public UserReview(String userId, String beerId, int sweetness, int sourness, int hoppiness, String comment) {
        this.userId = userId;
        this.beerId = beerId;
        this.sweetness = sweetness;
        this.sourness = sourness;
        this.hoppiness = hoppiness;
        this.comment = comment;
    }

    // Getters and setters
    public String getUserId() { 
        return userId; 
    }
    public void setUserId(String userId) { 
        this.userId = userId; 
    }

    public String getBeerId() { 
        return beerId; 
    }
    public void setBeerId(String beerId) { 
        this.beerId = beerId; 
    }

    public int getSweetness() { 
        return sweetness; 
    }
    public void setSweetness(int sweetness) { 
        this.sweetness = sweetness; 
    }

    public int getSourness() { 
        return sourness; 
    }
    public void setSourness(int sourness) { 
        this.sourness = sourness; 
    }

    public int getHoppiness() { 
        return hoppiness; 
    }
    public void setHoppiness(int hoppiness) { 
        this.hoppiness = hoppiness; 
    }

    public String getComment() { 
        return comment; 
    }
    public void setComment(String comment) { 
        this.comment = comment; 
    }
}
