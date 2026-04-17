package com.codewithneal.brew_backend.user.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "survey_beers")
public class SurveyBeer {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "survey_beer_id")
    private UUID surveyBeerId;

    @NotNull(message = "Beer name is required")
    @Size(max = 200)
    @Column(name = "name", nullable = false)
    private String name;

    @Size(max = 100)
    @Column(name = "style")
    private String style;

    @Size(max = 50)
    @Column(name = "style_family")
    private String styleFamily;

    @Column(name = "abv")
    private Double abv;

    @Column(name = "ibu")
    private Double ibu;

    @Size(max = 500)
    @Column(name = "image_url")
    private String imageUrl;

    @ElementCollection
    @CollectionTable(name = "survey_beer_flavor_tags", joinColumns = @JoinColumn(name = "survey_beer_id"))
    @Column(name = "flavor_tag")
    private List<@Size(max = 30) String> flavorTags;

    @ElementCollection
    @CollectionTable(name = "survey_beer_feature_vector", joinColumns = @JoinColumn(name = "survey_beer_id"))
    @Column(name = "value")
    private List<Double> featureVector;

    public SurveyBeer() {}

    public SurveyBeer(String name, String style, String styleFamily, Double abv, Double ibu, String imageUrl, List<String> flavorTags, List<Double> featureVector) {
        this.name = name;
        this.style = style;
        this.styleFamily = styleFamily;
        this.abv = abv;
        this.ibu = ibu;
        this.imageUrl = imageUrl;
        this.flavorTags = flavorTags;
        this.featureVector = featureVector;
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

    public List<Double> getFeatureVector() {
        return featureVector;
    }

    public void setFeatureVector(List<Double> featureVector) {
        this.featureVector = featureVector;
    }
}
