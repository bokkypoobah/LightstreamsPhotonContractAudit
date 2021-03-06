const chai = require('chai')
let LightstreamsToken = artifacts.require("LightstreamsToken");
let TeamDistribution = artifacts.require("distribution/TeamDistribution");
let LightstreamsCrowdsale = artifacts.require("LightstreamsCrowdsale");
chai.use(require('chai-as-promised'))
const assert = chai.assert;

const timeTravel = function (time) {
  return new Promise((resolve, reject) => {
    web3.currentProvider.sendAsync({
      jsonrpc: "2.0",
      method: "evm_increaseTime",
      params: [time], // 86400 is num seconds in day
      id: new Date().getTime()
    }, (err, result) => {
      if (err) {
        return reject(err)
      }
      return resolve(result)
    });
  })
};

const mineBlock = function () {
  return new Promise((resolve, reject) => {
    web3.currentProvider.sendAsync({
      jsonrpc: "2.0",
      method: "evm_mine"
    }, (err, result) => {
      if (err) {
        return reject(err)
      }
      return resolve(result)
    });
  })
};

const convertFromBnToInt = function (bn) {
  return Number(web3._extend.utils.fromWei(bn.toNumber(), 'ether'));
}

const convertEtherToWeiBN = function (ether) {
  const etherInWei = web3._extend.utils.toWei(ether, 'ether');
  return web3._extend.utils.toBigNumber(etherInWei);
}

const intToBN = function(i) {
  return web3._extend.utils.toBigNumber(i);
}

const RATE = 1000;

const VESTING_SCHEDULE = {
  startTimestamp: 0,
  endTimestamp: 1,
  lockPeriod: 2,
  initialAmount: 3,
  initialAmountClaimed: 4,
  initialBalance: 5,
  initialBonus: 6,
  bonusClaimed: 7,
  bonusBalance: 8,
  revocable: 9,
  revoked: 10
};

contract('Crowdsale', async (accounts) => {
  const OWNER_ACCOUNT = accounts[0];
  const CONTRIBUTOR_1_ACCOUNT = accounts[1];
  const CONTRIBUTOR_2_ACCOUNT = accounts[2];
  const CONTRIBUTOR_3_ACCOUNT = accounts[3];
  const CONTRIBUTOR_4_ACCOUNT = accounts[4];
  const CONTRIBUTOR_5_ACCOUNT = accounts[5];
  const CONTRIBUTOR_6_ACCOUNT = accounts[6];
  const MINT_ACCOUNT_1 = accounts[7];
  const MINT_ACCOUNT_2 = accounts[8];
  const MINT_ACCOUNT_3 = accounts[9];

  it('should deploy the token and store the address', async () => {
    const tokenInstance = await LightstreamsToken.deployed();
    assert.isDefined(tokenInstance.address, 'Token address couldn\'t be stored');
  });

  it('should transfer the ownership of token to the crowdsale contract so it can mint tokens', async () => {
    const tokenInstance = await LightstreamsToken.deployed();
    const transferOwnership = await tokenInstance.transferOwnership(LightstreamsCrowdsale.address);
    const owner = await tokenInstance.owner();

    assert.equal(LightstreamsCrowdsale.address, owner, 'The owner of the token was not updated to the crowdsale contact');
  });

  it('should the owner should not be able to transfer the ownership of token now that it has been assigned to the sales contract', async () => {
    const tokenInstance = await LightstreamsToken.deployed();

    return assert.isRejected(tokenInstance.transferOwnership(MINT_ACCOUNT_3));
  });

  it('The owner should be able to add an address to the whitelist', async () => {
    const crowdsaleInstance = await LightstreamsCrowdsale.deployed();

    const transaction = await crowdsaleInstance.addAddressToWhitelist(CONTRIBUTOR_1_ACCOUNT);
    const whitelisted = await crowdsaleInstance.whitelist(CONTRIBUTOR_1_ACCOUNT);

    assert.isTrue(whitelisted, 'Address not added to whitelist');
  });

  it('The owner should be able to remove an address from the whitelist', async () => {
    const crowdsaleInstance = await LightstreamsCrowdsale.deployed();

    const removeTransaction = await crowdsaleInstance.removeAddressFromWhitelist(CONTRIBUTOR_1_ACCOUNT);
    const whitelisted = await crowdsaleInstance.whitelist(CONTRIBUTOR_1_ACCOUNT)

    assert.equal(whitelisted, false, 'Address not added to whitelist');

    // add back to whitelist
    return crowdsaleInstance.addAddressToWhitelist(CONTRIBUTOR_1_ACCOUNT);
  });

  it('The owner should be able to add multiple addresses to the whitelist', async () => {
    const crowdsaleInstance = await LightstreamsCrowdsale.deployed();

    const transaction = await crowdsaleInstance.addAddressesToWhitelist([CONTRIBUTOR_2_ACCOUNT, CONTRIBUTOR_3_ACCOUNT, CONTRIBUTOR_4_ACCOUNT, CONTRIBUTOR_5_ACCOUNT, CONTRIBUTOR_6_ACCOUNT]);

    const whitelisted2 = await crowdsaleInstance.whitelist(CONTRIBUTOR_2_ACCOUNT);
    const whitelisted3 = await crowdsaleInstance.whitelist(CONTRIBUTOR_3_ACCOUNT);
    const whitelisted4 = await crowdsaleInstance.whitelist(CONTRIBUTOR_4_ACCOUNT);
    const whitelisted5 = await crowdsaleInstance.whitelist(CONTRIBUTOR_5_ACCOUNT);

    assert.equal(whitelisted2, true, 'Address 2 not added to whitelist');
    assert.equal(whitelisted3, true, 'Address 3 not added to whitelist');
    assert.equal(whitelisted4, true, 'Address 4 not added to whitelist');
    assert.equal(whitelisted5, true, 'Address 5 not added to whitelist');
  });

  it('The owner should be able to remove multiple addresses to the whitelist', async () => {
    const crowdsaleInstance = await LightstreamsCrowdsale.deployed();

    const transaction = await crowdsaleInstance.removeAddressesFromWhitelist([CONTRIBUTOR_2_ACCOUNT, CONTRIBUTOR_3_ACCOUNT, CONTRIBUTOR_4_ACCOUNT, CONTRIBUTOR_5_ACCOUNT, CONTRIBUTOR_6_ACCOUNT]);

    const whitelisted2 = await crowdsaleInstance.whitelist(CONTRIBUTOR_2_ACCOUNT);
    const whitelisted3 = await crowdsaleInstance.whitelist(CONTRIBUTOR_3_ACCOUNT);
    const whitelisted4 = await crowdsaleInstance.whitelist(CONTRIBUTOR_4_ACCOUNT);
    const whitelisted5 = await crowdsaleInstance.whitelist(CONTRIBUTOR_5_ACCOUNT);

    assert.equal(whitelisted2, false, 'Address 2 not removed from whitelist');
    assert.equal(whitelisted3, false, 'Address 3 not removed from whitelist');
    assert.equal(whitelisted4, false, 'Address 4 not not removed from whitelist');
    assert.equal(whitelisted5, false, 'Address 5 not not removed from whitelist');
  });

  it('The owner should be able to add back multiple addresses to the whitelist', async () => {
    const crowdsaleInstance = await LightstreamsCrowdsale.deployed();

    const transaction = await crowdsaleInstance.addAddressesToWhitelist([CONTRIBUTOR_2_ACCOUNT, CONTRIBUTOR_3_ACCOUNT, CONTRIBUTOR_4_ACCOUNT, CONTRIBUTOR_5_ACCOUNT, CONTRIBUTOR_6_ACCOUNT]);

    const whitelisted2 = await crowdsaleInstance.whitelist(CONTRIBUTOR_2_ACCOUNT);
    const whitelisted3 = await crowdsaleInstance.whitelist(CONTRIBUTOR_3_ACCOUNT);
    const whitelisted4 = await crowdsaleInstance.whitelist(CONTRIBUTOR_4_ACCOUNT);
    const whitelisted5 = await crowdsaleInstance.whitelist(CONTRIBUTOR_5_ACCOUNT);

    assert.equal(whitelisted2, true, 'Address 2 not added to whitelist');
    assert.equal(whitelisted3, true, 'Address 3 not added to whitelist');
    assert.equal(whitelisted4, true, 'Address 4 not added to whitelist');
    assert.equal(whitelisted5, true, 'Address 5 not added to whitelist');
  });


  it('Only the owner should be able to add an address to the whitelist', async () => {
    const crowdsaleInstance = await LightstreamsCrowdsale.deployed();

    return assert.isRejected(crowdsaleInstance.addAddressToWhitelist(CONTRIBUTOR_1_ACCOUNT, {from: CONTRIBUTOR_1_ACCOUNT}));
  });

  it('The owner should be able to update the rate at which tokens are minted per wei sent in', async () => {
    const crowdsaleInstance = await LightstreamsCrowdsale.deployed();

    const updateRate = await crowdsaleInstance.updateRate(RATE, {from: OWNER_ACCOUNT});
    const updatedRateBN = await crowdsaleInstance.rate.call();
    const updatedRate = updatedRateBN.toNumber();

    assert.equal(RATE, updatedRate);
  });

  it('The owner should not be able to update the rate more than 10 percent up', async () => {
    const crowdsaleInstance = await LightstreamsCrowdsale.deployed();

    return assert.isRejected(crowdsaleInstance.updateRate(RATE * 1.11, { from: OWNER_ACCOUNT }));
  });

  it('The owner should not be able to update the rate more than 10 percent lower', async () => {
    const crowdsaleInstance = await LightstreamsCrowdsale.deployed();

    return assert.isRejected(crowdsaleInstance.updateRate(RATE * .89, {from: OWNER_ACCOUNT}));
  });

  it('Only the owner should be able to update the rate at which tokens are minted per wei sent in', async () => {
    const crowdsaleInstance = await LightstreamsCrowdsale.deployed();

    return assert.isRejected(crowdsaleInstance.updateRate(RATE, {from: CONTRIBUTOR_2_ACCOUNT}));
  });

  it('An address on the whitelist and purchasing in the first 2 days should get a 30 percent bonus', async () => {
    const crowdsaleInstance = await LightstreamsCrowdsale.deployed();
    const tokenInstance = await LightstreamsToken.deployed();
    const etherInBn = convertEtherToWeiBN(1);

    // Time travel one day into the future so the sale has started
    const timeTravelTransaction = await timeTravel(3600 * 24 * 1);
    const mineBlockTransaction = await mineBlock(); // workaround for https://github.com/ethereumjs/testrspc/issues/336

    // BEFORE TRANSACTION
    // Get the balance of the owner wallet before the buying tokens transaction
    const walletEthBalanceBeforeBN = await web3.eth.getBalance(OWNER_ACCOUNT);
    const walletEthBalanceBefore = convertFromBnToInt(walletEthBalanceBeforeBN);

    // BUY TOKENS TRANSACTION
    const buyTokens = await crowdsaleInstance.buyTokens(CONTRIBUTOR_1_ACCOUNT, {
      from: CONTRIBUTOR_1_ACCOUNT,
      value: etherInBn
    });

    // AFTER TRANSACTION
    // Get the balances of everything after the buy transaction
    // PTH
    const contractPHTBalanceBN = await tokenInstance.balanceOf(LightstreamsCrowdsale.address);
    const contractPTHBalance = convertFromBnToInt(contractPHTBalanceBN);
    // ETH
    const walletEthBalanceAfterBN = await web3.eth.getBalance(OWNER_ACCOUNT);
    const walletEthBalanceAfter = convertFromBnToInt(walletEthBalanceAfterBN);
    // VESTING SCHEDULE
    const vestingSchedule = await crowdsaleInstance.vestingSchedules(CONTRIBUTOR_1_ACCOUNT);
    const vestedInitialAmount = convertFromBnToInt(vestingSchedule[VESTING_SCHEDULE.initialAmount]);
    const vestedBonus = convertFromBnToInt(vestingSchedule[VESTING_SCHEDULE.initialBonus]);

    assert.equal(1300, contractPTHBalance);
    assert.equal(1000, vestedInitialAmount);
    assert.equal(300, vestedBonus);
    assert.equal(walletEthBalanceBefore + 1, walletEthBalanceAfter);
  });

  it('The owner should be able mint an initial amount and bonus for a whitelisted address', async () => {
    const crowdsaleInstance = await LightstreamsCrowdsale.deployed();
    const tokenInstance = await LightstreamsToken.deployed();
    // 333000 is the min and 13.5 million is the max
    const initialPurchase = convertEtherToWeiBN(500000);
    const initialBonus = convertEtherToWeiBN(100000);

    const contractBalanceBeforeBN = await tokenInstance.balanceOf(LightstreamsCrowdsale.address);
    const contractBalanceBefore = convertFromBnToInt(contractBalanceBeforeBN);

    const mintAndVest = await crowdsaleInstance.mintAndVest(MINT_ACCOUNT_1, initialPurchase, initialBonus);
    // Get the balance of PHT the crowd sales contract holds
    const contractBalanceAfterBN = await tokenInstance.balanceOf(LightstreamsCrowdsale.address);
    const contractBalanceAfter = convertFromBnToInt(contractBalanceAfterBN);
    // Get the vesting schedule of the address
    const vestingSchedule = await crowdsaleInstance.vestingSchedules(MINT_ACCOUNT_1);
    const vestedInitialAmount = convertFromBnToInt(vestingSchedule[VESTING_SCHEDULE.initialAmount]);
    const vestedBonus = convertFromBnToInt(vestingSchedule[VESTING_SCHEDULE.initialBonus]);

    assert.equal(contractBalanceBefore + vestedInitialAmount + vestedBonus, contractBalanceAfter);
    assert.equal(500000, vestedInitialAmount);
    assert.equal(100000, vestedBonus);
  });

  it('The owner should be able mint an initial amount and bonus for another whitelisted address', async () => {
    const crowdsaleInstance = await LightstreamsCrowdsale.deployed();
    const tokenInstance = await LightstreamsToken.deployed();
    // 333000 is the min and 13.5 million is the max
    const initialPurchase = convertEtherToWeiBN(500000);
    const initialBonus = convertEtherToWeiBN(100000);

    const contractBalanceBeforeBN = await tokenInstance.balanceOf(LightstreamsCrowdsale.address);
    const contractBalanceBefore = convertFromBnToInt(contractBalanceBeforeBN);

    const mintAndVest = await crowdsaleInstance.mintAndVest(MINT_ACCOUNT_2, initialPurchase, initialBonus);
    // Get the balance of PHT the crowd sales contract holds
    const contractBalanceAfterBN = await tokenInstance.balanceOf(LightstreamsCrowdsale.address);
    const contractBalanceAfter = convertFromBnToInt(contractBalanceAfterBN);
    // Get the vesting schedule of the address
    const vestingSchedule = await crowdsaleInstance.vestingSchedules(MINT_ACCOUNT_2);
    const vestedInitialAmount = convertFromBnToInt(vestingSchedule[VESTING_SCHEDULE.initialAmount]);
    const vestedBonus = convertFromBnToInt(vestingSchedule[VESTING_SCHEDULE.initialBonus]);

    assert.equal(contractBalanceBefore + vestedInitialAmount + vestedBonus, contractBalanceAfter);
    assert.equal(500000, vestedInitialAmount);
    assert.equal(100000, vestedBonus);
  });

  it('The owner should not be able mint an amount greater than what is available for the crowdsale', async () => {
    const crowdsaleInstance = await LightstreamsCrowdsale.deployed();
    const tokenInstance = await LightstreamsToken.deployed();

    // 333000 is the min and 13.5 million is the max
    const initialPurchase = convertEtherToWeiBN(165000000);
    const initialBonus = convertEtherToWeiBN(100000);

    return assert.isRejected(crowdsaleInstance.mintAndVest(MINT_ACCOUNT_3, initialPurchase, initialBonus));
  });

  it('The owner should be not be able to mint an initial amount and bonus for a whitelisted address that has a vesting schedule', async () => {
    const crowdsaleInstance = await LightstreamsCrowdsale.deployed();
    const tokenInstance = await LightstreamsToken.deployed();
    // 333000 is the min and 13.5 million is the max
    const initialPurchase = convertEtherToWeiBN(500000);
    const initialBonus = convertEtherToWeiBN(100000);

    return assert.isRejected(crowdsaleInstance.mintAndVest(MINT_ACCOUNT_1, initialPurchase, initialBonus));
  });

  it('The owner should be not be able to mint an initial amount less than the minimum', async () => {
    const crowdsaleInstance = await LightstreamsCrowdsale.deployed();
    const tokenInstance = await LightstreamsToken.deployed();
    // 333000 is the min and 13.5 million is the max
    const initialPurchase = convertEtherToWeiBN(300000);
    const initialBonus = convertEtherToWeiBN(100000);


    return assert.isRejected(crowdsaleInstance.mintAndVest(MINT_ACCOUNT_2, initialPurchase, initialBonus));
  });

  it('The owner should be not be able to mint an initial amount greater than the maximum', async () => {
    const crowdsaleInstance = await LightstreamsCrowdsale.deployed();
    const tokenInstance = await LightstreamsToken.deployed();
    // 333000 is the min and 13.5 million is the max
    const initialPurchase = convertEtherToWeiBN(14000000);
    const initialBonus = convertEtherToWeiBN(100000);

    return assert.isRejected(crowdsaleInstance.mintAndVest(MINT_ACCOUNT_2, initialPurchase, initialBonus));
  });

  it('The owner should be able to update the vesting schedule if there was an error', async () => {
    const crowdsaleInstance = await LightstreamsCrowdsale.deployed();
    // originally 500000, and 100000
    const initialPurchase = convertEtherToWeiBN(400000);
    const initialBonus = convertEtherToWeiBN(50000);

    // GET BALANCES BEFORE
    const revokedAmountBeforeBN = await crowdsaleInstance.revokedAmount.call();
    const revokedAmountBefore = convertFromBnToInt(revokedAmountBeforeBN);
    const vestingScheduleBefore = await crowdsaleInstance.vestingSchedules(MINT_ACCOUNT_1);
    const vestingBalanceBefore = convertFromBnToInt(vestingScheduleBefore[VESTING_SCHEDULE.initialBalance]);
    const vestingBonusBefore = convertFromBnToInt(vestingScheduleBefore[VESTING_SCHEDULE.initialBonus]);

    const updateVestingSchedule = await crowdsaleInstance.updateVestingSchedule(MINT_ACCOUNT_1, initialPurchase, initialBonus);

    const revokedAmountAfterBN = await crowdsaleInstance.revokedAmount.call();
    const revokedAmountAfter = convertFromBnToInt(revokedAmountAfterBN);
    const vestingScheduleAfter = await crowdsaleInstance.vestingSchedules(MINT_ACCOUNT_1);
    const vestingBalanceAfter = convertFromBnToInt(vestingScheduleAfter[VESTING_SCHEDULE.initialBalance]);
    const vestingBonusAfter = convertFromBnToInt(vestingScheduleAfter[VESTING_SCHEDULE.initialBonus]);

    const vestingBalanceDifference = vestingBalanceBefore - vestingBalanceAfter;
    const vestingBonusDifference = vestingBonusBefore - vestingBonusAfter;
    const revokedAmountDifference = revokedAmountAfter - revokedAmountBefore;

    assert.equal(revokedAmountDifference, vestingBalanceDifference + vestingBonusDifference);
    assert.equal(400000, vestingBalanceAfter);
    assert.equal(50000, vestingBonusAfter);
  });

  it('Only the owner should be able to update the vesting schedule if there was an error', async () => {
    const crowdsaleInstance = await LightstreamsCrowdsale.deployed();
    // originally 500000, and 100000
    const initialPurchase = convertEtherToWeiBN(400000);
    const initialBonus = convertEtherToWeiBN(50000);


    return assert.isRejected(crowdsaleInstance.updateVestingSchedule(MINT_ACCOUNT_1, initialPurchase, initialBonus, {from: MINT_ACCOUNT_3}));
  });

  it('The owner should not be able to update a vesting schedule for an address that does not already have one', async () => {
    const crowdsaleInstance = await LightstreamsCrowdsale.deployed();
    // originally 500000, and 100000
    const initialPurchase = convertEtherToWeiBN(400000);
    const initialBonus = convertEtherToWeiBN(50000);

    return assert.isRejected(crowdsaleInstance.updateVestingSchedule(MINT_ACCOUNT_3, initialPurchase, initialBonus));
  });

  it('The owner should be able to update the address of the owner of the token', async () => {
    const crowdsaleInstance = await LightstreamsCrowdsale.deployed();
    const tokenInstance = await LightstreamsToken.deployed();

    const updateTokenOwner = await crowdsaleInstance.updateTokenOwner(MINT_ACCOUNT_3);
    const tokenOwner = await tokenInstance.owner.call();

    assert.equal(MINT_ACCOUNT_3, tokenOwner);
  });

  it('The new owner should be able to change the address token\'s owner back to the crowdsale contract', async () => {
    const crowdsaleInstance = await LightstreamsCrowdsale.deployed();
    const tokenInstance = await LightstreamsToken.deployed();

    const updateTokenOwner = await tokenInstance.transferOwnership(LightstreamsCrowdsale.address, {from: MINT_ACCOUNT_3});
    const tokenOwner = await tokenInstance.owner.call();

    assert.equal(LightstreamsCrowdsale.address, tokenOwner);
  });

  it('An address on the whitelist and purchasing between day 3 and 4 should get a 20 percent bonus', async () => {
    const crowdsaleInstance = await LightstreamsCrowdsale.deployed();
    const tokenInstance = await LightstreamsToken.deployed();
    const etherInBn = convertEtherToWeiBN(1);

    // Time travel two days into the future to the next bonus period
    const timeTravelTransaction = await timeTravel(3600 * 24 * 2);
    const mineBlockTransaction = await mineBlock(); // workaround for https://github.com/ethereumjs/testrspc/issues/336

    // BEFORE TRANSACTION
    // Get the balance of the owner wallet before the buying tokens transaction
    const walletEthBalanceBeforeBN = await web3.eth.getBalance(OWNER_ACCOUNT);
    const walletEthBalanceBefore = convertFromBnToInt(walletEthBalanceBeforeBN);

    const contractBalanceBeforeBN = await tokenInstance.balanceOf(LightstreamsCrowdsale.address);
    const contractBalanceBefore = convertFromBnToInt(contractBalanceBeforeBN);

    // BUY TOKENS
    const buyTokens = await crowdsaleInstance.buyTokens(CONTRIBUTOR_2_ACCOUNT, {
      from: CONTRIBUTOR_2_ACCOUNT,
      value: etherInBn
    });

    // AFTER TRANSACTION
    // Get the balance of PHT the crowd sales contract holds
    const contractBalanceAfterBN = await tokenInstance.balanceOf(LightstreamsCrowdsale.address);
    const contractBalanceAfter = convertFromBnToInt(contractBalanceAfterBN);
    // ETH
    const walletEthBalanceAfterBN = await web3.eth.getBalance(OWNER_ACCOUNT);
    const walletEthBalanceAfter = convertFromBnToInt(walletEthBalanceAfterBN);
    // Get the vesting schedule of the address
    const vestingSchedule = await crowdsaleInstance.vestingSchedules(CONTRIBUTOR_2_ACCOUNT);
    const vestedInitialAmount = convertFromBnToInt(vestingSchedule[VESTING_SCHEDULE.initialAmount]);
    const vestedBonus = convertFromBnToInt(vestingSchedule[VESTING_SCHEDULE.initialBonus]);

    assert.equal(contractBalanceBefore + vestedInitialAmount + vestedBonus, contractBalanceAfter);
    assert.equal(1000, vestedInitialAmount);
    assert.equal(200, vestedBonus);
    assert.equal(200, vestedBonus);
    assert.equal(walletEthBalanceBefore + 1, walletEthBalanceAfter);
  });

  it('An address on the whitelist and purchasing between day 4 and 6 should get a 10 percent bonus', async () => {
    const crowdsaleInstance = await LightstreamsCrowdsale.deployed();
    const tokenInstance = await LightstreamsToken.deployed();
    const etherInBn = convertEtherToWeiBN(1);

    // Time travel two days into the future to the next bonus period
    const timeTravelTransaction = await timeTravel(3600 * 24 * 2);
    const mineBlockTransaction = await mineBlock(); // workaround for https://github.com/ethereumjs/testrspc/issues/336

    // BEFORE TRANSACTION
    // Get the balance of the owner wallet before the buying tokens transaction
    const walletEthBalanceBeforeBN = await web3.eth.getBalance(OWNER_ACCOUNT);
    const walletEthBalanceBefore = convertFromBnToInt(walletEthBalanceBeforeBN);

    const contractBalanceBeforeBN = await tokenInstance.balanceOf(LightstreamsCrowdsale.address);
    const contractBalanceBefore = convertFromBnToInt(contractBalanceBeforeBN);

    // BUY TOKENS
    const buyTokens = await crowdsaleInstance.buyTokens(CONTRIBUTOR_3_ACCOUNT, {from: CONTRIBUTOR_3_ACCOUNT, value: etherInBn});

    // AFTER TRANSACTION
    // ETH
    const walletEthBalanceAfterBN = await web3.eth.getBalance(OWNER_ACCOUNT);
    const walletEthBalanceAfter = convertFromBnToInt(walletEthBalanceAfterBN);
    // Get the balance of PHT the crowd sales contract holds
    const contractBalanceAfterBN = await tokenInstance.balanceOf(LightstreamsCrowdsale.address);
    const contractBalanceAfter = convertFromBnToInt(contractBalanceAfterBN);
    // Get the vesting schedule of the address
    const vestingSchedule = await crowdsaleInstance.vestingSchedules(CONTRIBUTOR_3_ACCOUNT);
    const vestedInitialAmount = convertFromBnToInt(vestingSchedule[VESTING_SCHEDULE.initialAmount]);
    const vestedBonus = convertFromBnToInt(vestingSchedule[VESTING_SCHEDULE.initialBonus]);

    assert.equal(contractBalanceBefore + vestedInitialAmount + vestedBonus, contractBalanceAfter);
    assert.equal(1000, vestedInitialAmount);
    assert.equal(100, vestedBonus);
    assert.equal(walletEthBalanceBefore + 1, walletEthBalanceAfter);
  });

  it('An address on the whitelist and purchasing between day 6 and 8 should get a 5 percent bonus', async () => {
    const crowdsaleInstance = await LightstreamsCrowdsale.deployed();
    const tokenInstance = await LightstreamsToken.deployed();
    const etherInBn = convertEtherToWeiBN(1);

    // Time travel two days into the future to the next bonus period
    const timeTravelTransaction = await timeTravel(3600 * 24 * 2);
    const mineBlockTransaction = await mineBlock(); // workaround for https://github.com/ethereumjs/testrspc/issues/336

    // BEFORE TRANSACTION
    // Get the balance of the owner wallet before the buying tokens transaction
    const walletEthBalanceBeforeBN = await web3.eth.getBalance(OWNER_ACCOUNT);
    const walletEthBalanceBefore = convertFromBnToInt(walletEthBalanceBeforeBN);
    // Get the balance of PHT the crowd sales contract holds
    const contractBalanceBeforeBN = await tokenInstance.balanceOf(LightstreamsCrowdsale.address);
    const contractBalanceBefore = convertFromBnToInt(contractBalanceBeforeBN);

    // BUY TOKENS
    const buyTokens = await crowdsaleInstance.buyTokens(CONTRIBUTOR_4_ACCOUNT, {
      from: CONTRIBUTOR_4_ACCOUNT,
      value: etherInBn
    });

    // AFTER TRANSACTION
    // ETH
    const walletEthBalanceAfterBN = await web3.eth.getBalance(OWNER_ACCOUNT);
    const walletEthBalanceAfter = convertFromBnToInt(walletEthBalanceAfterBN);
    // Get the balance of PHT the crowd sales contract holds
    const contractBalanceAfterBN = await tokenInstance.balanceOf(LightstreamsCrowdsale.address);
    const contractBalanceAfter = convertFromBnToInt(contractBalanceAfterBN);
    // Get the vesting schedule of the address
    const vestingSchedule = await crowdsaleInstance.vestingSchedules(CONTRIBUTOR_4_ACCOUNT);
    const vestedInitialAmount = convertFromBnToInt(vestingSchedule[VESTING_SCHEDULE.initialAmount]);
    const vestedBonus = convertFromBnToInt(vestingSchedule[VESTING_SCHEDULE.initialBonus]);

    assert.equal(contractBalanceBefore + vestedInitialAmount + vestedBonus, contractBalanceAfter);
    assert.equal(1000, vestedInitialAmount);
    assert.equal(50, vestedBonus);
    assert.equal(walletEthBalanceBefore + 1, walletEthBalanceAfter);
  });

  it('An address on the whitelist and purchasing after day 8 should not get a bonus', async () => {
    const crowdsaleInstance = await LightstreamsCrowdsale.deployed();
    const tokenInstance = await LightstreamsToken.deployed();
    const etherInBn = convertEtherToWeiBN(1);

    // Time travel one day into the future so the sale has started
    const timeTravelTransaction = await timeTravel(3600 * 24 * 2);
    const mineBlockTransaction = await mineBlock(); // workaround for https://github.com/ethereumjs/testrspc/issues/336

    // BEFORE TRANSACTION
    // Get the balance of the owner wallet before the buying tokens transaction
    const walletEthBalanceBeforeBN = await web3.eth.getBalance(OWNER_ACCOUNT);
    const walletEthBalanceBefore = convertFromBnToInt(walletEthBalanceBeforeBN);

    const contractBalanceBeforeBN = await tokenInstance.balanceOf(LightstreamsCrowdsale.address);
    const contractBalanceBefore = convertFromBnToInt(contractBalanceBeforeBN);

    // BUY TOKENS
    const buyTokens = await crowdsaleInstance.buyTokens(CONTRIBUTOR_5_ACCOUNT, {
      from: CONTRIBUTOR_5_ACCOUNT,
      value: etherInBn
    });

    // AFTER TRANSACTION
    // ETH
    const walletEthBalanceAfterBN = await web3.eth.getBalance(OWNER_ACCOUNT);
    const walletEthBalanceAfter = convertFromBnToInt(walletEthBalanceAfterBN);
    // Get the balance of PHT the crowd sales contract holds
    const contractBalanceAfterBN = await tokenInstance.balanceOf(LightstreamsCrowdsale.address);
    const contractBalanceAfter = convertFromBnToInt(contractBalanceAfterBN);
    // Get the vesting schedule of the address
    const vestingSchedule = await crowdsaleInstance.vestingSchedules(CONTRIBUTOR_5_ACCOUNT);
    const vestedInitialAmount = convertFromBnToInt(vestingSchedule[VESTING_SCHEDULE.initialAmount]);
    const vestedBonus = convertFromBnToInt(vestingSchedule[VESTING_SCHEDULE.initialBonus]);

    assert.equal(contractBalanceBefore + vestedInitialAmount + vestedBonus, contractBalanceAfter);
    assert.equal(1000, vestedInitialAmount);
    assert.equal(0, vestedBonus);
    assert.equal(walletEthBalanceBefore + 1, walletEthBalanceAfter);
  });

  it('An address that has already purchased tokens should not be able to purchase again', async () => {
    const crowdsaleInstance = await LightstreamsCrowdsale.deployed();
    const tokenInstance = await LightstreamsToken.deployed();
    const etherInBn = convertEtherToWeiBN(1);

    return assert.isRejected(crowdsaleInstance.buyTokens(CONTRIBUTOR_5_ACCOUNT, {from: CONTRIBUTOR_5_ACCOUNT, value: etherInBn}));
  });

  it('The owner should be able to revoke a minted addresses vesting schedule if they do not pass KYC', async () => {
    const crowdsaleInstance = await LightstreamsCrowdsale.deployed();
    const tokenInstance = await LightstreamsToken.deployed();

    // const initialPurchase = convertEtherToWeiBN(500000);
    // const initialBonus = convertEtherToWeiBN(100000);

    // GET BALANCES BEFORE RELEASE
    // CROWDSALE CONTRACT
    const contractBalanceBeforeBN = await tokenInstance.balanceOf(LightstreamsCrowdsale.address);
    const contractBalanceBefore = convertFromBnToInt(contractBalanceBeforeBN);
    // CONTRIBUTORS ACCOUNT/WALLET
    const accountBalanceBeforeBN = await tokenInstance.balanceOf(MINT_ACCOUNT_2);
    const accountBalanceBefore = convertFromBnToInt(accountBalanceBeforeBN);
    // VESTING SCHEDULE
    const vestingScheduleBefore = await crowdsaleInstance.vestingSchedules(MINT_ACCOUNT_2);
    // PURCHASED AMOUNT
    const vestingInitialAmountClaimedBefore = convertFromBnToInt(vestingScheduleBefore[VESTING_SCHEDULE.initialAmountClaimed]);
    const vestingInitialAmountBalanceBefore = convertFromBnToInt(vestingScheduleBefore[VESTING_SCHEDULE.initialBalance]);
    // BONUS
    const vestingBonusBalanceBefore = convertFromBnToInt(vestingScheduleBefore[VESTING_SCHEDULE.bonusBalance]);
    const vestingBonusClaimedBefore = convertFromBnToInt(vestingScheduleBefore[VESTING_SCHEDULE.bonusClaimed]);
    // REVOKED AMOUNT
    const revokedAmountBeforeBN = await crowdsaleInstance.revokedAmount.call();
    const revokedAmountBefore = convertFromBnToInt(revokedAmountBeforeBN);

    // REVOKE
    const revoke = await crowdsaleInstance.revokeVesting(MINT_ACCOUNT_2);

    // GET BALANCES AFTER RELEASE
    // CROWDSALE CONTRACT
    const contractBalanceAfterBN = await tokenInstance.balanceOf(LightstreamsCrowdsale.address);
    const contractBalanceAfter = convertFromBnToInt(contractBalanceAfterBN);
    // CONTRIBUTORS ACCOUNT/WALLET
    const accountBalanceAfterBN = await tokenInstance.balanceOf(MINT_ACCOUNT_2);
    const accountBalanceAfter = convertFromBnToInt(accountBalanceAfterBN);
    // VESTING SCHEDULE
    const vestingScheduleAfter = await crowdsaleInstance.vestingSchedules(MINT_ACCOUNT_2);
    // PURCHASED AMOUNT
    const vestingInitialAmountClaimedAfter = convertFromBnToInt(vestingScheduleAfter[VESTING_SCHEDULE.initialAmountClaimed]);
    const vestingInitialAmountBalanceAfter = convertFromBnToInt(vestingScheduleAfter[VESTING_SCHEDULE.initialBalance]);
    // BONUS
    const vestingBonusBalanceAfter = convertFromBnToInt(vestingScheduleAfter[VESTING_SCHEDULE.bonusBalance]);
    const vestingBonusClaimedAfter = convertFromBnToInt(vestingScheduleAfter[VESTING_SCHEDULE.bonusClaimed]);
    // REVOKED AMOUNT
    const revokedAmountAfterBN = await crowdsaleInstance.revokedAmount.call();
    const revokedAmountAfter = convertFromBnToInt(revokedAmountAfterBN);

    const initialAmountDifference = vestingInitialAmountBalanceAfter - vestingInitialAmountBalanceBefore;
    const bonusDifference = vestingBonusBalanceAfter - vestingBonusBalanceBefore;
    const revokedAmountDifference = revokedAmountBefore - revokedAmountAfter;

    // CHECK THE CROWDSALE CONTRACT BALANCE
    assert.equal(contractBalanceAfter, contractBalanceBefore, 'contractBalanceAfter');
    // CHECK THE CONTRIBUTORS ACCOUNT/WALLET BALANCE
    assert.equal(accountBalanceBefore, accountBalanceAfter, 'accountBalance');
    // CHECK THE VESTING SCHEDULE
    assert.equal(0, vestingInitialAmountBalanceAfter, 'vestingInitialAmountBalanceAfter');
    assert.equal(0, vestingBonusBalanceAfter, 'vestingBonusBalanceAfter');
    assert.equal(0, vestingInitialAmountClaimedAfter, 'vestingInitialAmountClaimedAfter');
    assert.equal(0, vestingBonusClaimedAfter, 'vestingBonusClaimedAfter');
    assert.equal(0, vestingBonusBalanceAfter, 'vestingBonusBalanceAfter');
    // REVOKED AMOUNT
    assert.equal(revokedAmountDifference, bonusDifference + initialAmountDifference, 'revokedAmountDifference');
  });

  it('The sale should close and whitelisted addresses should no longer be able to purchase tokens', async () => {
    const crowdsaleInstance = await LightstreamsCrowdsale.deployed();
    const tokenInstance = await LightstreamsToken.deployed();
    const etherInBn = convertEtherToWeiBN(1);

    // Time travel 22 days into the future so the sale has ended
    const timeTravelTransaction = await timeTravel(3600 * 24 * 22);
    const mineBlockTransaction = await mineBlock(); // workaround for https://github.com/ethereumjs/testrspc/issues/336

    return assert.isRejected(crowdsaleInstance.buyTokens(CONTRIBUTOR_6_ACCOUNT, {from: CONTRIBUTOR_6_ACCOUNT, value: etherInBn}));
  });

  it('When finalize is called on the sales contract the team contract gets 135 million PTH', async () => {
    const crowdsalesInstance = await LightstreamsCrowdsale.deployed();
    const tokenInstance = await LightstreamsToken.deployed();

    const finalize = await crowdsalesInstance.finalize();
    const crowdsaleBalanceBN = await tokenInstance.balanceOf(TeamDistribution.address);

    const crowdsaleBalance = convertFromBnToInt(crowdsaleBalanceBN);

    assert.equal(crowdsaleBalance, 135000000);
  });


  // 1 MONTH (ISH) AFTER PURCHASE
  it('The first contributor should be able to release the 1/5th of their vested tokens after 30 days - Month 1', async () => {
    const crowdsaleInstance = await LightstreamsCrowdsale.deployed();
    const tokenInstance = await LightstreamsToken.deployed();

    // GET BALANCES BEFORE RELEASE
    const contractBalanceBeforeBN = await tokenInstance.balanceOf(LightstreamsCrowdsale.address);
    const accountBalanceBeforeBN = await tokenInstance.balanceOf(CONTRIBUTOR_1_ACCOUNT);
    const contractBalanceBefore = convertFromBnToInt(contractBalanceBeforeBN);
    const accountBalanceBefore = convertFromBnToInt(accountBalanceBeforeBN);
    const vestingScheduleBefore = await crowdsaleInstance.vestingSchedules(CONTRIBUTOR_1_ACCOUNT);
    const vestingBalanceBefore = convertFromBnToInt(vestingScheduleBefore[VESTING_SCHEDULE.initialBalance]);
    const vestingAmountClaimedBefore = convertFromBnToInt(vestingScheduleBefore[VESTING_SCHEDULE.initialAmountClaimed]);

    // RELEASE
    const release = await crowdsaleInstance.release(CONTRIBUTOR_1_ACCOUNT, {from: CONTRIBUTOR_1_ACCOUNT});

    // GET BALANCES AFTER RELEASE
    const contractBalanceAfterBN = await tokenInstance.balanceOf(LightstreamsCrowdsale.address);
    const contractBalanceAfter = convertFromBnToInt(contractBalanceAfterBN);
    const accountBalanceAfterBN = await tokenInstance.balanceOf(CONTRIBUTOR_1_ACCOUNT);
    const accountBalanceAfter = convertFromBnToInt(accountBalanceAfterBN);
    const vestingScheduleAfter = await crowdsaleInstance.vestingSchedules(CONTRIBUTOR_1_ACCOUNT);
    const vestingBalanceAfter = convertFromBnToInt(vestingScheduleAfter[VESTING_SCHEDULE.initialBalance]);
    const vestingAmountClaimedAfter = convertFromBnToInt(vestingScheduleAfter[VESTING_SCHEDULE.initialAmountClaimed]);

    const initialAmountClaimed = vestingAmountClaimedAfter - vestingAmountClaimedBefore;

    assert.equal(contractBalanceAfter, contractBalanceBefore - initialAmountClaimed);
    assert.equal(accountBalanceBefore, accountBalanceAfter - initialAmountClaimed);
    assert.equal(vestingBalanceBefore - vestingBalanceAfter, initialAmountClaimed);
  });


  // 30 DAYS LATER - 60 TOTAL
  it('The first contributor should be able to release the 1/5th of their vested tokens the next 30 days - Month 2', async () => {
    const crowdsaleInstance = await LightstreamsCrowdsale.deployed();
    const tokenInstance = await LightstreamsToken.deployed();

    // GET BALANCES BEFORE RELEASE
    const contractBalanceBeforeBN = await tokenInstance.balanceOf(LightstreamsCrowdsale.address);
    const accountBalanceBeforeBN = await tokenInstance.balanceOf(CONTRIBUTOR_1_ACCOUNT);
    const contractBalanceBefore = convertFromBnToInt(contractBalanceBeforeBN);
    const accountBalanceBefore = convertFromBnToInt(accountBalanceBeforeBN);
    const vestingScheduleBefore = await crowdsaleInstance.vestingSchedules(CONTRIBUTOR_1_ACCOUNT);
    const vestingBalanceBefore = convertFromBnToInt(vestingScheduleBefore[VESTING_SCHEDULE.initialBalance]);
    const vestingAmountClaimedBefore = convertFromBnToInt(vestingScheduleBefore[VESTING_SCHEDULE.initialAmountClaimed]);

    // Time travel 30 days into the future so the sale has ended
    const timeTravelTransaction = await timeTravel(3600 * 24 * 30);
    const mineBlockTransaction = await mineBlock(); // workaround for https://github.com/ethereumjs/testrspc/issues/336


    // RELEASE
    const release = await crowdsaleInstance.release(CONTRIBUTOR_1_ACCOUNT, {from: CONTRIBUTOR_1_ACCOUNT});

    // GET BALANCES AFTER RELEASE
    const contractBalanceAfterBN = await tokenInstance.balanceOf(LightstreamsCrowdsale.address);
    const contractBalanceAfter = convertFromBnToInt(contractBalanceAfterBN);
    const accountBalanceAfterBN = await tokenInstance.balanceOf(CONTRIBUTOR_1_ACCOUNT);
    const accountBalanceAfter = convertFromBnToInt(accountBalanceAfterBN);
    const vestingScheduleAfter = await crowdsaleInstance.vestingSchedules(CONTRIBUTOR_1_ACCOUNT);
    const vestingBalanceAfter = convertFromBnToInt(vestingScheduleAfter[VESTING_SCHEDULE.initialBalance]);
    const vestingAmountClaimedAfter = convertFromBnToInt(vestingScheduleAfter[VESTING_SCHEDULE.initialAmountClaimed]);

    const initialAmountClaimed = vestingAmountClaimedAfter - vestingAmountClaimedBefore;

    assert.equal(contractBalanceAfter, contractBalanceBefore - initialAmountClaimed);
    assert.equal(accountBalanceBefore, accountBalanceAfter - initialAmountClaimed);
    assert.equal(vestingBalanceBefore - vestingBalanceAfter, initialAmountClaimed);
  });

  it('The owner should be able to revoke an address that purchased through the sale', async () => {
    const crowdsaleInstance = await LightstreamsCrowdsale.deployed();
    const tokenInstance = await LightstreamsToken.deployed();

    // GET BALANCES BEFORE RELEASE
    // CROWDSALE CONTRACT
    const contractBalanceBeforeBN = await tokenInstance.balanceOf(LightstreamsCrowdsale.address);
    const contractBalanceBefore = convertFromBnToInt(contractBalanceBeforeBN);
    // CONTRIBUTORS ACCOUNT/WALLET
    const accountBalanceBeforeBN = await tokenInstance.balanceOf(CONTRIBUTOR_4_ACCOUNT);
    const accountBalanceBefore = convertFromBnToInt(accountBalanceBeforeBN);
    // VESTING SCHEDULE
    const vestingScheduleBefore = await crowdsaleInstance.vestingSchedules(CONTRIBUTOR_4_ACCOUNT);
    // PURCHASED AMOUNT
    const vestingInitialAmountClaimedBefore = convertFromBnToInt(vestingScheduleBefore[VESTING_SCHEDULE.initialAmountClaimed]);
    const vestingInitialAmountBalanceBefore = convertFromBnToInt(vestingScheduleBefore[VESTING_SCHEDULE.initialBalance]);
    // BONUS
    const vestingBonusBalanceBefore = convertFromBnToInt(vestingScheduleBefore[VESTING_SCHEDULE.bonusBalance]);
    const vestingInitialBalance = convertFromBnToInt(vestingScheduleBefore[VESTING_SCHEDULE.initialBalance]);
    const vestingInitialBonus = convertFromBnToInt(vestingScheduleBefore[VESTING_SCHEDULE.initialBonus]);
    const vestingBonusClaimedBefore = convertFromBnToInt(vestingScheduleBefore[VESTING_SCHEDULE.bonusClaimed]);
    // REVOKED AMOUNT
    const revokedAmountBeforeBN = await crowdsaleInstance.revokedAmount.call();
    const revokedAmountBefore = convertFromBnToInt(revokedAmountBeforeBN);

    // REVOKE
    const revoke = await crowdsaleInstance.revokeVesting(CONTRIBUTOR_4_ACCOUNT);

    // GET BALANCES AFTER RELEASE
    // CROWDSALE CONTRACT
    const contractBalanceAfterBN = await tokenInstance.balanceOf(LightstreamsCrowdsale.address);
    const contractBalanceAfter = convertFromBnToInt(contractBalanceAfterBN);
    // CONTRIBUTORS ACCOUNT/WALLET
    const accountBalanceAfterBN = await tokenInstance.balanceOf(CONTRIBUTOR_4_ACCOUNT);
    const accountBalanceAfter = convertFromBnToInt(accountBalanceAfterBN);
    // VESTING SCHEDULE
    const vestingScheduleAfter = await crowdsaleInstance.vestingSchedules(CONTRIBUTOR_4_ACCOUNT);
    // PURCHASED AMOUNT
    const vestingInitialAmountClaimedAfter = convertFromBnToInt(vestingScheduleAfter[VESTING_SCHEDULE.initialAmountClaimed]);
    const vestingInitialAmountBalanceAfter = convertFromBnToInt(vestingScheduleAfter[VESTING_SCHEDULE.initialBalance]);
    // BONUS
    const vestingBonusBalanceAfter = convertFromBnToInt(vestingScheduleAfter[VESTING_SCHEDULE.bonusBalance]);
    const vestingBonusClaimedAfter = convertFromBnToInt(vestingScheduleAfter[VESTING_SCHEDULE.bonusClaimed]);
    // REVOKED AMOUNT
    const revokedAmountAfterBN = await crowdsaleInstance.revokedAmount.call();
    const revokedAmountAfter = convertFromBnToInt(revokedAmountAfterBN);

    const initialAmountDifference = vestingInitialAmountBalanceBefore - vestingInitialAmountBalanceAfter;
    const bonusDifference = vestingBonusBalanceAfter - vestingBonusBalanceBefore;
    const initialAmountClaimedDifference = vestingInitialAmountClaimedAfter - vestingInitialAmountClaimedBefore;
    const initialBonusClaimedDifference = vestingBonusClaimedAfter - vestingBonusClaimedBefore;
    const revokedAmountDifference = revokedAmountAfter - revokedAmountBefore;

    // CHECK THE CROWDSALE CONTRACT BALANCE
    assert.equal(contractBalanceAfter, contractBalanceBefore - initialAmountClaimedDifference - initialBonusClaimedDifference, 'contractBalanceAfter');
    // CHECK THE CONTRIBUTORS ACCOUNT/WALLET BALANCE
    assert.equal(accountBalanceAfter, accountBalanceBefore + initialAmountClaimedDifference + initialBonusClaimedDifference, 'accountBalance');
    // CHECK THE VESTING SCHEDULE
    assert.equal(0, vestingInitialAmountBalanceAfter, 'vestingInitialAmountBalanceAfter');
    assert.equal(0, vestingBonusBalanceAfter, 'vestingBonusBalanceAfter');
    assert.equal(initialAmountClaimedDifference, vestingInitialAmountClaimedAfter, 'vestingInitialAmountClaimedAfter');
    assert.equal(initialBonusClaimedDifference, vestingBonusClaimedAfter, 'vestingBonusClaimedAfter');
    // REVOKED AMOUNT
    assert.equal(revokedAmountDifference, vestingInitialBalance + vestingInitialBonus - initialAmountClaimedDifference - initialBonusClaimedDifference);
  });

  // 30 DAYS LATER - 90 TOTAL
  it('The first contributor should be able to release the 1/5th of their vested tokens the next 30 days - Month 3', async () => {
    const crowdsaleInstance = await LightstreamsCrowdsale.deployed();
    const tokenInstance = await LightstreamsToken.deployed();

    // GET BALANCES BEFORE RELEASE
    const contractBalanceBeforeBN = await tokenInstance.balanceOf(LightstreamsCrowdsale.address);
    const accountBalanceBeforeBN = await tokenInstance.balanceOf(CONTRIBUTOR_1_ACCOUNT);
    const contractBalanceBefore = convertFromBnToInt(contractBalanceBeforeBN);
    const accountBalanceBefore = convertFromBnToInt(accountBalanceBeforeBN);
    const vestingScheduleBefore = await crowdsaleInstance.vestingSchedules(CONTRIBUTOR_1_ACCOUNT);
    const vestingBalanceBefore = convertFromBnToInt(vestingScheduleBefore[VESTING_SCHEDULE.initialBalance]);
    const vestingAmountClaimedBefore = convertFromBnToInt(vestingScheduleBefore[VESTING_SCHEDULE.initialAmountClaimed]);

    // Time travel 30 days into the future
    const timeTravelTransaction = await timeTravel(3600 * 24 * 30);
    const mineBlockTransaction = await mineBlock(); // workaround for https://github.com/ethereumjs/testrspc/issues/336


    // RELEASE
    const release = await crowdsaleInstance.release(CONTRIBUTOR_1_ACCOUNT, {from: CONTRIBUTOR_1_ACCOUNT});

    // GET BALANCES AFTER RELEASE
    const contractBalanceAfterBN = await tokenInstance.balanceOf(LightstreamsCrowdsale.address);
    const contractBalanceAfter = convertFromBnToInt(contractBalanceAfterBN);
    const accountBalanceAfterBN = await tokenInstance.balanceOf(CONTRIBUTOR_1_ACCOUNT);
    const accountBalanceAfter = convertFromBnToInt(accountBalanceAfterBN);
    const vestingScheduleAfter = await crowdsaleInstance.vestingSchedules(CONTRIBUTOR_1_ACCOUNT);
    const vestingBalanceAfter = convertFromBnToInt(vestingScheduleAfter[VESTING_SCHEDULE.initialBalance]);
    const vestingAmountClaimedAfter = convertFromBnToInt(vestingScheduleAfter[VESTING_SCHEDULE.initialAmountClaimed]);

    const initialAmountClaimed = vestingAmountClaimedAfter - vestingAmountClaimedBefore;

    assert.equal(contractBalanceAfter, contractBalanceBefore - initialAmountClaimed);
    assert.equal(accountBalanceBefore, accountBalanceAfter - initialAmountClaimed);
    assert.equal(vestingBalanceBefore - vestingBalanceAfter, initialAmountClaimed);
  });

  // 30 DAYS LATER - 120 TOTAL
  it('The first contributor should be able to release the 1/5th of their vested tokens the next 30 days - Month 4', async () => {
    const crowdsaleInstance = await LightstreamsCrowdsale.deployed();
    const tokenInstance = await LightstreamsToken.deployed();

    // GET BALANCES BEFORE RELEASE
    const contractBalanceBeforeBN = await tokenInstance.balanceOf(LightstreamsCrowdsale.address);
    const accountBalanceBeforeBN = await tokenInstance.balanceOf(CONTRIBUTOR_1_ACCOUNT);
    const contractBalanceBefore = convertFromBnToInt(contractBalanceBeforeBN);
    const accountBalanceBefore = convertFromBnToInt(accountBalanceBeforeBN);
    const vestingScheduleBefore = await crowdsaleInstance.vestingSchedules(CONTRIBUTOR_1_ACCOUNT);
    const vestingBalanceBefore = convertFromBnToInt(vestingScheduleBefore[VESTING_SCHEDULE.initialBalance]);
    const vestingAmountClaimedBefore = convertFromBnToInt(vestingScheduleBefore[VESTING_SCHEDULE.initialAmountClaimed]);

    // Time travel 30 days into the future
    const timeTravelTransaction = await timeTravel(3600 * 24 * 30);
    const mineBlockTransaction = await mineBlock(); // workaround for https://github.com/ethereumjs/testrspc/issues/336


    // RELEASE
    const release = await crowdsaleInstance.release(CONTRIBUTOR_1_ACCOUNT, {from: CONTRIBUTOR_1_ACCOUNT});

    // GET BALANCES AFTER RELEASE
    const contractBalanceAfterBN = await tokenInstance.balanceOf(LightstreamsCrowdsale.address);
    const contractBalanceAfter = convertFromBnToInt(contractBalanceAfterBN);
    const accountBalanceAfterBN = await tokenInstance.balanceOf(CONTRIBUTOR_1_ACCOUNT);
    const accountBalanceAfter = convertFromBnToInt(accountBalanceAfterBN);
    const vestingScheduleAfter = await crowdsaleInstance.vestingSchedules(CONTRIBUTOR_1_ACCOUNT);
    const vestingBalanceAfter = convertFromBnToInt(vestingScheduleAfter[VESTING_SCHEDULE.initialBalance]);
    const vestingAmountClaimedAfter = convertFromBnToInt(vestingScheduleAfter[VESTING_SCHEDULE.initialAmountClaimed]);

    const initialAmountClaimed = vestingAmountClaimedAfter - vestingAmountClaimedBefore;

    assert.equal(contractBalanceAfter, contractBalanceBefore - initialAmountClaimed);
    assert.equal(accountBalanceBefore, accountBalanceAfter - initialAmountClaimed);
    assert.equal(vestingBalanceBefore - vestingBalanceAfter, initialAmountClaimed);
  });

  // 150 DAYS
  it('The first contributor should be able to release all of their initial invested tokens', async () => {
    const crowdsaleInstance = await LightstreamsCrowdsale.deployed();
    const tokenInstance = await LightstreamsToken.deployed();

    // Time travel 1 month into the future
    const timeTravelTransaction = await timeTravel(3600 * 24 * 30);
    const mineBlockTransaction = await mineBlock(); // workaround for https://github.com/ethereumjs/testrspc/issues/336

    // GET BALANCES BEFORE RELEASE
    const contractBalanceBeforeBN = await tokenInstance.balanceOf(LightstreamsCrowdsale.address);
    const accountBalanceBeforeBN = await tokenInstance.balanceOf(CONTRIBUTOR_1_ACCOUNT);
    const contractBalanceBefore = convertFromBnToInt(contractBalanceBeforeBN);
    const accountBalanceBefore = convertFromBnToInt(accountBalanceBeforeBN);
    const vestingScheduleBefore = await crowdsaleInstance.vestingSchedules(CONTRIBUTOR_1_ACCOUNT);
    const vestingBalanceBefore = convertFromBnToInt(vestingScheduleBefore[VESTING_SCHEDULE.initialBalance]);
    const vestingAmountClaimedBefore = convertFromBnToInt(vestingScheduleBefore[VESTING_SCHEDULE.initialAmountClaimed]);

    // RELEASE
    const release = await crowdsaleInstance.release(CONTRIBUTOR_1_ACCOUNT, {from: CONTRIBUTOR_1_ACCOUNT});

    // GET BALANCES AFTER RELEASE
    const contractBalanceAfterBN = await tokenInstance.balanceOf(LightstreamsCrowdsale.address);
    const contractBalanceAfter = convertFromBnToInt(contractBalanceAfterBN);
    const accountBalanceAfterBN = await tokenInstance.balanceOf(CONTRIBUTOR_1_ACCOUNT);
    const accountBalanceAfter = convertFromBnToInt(accountBalanceAfterBN);
    const vestingScheduleAfter = await crowdsaleInstance.vestingSchedules(CONTRIBUTOR_1_ACCOUNT);
    const vestingBalanceAfter = convertFromBnToInt(vestingScheduleAfter[VESTING_SCHEDULE.initialBalance]);
    const vestingInitialAmount = convertFromBnToInt(vestingScheduleAfter[VESTING_SCHEDULE.initialAmount]);
    const vestingAmountClaimedAfter = convertFromBnToInt(vestingScheduleAfter[VESTING_SCHEDULE.initialAmountClaimed]);

    const initialAmountClaimed = vestingAmountClaimedAfter - vestingAmountClaimedBefore;

    assert.equal(contractBalanceAfter, contractBalanceBefore - initialAmountClaimed, 'contractBalanceAfter');
    assert.equal(accountBalanceBefore, accountBalanceAfter - initialAmountClaimed, 'accountBalanceBefore');
    assert.equal(vestingBalanceBefore - vestingBalanceAfter, initialAmountClaimed, 'initialAmountClaimed');
    assert.equal(vestingBalanceAfter, 0, 'vestingBalanceAfter');
    assert.equal(vestingInitialAmount, vestingAmountClaimedAfter, 'vestingInitialAmount');
  });

  // 180 DAYS - BONUS
  it('The first contributor should be able to release the first part of their bonus', async () => {
    const crowdsaleInstance = await LightstreamsCrowdsale.deployed();
    const tokenInstance = await LightstreamsToken.deployed();

    // Time travel 1 month into the future
    const timeTravelTransaction = await timeTravel(3600 * 24 * 30);
    const mineBlockTransaction = await mineBlock(); // workaround for https://github.com/ethereumjs/testrspc/issues/336

    // GET BALANCES BEFORE RELEASE
    // CROWDSALE CONTRACT
    const contractBalanceBeforeBN = await tokenInstance.balanceOf(LightstreamsCrowdsale.address);
    const contractBalanceBefore = convertFromBnToInt(contractBalanceBeforeBN);
    // CONTRIBUTORS ACCOUNT/WALLET
    const accountBalanceBeforeBN = await tokenInstance.balanceOf(CONTRIBUTOR_1_ACCOUNT);
    const accountBalanceBefore = convertFromBnToInt(accountBalanceBeforeBN);
    // VESTING SCHEDULE
    const vestingScheduleBefore = await crowdsaleInstance.vestingSchedules(CONTRIBUTOR_1_ACCOUNT);
    // PURCHASED AMOUNT
    const vestingInitialAmountClaimedBefore = convertFromBnToInt(vestingScheduleBefore[VESTING_SCHEDULE.initialAmountClaimed]);
    const vestingBalanceBefore = convertFromBnToInt(vestingScheduleBefore[VESTING_SCHEDULE.initialBalance]);
    // BONUS
    const vestingBonusBefore = convertFromBnToInt(vestingScheduleBefore[VESTING_SCHEDULE.bonusBalance]);
    const vestingBonusClaimedBefore = convertFromBnToInt(vestingScheduleBefore[VESTING_SCHEDULE.bonusClaimed]);

    // RELEASE
    const release = await crowdsaleInstance.release(CONTRIBUTOR_1_ACCOUNT, {from: CONTRIBUTOR_1_ACCOUNT});

    // GET BALANCES AFTER RELEASE
    // CROWDSALE CONTRACT
    const contractBalanceAfterBN = await tokenInstance.balanceOf(LightstreamsCrowdsale.address);
    const contractBalanceAfter = convertFromBnToInt(contractBalanceAfterBN);
    // CONTRIBUTORS ACCOUNT/WALLET
    const accountBalanceAfterBN = await tokenInstance.balanceOf(CONTRIBUTOR_1_ACCOUNT);
    const accountBalanceAfter = convertFromBnToInt(accountBalanceAfterBN);
    // VESTING SCHEDULE
    const vestingScheduleAfter = await crowdsaleInstance.vestingSchedules(CONTRIBUTOR_1_ACCOUNT);
    // PURCHASED AMOUNT
    const vestingInitialAmountClaimedAfter = convertFromBnToInt(vestingScheduleAfter[VESTING_SCHEDULE.initialAmountClaimed]);
    const vestingInitialAmountBalanceAfter = convertFromBnToInt(vestingScheduleAfter[VESTING_SCHEDULE.initialBalance]);
    // BONUS
    const vestingBonusBalaceAfter = convertFromBnToInt(vestingScheduleAfter[VESTING_SCHEDULE.bonusBalance]);
    const vestingBonusClaimedAfter = convertFromBnToInt(vestingScheduleAfter[VESTING_SCHEDULE.bonusClaimed]);

    const initialAmountClaimedDifference = vestingInitialAmountClaimedBefore - vestingInitialAmountClaimedAfter;
    const bonusDifference = vestingBonusClaimedAfter - vestingBonusClaimedBefore;

    // CHECK THE CROWDSALE CONTRACT BALANCE
    assert.equal(contractBalanceAfter, contractBalanceBefore - initialAmountClaimedDifference - bonusDifference, 'contractBalanceAfter');
    // CHECK THE CONTRIBUTORS ACCOUNT/WALLET BALANCE
    assert.equal(accountBalanceBefore, accountBalanceAfter - initialAmountClaimedDifference - bonusDifference, 'accountBalanceBefore');
    // CHECK THE VESTING SCHEDULE
    assert.equal(vestingInitialAmountBalanceAfter, 0, 'vestingInitialAmountBalanceAfter');
    assert.equal(bonusDifference, accountBalanceAfter - accountBalanceBefore - initialAmountClaimedDifference, 'bonusDifference');
  });

  it('Contributor 3 should be able to successfully release their tokens (Hosho audit response test)', async () => {
    const crowdsaleInstance = await LightstreamsCrowdsale.deployed();
    const tokenInstance = await LightstreamsToken.deployed();

    await timeTravel(3600 * 24 * 5);
    await mineBlock(); // workaround for https://github.com/ethereumjs/testrspc/issues/336

    const accountBalanceBefore = convertFromBnToInt(await tokenInstance.balanceOf(CONTRIBUTOR_3_ACCOUNT));
    const vestingScheduleBefore = await crowdsaleInstance.vestingSchedules(CONTRIBUTOR_3_ACCOUNT);
    await crowdsaleInstance.release(CONTRIBUTOR_3_ACCOUNT, {from: CONTRIBUTOR_3_ACCOUNT});
    const accountBalanceAfter = convertFromBnToInt(await tokenInstance.balanceOf(CONTRIBUTOR_3_ACCOUNT));
    const amt = convertFromBnToInt(vestingScheduleBefore[VESTING_SCHEDULE.initialAmount]);
    const bonus = convertFromBnToInt(vestingScheduleBefore[VESTING_SCHEDULE.initialBonus]);
    assert.equal(accountBalanceBefore + amt + bonus, accountBalanceAfter);
  });

  // 210 DAYS - BONUS
  it('The first contributor should be able to release the last part of their bonus', async () => {
    const crowdsaleInstance = await LightstreamsCrowdsale.deployed();
    const tokenInstance = await LightstreamsToken.deployed();

    // Time travel 1 month into the future
    const timeTravelTransaction = await timeTravel(3600 * 24 * 30);
    const mineBlockTransaction = await mineBlock(); // workaround for https://github.com/ethereumjs/testrspc/issues/336

    // GET BALANCES BEFORE RELEASE
    // CROWDSALE CONTRACT
    const contractBalanceBeforeBN = await tokenInstance.balanceOf(LightstreamsCrowdsale.address);
    const contractBalanceBefore = convertFromBnToInt(contractBalanceBeforeBN);
    // CONTRIBUTORS ACCOUNT/WALLET
    const accountBalanceBeforeBN = await tokenInstance.balanceOf(CONTRIBUTOR_1_ACCOUNT);
    const accountBalanceBefore = convertFromBnToInt(accountBalanceBeforeBN);
    // VESTING SCHEDULE
    const vestingScheduleBefore = await crowdsaleInstance.vestingSchedules(CONTRIBUTOR_1_ACCOUNT);
    // PURCHASED AMOUNT
    const vestingInitialAmountClaimedBefore = convertFromBnToInt(vestingScheduleBefore[VESTING_SCHEDULE.initialAmountClaimed]);
    const vestingBalanceBefore = convertFromBnToInt(vestingScheduleBefore[VESTING_SCHEDULE.initialBalance]);
    // BONUS
    const vestingBonusBefore = convertFromBnToInt(vestingScheduleBefore[VESTING_SCHEDULE.bonusBalance]);
    const vestingBonusClaimedBefore = convertFromBnToInt(vestingScheduleBefore[VESTING_SCHEDULE.bonusClaimed]);

    // RELEASE
    const release = await crowdsaleInstance.release(CONTRIBUTOR_1_ACCOUNT, {from: CONTRIBUTOR_1_ACCOUNT});

    // GET BALANCES AFTER RELEASE
    // CROWDSALE CONTRACT
    const contractBalanceAfterBN = await tokenInstance.balanceOf(LightstreamsCrowdsale.address);
    const contractBalanceAfter = convertFromBnToInt(contractBalanceAfterBN);
    // CONTRIBUTORS ACCOUNT/WALLET
    const accountBalanceAfterBN = await tokenInstance.balanceOf(CONTRIBUTOR_1_ACCOUNT);
    const accountBalanceAfter = convertFromBnToInt(accountBalanceAfterBN);
    // VESTING SCHEDULE
    const vestingScheduleAfter = await crowdsaleInstance.vestingSchedules(CONTRIBUTOR_1_ACCOUNT);
    // PURCHASED AMOUNT
    const vestingInitialAmountClaimedAfter = convertFromBnToInt(vestingScheduleAfter[VESTING_SCHEDULE.initialAmountClaimed]);
    const vestingInitialAmountBalanceAfter = convertFromBnToInt(vestingScheduleAfter[VESTING_SCHEDULE.initialBalance]);
    // BONUS
    const vestingBonusBalaceAfter = convertFromBnToInt(vestingScheduleAfter[VESTING_SCHEDULE.bonusBalance]);
    const vestingBonusClaimedAfter = convertFromBnToInt(vestingScheduleAfter[VESTING_SCHEDULE.bonusClaimed]);

    const initialAmountClaimedDifference = vestingInitialAmountClaimedBefore - vestingInitialAmountClaimedAfter;
    const bonusDifference = vestingBonusClaimedAfter - vestingBonusClaimedBefore;

    // CHECK THE CROWDSALE CONTRACT BALANCE
    assert.equal(contractBalanceAfter, contractBalanceBefore - initialAmountClaimedDifference - bonusDifference, 'contractBalanceAfter');
    // CHECK THE CONTRIBUTORS ACCOUNT/WALLET BALANCE
    assert.equal(accountBalanceBefore, accountBalanceAfter - initialAmountClaimedDifference - bonusDifference, 'accountBalanceBefore');
    // CHECK THE VESTING SCHEDULE
    assert.equal(vestingInitialAmountBalanceAfter, 0, 'vestingInitialAmountBalanceAfter');
    assert.equal(bonusDifference, accountBalanceAfter - accountBalanceBefore - initialAmountClaimedDifference, 'bonusDifference');
  });

  // 210 DAYS - BONUS
  it('The first contributor should not be able to release any more tokens after both initial amount and bonuses have been released', async () => {
    const crowdsaleInstance = await LightstreamsCrowdsale.deployed();
    const vesting = await crowdsaleInstance.vestingSchedules(CONTRIBUTOR_1_ACCOUNT);

    return assert.isRejected(crowdsaleInstance.release(CONTRIBUTOR_1_ACCOUNT, {from: CONTRIBUTOR_1_ACCOUNT}));
  });

  // 210 DAYS - BONUS
  it('The second contributor should be able to release all of their initial amount and bonus', async () => {
    const crowdsaleInstance = await LightstreamsCrowdsale.deployed();
    const tokenInstance = await LightstreamsToken.deployed();

    // GET BALANCES BEFORE RELEASE
    // CROWDSALE CONTRACT
    const contractBalanceBeforeBN = await tokenInstance.balanceOf(LightstreamsCrowdsale.address);
    const contractBalanceBefore = convertFromBnToInt(contractBalanceBeforeBN);
    // CONTRIBUTORS ACCOUNT/WALLET
    const accountBalanceBeforeBN = await tokenInstance.balanceOf(CONTRIBUTOR_2_ACCOUNT);
    const accountBalanceBefore = convertFromBnToInt(accountBalanceBeforeBN);
    // VESTING SCHEDULE
    const vestingScheduleBefore = await crowdsaleInstance.vestingSchedules(CONTRIBUTOR_2_ACCOUNT);
    // PURCHASED AMOUNT
    const vestingInitialAmountClaimedBefore = convertFromBnToInt(vestingScheduleBefore[VESTING_SCHEDULE.initialAmountClaimed]);
    const vestingBalanceBefore = convertFromBnToInt(vestingScheduleBefore[VESTING_SCHEDULE.initialBalance]);
    // BONUS
    const vestingBonusBefore = convertFromBnToInt(vestingScheduleBefore[VESTING_SCHEDULE.bonusBalance]);
    const vestingBonusClaimedBefore = convertFromBnToInt(vestingScheduleBefore[VESTING_SCHEDULE.bonusClaimed]);

    // RELEASE
    const release = await crowdsaleInstance.release(CONTRIBUTOR_2_ACCOUNT, {from: CONTRIBUTOR_2_ACCOUNT});

    // GET BALANCES AFTER RELEASE
    // CROWDSALE CONTRACT
    const contractBalanceAfterBN = await tokenInstance.balanceOf(LightstreamsCrowdsale.address);
    const contractBalanceAfter = convertFromBnToInt(contractBalanceAfterBN);
    // CONTRIBUTORS ACCOUNT/WALLET
    const accountBalanceAfterBN = await tokenInstance.balanceOf(CONTRIBUTOR_2_ACCOUNT);
    const accountBalanceAfter = convertFromBnToInt(accountBalanceAfterBN);
    // VESTING SCHEDULE
    const vestingScheduleAfter = await crowdsaleInstance.vestingSchedules(CONTRIBUTOR_2_ACCOUNT);
    // PURCHASED AMOUNT
    const vestingInitialAmountClaimedAfter = convertFromBnToInt(vestingScheduleAfter[VESTING_SCHEDULE.initialAmountClaimed]);
    const vestingInitialAmountBalanceAfter = convertFromBnToInt(vestingScheduleAfter[VESTING_SCHEDULE.initialBalance]);
    // BONUS
    const vestingBonusBalaceAfter = convertFromBnToInt(vestingScheduleAfter[VESTING_SCHEDULE.bonusBalance]);
    const vestingBonusClaimedAfter = convertFromBnToInt(vestingScheduleAfter[VESTING_SCHEDULE.bonusClaimed]);

    const initialAmountClaimedDifference = vestingInitialAmountClaimedAfter - vestingInitialAmountClaimedBefore;
    const bonusDifference = vestingBonusClaimedAfter - vestingBonusClaimedBefore;


    // CHECK THE CROWDSALE CONTRACT BALANCE
    assert.equal(contractBalanceAfter, contractBalanceBefore - initialAmountClaimedDifference - bonusDifference, 'contractBalanceAfter');
    // CHECK THE CONTRIBUTORS ACCOUNT/WALLET BALANCE
    assert.equal(accountBalanceBefore, accountBalanceAfter - initialAmountClaimedDifference - bonusDifference, 'accountBalanceBefore');
    // CHECK THE VESTING SCHEDULE
    assert.equal(vestingInitialAmountBalanceAfter, 0, 'vestingInitialAmountBalanceAfter');
    assert.equal(bonusDifference, accountBalanceAfter - accountBalanceBefore - initialAmountClaimedDifference, 'bonusDifference');
  });

  // 210 DAYS - BONUS
  it('The second contributor should not be able to release any more tokens after both initial amount and bonuses have been released', async () => {
    const crowdsaleInstance = await LightstreamsCrowdsale.deployed();

    return assert.isRejected(crowdsaleInstance.release(CONTRIBUTOR_2_ACCOUNT, {from: CONTRIBUTOR_2_ACCOUNT}));
  });

  it('should prevent more revoked tokens from being transferred than exist in the revocation pool', async () => {
    const crowdsaleInstance = await LightstreamsCrowdsale.deployed();
    const revokedAmount = convertFromBnToInt(await crowdsaleInstance.revokedAmount.call());
    return assert.isRejected(crowdsaleInstance.transferRevokedTokens('0x0000000000000000000000000000000000000001', convertEtherToWeiBN(revokedAmount + 1)));
  });

  it('should allow transfers of revoked tokens from the revocation pool', async () => {
    const crowdsaleInstance = await LightstreamsCrowdsale.deployed();
    const revokedAmount = convertFromBnToInt(await crowdsaleInstance.revokedAmount.call());
    await crowdsaleInstance.transferRevokedTokens('0x0000000000000000000000000000000000000001', convertEtherToWeiBN(revokedAmount));
    const revokedAfter = await crowdsaleInstance.revokedAmount.call();
    assert.equal(convertFromBnToInt(revokedAfter), 0);
  });
});