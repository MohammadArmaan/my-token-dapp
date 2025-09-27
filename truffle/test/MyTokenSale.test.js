const TokenSale = artifacts.require("MyTokenSale");
const Token = artifacts.require("MyToken");
const KycContract = artifacts.require("KycContract");

const chai = require("./setupchai");
const BN = web3.utils.BN;
const expect = chai.expect;

require("dotenv").config({ path: "./../.env" });

contract("TokenSale Test", async (accounts) => {
    const [deployerAccount, recipient] = accounts;

    it("Should not have any tokens in a fresh account", async () => {
        let instance = await Token.deployed();
        const freshAccount = accounts[5]; // Use an unused account

        return expect(
            await instance.balanceOf(freshAccount)
        ).to.be.a.bignumber.equal(new BN(0));
    });

    it("All tokens should be in the TokenSale Smart Contract by default", async () => {
        let instance = await Token.deployed();
        let balanceOfTokenSale = await instance.balanceOf(TokenSale.address);
        let totalSupply = await instance.totalSupply();
        return expect(balanceOfTokenSale).to.be.a.bignumber.equal(totalSupply);
    });

    it("Should be possible to buy tokens", async () => {
        let tokenInstance = await Token.deployed();
        let tokenSaleInstance = await TokenSale.deployed();
        let kycInstance = await KycContract.deployed();

        let balanceBefore = new BN(
            await tokenInstance.balanceOf(deployerAccount)
        );

        await kycInstance.setKycCompleted(deployerAccount, {
            from: deployerAccount,
        });

        await tokenSaleInstance.sendTransaction({
            from: deployerAccount,
            value: web3.utils.toWei("1", "wei"),
        });

        let balanceAfter = new BN(
            await tokenInstance.balanceOf(deployerAccount)
        );

        expect(balanceAfter).to.be.a.bignumber.equal(
            balanceBefore.add(new BN(1))
        );
    });
});
