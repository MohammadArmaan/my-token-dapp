require("dotenv").config({ path: "./.env" });
const HDWalletProvider = require("@truffle/hdwallet-provider");

const SEPOLIA_URL = process.env.SEPOLIA_URL || "";
const PRIVATE_KEY = process.env.PRIVATE_KEY || "";

console.log(SEPOLIA_URL, PRIVATE_KEY);

module.exports = {
    contracts_build_directory: "../client/src/contracts",
    networks: {
        development: {
            host: "127.0.0.1",
            port: 7545,
            network_id: "*", // Match any network id
            gas: 6721975,
            gasPrice: 20000000000, // 20 gwei
        },
        sepolia: {
            provider: () => new HDWalletProvider([PRIVATE_KEY], SEPOLIA_URL),
            network_id: 11155111,
            confirmations: 2,
            timeoutBlocks: 200,
            networkCheckTimeout: 100000,
            skipDryRun: true,
        },
    },

    compilers: {
        solc: {
            version: "^0.8.19", // Stable version
            settings: {
                optimizer: {
                    enabled: false,
                    runs: 200,
                },
                evmVersion: "byzantium", // Try this if you're having issues
            },
        },
    },
};
