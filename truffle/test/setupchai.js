"use strict";
const chai = require("chai");
const BN = web3.utils.BN;
const chaiBN = require("chai-bn")(BN);

chai.use(chaiBN);

module.exports = chai;