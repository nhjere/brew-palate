#!/bin/bash

API_URL="http://localhost:8080/api/user/breweries"
BASE_URL="https://api.openbrewerydb.org/v1/breweries"
STATE="texas"
TYPE="micro"
PAGE=1
PER_PAGE=100

echo "Seeding breweries from Open Brewery DB..."

while true; do
  echo "Fetching page $PAGE..."

  response=$(curl -s "${BASE_URL}?by_state=${STATE}&by_type=${TYPE}&per_page=${PER_PAGE}&page=${PAGE}")

  # Stop if empty
  if [[ $(echo "$response" | jq 'length') -eq 0 ]]; then
    echo "Done. No more breweries."
    break
  fi

  # Use OpenBreweryDB's field names
  payload=$(echo "$response" | jq '[.[] | {
    id: .id,
    name: .name,
    brewery_type: .brewery_type,
    street: .street,
    city: .city,
    state: .state,
    postal_code: .postal_code,
    country: .country,
    phone: .phone,
    website_url: .website_url,
    latitude: .latitude,
    longitude: .longitude
  }]')

  # Post payload to backend
  curl -s -X POST "$API_URL" \
    -H "Content-Type: application/json" \
    -d "$payload"

  echo "Page $PAGE seeded."
  ((PAGE++))
done
