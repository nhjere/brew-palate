package com.codewithneal.brew_backend;

import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;
import org.springframework.web.util.UriUtils;
import org.springframework.http.HttpHeaders; 


@Service
public class GeocodingService {
  private final RestTemplate http;

  public GeocodingService(RestTemplateBuilder builder) {
    this.http = builder
        .defaultHeader(HttpHeaders.USER_AGENT, "BrewPalate/1.0 (contact@yourapp.com)")
        .build();
  }

  public Optional<LatLon> geocode(String street, String city, String state, String postal) {
    String q = Stream.of(street, city, state, postal)
        .filter(s -> s != null && !s.isBlank())
        .collect(Collectors.joining(", "));
    if (q.isBlank()) return Optional.empty();

    URI uri = UriComponentsBuilder
    .fromUriString("https://nominatim.openstreetmap.org/search?format=json&limit=1&q=" +
                   UriUtils.encode(q, StandardCharsets.UTF_8))
    .build(true)
    .toUri();


    ResponseEntity<NominatimResult[]> resp = http.getForEntity(uri, NominatimResult[].class);
    var arr = resp.getBody();
    if (arr != null && arr.length > 0) {
      return Optional.of(new LatLon(Double.parseDouble(arr[0].lat), Double.parseDouble(arr[0].lon)));
    }
    return Optional.empty();
  }

  public record LatLon(double lat, double lon) {}
  static class NominatimResult { public String lat; public String lon; }
}

