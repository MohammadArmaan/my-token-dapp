import React, { useEffect, useState, useRef } from "react";
import Web3 from "web3";
import EthContext from "./EthContext";

import MyToken from "../../contracts/MyToken.json";
import TokenSale from "../../contracts/MyTokenSale.json";
import KycContract from "../../contracts/KycContract.json";

function EthProvider({ children }) {
    const [account, setAccount] = useState(null);
    const [tokenSale, setTokenSale] = useState(null);
    const [myToken, setMyToken] = useState(null);
    const [kyc, setKyc] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // ✅ store web3 in a ref (not state)
    const web3Ref = useRef(null);

    useEffect(() => {
        const init = async () => {
            try {
                setIsLoading(true);

                // connect to web3 (MetaMask or Ganache)
                const web3 = new Web3(
                    Web3.givenProvider || "http://localhost:7545"
                );
                web3Ref.current = web3;

                // request accounts
                const accounts = await web3.eth.requestAccounts();
                setAccount(accounts[0]);

                // detect network
                const networkId = await web3.eth.net.getId();
                console.log("Connected network:", networkId);

                // Load contracts from artifacts
                const tokenSaleData = TokenSale.networks[networkId];
                const myTokenData = MyToken.networks[networkId];
                const kycData = KycContract.networks[networkId];

                if (tokenSaleData && myTokenData && kycData) {
                    setTokenSale(
                        new web3.eth.Contract(TokenSale.abi, tokenSaleData.address)
                    );
                    setMyToken(
                        new web3.eth.Contract(MyToken.abi, myTokenData.address)
                    );
                    setKyc(new web3.eth.Contract(KycContract.abi, kycData.address));
                } else {
                    console.error("❌ Contracts not deployed on this network");
                }
            } catch (err) {
                console.error("Error loading contracts:", err);
            } finally {
                setIsLoading(false);
            }
        };

        init();
    }, []);

    return (
        <EthContext.Provider
            value={{
                account,
                tokenSale,
                myToken,
                kyc,
                isLoading,
                web3: web3Ref.current, // ✅ pass ref value
            }}
        >
            {children}
        </EthContext.Provider>
    );
}

export default EthProvider;
