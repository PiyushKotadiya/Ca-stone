// contracts/GLDToken.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract TimeBody is ERC20 {
    constructor() ERC20("MusicDapp", "@MDA") {
        _mint(msg.sender, 100000000000000000000000000000000000);
    }
}