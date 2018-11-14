
## Code Review

$ prepareSol2Md ../../contracts/contracts/*.sol
* [ ] [code-review/LightstreamsCrowdsale.md](code-review/LightstreamsCrowdsale.md)
  * [ ] contract LightstreamsCrowdsale is TimedCrowdsale, TokenCappedCrowdsale, FinalizableCrowdsale, MintedCrowdsale, WhitelistedCrowdsale
* [ ] [code-review/LightstreamsToken.md](code-review/LightstreamsToken.md)
  * [ ] contract LightstreamsToken is MintableToken, PausableToken, CappedToken
* [ ] [code-review/Migrations.md](code-review/Migrations.md)
  * [ ] contract Migrations


token /

* [ ] [code-review/CappedToken.md](code-review/CappedToken.md)
  * [ ] contract CappedToken is MintableToken
* [ ] [code-review/ERC20.md](code-review/ERC20.md)
  * [ ] contract ERC20
* [ ] [code-review/MintableToken.md](code-review/MintableToken.md)
  * [ ] contract MintableToken is StandardToken, Ownable
* [ ] [code-review/PausableToken.md](code-review/PausableToken.md)
  * [ ] contract PausableToken is StandardToken, Pausable
* [ ] [code-review/SafeERC20.md](code-review/SafeERC20.md)
  * [ ] library SafeERC20
* [ ] [code-review/StandardToken.md](code-review/StandardToken.md)
  * [ ] contract StandardToken is ERC20
  * [ ]   using SafeMath for uint256;
  * [ ]   using SafeERC20 for ERC20;


access /

* [ ] [code-review/Whitelist.md](code-review/Whitelist.md)
  * [ ] contract Whitelist is Ownable, RBAC

access/rbac /

* [ ] [code-review/RBAC.md](code-review/RBAC.md)
  * [ ] contract RBAC
  * [ ]   using Roles for Roles.Role;
* [ ] [code-review/Roles.md](code-review/Roles.md)
  * [ ] library Roles


distribution /

* [ ] [code-review/MonthlyVestingWithBonus.md](code-review/MonthlyVestingWithBonus.md)
  * [ ] contract MonthlyVestingWithBonus is Ownable
  * [ ]   using SafeMath for uint256;
  * [ ]   using SafeERC20 for ERC20;
* [ ] [code-review/TeamDistribution.md](code-review/TeamDistribution.md)
  * [ ] contract TeamDistribution is Ownable
  * [ ]   using SafeMath for uint256;
  * [ ]   using SafeERC20 for ERC20;


lifecycle /

* [ ] [code-review/Pausable.md](code-review/Pausable.md)
  * [ ] contract Pausable is Ownable


crowdsale /

* [ ] [code-review/Crowdsale.md](code-review/Crowdsale.md)
  * [ ] contract Crowdsale is Ownable, MonthlyVestingWithBonus, Pausable
  * [ ]   using SafeMath for uint256;
  * [ ]   using SafeERC20 for ERC20;
* [ ] [code-review/FinalizableCrowdsale.md](code-review/FinalizableCrowdsale.md)
  * [ ] contract FinalizableCrowdsale is Ownable, TimedCrowdsale
  * [ ]   using SafeMath for uint256;
* [ ] [code-review/MintedCrowdsale.md](code-review/MintedCrowdsale.md)
  * [ ] contract MintedCrowdsale is Crowdsale
* [ ] [code-review/TimedCrowdsale.md](code-review/TimedCrowdsale.md)
  * [ ] contract TimedCrowdsale is Crowdsale
  * [ ]   using SafeMath for uint256;
* [ ] [code-review/TokenCappedCrowdsale.md](code-review/TokenCappedCrowdsale.md)
  * [ ] contract TokenCappedCrowdsale is Crowdsale
  * [ ]   using SafeMath for uint256;
* [ ] [code-review/WhitelistedCrowdsale.md](code-review/WhitelistedCrowdsale.md)
  * [ ] contract WhitelistedCrowdsale is Whitelist, Crowdsale


utils /

* [ ] [code-review/Ownable.md](code-review/Ownable.md)
  * [ ] contract Ownable
* [ ] [code-review/SafeMath.md](code-review/SafeMath.md)
  * [ ] library SafeMath




  $ solidityFlattener.pl --contractsdir=. --mainsol=LightstreamsCrowdsale.sol --verbose
  contractsdir: .
  remapdir    : (no remapping)
  mainsol     : LightstreamsCrowdsale.sol
  outputsol   : LightstreamsCrowdsale_flattened.sol
  Processing ./LightstreamsCrowdsale.sol
      Importing ./crowdsale/TokenCappedCrowdsale.sol
      Processing ./crowdsale/TokenCappedCrowdsale.sol
          Importing crowdsale/../utils/SafeMath.sol
          Processing crowdsale/../utils/SafeMath.sol
          Importing crowdsale/Crowdsale.sol
          Processing crowdsale/Crowdsale.sol
              Importing crowdsale/../token/ERC20.sol
              Processing crowdsale/../token/ERC20.sol
              Importing crowdsale/../token/SafeERC20.sol
              Processing crowdsale/../token/SafeERC20.sol
                  Importing crowdsale/../token/StandardToken.sol
                  Processing crowdsale/../token/StandardToken.sol
                      Already Imported crowdsale/../token/ERC20.sol
                      Already Imported crowdsale/../token/../utils/SafeMath.sol
                      Already Imported crowdsale/../token/SafeERC20.sol
                  Already Imported crowdsale/../token/ERC20.sol
              Importing crowdsale/../token/MintableToken.sol
              Processing crowdsale/../token/MintableToken.sol
                  Already Imported crowdsale/../token/StandardToken.sol
                  Importing crowdsale/../token/../utils/Ownable.sol
                  Processing crowdsale/../token/../utils/Ownable.sol
              Already Imported crowdsale/../utils/SafeMath.sol
              Already Imported crowdsale/../utils/Ownable.sol
              Importing crowdsale/../distribution/MonthlyVestingWithBonus.sol
              Processing crowdsale/../distribution/MonthlyVestingWithBonus.sol
                  Already Imported crowdsale/../distribution/../token/SafeERC20.sol
                  Already Imported crowdsale/../distribution/../token/ERC20.sol
                  Importing crowdsale/../distribution/../LightstreamsToken.sol
                  Processing crowdsale/../distribution/../LightstreamsToken.sol
                      Already Imported crowdsale/../distribution/../token/MintableToken.sol
                      Importing crowdsale/../distribution/../token/PausableToken.sol
                      Processing crowdsale/../distribution/../token/PausableToken.sol
                          Already Imported crowdsale/../distribution/../token/StandardToken.sol
                          Importing crowdsale/../distribution/../token/../lifecycle/Pausable.sol
                          Processing crowdsale/../distribution/../token/../lifecycle/Pausable.sol
                              Already Imported crowdsale/../distribution/../token/../lifecycle/../utils/Ownable.sol
                      Importing crowdsale/../distribution/../token/CappedToken.sol
                      Processing crowdsale/../distribution/../token/CappedToken.sol
                          Already Imported crowdsale/../distribution/../token/MintableToken.sol
                  Already Imported crowdsale/../distribution/../utils/SafeMath.sol
                  Already Imported crowdsale/../distribution/../utils/Ownable.sol
              Already Imported crowdsale/../lifecycle/Pausable.sol
              Already Imported crowdsale/../LightstreamsToken.sol
      Importing ./crowdsale/FinalizableCrowdsale.sol
      Processing ./crowdsale/FinalizableCrowdsale.sol
          Already Imported crowdsale/../utils/SafeMath.sol
          Already Imported crowdsale/../utils/Ownable.sol
          Importing crowdsale/../crowdsale/TimedCrowdsale.sol
          Processing crowdsale/../crowdsale/TimedCrowdsale.sol
              Already Imported crowdsale/../crowdsale/../utils/SafeMath.sol
              Already Imported crowdsale/../crowdsale/../utils/Ownable.sol
              Already Imported crowdsale/../crowdsale/Crowdsale.sol
      Already Imported ./distribution/MonthlyVestingWithBonus.sol
      Importing ./crowdsale/MintedCrowdsale.sol
      Processing ./crowdsale/MintedCrowdsale.sol
          Already Imported crowdsale/Crowdsale.sol
          Already Imported crowdsale/../token/MintableToken.sol
      Already Imported ./crowdsale/TimedCrowdsale.sol
      Importing ./crowdsale/WhitelistedCrowdsale.sol
      Processing ./crowdsale/WhitelistedCrowdsale.sol
          Already Imported crowdsale/Crowdsale.sol
          Importing crowdsale/../access/Whitelist.sol
          Processing crowdsale/../access/Whitelist.sol
              Already Imported crowdsale/../access/../utils/Ownable.sol
              Importing crowdsale/../access/../access/rbac/RBAC.sol
              Processing crowdsale/../access/../access/rbac/RBAC.sol
                  Importing crowdsale/../access/../access/rbac/Roles.sol
                  Processing crowdsale/../access/../access/rbac/Roles.sol
      Already Imported ./LightstreamsToken.sol
      Already Imported ./token/MintableToken.sol
