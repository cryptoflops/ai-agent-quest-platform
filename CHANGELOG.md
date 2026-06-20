# Changelog

## 1.0.0 (2026-06-20)


### Features

* add create quest page and link from dashboard ([ebd5698](https://github.com/cryptoflops/ai-agent-quest-platform/commit/ebd569823322265542f40aa043166aaf13a84671))
* Add dynamic network switching ([0dc97be](https://github.com/cryptoflops/ai-agent-quest-platform/commit/0dc97be4d1a7d0157fddfe5a57d7383fabc83ba4))
* Add x402-stacks Agent Playground to frontend and fix CORS on server ([092240b](https://github.com/cryptoflops/ai-agent-quest-platform/commit/092240b2fcd715cdbcc330e5563f7a784aec9f28))
* **frontend:** implement global layout and user dashboard architecture ([bfa7fd6](https://github.com/cryptoflops/ai-agent-quest-platform/commit/bfa7fd60a1f4de739bc0d690ec88089f34b7f6dd))
* integrate stacks sdk utilities for enhanced connectivity ([99a7d9e](https://github.com/cryptoflops/ai-agent-quest-platform/commit/99a7d9e0b0fd64616b332f17ac1adc25e00d8542))
* integrate x402-stacks payment middleware in MCP server ([be0b0fb](https://github.com/cryptoflops/ai-agent-quest-platform/commit/be0b0fbea6e50c4a65a66ded8221a8680bbe279f))
* switch to Mainnet contract address ([b692fd5](https://github.com/cryptoflops/ai-agent-quest-platform/commit/b692fd58803676ad57d668856bbd278374b74f9b))


### Bug Fixes

* add webpack fallbacks for crypto and stream ([63660c9](https://github.com/cryptoflops/ai-agent-quest-platform/commit/63660c9545bf1b155c7c5a4ec978916fd18e9ca8))
* Always render network toggle independently of session state ([1c4ac5c](https://github.com/cryptoflops/ai-agent-quest-platform/commit/1c4ac5c43012ffcb1bec486cab5b82e53ad77296))
* **build:** force webpack in build script to support custom config ([dc2d04f](https://github.com/cryptoflops/ai-agent-quest-platform/commit/dc2d04f8493bdd7943139593b951ba53b3abbcc7))
* **deps:** downgrade @stacks/connect to 7.3.1 and revert to static import ([149b684](https://github.com/cryptoflops/ai-agent-quest-platform/commit/149b6841432238c9c6ab85dc019b65b0f51cf2b2))
* disable reactCompiler, add transpilePackages, use standalone output ([5866ed2](https://github.com/cryptoflops/ai-agent-quest-platform/commit/5866ed24eac4016dc41aa4b89da6dfc3d66402ce))
* **frontend:** resolve Stacks SDK authentication and tuple parsing type errors ([07fd6bd](https://github.com/cryptoflops/ai-agent-quest-platform/commit/07fd6bdaf3aa153b414330947602d39b17785f64))
* **frontend:** serialize Stacks transaction payloads to hex out-of-band to bypass Connect API type collision ([225d40e](https://github.com/cryptoflops/ai-agent-quest-platform/commit/225d40e051753d1ebe369298f53780ce1e07ffce))
* lazy initialize AppConfig to avoid top-level side effects ([5a8046c](https://github.com/cryptoflops/ai-agent-quest-platform/commit/5a8046cad5a5503741e564786593450d6e9a610e))
* remove unsupported --webpack flag from Next.js 15 scripts ([942b4ee](https://github.com/cryptoflops/ai-agent-quest-platform/commit/942b4eecc871ea04fd2601a6ec118bf77fdfe948))
* resolve StacksMainnet import type error for CI compliance ([388335a](https://github.com/cryptoflops/ai-agent-quest-platform/commit/388335af337d91281d1953f381f8ab4883dbc598))
* use correct stacks network import for sdk v6 compatibility ([1e0450d](https://github.com/cryptoflops/ai-agent-quest-platform/commit/1e0450da4a47b4cc9940dcb14ed70fcfe892d654))
* **wallet:** add safety checks and logs for showConnect import ([d3fa897](https://github.com/cryptoflops/ai-agent-quest-platform/commit/d3fa897e5c790d956a91a2c84adfb825f54debb6))
* **wallet:** handle corrupted session data by signing out ([bbfa93d](https://github.com/cryptoflops/ai-agent-quest-platform/commit/bbfa93d0924025162dada784f6cc354071a5dbf1))
* **wallet:** use dynamic import for showConnect to avoid runtime errors ([7e53e13](https://github.com/cryptoflops/ai-agent-quest-platform/commit/7e53e13d44ba05db0a01f9934315c513fd955d69))
