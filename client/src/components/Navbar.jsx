import { useState, useEffect } from "react";
import { useEth } from "../contexts/EthContext";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { FiCopy } from "react-icons/fi";

export default function Navbar() {
    const { account, web3, myToken } = useEth();
    const [balance, setBalance] = useState(null);
    const [copied, setCopied] = useState("");

    useEffect(() => {
        const fetchBalance = async () => {
            if (account && web3) {
                const bal = await web3.eth.getBalance(account);
                setBalance(
                    parseFloat(web3.utils.fromWei(bal, "ether")).toFixed(4)
                );
            }
        };
        fetchBalance();
    }, [account, web3]);

    const handleCopy = (text, label) => {
        navigator.clipboard.writeText(text);
        setCopied(`${label} copied!`);
        setTimeout(() => setCopied(""), 2000);
    };

    return (
        <nav className="nav">
            <DropdownMenu.Root>
                <DropdownMenu.Trigger className="wallet-control">
                    Account & Token Details
                </DropdownMenu.Trigger>

                <DropdownMenu.Content className="wallet-menu" sideOffset={5}>
                    {account && account.length > 0 ? (
                        <>
                            <DropdownMenu.Item
                                onClick={() =>
                                    handleCopy(account, "Account hash")
                                }
                                className="wallet-item"
                            >
                                Account: {account.slice(0, 6)}...
                                {account.slice(-4)}{" "}
                                <FiCopy className="copy-icon" />
                            </DropdownMenu.Item>

                            <DropdownMenu.Item className="wallet-item">
                                Balance:{" "}
                                {balance ? `${balance} ETH` : "Loading..."}
                            </DropdownMenu.Item>

                            {myToken && myToken._address && (
                                <DropdownMenu.Item
                                    onClick={() =>
                                        handleCopy(
                                            myToken._address,
                                            "myToken address"
                                        )
                                    }
                                    className="wallet-item"
                                >
                                    Token: {myToken._address.slice(0, 6)}...
                                    {myToken._address.slice(-4)}{" "}
                                    <FiCopy className="copy-icon" />
                                </DropdownMenu.Item>
                            )}
                        </>
                    ) : (
                        <DropdownMenu.Item className="wallet-item">
                            No wallet connected
                        </DropdownMenu.Item>
                    )}
                </DropdownMenu.Content>
            </DropdownMenu.Root>

            {copied && <p className="copied-msg">{copied}</p>}
        </nav>
    );
}
