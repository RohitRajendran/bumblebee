# Bumblebee

## Requirements

- Azure
- Firebase Realtime DB
- NodeJS

## Running Locally

1. Install dependencies with `npm i`
1. Convert `local.sample.json` to `local.json` and fill in the env variables
1. To run locally: `npm start`

## Env Variables

Pass these in as env variables during build or convert `local.sample.json` to `local.json` for running locally

- `AZURE_CLIENT_ID` - Azure client id
- `AZURE_CLIENT_SECRET` - Azure client secret
- `AZURE_SUBSCRIPTION_ID` - Azure subscription id
- `AZURE_TENANT_ID` - Azure tenant id
- `BUZZER_NUMBER` - The number that the call will come from for buzzing in people
- `FIREBASE_CLIENT_EMAIL` - Firebase client email
- `FIREBASE_PRIVATE_KEY` - Firebase private key
- `FIREBASE_PROJECT_ID` - Firebase project id
- `FIREBASE_URL` - Firebase url
- `TWILIO_ACCOUNT_SID` - Twilio account SID
- `TWILIO_AUTH_TOKEN` - Twilio auth token
- `TWILIO_NUMBER` - Twilio phone number
- `URL` - Url for where this is deployed

## Azure Functions

Refer to [Serverless docs](https://serverless.com/framework/docs/providers/azure/guide/intro/) for more information.
