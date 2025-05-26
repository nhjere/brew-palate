#!/bin/bash
API_URL="http://localhost:8080/api/user/reviews"
echo "Seeding reviews..."
curl -s -X POST $API_URL -H "Content-Type: application/json" -d '{"userId": "5866d6da-e4af-4f93-b1c7-d28f1de02101", "beerId": "82e2801b-12c8-4abc-855d-fe61221cfb00", "flavorBalance": 5, "mouthfeelQuality": 3, "aromaIntensity": 3, "finishQuality": 4, "overallEnjoyment": 3, "comment": "Unique profile with lots of character.", "flavorTags": ["bitter", "resinous"]}'

curl -s -X POST $API_URL -H "Content-Type: application/json" -d '{"userId": "4d795b87-0eca-48f8-a920-44be5af31f30", "beerId": "210db97c-decb-49f6-ab63-f0163730be2c", "flavorBalance": 1, "mouthfeelQuality": 5, "aromaIntensity": 3, "finishQuality": 4, "overallEnjoyment": 2, "comment": "Smooth profile with lots of character.", "flavorTags": ["roasty", "dark", "heavy"]}'

curl -s -X POST $API_URL -H "Content-Type: application/json" -d '{"userId": "9c9684f0-72b6-48e2-ab66-c0bee8d1d9b6", "beerId": "326c1cb4-c92e-4d3e-be41-dcc55176d78f", "flavorBalance": 5, "mouthfeelQuality": 5, "aromaIntensity": 3, "finishQuality": 5, "overallEnjoyment": 5, "comment": "Bold profile with a clean finish.", "flavorTags": ["bitter", "resinous"]}'

curl -s -X POST $API_URL -H "Content-Type: application/json" -d '{"userId": "400321f4-095d-44d7-bc26-2222c51d7823", "beerId": "82e2801b-12c8-4abc-855d-fe61221cfb00", "flavorBalance": 4, "mouthfeelQuality": 2, "aromaIntensity": 1, "finishQuality": 5, "overallEnjoyment": 1, "comment": "Unique profile with a clean finish.", "flavorTags": ["fruity", "crisp"]}'

curl -s -X POST $API_URL -H "Content-Type: application/json" -d '{"userId": "a42717ae-4991-4d50-8a5e-b2f944e346a7", "beerId": "de8f6b89-9f86-433e-91ae-e43cbb516d42", "flavorBalance": 5, "mouthfeelQuality": 5, "aromaIntensity": 1, "finishQuality": 3, "overallEnjoyment": 1, "comment": "Unique profile with lots of character.", "flavorTags": ["roasty", "dark", "heavy"]}'

curl -s -X POST $API_URL -H "Content-Type: application/json" -d '{"userId": "9c9684f0-72b6-48e2-ab66-c0bee8d1d9b6", "beerId": "e958eb04-279a-4859-8ba4-b21509692b7f", "flavorBalance": 4, "mouthfeelQuality": 4, "aromaIntensity": 3, "finishQuality": 2, "overallEnjoyment": 4, "comment": "Unique profile with a bitter aftertaste.", "flavorTags": ["caramel", "smooth"]}'

curl -s -X POST $API_URL -H "Content-Type: application/json" -d '{"userId": "8213ccd3-7881-41ee-999f-e74934a2f4f8", "beerId": "14b3ad13-3e07-458e-8d45-4d56630c8c88", "flavorBalance": 5, "mouthfeelQuality": 2, "aromaIntensity": 4, "finishQuality": 3, "overallEnjoyment": 4, "comment": "Unique profile with a clean finish.", "flavorTags": ["roasty", "dark", "heavy"]}'

curl -s -X POST $API_URL -H "Content-Type: application/json" -d '{"userId": "a42717ae-4991-4d50-8a5e-b2f944e346a7", "beerId": "ac506342-e360-496b-8062-341412946ffd", "flavorBalance": 1, "mouthfeelQuality": 5, "aromaIntensity": 2, "finishQuality": 3, "overallEnjoyment": 2, "comment": "Fresh profile with lots of character.", "flavorTags": ["malty", "bready"]}'

curl -s -X POST $API_URL -H "Content-Type: application/json" -d '{"userId": "5cc5dabc-6bdb-4a4b-861f-225924681502", "beerId": "ac506342-e360-496b-8062-341412946ffd", "flavorBalance": 3, "mouthfeelQuality": 5, "aromaIntensity": 4, "finishQuality": 5, "overallEnjoyment": 5, "comment": "Unique profile with a bitter aftertaste.", "flavorTags": ["malty", "bready"]}'

curl -s -X POST $API_URL -H "Content-Type: application/json" -d '{"userId": "400321f4-095d-44d7-bc26-2222c51d7823", "beerId": "210db97c-decb-49f6-ab63-f0163730be2c", "flavorBalance": 2, "mouthfeelQuality": 5, "aromaIntensity": 3, "finishQuality": 1, "overallEnjoyment": 2, "comment": "Smooth profile with lots of character.", "flavorTags": ["fruity", "crisp"]}'

curl -s -X POST $API_URL -H "Content-Type: application/json" -d '{"userId": "6606cafe-d65b-4631-bfa9-3f7c28222cb9", "beerId": "de8f6b89-9f86-433e-91ae-e43cbb516d42", "flavorBalance": 3, "mouthfeelQuality": 3, "aromaIntensity": 5, "finishQuality": 5, "overallEnjoyment": 4, "comment": "Bold profile with a clean finish.", "flavorTags": ["citrusy", "fresh"]}'

curl -s -X POST $API_URL -H "Content-Type: application/json" -d '{"userId": "400321f4-095d-44d7-bc26-2222c51d7823", "beerId": "e853def3-0c1e-4b47-a63f-7319877f5cda", "flavorBalance": 2, "mouthfeelQuality": 3, "aromaIntensity": 2, "finishQuality": 2, "overallEnjoyment": 3, "comment": "Bold profile with lots of character.", "flavorTags": ["fruity", "crisp"]}'

curl -s -X POST $API_URL -H "Content-Type: application/json" -d '{"userId": "5cc5dabc-6bdb-4a4b-861f-225924681502", "beerId": "00e5151a-cdf5-47ea-a43d-0f019a630e22", "flavorBalance": 2, "mouthfeelQuality": 1, "aromaIntensity": 5, "finishQuality": 4, "overallEnjoyment": 1, "comment": "Fresh profile with great aroma.", "flavorTags": ["balanced", "pine"]}'

curl -s -X POST $API_URL -H "Content-Type: application/json" -d '{"userId": "4d795b87-0eca-48f8-a920-44be5af31f30", "beerId": "a5942295-330a-4f0a-9172-d8705f75c5f0", "flavorBalance": 2, "mouthfeelQuality": 2, "aromaIntensity": 3, "finishQuality": 1, "overallEnjoyment": 4, "comment": "Smooth profile with a bitter aftertaste.", "flavorTags": ["balanced", "pine"]}'

curl -s -X POST $API_URL -H "Content-Type: application/json" -d '{"userId": "8213ccd3-7881-41ee-999f-e74934a2f4f8", "beerId": "210db97c-decb-49f6-ab63-f0163730be2c", "flavorBalance": 2, "mouthfeelQuality": 4, "aromaIntensity": 1, "finishQuality": 2, "overallEnjoyment": 1, "comment": "Strong profile with lots of character.", "flavorTags": ["caramel", "smooth"]}'

curl -s -X POST $API_URL -H "Content-Type: application/json" -d '{"userId": "9c9684f0-72b6-48e2-ab66-c0bee8d1d9b6", "beerId": "f9910a63-a3f5-4d02-bfe6-814fa3661448", "flavorBalance": 3, "mouthfeelQuality": 2, "aromaIntensity": 2, "finishQuality": 4, "overallEnjoyment": 2, "comment": "Unique profile with a bitter aftertaste.", "flavorTags": ["roasty", "dark", "heavy"]}'

curl -s -X POST $API_URL -H "Content-Type: application/json" -d '{"userId": "f5dccdd8-800b-45a8-8b62-59d454b1c137", "beerId": "210db97c-decb-49f6-ab63-f0163730be2c", "flavorBalance": 5, "mouthfeelQuality": 5, "aromaIntensity": 1, "finishQuality": 4, "overallEnjoyment": 5, "comment": "Unique profile with great aroma.", "flavorTags": ["fruity", "crisp"]}'

curl -s -X POST $API_URL -H "Content-Type: application/json" -d '{"userId": "5cc5dabc-6bdb-4a4b-861f-225924681502", "beerId": "14b3ad13-3e07-458e-8d45-4d56630c8c88", "flavorBalance": 5, "mouthfeelQuality": 5, "aromaIntensity": 2, "finishQuality": 4, "overallEnjoyment": 3, "comment": "Unique profile with great aroma.", "flavorTags": ["bitter", "resinous"]}'

curl -s -X POST $API_URL -H "Content-Type: application/json" -d '{"userId": "4d795b87-0eca-48f8-a920-44be5af31f30", "beerId": "de8f6b89-9f86-433e-91ae-e43cbb516d42", "flavorBalance": 4, "mouthfeelQuality": 2, "aromaIntensity": 2, "finishQuality": 3, "overallEnjoyment": 3, "comment": "Unique profile with a bitter aftertaste.", "flavorTags": ["roasty", "dark", "heavy"]}'

curl -s -X POST $API_URL -H "Content-Type: application/json" -d '{"userId": "400321f4-095d-44d7-bc26-2222c51d7823", "beerId": "c4be9cdc-adea-49f6-bbff-ddae22b82c33", "flavorBalance": 5, "mouthfeelQuality": 1, "aromaIntensity": 5, "finishQuality": 5, "overallEnjoyment": 2, "comment": "Bold profile with great aroma.", "flavorTags": ["bitter", "resinous"]}'

curl -s -X POST $API_URL -H "Content-Type: application/json" -d '{"userId": "9c9684f0-72b6-48e2-ab66-c0bee8d1d9b6", "beerId": "e853def3-0c1e-4b47-a63f-7319877f5cda", "flavorBalance": 4, "mouthfeelQuality": 3, "aromaIntensity": 5, "finishQuality": 4, "overallEnjoyment": 1, "comment": "Smooth profile with a bitter aftertaste.", "flavorTags": ["fruity", "crisp"]}'

curl -s -X POST $API_URL -H "Content-Type: application/json" -d '{"userId": "5866d6da-e4af-4f93-b1c7-d28f1de02101", "beerId": "e853def3-0c1e-4b47-a63f-7319877f5cda", "flavorBalance": 4, "mouthfeelQuality": 4, "aromaIntensity": 4, "finishQuality": 1, "overallEnjoyment": 2, "comment": "Fresh profile with a clean finish.", "flavorTags": ["balanced", "pine"]}'

curl -s -X POST $API_URL -H "Content-Type: application/json" -d '{"userId": "5cc5dabc-6bdb-4a4b-861f-225924681502", "beerId": "e853def3-0c1e-4b47-a63f-7319877f5cda", "flavorBalance": 4, "mouthfeelQuality": 1, "aromaIntensity": 2, "finishQuality": 5, "overallEnjoyment": 3, "comment": "Fresh profile with a bitter aftertaste.", "flavorTags": ["roasty", "dark", "heavy"]}'

curl -s -X POST $API_URL -H "Content-Type: application/json" -d '{"userId": "ebaf37ac-0971-476d-a9bb-4f42d37a2cef", "beerId": "210db97c-decb-49f6-ab63-f0163730be2c", "flavorBalance": 1, "mouthfeelQuality": 2, "aromaIntensity": 4, "finishQuality": 1, "overallEnjoyment": 4, "comment": "Smooth profile with lots of character.", "flavorTags": ["malty", "bready"]}'

curl -s -X POST $API_URL -H "Content-Type: application/json" -d '{"userId": "5cc5dabc-6bdb-4a4b-861f-225924681502", "beerId": "33eaf45a-a8b1-4131-9c0e-7f643a907496", "flavorBalance": 1, "mouthfeelQuality": 5, "aromaIntensity": 3, "finishQuality": 3, "overallEnjoyment": 5, "comment": "Bold profile with great aroma.", "flavorTags": ["citrusy", "fresh"]}'

curl -s -X POST $API_URL -H "Content-Type: application/json" -d '{"userId": "ebaf37ac-0971-476d-a9bb-4f42d37a2cef", "beerId": "82e2801b-12c8-4abc-855d-fe61221cfb00", "flavorBalance": 1, "mouthfeelQuality": 2, "aromaIntensity": 1, "finishQuality": 4, "overallEnjoyment": 4, "comment": "Strong profile with a clean finish.", "flavorTags": ["caramel", "smooth"]}'

curl -s -X POST $API_URL -H "Content-Type: application/json" -d '{"userId": "ebaf37ac-0971-476d-a9bb-4f42d37a2cef", "beerId": "e853def3-0c1e-4b47-a63f-7319877f5cda", "flavorBalance": 4, "mouthfeelQuality": 1, "aromaIntensity": 3, "finishQuality": 2, "overallEnjoyment": 2, "comment": "Smooth profile with a clean finish.", "flavorTags": ["roasty", "dark", "heavy"]}'

curl -s -X POST $API_URL -H "Content-Type: application/json" -d '{"userId": "a42717ae-4991-4d50-8a5e-b2f944e346a7", "beerId": "33eaf45a-a8b1-4131-9c0e-7f643a907496", "flavorBalance": 1, "mouthfeelQuality": 2, "aromaIntensity": 2, "finishQuality": 4, "overallEnjoyment": 4, "comment": "Fresh profile with lots of character.", "flavorTags": ["fruity", "crisp"]}'

curl -s -X POST $API_URL -H "Content-Type: application/json" -d '{"userId": "5cc5dabc-6bdb-4a4b-861f-225924681502", "beerId": "23e81bda-bf60-4786-a922-70d8dd8091aa", "flavorBalance": 3, "mouthfeelQuality": 4, "aromaIntensity": 4, "finishQuality": 4, "overallEnjoyment": 1, "comment": "Unique profile with a bitter aftertaste.", "flavorTags": ["juicy", "tropical"]}'

curl -s -X POST $API_URL -H "Content-Type: application/json" -d '{"userId": "5cc5dabc-6bdb-4a4b-861f-225924681502", "beerId": "c4be9cdc-adea-49f6-bbff-ddae22b82c33", "flavorBalance": 4, "mouthfeelQuality": 1, "aromaIntensity": 5, "finishQuality": 3, "overallEnjoyment": 5, "comment": "Fresh profile with great aroma.", "flavorTags": ["fruity", "crisp"]}'

curl -s -X POST $API_URL -H "Content-Type: application/json" -d '{"userId": "5866d6da-e4af-4f93-b1c7-d28f1de02101", "beerId": "f9910a63-a3f5-4d02-bfe6-814fa3661448", "flavorBalance": 3, "mouthfeelQuality": 1, "aromaIntensity": 3, "finishQuality": 3, "overallEnjoyment": 4, "comment": "Fresh profile with a bitter aftertaste.", "flavorTags": ["caramel", "smooth"]}'

curl -s -X POST $API_URL -H "Content-Type: application/json" -d '{"userId": "6606cafe-d65b-4631-bfa9-3f7c28222cb9", "beerId": "a5942295-330a-4f0a-9172-d8705f75c5f0", "flavorBalance": 1, "mouthfeelQuality": 1, "aromaIntensity": 1, "finishQuality": 4, "overallEnjoyment": 3, "comment": "Smooth profile with a clean finish.", "flavorTags": ["malty", "bready"]}'

curl -s -X POST $API_URL -H "Content-Type: application/json" -d '{"userId": "8213ccd3-7881-41ee-999f-e74934a2f4f8", "beerId": "ac506342-e360-496b-8062-341412946ffd", "flavorBalance": 3, "mouthfeelQuality": 1, "aromaIntensity": 5, "finishQuality": 1, "overallEnjoyment": 5, "comment": "Bold profile with a bitter aftertaste.", "flavorTags": ["malty", "bready"]}'

curl -s -X POST $API_URL -H "Content-Type: application/json" -d '{"userId": "4d795b87-0eca-48f8-a920-44be5af31f30", "beerId": "ac506342-e360-496b-8062-341412946ffd", "flavorBalance": 5, "mouthfeelQuality": 2, "aromaIntensity": 1, "finishQuality": 5, "overallEnjoyment": 5, "comment": "Strong profile with a bitter aftertaste.", "flavorTags": ["juicy", "tropical"]}'

curl -s -X POST $API_URL -H "Content-Type: application/json" -d '{"userId": "f5dccdd8-800b-45a8-8b62-59d454b1c137", "beerId": "a5942295-330a-4f0a-9172-d8705f75c5f0", "flavorBalance": 4, "mouthfeelQuality": 2, "aromaIntensity": 1, "finishQuality": 4, "overallEnjoyment": 5, "comment": "Bold profile with a clean finish.", "flavorTags": ["caramel", "smooth"]}'

curl -s -X POST $API_URL -H "Content-Type: application/json" -d '{"userId": "ebaf37ac-0971-476d-a9bb-4f42d37a2cef", "beerId": "210db97c-decb-49f6-ab63-f0163730be2c", "flavorBalance": 2, "mouthfeelQuality": 3, "aromaIntensity": 4, "finishQuality": 4, "overallEnjoyment": 4, "comment": "Smooth profile with lots of character.", "flavorTags": ["caramel", "smooth"]}'

curl -s -X POST $API_URL -H "Content-Type: application/json" -d '{"userId": "f5dccdd8-800b-45a8-8b62-59d454b1c137", "beerId": "33eaf45a-a8b1-4131-9c0e-7f643a907496", "flavorBalance": 1, "mouthfeelQuality": 5, "aromaIntensity": 3, "finishQuality": 3, "overallEnjoyment": 1, "comment": "Smooth profile with great aroma.", "flavorTags": ["bitter", "resinous"]}'

curl -s -X POST $API_URL -H "Content-Type: application/json" -d '{"userId": "6606cafe-d65b-4631-bfa9-3f7c28222cb9", "beerId": "326c1cb4-c92e-4d3e-be41-dcc55176d78f", "flavorBalance": 3, "mouthfeelQuality": 4, "aromaIntensity": 3, "finishQuality": 4, "overallEnjoyment": 4, "comment": "Unique profile with a bitter aftertaste.", "flavorTags": ["funky", "dry"]}'

curl -s -X POST $API_URL -H "Content-Type: application/json" -d '{"userId": "5866d6da-e4af-4f93-b1c7-d28f1de02101", "beerId": "326c1cb4-c92e-4d3e-be41-dcc55176d78f", "flavorBalance": 3, "mouthfeelQuality": 2, "aromaIntensity": 4, "finishQuality": 1, "overallEnjoyment": 2, "comment": "Smooth profile with lots of character.", "flavorTags": ["balanced", "pine"]}'

curl -s -X POST $API_URL -H "Content-Type: application/json" -d '{"userId": "4d795b87-0eca-48f8-a920-44be5af31f30", "beerId": "919bd994-8d04-45a4-acd2-632acd1fbfca", "flavorBalance": 5, "mouthfeelQuality": 4, "aromaIntensity": 2, "finishQuality": 4, "overallEnjoyment": 5, "comment": "Strong profile with a clean finish.", "flavorTags": ["citrusy", "fresh"]}'

curl -s -X POST $API_URL -H "Content-Type: application/json" -d '{"userId": "ebaf37ac-0971-476d-a9bb-4f42d37a2cef", "beerId": "23e81bda-bf60-4786-a922-70d8dd8091aa", "flavorBalance": 4, "mouthfeelQuality": 2, "aromaIntensity": 5, "finishQuality": 4, "overallEnjoyment": 3, "comment": "Unique profile with lots of character.", "flavorTags": ["citrusy", "fresh"]}'

curl -s -X POST $API_URL -H "Content-Type: application/json" -d '{"userId": "400321f4-095d-44d7-bc26-2222c51d7823", "beerId": "919bd994-8d04-45a4-acd2-632acd1fbfca", "flavorBalance": 2, "mouthfeelQuality": 1, "aromaIntensity": 2, "finishQuality": 4, "overallEnjoyment": 1, "comment": "Bold profile with a clean finish.", "flavorTags": ["sweet", "boozy"]}'

curl -s -X POST $API_URL -H "Content-Type: application/json" -d '{"userId": "f5dccdd8-800b-45a8-8b62-59d454b1c137", "beerId": "919bd994-8d04-45a4-acd2-632acd1fbfca", "flavorBalance": 5, "mouthfeelQuality": 1, "aromaIntensity": 5, "finishQuality": 4, "overallEnjoyment": 3, "comment": "Unique profile with a clean finish.", "flavorTags": ["fruity", "crisp"]}'

curl -s -X POST $API_URL -H "Content-Type: application/json" -d '{"userId": "8213ccd3-7881-41ee-999f-e74934a2f4f8", "beerId": "e958eb04-279a-4859-8ba4-b21509692b7f", "flavorBalance": 3, "mouthfeelQuality": 5, "aromaIntensity": 5, "finishQuality": 1, "overallEnjoyment": 5, "comment": "Smooth profile with a bitter aftertaste.", "flavorTags": ["roasty", "dark", "heavy"]}'

curl -s -X POST $API_URL -H "Content-Type: application/json" -d '{"userId": "a42717ae-4991-4d50-8a5e-b2f944e346a7", "beerId": "82e2801b-12c8-4abc-855d-fe61221cfb00", "flavorBalance": 1, "mouthfeelQuality": 5, "aromaIntensity": 1, "finishQuality": 1, "overallEnjoyment": 2, "comment": "Bold profile with a clean finish.", "flavorTags": ["funky", "dry"]}'

curl -s -X POST $API_URL -H "Content-Type: application/json" -d '{"userId": "9c9684f0-72b6-48e2-ab66-c0bee8d1d9b6", "beerId": "a5942295-330a-4f0a-9172-d8705f75c5f0", "flavorBalance": 2, "mouthfeelQuality": 3, "aromaIntensity": 2, "finishQuality": 4, "overallEnjoyment": 5, "comment": "Fresh profile with great aroma.", "flavorTags": ["malty", "bready"]}'

curl -s -X POST $API_URL -H "Content-Type: application/json" -d '{"userId": "6606cafe-d65b-4631-bfa9-3f7c28222cb9", "beerId": "210db97c-decb-49f6-ab63-f0163730be2c", "flavorBalance": 2, "mouthfeelQuality": 5, "aromaIntensity": 4, "finishQuality": 5, "overallEnjoyment": 2, "comment": "Strong profile with lots of character.", "flavorTags": ["bitter", "resinous"]}'

curl -s -X POST $API_URL -H "Content-Type: application/json" -d '{"userId": "400321f4-095d-44d7-bc26-2222c51d7823", "beerId": "33eaf45a-a8b1-4131-9c0e-7f643a907496", "flavorBalance": 3, "mouthfeelQuality": 4, "aromaIntensity": 1, "finishQuality": 3, "overallEnjoyment": 3, "comment": "Fresh profile with great aroma.", "flavorTags": ["citrusy", "fresh"]}'

curl -s -X POST $API_URL -H "Content-Type: application/json" -d '{"userId": "6606cafe-d65b-4631-bfa9-3f7c28222cb9", "beerId": "919bd994-8d04-45a4-acd2-632acd1fbfca", "flavorBalance": 4, "mouthfeelQuality": 4, "aromaIntensity": 4, "finishQuality": 2, "overallEnjoyment": 3, "comment": "Fresh profile with a clean finish.", "flavorTags": ["citrusy", "fresh"]}'

curl -s -X POST $API_URL -H "Content-Type: application/json" -d '{"userId": "400321f4-095d-44d7-bc26-2222c51d7823", "beerId": "de8f6b89-9f86-433e-91ae-e43cbb516d42", "flavorBalance": 5, "mouthfeelQuality": 1, "aromaIntensity": 2, "finishQuality": 5, "overallEnjoyment": 4, "comment": "Strong profile with lots of character.", "flavorTags": ["malty", "bready"]}'
