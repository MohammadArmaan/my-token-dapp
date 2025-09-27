import React, { useEffect, useState } from "react";
import useEth from "./contexts/EthContext/useEth";
import { toast } from "sonner";
import { formatAddress } from "./lib/utils";

export default function App() {
    const { isLoading, kyc, account, tokenSale, web3, myToken } = useEth();
    const [kycAddress, setKycAddress] = useState("");
    const [tokens, setTokens] = useState(undefined);
    const [isWhiteListing, setIsWhiteListing] = useState(false);
    const [isTokenPaymentLoading, setIsTokenPaymentLoading] = useState(false);
    const [userTokens, setUserTokens] = useState(undefined);

    useEffect(() => {
        async function updateUserTokens() {
            if (myToken && account) {
                try {
                    const userTokensInstance = await myToken.methods
                        .balanceOf(account)
                        .call();
                    console.log("User tokens:", userTokensInstance);
                    setUserTokens(userTokensInstance);
                } catch (err) {
                    console.error("Error fetching user tokens:", err);
                }
            }
        }
        updateUserTokens();
    }, [account, myToken]);

    async function handleKycWhitelisting() {
        setIsWhiteListing(true);
        await kyc.methods.setKycCompleted(kycAddress).send({ from: account });
        toast.success(`KYC for ${formatAddress(kycAddress)} is completed! 👍`);
        setIsWhiteListing(false);
    }

    async function handleTokenPayment() {
        setIsTokenPaymentLoading(true);
        try {
            await web3.eth.sendTransaction({
                from: account,
                to: tokenSale._address,
                value: tokens,
            });
            toast.success(`You bought ${tokens} CAPPU Tokens! 🎉`);

            const newBalance = await myToken.methods.balanceOf(account).call();
            setUserTokens(newBalance);
        } catch (err) {
            toast.error("Transaction failed ❌");
            console.error(err);
        } finally {
            setIsTokenPaymentLoading(false);
        }
    }

    async function handleBuyMoreTokens() {
        setIsTokenPaymentLoading(true);
        try {
            await tokenSale.methods.buyTokens(account).send({
                from: account,
                to: tokenSale._address,
                value: web3.utils.toWei("1", "wei"),
            });
            toast.success("You bought 1 CAPPU Token! 🎉");

            const newBalance = await myToken.methods.balanceOf(account).call();
            setUserTokens(newBalance);
        } catch (err) {
            toast.error("Transaction failed ❌");
            console.error(err);
        } finally {
            setIsTokenPaymentLoading(false);
        }
    }

    if (isLoading) {
        return (
            <div className="loading">
                <div className="loading-spinner"></div>
                <div >Loading contracts, please wait…</div>
            </div>
        );
    }

    return (
        <div className="section">
            <h1>Cappucino Token Sale</h1>
            <div className="container">
                <h2>KYC Whitelisting</h2>
                <div className="group">
                    <p className="note">Get Your Tokens today!</p>
                    <div className="group">
                        <label htmlFor="kycAddress">Address to Allow:</label>
                        <input
                            type="text"
                            name="kycAddress"
                            id="kycAddress"
                            value={kycAddress}
                            onChange={(e) => setKycAddress(e.target.value)}
                            disabled={isWhiteListing}
                        />
                    </div>
                    <button
                        type="button"
                        disabled={isWhiteListing}
                        onClick={handleKycWhitelisting}
                    >
                        {!isWhiteListing
                            ? "Add to Whitelist"
                            : "Whitelisting..."}
                    </button>
                </div>
            </div>

            <div className="container">
                <h2>Buy Tokens</h2>
                <p className="note">
                    1 Token = 1 Wei or (10 <sup>-18</sup> ETH)
                </p>
                <div className="group">
                    <input
                        type="text"
                        value={tokenSale._address}
                        disabled={true}
                        id="tokenAddress"
                    />
                    <input
                        type="text"
                        value={tokens}
                        onChange={(e) => setTokens(e.target.value)}
                        id="tokens"
                        placeholder="Enter number of tokens"
                        disabled={isTokenPaymentLoading}
                        required
                    />
                    <button
                        onClick={handleTokenPayment}
                        disabled={isTokenPaymentLoading}
                    >
                        {!isTokenPaymentLoading
                            ? "Buy Tokens"
                            : "Buying Tokens..."}
                    </button>
                </div>
            </div>
            <div className="container">
                <h2>Your Tokens</h2>
                <p className="note">
                    You currently have {userTokens} CAPPU Tokens
                </p>
                <div className="group">
                    <button
                        onClick={handleBuyMoreTokens}
                        disabled={isTokenPaymentLoading}
                    >
                        {!isTokenPaymentLoading
                            ? "Buy More Tokens"
                            : "Buying Tokens..."}
                    </button>
                </div>
            </div>
        </div>
    );
}
