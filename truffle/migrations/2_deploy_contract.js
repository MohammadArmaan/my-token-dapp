const MyToken = artifacts.require("MyToken");
const MyTokenSale = artifacts.require("MyTokenSale");
const MYKycContract = artifacts.require("KycContract");

require("dotenv").config({ path: "./../.env" });

module.exports = async function (deployer) {
    let address = await web3.eth.getAccounts();

    const tokens = web3.utils.toWei(process.env.INITIAL_TOKENS, "ether");

    await deployer.deploy(MYKycContract, address[0]);
    await deployer.deploy(MyToken, tokens);
    await deployer.deploy(MyTokenSale, 1, address[0], MyToken.address, MYKycContract.address);

    const instance = await MyToken.deployed();

    const totalSupply = await instance.totalSupply();
    await instance.transfer(MyTokenSale.address, totalSupply);
};
