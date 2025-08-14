package com.codewithneal.brew_backend.CsvReader.beers;

public interface BeerListItem {
  java.util.UUID getBeerId();
  String getName();
  Double getAbv();
  Double getIbu();
  Double getDistanceMiles();
  java.util.UUID getBreweryUuid();
  String getStyle();
  java.util.List<String> getFlavorTags();
}
