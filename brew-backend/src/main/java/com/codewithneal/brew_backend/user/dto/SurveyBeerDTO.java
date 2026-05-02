package com.codewithneal.brew_backend.user.dto;

import java.util.List;
import java.util.UUID;

public class SurveyBeerDTO {

    private UUID surveyBeerId;
    private String name;
    private String style;
    private String styleFamily;
    private Double abv;
    private Double ibu;
    private String imageUrl;
    private List<String> flavorTags;

    public SurveyBeerDTO() {}

    public SurveyBeerDTO(UUID surveyBeerId, String name, String style, String styleFamily, Double abv, Double ibu, String imageUrl, List<String> flavorTags) {
        this.surveyBeerId = surveyBeerId;
        this.name = name;
        this.style = style;
        this.styleFamily = styleFamily;
        this.abv = abv;
        this.ibu = ibu;
        this.imageUrl = imageUrl;
        this.flavorTags = flavorTags;
    }

    public UUID getSurveyBeerId() {
        return surveyBeerId;
    }

    public void setSurveyBeerId(UUID surveyBeerId) {
        this.surveyBeerId = surveyBeerId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getStyle() {
        return style;
    }

    public void setStyle(String style) {
        this.style = style;
    }

    public String getStyleFamily() {
        return styleFamily;
    }

    public void setStyleFamily(String styleFamily) {
        this.styleFamily = styleFamily;
    }

    public Double getAbv() {
        return abv;
    }

    public void setAbv(Double abv) {
        this.abv = abv;
    }

    public Double getIbu() {
        return ibu;
    }

    public void setIbu(Double ibu) {
        this.ibu = ibu;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public List<String> getFlavorTags() {
        return flavorTags;
    }

    public void setFlavorTags(List<String> flavorTags) {
        this.flavorTags = flavorTags;
    }
}
