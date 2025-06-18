#!/bin/bash

API_ENDPOINT="http://localhost:8080/api/brewer/beers"
COMMON_BREWERY_ID="00000000-0000-0000-0000-000000000001"
FLAVOR_TAGS=("crisp" "smooth" "malty" "hoppy" "light" "refreshing" "bitter" "sweet" "carbonated" "clean")

BEERS=(
  "Bud Light|Light Lager"
  "Coors Light|Light Lager"
  "Miller Lite|Pilsner"
  "Budweiser|American Lager"
  "Michelob Ultra|Light Lager"
  "Natural Light|Light Lager"
  "Busch Light|Light Lager"
  "Keystone Light|Light Lager"
  "Pabst Blue Ribbon|Lager"
  "Rolling Rock|Pale Lager"
  "Old Milwaukee|American Lager"
  "Yuengling Traditional Lager|Amber Lager"
  "Icehouse|American Adjunct Lager"
  "Milwaukee’s Best|American Lager"
  "Genesee Cream Ale|Cream Ale"
  "Steel Reserve|High Gravity Lager"
  "Hamm’s|American Lager"                                         
  "Schlitz|American Lager"
  "Lone Star|American Lager"
  "Rainier|American Lager"
)

# Simple function to pick N unique random tags from FLAVOR_TAGS
pick_random_tags() {
  count=$1
  selected=()
  used=()

  while [ "${#selected[@]}" -lt "$count" ]; do
    index=$((RANDOM % ${#FLAVOR_TAGS[@]}))
    tag=${FLAVOR_TAGS[$index]}
    if [[ ! " ${used[*]} " =~ " $index " ]]; then
      selected+=("$tag")
      used+=("$index")
    fi
  done

  # Return result as JSON array string
  result="["
  for t in "${selected[@]}"; do
    result+="\"$t\","
  done
  echo "${result%,}]"
}

for entry in "${BEERS[@]}"; do
  name="${entry%%|*}"
  style="${entry##*|}"
  uuid=$(uuidgen)

  # Pick 2–4 random flavor tags
  tag_count=$((RANDOM % 3 + 2))
  tag_json=$(pick_random_tags $tag_count)

  # Build JSON payload
  json_payload=$(jq -n \
    --arg id "$uuid" \
    --arg name "$name" \
    --arg style "$style" \
    --arg breweryId "$COMMON_BREWERY_ID" \
    --arg breweryName "Domestic" \
    --argjson flavorTags "$tag_json" \
    '{
        beerId: $id,
        name: $name,
        style: $style,
        breweryId: $breweryId,
        breweryName: $breweryName,
        flavorTags: $flavorTags
    }'
  )

  curl -s -X POST "$API_ENDPOINT" \
    -H "Content-Type: application/json" \
    -d "$json_payload" \
    && echo "✅ Posted: $name"
done
