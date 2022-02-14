# Bumblebee 🐝

![Node.js CI](https://github.com/RohitRajendran/bumblebee/workflows/Node.js%20CI/badge.svg) [![DeepScan grade](https://deepscan.io/api/teams/9267/projects/11565/branches/173076/badge/grade.svg)](https://deepscan.io/dashboard#view=project&tid=9267&pid=11565&bid=173076)

Have one of those directories in your building that calls your phone to buzz people in? Too lazy to answer the phone and press 9 everytime you need to let someone in? Now Bumblebee can take care of that for you! Using Twilio and Azure Functions, you can text the Twilio number to set time periods that Bumblebee should automatically buzz people in. Any calls when Bumblebee is not active will automatically forward to your phone.

Inspired by [https://github.com/mulka/buzzer](https://github.com/mulka/buzzer), Bumblebee was built using Firebase and Twilio.

![Example Image](./example-image.jpeg)

## Getting Started 🎬

1. Create a Twilio account and get a local number
1. Create a new Firebase project

## Running Locally 💻

This repo has dev containers set up to quickly get your developer environement set up. You can take advantage of this by setting up [Docker](https://www.docker.com/get-started), [VS Code](https://code.visualstudio.com/), and [the VS Code Remote - Containers extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers)

1. Login to firebase by running `firebase login`.
1. Fill in the necessary env variables in `local.json`. This will be used when run locally. Before deploying, you will want to set the environment variables using `npm run firebase:setConfig`.
1. Run `npm start` which will run both the functions and the realtime db locally.
1. To run tests and lint, you will need to navigate into the `functions` folder first.

## Env Variables 🔑

Configure these as env variables before deployment using `npm run firebase:setConfig` or convert `local.sample.json` to `local.json` for running locally.

| Variable             | Description                                                   |
| -------------------- | ------------------------------------------------------------- |
| `BUZZER_NUMBER`      | The number that the call will come from for buzzing in people |
|                      |
| `TWILIO_ACCOUNT_SID` | Twilio account SID which can be found on the Twilio console   |
| `TWILIO_AUTH_TOKEN`  | Twilio auth token which can be found on the Twilio console    |
| `TWILIO_NUMBER`      | Twilio phone number                                           |
| `URL`                | The url that the Azure Function will be deployed to           |
