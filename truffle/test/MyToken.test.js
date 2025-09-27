const Token = artifacts.require("MyToken");

const chai = require("chai");
const BN = web3.utils.BN;
const chaiBN = require("chai-bn")(BN);

require("dotenv").config({ path: "./../.env" });

chai.use(chaiBN);

const expect = chai.expect;

contract("Token Test", async (accounts) => {
    const [deployerAccount, recipient] = accounts;
    let tokenInstance;

    beforeEach(async () => {
        // Deploy a fresh instance for each test
        tokenInstance = await Token.new(process.env.INITIAL_TOKENS);
    });

    it("All Tokens should be in my account", async () => {
        let totalSupply = await tokenInstance.totalSupply();

        return expect(await tokenInstance.balanceOf(deployerAccount))
            .to.be.a.bignumber.equal(totalSupply);
    });

    it("Is possible to send tokens between accounts", async () => {
        const sendTokens = new BN(1);
        let totalSupply = await tokenInstance.totalSupply();

        expect(await tokenInstance.balanceOf(deployerAccount))
            .to.be.a.bignumber.equal(totalSupply);

        await tokenInstance.transfer(recipient, sendTokens);

        expect(await tokenInstance.balanceOf(deployerAccount))
            .to.be.a.bignumber.equal(totalSupply.sub(sendTokens));

        return expect(await tokenInstance.balanceOf(recipient))
            .to.be.a.bignumber.equal(sendTokens);
    });

    it("Is not possible to send more tokens than available in total", async () => {
        let balanceOfDeployer = await tokenInstance.balanceOf(deployerAccount);

        try {
            await tokenInstance.transfer(recipient, balanceOfDeployer.add(new BN(1)));
            assert.fail("Transfer should have thrown");
        } catch (err) {
            expect(err.message).to.include("revert");
        }

        return expect(await tokenInstance.balanceOf(deployerAccount))
            .to.be.a.bignumber.equal(balanceOfDeployer);
    });
});