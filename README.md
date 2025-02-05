<div align="center">
  <h1>CREDEBL Mobile SSI Wallet</h1>
</div>

## Prerequisites

- Set-up requires [Node.js](https://nodejs.org/en/download/) to be installed on your computer.
  - The `ADEYA SSI Wallet` requires `Node.js v18` to build the project. You can either manually install Node version 18, or you can use a version manager like [nvm](https://github.com/nvm-sh/nvm)
- We use [Yarn](https://yarnpkg.com) as our package manager.
- We use [CocoaPods](https://cocoapods.org/) for `iOS` dependency management.

---

## Env Variables

```bash
MEDIATOR_URL=
# Use push notifications for mediator only if we have the mediator with push notification enabled
MEDIATOR_USE_PUSH_NOTIFICATIONS=true
MEDIATOR_LABEL=Mediator
# Use OCA(Overlay Credential Architecture) for app if we have a valid OCA url with json file
OCA_URL=
#BASE_URL
PUBLIC_ORG=https://example.com
```

---

## Getting Started

- Clone the repository

```bash
git clone https://github.com/credebl/adeya-wallet.git
```

- Move to the project directory

```bash
cd adeya-wallet
```

- Install dependencies

```bash
yarn
```

- Install `iOS` dependencies

```bash
cd ios && pod install && cd ..
```

- Run the project

```bash
yarn start
```

- Run the project on `iOS`

```bash
yarn ios
```

- Run the project on `Android`

```bash
yarn android
```

---

## Indy Ledgers Supported

- bcovrin:test
- indicio
- indicio:test
- indicio:demo
- sovrin:builder
- sovrin:staging
- sovrin
- candy:dev
- candy:test
- candy

> Note: If you want add any additional indy ledger, you can add it in `configs/ledgers/indy/ledgers.json` file.

---

## Contributing

We welcome contributions from the community to improve ADEYA SSI Wallet. If you'd like to contribute, please follow these guidelines:

1. Fork the repository and create a new branch for your feature or bug fix.
2. Raise an issue for the feature or bug fix.
3. Make your changes and ensure that your code follows the project's coding style.
4. Commit your changes and push your branch to GitHub.
5. Submit a pull request with a clear description of your changes and their purpose

---

## Get help

* Get help, request features and report bugs: <a href="https://github.com/orgs/credebl/discussions" target="_blank">GitHub Discussions</a> | <a href="https://docs.credebl.id" target="_blank">docs.credebl.id</a>



## License

This project is licensed under the Apache License - see the [LICENSE](./LICENSE.md) file for details.
