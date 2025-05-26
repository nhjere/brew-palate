#!/bin/bash
API_URL="http://localhost:8080/api/brewer/beers"
echo "Seeding beers..."
curl -s -X POST $API_URL -H "Content-Type: application/json" -d '{"beer_id": "ac506342-e360-496b-8062-341412946ffd", "name": "Hop Storm", "style": "Lager", "breweryId": "d1607d50-7679-467c-a3bb-15280b479b1a", "breweryName": "Lone Pint Brewery"}'

curl -s -X POST $API_URL -H "Content-Type: application/json" -d '{"beer_id": "326c1cb4-c92e-4d3e-be41-dcc55176d78f", "name": "Hop Machine", "style": "Pale Ale", "breweryId": "d1607d50-7679-467c-a3bb-15280b479b1a", "breweryName": "Lone Pint Brewery"}'

curl -s -X POST $API_URL -H "Content-Type: application/json" -d '{"beer_id": "f9910a63-a3f5-4d02-bfe6-814fa3661448", "name": "Sun Machine", "style": "Stout", "breweryId": "50a34bd8-7559-4204-beee-2f8e9a4ebd31", "breweryName": "Jester King Brewery"}'

curl -s -X POST $API_URL -H "Content-Type: application/json" -d '{"beer_id": "c4be9cdc-adea-49f6-bbff-ddae22b82c33", "name": "Ghost Machine", "style": "IPA", "breweryId": "50a34bd8-7559-4204-beee-2f8e9a4ebd31", "breweryName": "Jester King Brewery"}'

curl -s -X POST $API_URL -H "Content-Type: application/json" -d '{"beer_id": "00e5151a-cdf5-47ea-a43d-0f019a630e22", "name": "Sun River", "style": "IPA", "breweryId": "50a34bd8-7559-4204-beee-2f8e9a4ebd31", "breweryName": "Jester King Brewery"}'

curl -s -X POST $API_URL -H "Content-Type: application/json" -d '{"beer_id": "210db97c-decb-49f6-ab63-f0163730be2c", "name": "Ghost River", "style": "IPA", "breweryId": "50a34bd8-7559-4204-beee-2f8e9a4ebd31", "breweryName": "Jester King Brewery"}'

curl -s -X POST $API_URL -H "Content-Type: application/json" -d '{"beer_id": "de8f6b89-9f86-433e-91ae-e43cbb516d42", "name": "Wild River", "style": "Farmhouse Ale", "breweryId": "464cd09a-db11-47fd-b42d-d03d6c7fa7af", "breweryName": "Pinthouse Pizza"}'

curl -s -X POST $API_URL -H "Content-Type: application/json" -d '{"beer_id": "e853def3-0c1e-4b47-a63f-7319877f5cda", "name": "Sun King", "style": "Farmhouse Ale", "breweryId": "464cd09a-db11-47fd-b42d-d03d6c7fa7af", "breweryName": "Pinthouse Pizza"}'

curl -s -X POST $API_URL -H "Content-Type: application/json" -d '{"beer_id": "a5942295-330a-4f0a-9172-d8705f75c5f0", "name": "Ghost Machine", "style": "Pale Ale", "breweryId": "464cd09a-db11-47fd-b42d-d03d6c7fa7af", "breweryName": "Pinthouse Pizza"}'

curl -s -X POST $API_URL -H "Content-Type: application/json" -d '{"beer_id": "d04d33ef-da40-4ec3-a3a2-61b19fa313ff", "name": "Sun River", "style": "Farmhouse Ale", "breweryId": "464cd09a-db11-47fd-b42d-d03d6c7fa7af", "breweryName": "Pinthouse Pizza"}'

curl -s -X POST $API_URL -H "Content-Type: application/json" -d '{"beer_id": "919bd994-8d04-45a4-acd2-632acd1fbfca", "name": "Wild King", "style": "Blonde Ale", "breweryId": "465c7528-f622-4a8f-bd97-3d558d02b64b", "breweryName": "Real Ale Brewing Co."}'

curl -s -X POST $API_URL -H "Content-Type: application/json" -d '{"beer_id": "82e2801b-12c8-4abc-855d-fe61221cfb00", "name": "Dark King", "style": "Stout", "breweryId": "465c7528-f622-4a8f-bd97-3d558d02b64b", "breweryName": "Real Ale Brewing Co."}'

curl -s -X POST $API_URL -H "Content-Type: application/json" -d '{"beer_id": "14b3ad13-3e07-458e-8d45-4d56630c8c88", "name": "Sun River", "style": "Farmhouse Ale", "breweryId": "465c7528-f622-4a8f-bd97-3d558d02b64b", "breweryName": "Real Ale Brewing Co."}'

curl -s -X POST $API_URL -H "Content-Type: application/json" -d '{"beer_id": "33eaf45a-a8b1-4131-9c0e-7f643a907496", "name": "Wild River", "style": "ESB", "breweryId": "465c7528-f622-4a8f-bd97-3d558d02b64b", "breweryName": "Real Ale Brewing Co."}'

curl -s -X POST $API_URL -H "Content-Type: application/json" -d '{"beer_id": "23e81bda-bf60-4786-a922-70d8dd8091aa", "name": "Hop River", "style": "IPA", "breweryId": "0c57090c-af05-4301-b30c-41e871deb3c0", "breweryName": "Hi Sign Brewing"}'

curl -s -X POST $API_URL -H "Content-Type: application/json" -d '{"beer_id": "e958eb04-279a-4859-8ba4-b21509692b7f", "name": "Dark Machine", "style": "IPA", "breweryId": "0c57090c-af05-4301-b30c-41e871deb3c0", "breweryName": "Hi Sign Brewing"}'
