pragma solidity ^0.4.24;




/**
 * @title SafeMath
 * @dev Math operations with safety checks that throw on error
 */
library SafeMath {

  /**
  * @dev Multiplies two numbers, throws on overflow.
  */
  function mul(uint256 _a, uint256 _b) internal pure returns (uint256 c) {
    // Gas optimization: this is cheaper than asserting 'a' not being zero, but the
    // benefit is lost if 'b' is also tested.
    // See: https://github.com/OpenZeppelin/openzeppelin-solidity/pull/522
    if (_a == 0) {
      return 0;
    }

    c = _a * _b;
    assert(c / _a == _b);
    return c;
  }

  /**
  * @dev Integer division of two numbers, truncating the quotient.
  */
  function div(uint256 _a, uint256 _b) internal pure returns (uint256) {
    // assert(_b > 0); // Solidity automatically throws when dividing by 0
    // uint256 c = _a / _b;
    // assert(_a == _b * c + _a % _b); // There is no case in which this doesn't hold
    return _a / _b;
  }

  /**
  * @dev Subtracts two numbers, throws on overflow (i.e. if subtrahend is greater than minuend).
  */
  function sub(uint256 _a, uint256 _b) internal pure returns (uint256) {
    assert(_b <= _a);
    return _a - _b;
  }

  /**
  * @dev Adds two numbers, throws on overflow.
  */
  function add(uint256 _a, uint256 _b) internal pure returns (uint256 c) {
    c = _a + _b;
    assert(c >= _a);
    return c;
  }

  /**
  * @dev Divides two numbers and returns the remainder (unsigned integer modulo),
  * reverts when dividing by zero.
  */
  function mod(uint256 a, uint256 b) internal pure returns (uint256) {
    require(b != 0);
    return a % b;
  }
}



/**
 * @title ERC20 interface
 * @dev see https://github.com/ethereum/EIPs/issues/20
 */
contract ERC20 {
  function totalSupply() public view returns (uint256);

  function balanceOf(address _who) public view returns (uint256);

  function allowance(address _owner, address _spender)
    public view returns (uint256);

  function transfer(address _to, uint256 _value) public returns (bool);

  function approve(address _spender, uint256 _value)
    public returns (bool);

  function transferFrom(address _from, address _to, uint256 _value)
    public returns (bool);

  event Transfer(
    address indexed from,
    address indexed to,
    uint256 value
  );

  event Approval(
    address indexed owner,
    address indexed spender,
    uint256 value
  );
}




/**
 * @title Standard ERC20 token
 *
 * @dev Implementation of the basic standard token.
 * https://github.com/ethereum/EIPs/issues/20
 * Based on code by FirstBlood: https://github.com/Firstbloodio/token/blob/master/smart_contract/FirstBloodToken.sol
 */
contract StandardToken is ERC20 {
  using SafeMath for uint256;
  using SafeERC20 for ERC20;

  mapping(address => uint256) balances;

  mapping (address => mapping (address => uint256)) internal allowed;

  uint256 totalSupply_;

  /**
  * @dev Total number of tokens in existence
  */
  function totalSupply() public view returns (uint256) {
    return totalSupply_;
  }

  /**
  * @dev Gets the balance of the specified address.
  * @param _owner The address to query the the balance of.
  * @return An uint256 representing the amount owned by the passed address.
  */
  function balanceOf(address _owner) public view returns (uint256) {
    return balances[_owner];
  }

  /**
   * @dev Function to check the amount of tokens that an owner allowed to a spender.
   * @param _owner address The address which owns the funds.
   * @param _spender address The address which will spend the funds.
   * @return A uint256 specifying the amount of tokens still available for the spender.
   */
  function allowance(
    address _owner,
    address _spender
   )
    public
    view
    returns (uint256)
  {
    return allowed[_owner][_spender];
  }

  /**
  * @dev Transfer token for a specified address.
  * @param _to The address to transfer to.
  * @param _value The amount to be transferred.
  */
  function transfer(address _to, uint256 _value) public returns (bool) {
    require(_value <= balances[msg.sender]);
    require(_to != address(0));

    balances[msg.sender] = balances[msg.sender].sub(_value);
    balances[_to] = balances[_to].add(_value);
    emit Transfer(msg.sender, _to, _value);
    return true;
  }

  /**
   * @dev Approve the passed address to spend the specified amount of tokens on behalf of msg.sender.
   * Beware that changing an allowance with this method brings the risk that someone may use both the old
   * and the new allowance by unfortunate transaction ordering. One possible solution to mitigate this
   * race condition is to first reduce the spender's allowance to 0 and set the desired value afterwards:
   * https://github.com/ethereum/EIPs/issues/20#issuecomment-263524729
   * @param _spender The address which will spend the funds.
   * @param _value The amount of tokens to be spent.
   */
  function approve(address _spender, uint256 _value) public returns (bool) {
    allowed[msg.sender][_spender] = _value;
    emit Approval(msg.sender, _spender, _value);
    return true;
  }

  /**
   * @dev Transfer tokens from one address to another
   * @param _from address The address which you want to send tokens from
   * @param _to address The address which you want to transfer to
   * @param _value uint256 the amount of tokens to be transferred
   */
  function transferFrom(
    address _from,
    address _to,
    uint256 _value
  )
    public
    returns (bool)
  {
    require(_value <= balances[_from]);
    require(_value <= allowed[_from][msg.sender]);
    require(_to != address(0));

    balances[_from] = balances[_from].sub(_value);
    balances[_to] = balances[_to].add(_value);
    allowed[_from][msg.sender] = allowed[_from][msg.sender].sub(_value);
    emit Transfer(_from, _to, _value);
    return true;
  }

  /**
   * @dev Increase the amount of tokens that an owner allowed to a spender.
   * approve should be called when allowed[_spender] == 0. To increment
   * allowed value is better to use this function to avoid 2 calls (and wait until
   * the first transaction is mined)
   * From MonolithDAO Token.sol
   * @param _spender The address which will spend the funds.
   * @param _addedValue The amount of tokens to increase the allowance by.
   */
  function increaseApproval(
    address _spender,
    uint256 _addedValue
  )
    public
    returns (bool)
  {
    allowed[msg.sender][_spender] = (
      allowed[msg.sender][_spender].add(_addedValue));
    emit Approval(msg.sender, _spender, allowed[msg.sender][_spender]);
    return true;
  }

  /**
   * @dev Decrease the amount of tokens that an owner allowed to a spender.
   * approve should be called when allowed[_spender] == 0. To decrement
   * allowed value is better to use this function to avoid 2 calls (and wait until
   * the first transaction is mined)
   * From MonolithDAO Token.sol
   * @param _spender The address which will spend the funds.
   * @param _subtractedValue The amount of tokens to decrease the allowance by.
   */
  function decreaseApproval(
    address _spender,
    uint256 _subtractedValue
  )
    public
    returns (bool)
  {
    uint256 oldValue = allowed[msg.sender][_spender];
    if (_subtractedValue >= oldValue) {
      allowed[msg.sender][_spender] = 0;
    } else {
      allowed[msg.sender][_spender] = oldValue.sub(_subtractedValue);
    }
    emit Approval(msg.sender, _spender, allowed[msg.sender][_spender]);
    return true;
  }

}


/**
 * @title SafeERC20
 * @dev Wrappers around ERC20 operations that throw on failure.
 * To use this library you can add a `using SafeERC20 for ERC20;` statement to your contract,
 * which allows you to call the safe operations as `token.safeTransfer(...)`, etc.
 */
library SafeERC20 {
  function safeTransfer(
    ERC20 _token,
    address _to,
    uint256 _value
  )
    internal
  {
    require(_token.transfer(_to, _value));
  }

  function safeTransferFrom(
    ERC20 _token,
    address _from,
    address _to,
    uint256 _value
  )
    internal
  {
    require(_token.transferFrom(_from, _to, _value));
  }

  function safeApprove(
    ERC20 _token,
    address _spender,
    uint256 _value
  )
    internal
  {
    require(_token.approve(_spender, _value));
  }
}



/**
 * @title Ownable
 * @dev The Ownable contract has an owner address, and provides basic authorization control
 * functions, this simplifies the implementation of "user permissions".
 */
contract Ownable {
  address public owner;


  event OwnershipRenounced(address indexed previousOwner);
  event OwnershipTransferred(
    address indexed previousOwner,
    address indexed newOwner
  );


  /**
   * @dev The Ownable constructor sets the original `owner` of the contract to the sender
   * account.
   */
  constructor() public {
    owner = msg.sender;
  }

  /**
   * @dev Throws if called by any account other than the owner.
   */
  modifier onlyOwner() {
    require(msg.sender == owner);
    _;
  }

  /**
   * @dev Allows the current owner to relinquish control of the contract.
   * @notice Renouncing to ownership will leave the contract without an owner.
   * It will not be possible to call the functions with the `onlyOwner`
   * modifier anymore.
   */
  function renounceOwnership() public onlyOwner {
    emit OwnershipRenounced(owner);
    owner = address(0);
  }

  /**
   * @dev Allows the current owner to transfer control of the contract to a newOwner.
   * @param _newOwner The address to transfer ownership to.
   */
  function transferOwnership(address _newOwner) public onlyOwner {
    _transferOwnership(_newOwner);
  }

  /**
   * @dev Transfers control of the contract to a newOwner.
   * @param _newOwner The address to transfer ownership to.
   */
  function _transferOwnership(address _newOwner) internal {
    require(_newOwner != address(0));
    emit OwnershipTransferred(owner, _newOwner);
    owner = _newOwner;
  }
}


/**
 * @title Mintable token
 * @dev Simple ERC20 Token example, with mintable token creation
 * Based on code by TokenMarketNet: https://github.com/TokenMarketNet/ico/blob/master/contracts/MintableToken.sol
 */
contract MintableToken is StandardToken, Ownable {
  event Mint(address indexed to, uint256 amount);
  event MintFinished();

  bool public mintingFinished = false;


  modifier canMint() {
    require(!mintingFinished);
    _;
  }

  modifier hasMintPermission() {
    require(msg.sender == owner);
    _;
  }

  /**
   * @dev Function to mint tokens
   * @param _to The address that will receive the minted tokens.
   * @param _amount The amount of tokens to mint.
   * @return A boolean that indicates if the operation was successful.
   */
  function mint(
    address _to,
    uint256 _amount
  )
    public
    hasMintPermission
    canMint
    returns (bool)
  {
    totalSupply_ = totalSupply_.add(_amount);
    balances[_to] = balances[_to].add(_amount);
    emit Mint(_to, _amount);
    emit Transfer(address(0), _to, _amount);
    return true;
  }

  /**
   * @dev Function to stop minting new tokens.
   * @return True if the operation was successful.
   */
  function finishMinting() public onlyOwner canMint returns (bool) {
    mintingFinished = true;
    emit MintFinished();
    return true;
  }
}







/**
 * @title Pausable
 * @dev Base contract which allows children to implement an emergency stop mechanism.
 */
contract Pausable is Ownable {
  event Pause();
  event Unpause();

  bool public paused = false;


  /**
   * @dev Modifier to make a function callable only when the contract is not paused.
   */
  modifier whenNotPaused() {
    require(!paused);
    _;
  }

  /**
   * @dev Modifier to make a function callable only when the contract is paused.
   */
  modifier whenPaused() {
    require(paused);
    _;
  }

  /**
   * @dev called by the owner to pause, triggers stopped state
   */
  function pause() public onlyOwner whenNotPaused {
    paused = true;
    emit Pause();
  }

  /**
   * @dev called by the owner to unpause, returns to normal state
   */
  function unpause() public onlyOwner whenPaused {
    paused = false;
    emit Unpause();
  }
}


/**
 * @title Pausable token
 * @dev StandardToken modified with pausable transfers.
 **/
contract PausableToken is StandardToken, Pausable {

  function transfer(
    address _to,
    uint256 _value
  )
    public
    whenNotPaused
    returns (bool)
  {
    return super.transfer(_to, _value);
  }

  function transferFrom(
    address _from,
    address _to,
    uint256 _value
  )
    public
    whenNotPaused
    returns (bool)
  {
    return super.transferFrom(_from, _to, _value);
  }

  function approve(
    address _spender,
    uint256 _value
  )
    public
    whenNotPaused
    returns (bool)
  {
    return super.approve(_spender, _value);
  }

  function increaseApproval(
    address _spender,
    uint _addedValue
  )
    public
    whenNotPaused
    returns (bool success)
  {
    return super.increaseApproval(_spender, _addedValue);
  }

  function decreaseApproval(
    address _spender,
    uint _subtractedValue
  )
    public
    whenNotPaused
    returns (bool success)
  {
    return super.decreaseApproval(_spender, _subtractedValue);
  }
}



/**
 * @title Capped token
 * @dev Mintable token with a token cap.
 */
contract CappedToken is MintableToken {

  uint256 public cap;

  constructor(uint256 _cap) public {
    require(_cap > 0);
    cap = _cap;
  }

  /**
   * @dev Function to mint tokens
   * @param _to The address that will receive the minted tokens.
   * @param _amount The amount of tokens to mint.
   * @return A boolean that indicates if the operation was successful.
   */
  function mint(
    address _to,
    uint256 _amount
  )
    public
    returns (bool)
  {
    require(totalSupply_.add(_amount) <= cap);

    return super.mint(_to, _amount);
  }

}

contract LightstreamsToken is MintableToken, PausableToken, CappedToken {

  string public constant name = "Lightstream Token";
  string public constant symbol = "PHT";
  uint8 public constant decimals = 18;
  uint256 public constant decimalFactor = 10 ** uint256(decimals);
  uint256 public cap = 300000000 * decimalFactor; // There will be total 300 million PTH Tokens

  constructor() public
    CappedToken(cap)
  {

  }

}

/**
 * @title Monthly Vesting with Bonus
 *
 */
contract MonthlyVestingWithBonus is Ownable {
  using SafeMath for uint256;
  using SafeERC20 for ERC20;

  ERC20 public vestedToken;
  // Pool of revoked tokens and where tokens that have been adjusted from an error minting go
  // They can be transfered by the owner where ever they want to
  uint256 public revokedAmount = 0;

  event LogInt(string _type, uint _uint);

  /**
   * @dev Creates vesting schedule with vesting information
   * beneficiary address of the beneficiary to whom vested tokens are transferred
   * startTimestamp timestamp of when vesting begins
   * endTimestamp timestamp of when vesting ends
   * lockPeriod amount of time in seconds between withdrawal periods. (EG. 6 months or 1 month)
   * initialAmount - the initial amount of tokens to be vested that does not include the amount given as a bonus. Will not change
   * initialAmountClaimed - amount the beneficiary has released and claimed from the initial amount
   * initialBalance - the initialAmount less the initialAmountClaimed.  The remaining amount that can be vested.
   * initialBonus - the initial amount of tokens given as a bonus. Will not change
   * bonusClaimed - amount the beneficiary has released and claimed from the initial bonus
   * bonusBalance - the initialBonus less the bonusClaimed.  The remaining amount of the bonus that can be vested
   * revocable whether the vesting is revocable or not
   * revoked whether the vesting has been revoked or not
   */

  struct VestingSchedule {
    uint256 startTimestamp;
    uint256 endTimestamp;
    uint256 lockPeriod;
    uint256 initialAmount;
    uint256 initialAmountClaimed;
    uint256 initialBalance;
    uint256 initialBonus;
    uint256 bonusClaimed;
    uint256 bonusBalance;
    bool revocable;
    bool revoked;
  }

  mapping (address => VestingSchedule) public vestingSchedules;

  /**
   * Event for when a new vesting schedule is created
   * @param _beneficiary Address of investor tokens minted and vested for
   * @param _totalPurchased number of token purchased or minted not including any bonus
   * @param _initialBonus the number of tokens given as a bonus when minting or received from early crowdsale participation
   */
  event NewVesting(address _beneficiary, uint256 _totalPurchased, uint256 _initialBonus);

  /**
   * Event for when the beneficiary releases vested tokens to their account/wallet
   * @param _recipient address beneficiary/recipient tokens released to
   * @param _amount the number of tokens release
   */
  event Released(address _recipient, uint256 _amount);

  /**
   * Event for when the owner revokes the vesting of a contributor releasing any vested tokens to the beneficiary,
   * and the remaining balance going to the contract to be distributed by the contact owner
   * @param _beneficiary address of beneficiary vesting is being cancelled for
   */
  event RevokedVesting(address _beneficiary);

  /**
   * @dev Constructor function - Set the Lightstream token address
   */
  constructor(ERC20 _lightstream) public {
    vestedToken = _lightstream;
  }

  /**
   * @dev Allows the beneficiary of a vesting schedule to release vested tokens to their account/wallet
   * @param _beneficiary The address of the recipient of vested tokens
   */
  function release(address _beneficiary) public returns(uint){
    require(vestingSchedules[_beneficiary].initialBalance > 0 || vestingSchedules[_beneficiary].bonusBalance > 0);
    require(msg.sender == _beneficiary);

    VestingSchedule memory vestingSchedule = vestingSchedules[_beneficiary];

    uint256 totalAmountVested = calculateTotalAmountVested(_beneficiary, vestingSchedule.startTimestamp, vestingSchedule.endTimestamp, vestingSchedule.initialAmount);
    uint256 amountWithdrawable = totalAmountVested.sub(vestingSchedule.initialAmountClaimed);
    uint256 releasable = withdrawalAllowed(amountWithdrawable,  vestingSchedule.startTimestamp, vestingSchedule.endTimestamp, vestingSchedule.lockPeriod, vestingSchedule.initialAmount);

    if(releasable > 0) {
      vestingSchedules[_beneficiary].initialAmountClaimed = vestingSchedule.initialAmountClaimed.add(releasable);
      vestingSchedules[_beneficiary].initialBalance = vestingSchedule.initialBalance.sub(releasable);

      vestedToken.safeTransfer(_beneficiary, releasable);

      emit Released(_beneficiary, releasable);
    }

    if (now > vestingSchedule.endTimestamp && vestingSchedule.bonusBalance > 0) {
      uint256 withdrawableBonus = calculateBonusWithdrawal(vestingSchedule.startTimestamp, vestingSchedule.endTimestamp, vestingSchedule.lockPeriod, vestingSchedule.initialAmount, vestingSchedule.bonusBalance);
  
      if (withdrawableBonus > 0) {
        emit LogInt('withdrawableBonus', withdrawableBonus);
    
        vestingSchedules[_beneficiary].bonusClaimed = vestingSchedule.bonusClaimed.add(withdrawableBonus);
        vestingSchedules[_beneficiary].bonusBalance = vestingSchedule.bonusBalance.sub(withdrawableBonus);
    
        vestedToken.safeTransfer(_beneficiary, withdrawableBonus);
        emit Released(_beneficiary, withdrawableBonus);
      }
    }
  }

  /**
   * @dev Allows the to revoke the vesting schedule for a contributor/investor with a vesting schedule
   * @param _beneficiary Address of contributor/investor with a vesting schedule to be revoked
   */
  function revokeVesting (address _beneficiary) onlyOwner public {
    require(vestingSchedules[_beneficiary].revocable == true);

    VestingSchedule memory vestingSchedule = vestingSchedules[_beneficiary];

    uint256 totalAmountVested = calculateTotalAmountVested(_beneficiary, vestingSchedule.startTimestamp, vestingSchedule.endTimestamp, vestingSchedule.initialAmount);
    uint256 amountWithdrawable = totalAmountVested.sub(vestingSchedule.initialAmountClaimed);

    uint256 refundable = withdrawalAllowed(amountWithdrawable,  vestingSchedule.startTimestamp, vestingSchedule.endTimestamp, vestingSchedule.lockPeriod, vestingSchedule.initialAmount);
    uint256 refundableBonus = calculateBonusWithdrawal(vestingSchedule.startTimestamp, vestingSchedule.endTimestamp, vestingSchedule.lockPeriod, vestingSchedule.initialAmount, vestingSchedule.bonusBalance);

    uint256 toProjectWalletFromInitialAmount = vestingSchedule.initialBalance.sub(refundable);
    uint256 toProjectWalletFromInitialBonus = vestingSchedule.initialBonus.sub(refundableBonus);
    uint256 backToProjectWallet = toProjectWalletFromInitialAmount.add(toProjectWalletFromInitialBonus);

    revokedAmount = revokedAmount.add(backToProjectWallet);

    vestingSchedules[_beneficiary].initialAmountClaimed = vestingSchedule.initialAmountClaimed.add(refundable);
    vestingSchedules[_beneficiary].initialBalance = 0;
    vestingSchedules[_beneficiary].bonusClaimed = vestingSchedule.bonusClaimed.add(refundableBonus);
    vestingSchedules[_beneficiary].bonusBalance = 0;
    vestingSchedules[_beneficiary].revoked = true;

    if(refundable > 0 || refundableBonus > 0) {
      uint256 totalRefundable = refundable.add(refundableBonus);
      vestedToken.safeTransfer(_beneficiary, totalRefundable);

      emit Released(_beneficiary, totalRefundable);
    }

    emit RevokedVesting(_beneficiary);
  }

  /**
   * @dev Allows the owner to transfer any tokens that have been revoked to be transfered to another address
   * @param _recipient The address where the tokens should be sent
   * @param _amount Number of tokens to be transfer to recipient
   */
  function transferRevokedTokens(address _recipient, uint256 _amount) public onlyOwner {
    require(_amount <= revokedAmount);
    require(_recipient != address(0));
    revokedAmount = revokedAmount.sub(_amount);
    require(vestedToken.transfer(_recipient, _amount));
  }


  /**
   * @dev Sets the vesting schedule for a beneficiary who either purchased tokens or had them minted
   * @param _beneficiary The recipient of the allocation
   * @param _totalPurchased The total amount of Lightstream purchased
   * @param _initialBonus The investors bonus from purchasing
   */
  function setVestingSchedule(address _beneficiary, uint256 _totalPurchased, uint256 _initialBonus) internal {
    require(vestingSchedules[_beneficiary].startTimestamp == 0);

    vestingSchedules[_beneficiary] = VestingSchedule(now, now + 150 days, 30 days, _totalPurchased, 0, _totalPurchased, _initialBonus, 0, _initialBonus, true, false);

    emit NewVesting(_beneficiary, _totalPurchased, _initialBonus);
  }

  function updateVestingSchedule(address _beneficiary, uint256 _totalPurchased, uint256 _initialBonus) public onlyOwner {
    VestingSchedule memory vestingSchedule = vestingSchedules[_beneficiary];
    require(vestingSchedule.startTimestamp != 0);
    require(vestingSchedule.initialAmount.sub(vestingSchedule.initialAmountClaimed) >= _totalPurchased);
    require(vestingSchedule.initialBonus.sub(vestingSchedule.bonusClaimed) >=  _initialBonus);
    
    uint256 totalPurchaseDifference = vestingSchedule.initialAmount.sub(vestingSchedule.initialAmountClaimed).sub(_totalPurchased);
    uint256 totalBonusDifference = vestingSchedule.initialBonus.sub(vestingSchedule.bonusClaimed).sub(_initialBonus);

    revokedAmount = revokedAmount.add(totalPurchaseDifference).add(totalBonusDifference);

    vestingSchedules[_beneficiary] = VestingSchedule(now, now + 150 days, 30 days, _totalPurchased, 0, _totalPurchased, _initialBonus, 0, _initialBonus, true, false);

    emit NewVesting(_beneficiary, _totalPurchased, _initialBonus);
  }

  /**
   * @dev Calculates the total amount vested since the start time. If after the endTime
   * the entire initialBalance is returned
   */
  function calculateTotalAmountVested(address _beneficiary, uint256 _startTimestamp, uint256 _endTimestamp, uint256 _initialAmount) internal view returns (uint256 _amountVested) {
    // If it's past the end time, the whole amount is available.
    if (now >= _endTimestamp) {
      return vestingSchedules[_beneficiary].initialAmount;
    }

    // get the amount of time that passed since the start of vesting
    uint256 durationSinceStart = SafeMath.sub(now, _startTimestamp);
    // Get the amount of time amount of time the vesting will happen over
    uint256 totalVestingTime = SafeMath.sub(_endTimestamp, _startTimestamp);
    // Calculate the amount vested as a ratio
    uint256 vestedAmount = SafeMath.div(
      SafeMath.mul(durationSinceStart, _initialAmount),
      totalVestingTime
    );

    return vestedAmount;
  }

  /**
   * @dev Calculates the amount releasable. If the amount is less than the allowable amount
   * for each lock period zero will be returned. If more than the allowable amount each month will return
   * a multiple of the allowable amount each month
   * @param _amountWithdrawable The total amount vested so far less the amount that has been released so far
   * @param _startTimestamp The start time of for when vesting started
   * @param _endTimestamp The end time of for when vesting will be complete and all tokens available
   * @param _lockPeriod time interval (ins econds) in between vesting releases (example 30 days = 2592000 seconds)
   * @param _initialAmount The starting number of tokens vested
   */
  function withdrawalAllowed(uint256 _amountWithdrawable, uint256 _startTimestamp, uint256 _endTimestamp, uint256 _lockPeriod, uint256 _initialAmount) internal view returns(uint256 _amountReleasable) {
    // If it's past the end time, the whole amount is available.
    if (now >= _endTimestamp) {
      return _amountWithdrawable;
    }
    // calculate the number of time periods vesting is done over
    uint256 lockPeriods = (_endTimestamp.sub(_startTimestamp)).div(_lockPeriod);
    uint256 amountWithdrawablePerLockPeriod = SafeMath.div(_initialAmount, lockPeriods);

    // get the remainder and subtract it from the amount amount withdrawable to get a multiple of the
    // amount withdrawable per lock period
    uint256 remainder = SafeMath.mod(_amountWithdrawable, amountWithdrawablePerLockPeriod);
    uint256 amountReleasable = _amountWithdrawable.sub(remainder);

    if (now < _endTimestamp && amountReleasable >= amountWithdrawablePerLockPeriod) {
      return amountReleasable;
    }

    return 0;
  }

  /**
   * @dev Calculates the amount of the bonus that is releasable. If the amount is less than the allowable amount
   * for each lock period zero will be returned. It has been 30 days since the initial vesting has ended an amount
   * equal to the original releases will be returned.  If over 60 days the entire bonus can be released
   * @param _amountWithdrawable The total amount vested so far less the amount that has been released so far
   * @param _startTimestamp The start time of for when vesting started
   * @param _endTimestamp The end time of for when vesting will be complete and all tokens available
   * @param _lockPeriod time interval (ins econds) in between vesting releases (example 30 days = 2592000 seconds)
   * @param _initialAmount The starting number of tokens vested
   * @param _bonusBalance The current balance of the vested bonus
   */

  function calculateBonusWithdrawal(uint256 _startTimestamp, uint _endTimestamp, uint256 _lockPeriod, uint256 _initialAmount, uint256 _bonusBalance) internal view returns(uint256 _amountWithdrawable) {
    if (now >= _endTimestamp.add(30 days) && now < _endTimestamp.add(60 days)) {
      // calculate the number of time periods vesting is done over
      uint256 lockPeriods = (_endTimestamp.sub(_startTimestamp)).div(_lockPeriod);
      uint256 amountWithdrawablePerLockPeriod = SafeMath.div(_initialAmount, lockPeriods);
      
      if (_bonusBalance < amountWithdrawablePerLockPeriod) {
        return _bonusBalance;
      }
      
      return amountWithdrawablePerLockPeriod;
    } else if (now >= _endTimestamp.add(60 days)){
      return _bonusBalance;
    }

    return 0;
  }
}


/**
 * @title Crowdsale
 * @dev Crowdsale is a base contract for managing a token crowdsale,
 * allowing investors to purchase tokens with ether. This contract implements
 * such functionality in its most fundamental form and can be extended to provide additional
 * functionality and/or custom behavior.
 * The external interface represents the basic interface for purchasing tokens, and conform
 * the base architecture for crowdsales. They are *not* intended to be modified / overridden.
 * The internal interface conforms the extensible and modifiable surface of crowdsales. Override
 * the methods to add functionality. Consider using 'super' where appropriate to concatenate
 * behavior.
 */

contract Crowdsale is Ownable, MonthlyVestingWithBonus, Pausable {
  using SafeMath for uint256;
  using SafeERC20 for ERC20;

  // The token being sold
  ERC20 public token;

  // Address where funds are collected
  address public wallet;

  // How many token units a buyer gets per wei.
  // The rate is the conversion between wei and the smallest and indivisible token unit.
  // So, if you are using a rate of 1 with a DetailedERC20 token with 3 decimals called TOK
  // 1 wei will give you 1 unit, or 0.001 TOK.
  uint16 public rate;
  uint256 public openingTime;

  mapping (address => uint256) public bonuses;


  // Amount of wei raised
  uint256 public weiRaised;
  uint256 public tokensSold;

  uint256 private constant decimalFactor = 10 ** uint256(18);
  uint256 private constant INITIAL_MINT_MAX =   13500000 * decimalFactor; // Max amount that can be minted approximately 2 million USD if sold at .15
  uint256 private constant INITIAL_MINT_MIN =      330000 * decimalFactor; // Min amount that can be minted approximately 50,000 USD if sold at .15
  uint256 private constant BONUS_MIN =                  0;                 // Min amount that can be minted approximately 50,000 USD if sold at .15

  /**
   * Event for token purchase logging
   * @param purchaser who paid for the tokens
   * @param beneficiary who got the tokens
   * @param value weis paid for purchase
   * @param amount amount of tokens purchased
   */
  event TokenPurchase(
    address purchaser,
    address beneficiary,
    uint256 value,
    uint256 amount
  );

  /**
   * Event for tokens minted by the owner for contributors in private sale
   * @param beneficiary Address of investor tokens minted and vested for
   * @param tokens number of PTH to be minted 1 PTH = 1000000000000000000
   * @param bonus number of PTH to be minted and given as bonus
   */
  event TokensMintedAndVested(
    address beneficiary,
    uint256 tokens,
    uint256 bonus
  );

  event FundsReceivedOnFallback(address sender, uint256 value);

  /**
   * @param _rate Number of token units a buyer gets per wei
   * @param _wallet Address where collected funds will be forwarded to
   * @param _token Address of the token being sold
   */
  constructor(uint16 _rate, address _wallet, ERC20 _token, uint256 _openingTime) public {
    require(_rate > 0);
    require(_wallet != address(0));
    require(_token != address(0));

    rate = _rate;
    wallet = _wallet;
    token = _token;
    vestedToken = _token;
    openingTime  = _openingTime;
  }

  // -----------------------------------------
  // Crowdsale external interface
  // -----------------------------------------

  /**
   * @dev fallback function ***DO NOT OVERRIDE***
   */
  function () external payable {
    require(msg.data.length == 0);
    emit FundsReceivedOnFallback(msg.sender, msg.value);
    _forwardFunds();
  }

  /**
   * @dev low level token purchase ***DO NOT OVERRIDE***
   * @param _beneficiary Address performing the token purchase
   */
  function buyTokens(address _beneficiary) public payable whenNotPaused {
    require(vestingSchedules[_beneficiary].startTimestamp == 0);

    uint256 weiAmount = msg.value;

    _preValidatePurchase(_beneficiary, weiAmount);

    // calculate token amount to be created
    uint256 tokens = _getTokenAmount(weiAmount);
    uint256 bonus =  _getBonus(tokens);

    // update state
    weiRaised = weiRaised.add(weiAmount);
    tokensSold = tokensSold.add(tokens).add(bonus);

    _processPurchase(_beneficiary, tokens, bonus);

    emit TokenPurchase(
      msg.sender,
      _beneficiary,
      weiAmount,
      tokens
    );

    _forwardFunds();
  }

  /**
  * @param _beneficiary Address minting the tokens for
  * @param _tokens number fo PTH to be minted 1 PTH = 1000000000000000000
  * @param _bonus number fo PTH to be minted  1 PTH = 1000000000000000000
  */
  function mintAndVest(address _beneficiary, uint256 _tokens, uint256 _bonus) public onlyOwner {
    require(vestingSchedules[_beneficiary].startTimestamp == 0);

    _preValidateMintAndVest(_beneficiary, _tokens, _bonus);

    // update state
    tokensSold = tokensSold.add(_tokens).add(_bonus);

    _processPurchase(_beneficiary, _tokens, _bonus);

    emit TokensMintedAndVested(
      _beneficiary,
      _tokens,
      _bonus
    );
  }

  /**
   * @dev updates the number of PTH given per wei. It will not allow a change over 10 percent of the current rate
   * @param _newRate number of PTH given per wei
   */
  function updateRate(uint16 _newRate) public onlyOwner {
    uint256 lowestRate = SafeMath.div(
      SafeMath.mul(rate, 9),
      10
    );

    uint256 highestRate = SafeMath.div(
      SafeMath.mul(rate, 11),
      10
    );

    require(_newRate >= lowestRate && _newRate <= highestRate);

    rate = _newRate;
  }

  /**
   * @dev Allows transfer of accidentally sent ERC20 tokens to contract
   * @param _recipient address of recipient to receive ERC20 token
   * @param _token address ERC20 token to transfer
   */
  function refundTokens(address _recipient, address _token) public onlyOwner {
    require(_token != address(token));
    require(_recipient != address(0));
    require(_token != address(0));
    ERC20 refundToken = ERC20(_token);
    uint256 balance = refundToken.balanceOf(this);
    require(balance > 0);
    require(refundToken.transfer(_recipient, balance));
  }

  /**
   * @dev The sales contract needs to be made the owner of the token in order to mint tokens. If the owner
   * of the token needs to be updated it will have to come from the sales contract.  This was another contract
   * could be added later for second sale
   * @param _newOwnerAddress address of contract or wallet that will become owner of token giving it minting privileges
   */
  function updateTokenOwner(address _newOwnerAddress) public onlyOwner {
    require(_newOwnerAddress != address(0));
    LightstreamsToken lsToken = LightstreamsToken(token);
    lsToken.transferOwnership(_newOwnerAddress);
  }


  // -----------------------------------------
  // Internal interface (extensible)
  // -----------------------------------------

  /**
   * @dev Validation of an incoming purchase. Use require statements to revert state when conditions are not met. Use `super` in contracts that inherit from Crowdsale to extend their validations.
   * Example from CappedCrowdsale.sol's _preValidatePurchase method:
   *   super._preValidatePurchase(_beneficiary, _weiAmount);
   *   require(weiRaised.add(_weiAmount) <= cap);
   * @param _beneficiary Address performing the token purchase
   * @param _weiAmount Value in wei involved in the purchase
   */
  function _preValidatePurchase(
    address _beneficiary,
    uint256 _weiAmount
  )
  internal
  {
    require(_beneficiary != address(0));
    require(_weiAmount != 0);
  }

  /**
   * @dev Validation of an incoming minting  and vesting by the owner
   * @param _beneficiary Address of the investor/contributor tokens are being minted for
   * @param _tokens Number of tokens to purchased in smallest unit of PHT 18 decimals
   * @param _bonus Number of tokens allocated to the investor for contributing
   */
  function _preValidateMintAndVest(
    address _beneficiary,
    uint256 _tokens,
    uint256 _bonus
  )
  internal
  {
    uint256 bonusMax = SafeMath.div(
        SafeMath.mul(_tokens, 40),
        100
      );
    require(_tokens >= INITIAL_MINT_MIN && _tokens <= INITIAL_MINT_MAX);
    require(_bonus >= BONUS_MIN && _bonus <= bonusMax);
    require(_bonus <= _tokens);
  }

  /**
   * @dev Source of tokens. Override this method to modify the way in which the crowdsale ultimately gets and sends its tokens.
   * @param _beneficiary address to receive tokens after they're minted
   * @param _tokenAmount Number of tokens to be emitted
   */
  function _deliverTokens(
    address _beneficiary,
    uint256 _tokenAmount
  )
  internal
  {
    token.safeTransfer(_beneficiary, _tokenAmount);
  }

  /**
   * @dev Executed when a purchase has been validated and is ready to be executed. Not necessarily emits/sends tokens.
   * @param _beneficiary Address receiving the tokens
   * @param _tokensPurchased Number of tokens to be purchased
   * @param _bonus Number of tokens awarded as a bonus
   */
  function _processPurchase(
    address _beneficiary,
    uint256 _tokensPurchased,
    uint _bonus
  )
  internal
  {
    uint256 totalTokens = _tokensPurchased.add(_bonus);
    _deliverTokens(address(this), totalTokens);

    setVestingSchedule(_beneficiary, _tokensPurchased, _bonus);
  }

  /**
   * @dev Override to extend the way in which ether is converted to tokens.
   * @param _weiAmount Value in wei to be converted into tokens
   * @return Number of tokens that can be purchased with the specified _weiAmount
   */
  function _getTokenAmount(uint256 _weiAmount) internal view returns (uint256)
  {
    return _weiAmount.mul(rate);
  }


  /**
   * @dev Override to extend the way in which ether is converted to tokens.
   * @return Number of tokens that the investor is entitled to based on bonus
   */
  function _getBonus(uint256 _tokens) internal returns (uint256 _bonus) {
    uint256 bonus = 0;
    // If within days 0 - 2 contributor gets a 30 percent bonus
    if(now >= openingTime && now < openingTime + 2 days) {
      bonus = SafeMath.div(
        SafeMath.mul(_tokens, 30),
        100
      );
    // If within days 2 - 4 contributor gets a 20 percent bonus
    } else if (now >= openingTime + 2 days && now < openingTime + 4 days) {
      bonus = SafeMath.div(
        SafeMath.mul(_tokens, 20),
        100
      );
    // If within days 4 - 6 contributor gets a 10 percent bonus
    } else if (now >= openingTime + 4 days && now < openingTime + 6 days) {
      bonus = SafeMath.div(
        SafeMath.mul(_tokens, 10),
        100
      );
    // If within days 6 - 8 contributor gets a 5 percent bonus
    } else if (now >= openingTime + 6 days && now < openingTime + 8 days) {
      bonus = SafeMath.div(
        SafeMath.mul(_tokens, 5),
        100
      );
    }

    return bonus;
  }

  /**
   * @dev Determines how ETH is stored/forwarded on purchases.
   */
  function _forwardFunds() internal {
    wallet.transfer(msg.value);
  }
}


/**
 * @title TokenCappedCrowdsale
 * @dev Crowdsale with a limit for the amount of tokens that can be sold
 */
contract TokenCappedCrowdsale is Crowdsale {
  using SafeMath for uint256;

  uint256 public tokenCap;

  /**
   * @dev Constructor, takes maximum amount of tokens sold in the crowdsale
   * @param _tokenCap Max amount of tokens to be sold
   */
  constructor(uint256 _tokenCap) public {
    require(_tokenCap > 0);
    tokenCap = _tokenCap;
  }

  /**
   * @dev Checks whether the cap has been reached.
   * @return Whether the cap was reached
   */
  function capReached() public view returns (bool) {
    return tokensSold >= tokenCap;
  }

  /**
   * @dev Extend parent behavior requiring purchase to respect the funding cap.
   * @param _beneficiary Token purchaser
   * @param _weiAmount Amount of wei contributed
   */
  function _preValidatePurchase(
    address _beneficiary,
    uint256 _weiAmount
  )
  internal
  {
    super._preValidatePurchase(_beneficiary, _weiAmount);
    uint256 tokensPurchasing = super._getTokenAmount(_weiAmount);
    uint256 bonus = super._getBonus(tokensPurchasing);
    require(tokensSold.add(tokensPurchasing).add(bonus) <= tokenCap, 'tokenCap');
  }

  function _preValidateMintAndVest(
    address _beneficiary,
    uint256 _tokens,
    uint256 _bonus
  )
  internal
  {
    super._preValidateMintAndVest(_beneficiary, _tokens, _bonus);
    require(tokensSold.add(_tokens).add(_bonus) <= tokenCap, 'tokenCap');
  }


}




/**
 * @title TimedCrowdsale
 * @dev Crowdsale accepting contributions only within a time frame.
 */
contract TimedCrowdsale is Crowdsale {
  using SafeMath for uint256;

  uint256 public openingTime;
  uint256 public closingTime;

  /**
   * @dev Reverts if not in crowdsale time range.
   */
  modifier onlyWhileOpen {
    // solium-disable-next-line security/no-block-members
    require(block.timestamp >= openingTime && block.timestamp <= closingTime);
    _;
  }

  /**
   * @dev Constructor, takes crowdsale opening and closing times.
   * @param _openingTime Crowdsale opening time
   * @param _closingTime Crowdsale closing time
   */
  constructor(uint256 _openingTime, uint256 _closingTime) public {
    // solium-disable-next-line security/no-block-members
    require(_openingTime >= block.timestamp);
    require(_closingTime >= _openingTime);

    openingTime = _openingTime;
    closingTime = _closingTime;
  }

  /**
   * @dev Checks whether the period in which the crowdsale is open has already elapsed.
   * @return Whether crowdsale period has elapsed
   */
  function hasClosed() public returns (bool) {
    // solium-disable-next-line security/no-block-members
    return now > closingTime;
  }

  /**
   * @dev Extend parent behavior requiring to be within contributing period
   * @param _beneficiary Token purchaser
   * @param _weiAmount Amount of wei contributed
   */
  function _preValidatePurchase(
    address _beneficiary,
    uint256 _weiAmount
  )
    internal
    onlyWhileOpen
  {
    super._preValidatePurchase(_beneficiary, _weiAmount);
  }

}


/**
 * @title FinalizableCrowdsale
 * @dev Extension of Crowdsale where an owner can do extra work
 * after finishing.
 */
contract FinalizableCrowdsale is Ownable, TimedCrowdsale {
  using SafeMath for uint256;

  bool public isFinalized = false;

  event Finalized();

  /**
   * @dev Must be called after crowdsale ends, to do some extra finalization
   * work. Calls the contract's finalization function.
   */
  function finalize() public onlyOwner {
    require(!isFinalized, 'Is Finalized');
    require(hasClosed(), 'Has Closed');

    finalization();
    emit Finalized();

    isFinalized = true;
  }

  /**
   * @dev Can be overridden to add finalization logic. The overriding function
   * should call super.finalization() to ensure the chain of finalization is
   * executed entirely.
   */
  function finalization() internal {
  }

}



/**
 * @title MintedCrowdsale
 * @dev Extension of Crowdsale contract whose tokens are minted in each purchase.
 * Token ownership should be transferred to MintedCrowdsale for minting.
 */
contract MintedCrowdsale is Crowdsale {

  /**
   * @dev Overrides delivery by minting tokens upon purchase.
   * @param _beneficiary Token purchaser
   * @param _tokenAmount Number of tokens to be minted
   */
  function _deliverTokens(
    address _beneficiary,
    uint256 _tokenAmount
  )
    internal
  {
    // Potentially dangerous assumption about the type of the token.
    require(MintableToken(address(token)).mint(_beneficiary, _tokenAmount));
  }
}






/**
 * @title Roles
 * @author Francisco Giordano (@frangio)
 * @dev Library for managing addresses assigned to a Role.
 * See RBAC.sol for example usage.
 */
library Roles {
  struct Role {
    mapping (address => bool) bearer;
  }

  /**
   * @dev give an account access to this role
   */
  function add(Role storage _role, address _account)
    internal
  {
    _role.bearer[_account] = true;
  }

  /**
   * @dev remove an account's access to this role
   */
  function remove(Role storage _role, address _account)
    internal
  {
    _role.bearer[_account] = false;
  }

  /**
   * @dev check if an account has this role
   * // reverts
   */
  function check(Role storage _role, address _account)
    internal
    view
  {
    require(has(_role, _account));
  }

  /**
   * @dev check if an account has this role
   * @return bool
   */
  function has(Role storage _role, address _account)
    internal
    view
    returns (bool)
  {
    return _role.bearer[_account];
  }
}


/**
 * @title RBAC (Role-Based Access Control)
 * @author Matt Condon (@Shrugs)
 * @dev Stores and provides setters and getters for roles and addresses.
 * Supports unlimited numbers of roles and addresses.
 * See //contracts/mocks/RBACMock.sol for an example of usage.
 * This RBAC method uses strings to key roles. It may be beneficial
 * for you to write your own implementation of this interface using Enums or similar.
 */
contract RBAC {
  using Roles for Roles.Role;

  mapping (string => Roles.Role) private roles;

  event RoleAdded(address indexed operator, string role);
  event RoleRemoved(address indexed operator, string role);

  /**
   * @dev reverts if addr does not have role
   * @param _operator address
   * @param _role the name of the role
   * // reverts
   */
  function checkRole(address _operator, string _role)
    public
    view
  {
    roles[_role].check(_operator);
  }

  /**
   * @dev determine if addr has role
   * @param _operator address
   * @param _role the name of the role
   * @return bool
   */
  function hasRole(address _operator, string _role)
    public
    view
    returns (bool)
  {
    return roles[_role].has(_operator);
  }

  /**
   * @dev add a role to an address
   * @param _operator address
   * @param _role the name of the role
   */
  function addRole(address _operator, string _role)
    internal
  {
    roles[_role].add(_operator);
    emit RoleAdded(_operator, _role);
  }

  /**
   * @dev remove a role from an address
   * @param _operator address
   * @param _role the name of the role
   */
  function removeRole(address _operator, string _role)
    internal
  {
    roles[_role].remove(_operator);
    emit RoleRemoved(_operator, _role);
  }

  /**
   * @dev modifier to scope access to a single role (uses msg.sender as addr)
   * @param _role the name of the role
   * // reverts
   */
  modifier onlyRole(string _role)
  {
    checkRole(msg.sender, _role);
    _;
  }
}


/**
 * @title Whitelist
 * @dev The Whitelist contract has a whitelist of addresses, and provides basic authorization control functions.
 * This simplifies the implementation of "user permissions".
 */
contract Whitelist is Ownable, RBAC {
  string public constant ROLE_WHITELISTED = "whitelist";

  /**
   * @dev Throws if operator is not whitelisted.
   * @param _operator address
   */
  modifier onlyIfWhitelisted(address _operator) {
    checkRole(_operator, ROLE_WHITELISTED);
    _;
  }

  /**
   * @dev add an address to the whitelist
   * @param _operator address
   * @return true if the address was added to the whitelist, false if the address was already in the whitelist
   */
  function addAddressToWhitelist(address _operator)
    public
    onlyOwner
  {
    addRole(_operator, ROLE_WHITELISTED);
  }

  /**
   * @dev getter to determine if address is in whitelist
   */
  function whitelist(address _operator)
    public
    view
    returns (bool)
  {
    return hasRole(_operator, ROLE_WHITELISTED);
  }

  /**
   * @dev add addresses to the whitelist
   * @param _operators addresses
   * @return true if at least one address was added to the whitelist,
   * false if all addresses were already in the whitelist
   */
  function addAddressesToWhitelist(address[] _operators)
    public
    onlyOwner
  {
    for (uint256 i = 0; i < _operators.length; i++) {
      addAddressToWhitelist(_operators[i]);
    }
  }

  /**
   * @dev remove an address from the whitelist
   * @param _operator address
   * @return true if the address was removed from the whitelist,
   * false if the address wasn't in the whitelist in the first place
   */
  function removeAddressFromWhitelist(address _operator)
    public
    onlyOwner
  {
    removeRole(_operator, ROLE_WHITELISTED);
  }

  /**
   * @dev remove addresses from the whitelist
   * @param _operators addresses
   * @return true if at least one address was removed from the whitelist,
   * false if all addresses weren't in the whitelist in the first place
   */
  function removeAddressesFromWhitelist(address[] _operators)
    public
    onlyOwner
  {
    for (uint256 i = 0; i < _operators.length; i++) {
      removeAddressFromWhitelist(_operators[i]);
    }
  }

}


/**
 * @title WhitelistedCrowdsale
 * @dev Crowdsale in which only whitelisted users can contribute.
 */
contract WhitelistedCrowdsale is Whitelist, Crowdsale {
  /**
   * @dev Extend parent behavior requiring beneficiary to be in whitelist.
   * @param _beneficiary Token beneficiary
   * @param _weiAmount Amount of wei contributed
   */
  function _preValidatePurchase(
    address _beneficiary,
    uint256 _weiAmount
  )
    internal
    onlyIfWhitelisted(_beneficiary)
  {
    super._preValidatePurchase(_beneficiary, _weiAmount);
  }

}


/**
 * @title LightstreamsCrowdsale
 * The way to add new features to a base crowdsale is by multiple inheritance.
 * In this example we are providing following extensions:
 * TimedCrowdsale - set the start and end time for the sale
 * TokenCappedCrowdsale - sets a max boundary for the number of tokens minted
 * MintedCrowdsale - Creates tokens as the are sold in the sale
 * WhitelistedCrowdsale - only whitelisted addresses are allowed to purchase
 * FinalizableCrowdsale - finalizing sale mints tokens and send them to the team distribution contract
 * After adding multiple features it's good practice to run integration tests
 * to ensure that subcontracts works together as intended.
 */


contract LightstreamsCrowdsale is TimedCrowdsale, TokenCappedCrowdsale, FinalizableCrowdsale, MintedCrowdsale, WhitelistedCrowdsale {

  // Token Distribution
  // =============================
  uint8 public constant decimals = 18;
  uint256 public constant decimalFactor = 10 ** uint256(decimals);
  uint256 public maxTokens =           300000000 * decimalFactor; // There will be total 300 million PTH Tokens
  uint256 public tokensForTeam =       135000000 * decimalFactor; // 45 percent will be reserved for the team
  uint256 public tokensForSale =       165000000 * decimalFactor; // 65 percent will be sold in Crowdsale
  uint16 public initialRate =              1090; // in Eth if Eth = 410 USD for this 2733 PHT = 1 Eth
  address public distributionContract;
  address public token;

  event LogString(string _string);

  constructor(
    uint256 _openingTime, // Timestamp in epoch format (online calculator: https://www.unixtimestamp.com/index.php)
    uint256 _closingTime,
    address _wallet,  // address of the wallet that receives funds
    LightstreamsToken _token, // address of deployed token contract
    address _distributionContract
  )
  public
  Crowdsale(initialRate, _wallet, _token, _openingTime)
  MonthlyVestingWithBonus(_token)
  TimedCrowdsale(_openingTime, _closingTime)
  TokenCappedCrowdsale(tokensForSale)
  FinalizableCrowdsale()
  MintedCrowdsale()
  WhitelistedCrowdsale()
  {
    distributionContract = _distributionContract;
    token = _token;
  }

  function finalization() internal {
    // emit tokens for the foundation
    MintableToken(token).mint(distributionContract, tokensForTeam);
    emit LogString('finalization');
    // NOTE: cannot call super here because it would finish minting and
    // the continuous sale would not be able to proceed
  }
}
