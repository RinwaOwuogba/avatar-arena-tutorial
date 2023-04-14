# Building an NFT Game Using TDD With Hardhat

## Table of Contents
- [Building an NFT Game Using TDD With Hardhat](#building-an-nft-game-using-tdd-with-hardhat)
	- [Table of Contents](#table-of-contents)
	- [1. Introduction](#1-introduction)
	- [2. Prerequisites](#2-prerequisites)
	- [3. Requirements](#3-requirements)
	- [4. Diving In](#4-diving-in)
		- [4.1. Project Setup](#41-project-setup)
		- [4.2. Bootstrapping the Smart Contract](#42-bootstrapping-the-smart-contract)
		- [4.3. TDD](#43-tdd)
		- [4.3.1 - Test 1: Should Start a Pending Battle if No Pending Battle Is Available](#431---test-1-should-start-a-pending-battle-if-no-pending-battle-is-available)
		- [4.3.2 - Test 2: Should Put User in Pending Battle if Available](#432---test-2-should-put-user-in-pending-battle-if-available)
		- [_Brief Intermission_](#brief-intermission)
		- [4.3.3 - Test 3: Should Simulate Battle Results Once Two Users Join a Battle](#433---test-3-should-simulate-battle-results-once-two-users-join-a-battle)
		- [4.3.4 - Test 4: Should Simulate Battle Results Randomly](#434---test-4-should-simulate-battle-results-randomly)
		- [4.3.5 - Test 5: Should Fail to Start a Battle With a Token Sender Does Not Own](#435---test-5-should-fail-to-start-a-battle-with-a-token-sender-does-not-own)
		- [4.3.6 - Test 6: Should Fail to Start Another Battle While in a Pending Battle](#436---test-6-should-fail-to-start-another-battle-while-in-a-pending-battle)
		- [4.4. Contract Deployment](#44-contract-deployment)
		- [4.5. Frontend: Setup](#45-frontend-setup)
		- [4.6. Frontend: Laying Bricks - Building Components](#46-frontend-laying-bricks---building-components)
		- [4.6.1 - Utilities](#461---utilities)
		- [4.6.2 - Contracts](#462---contracts)
		- [4.6.3 - Hooks](#463---hooks)
		- [4.6.4 - Components](#464---components)
		- [4.6.5 - Routes](#465---routes)
	- [5. Conclusion](#5-conclusion)
	- [6. Next Steps](#6-next-steps)
	- [7. About the Author](#7-about-the-author)
	- [8. References](#8-references)

## 1. Introduction

Security is critical when building blockchain applications, a simple mistake could lead to the loss of millions of dollars. TDD (Test Driven Development) is an approach that can help us catch errors early. We'll explore the wonderful world of TDD by building an NFT game using Hardhat's development environment, deploying it on the Celo blockchain, and finally creating a front-end to interact with it. Let's go!

## 2. Prerequisites

To follow along with this tutorial, you need to have an understanding of:

- [JavaScript](https://developer.mozilla.org/en-US/docs/Learn/Getting_started_with_the_web/JavaScript_basics)
- [React](https://react.dev/)
- [EVM Smart contracts](https://ethereum.org/en/developers/docs/smart-contracts/)

## 3. Requirements

Make sure to have the following installed:

- [Metamask](https://metamask.io/download/)
- [Node js v16.20.0](https://nodejs.org/en/download/package-manager)
- [yarn 1.22.19+](https://classic.yarnpkg.com/lang/en/docs/install/#debian-stable)

## 4. Diving In

### 4.1. Project Setup

Let's create a folder for the project, we'll call it `avatar-arena`.

```bash
mkdir avatar-arena
cd avatar-arena
yarn init -y
yarn add --dev hardhat
yarn add dotenv
```

Next, we set up the hardhat project by running: 

```bash
npx hardhat
```

This brings up a menu that configures the hardhat boilerplate, we'll choose the default option for all the questions i.e

```
✔ What do you want to do? · Create a JavaScript project
✔ Hardhat project root: · [your current directory by default]
✔ Do you want to add a .gitignore? (Y/n) · y
✔ Help us improve Hardhat with anonymous crash reports & basic usage data? (Y/n) · y
✔ Do you want to install this sample project's dependencies with yarn (@nomicfoundation/hardhat-toolbox @nomicfoundation/hardhat-network-helpers @nomicfoundation/hardhat-chai-matchers @nomiclabs/hardhat-ethers @nomiclabs/hardhat-etherscan chai ethers hardhat-gas-reporter solidity-coverage @typechain/hardhat typechain @typechain/ethers-v5 @ethersproject/abi @ethersproject/providers)? (Y/n) · y
```

Great!

The last configuration we need is in the `package.json` file. We need to add a handy script:

```json
// package.json

"scripts": {
    "test": "hardhat test"
},
```

### 4.2. Bootstrapping the Smart Contract

Remove the boilerplate contract files and add the new contract files

```bash
rm contracts/* test/*
touch contracts/AvatarArena.sol test/AvatarArena.js
```

We'll use the openzepplin [contract wizard](https://docs.openzeppelin.com/contracts/4.x/wizard) to bootstrap our `AvatarArena` contract.

Our contract needs to do a few things:

- mint tokens
- list tokens
- ownable tokens
- URI storage

We will choose ERC 721 as our token type (the standard for smart contracts that mint NFT tokens) template with the following configurations:

- Settings:
  - name: AvatarArena
  - symbol: AVR
  - base URI: (blank)
- Features: mintable (with auto-increment ID), enumerable, URI storage
- Access Control: ownable
- Upgradability: (use default)
- Info (optional):
  - security contact (optional)
  - license: MIT (optional)

This config gives us the basic template for the smart contract we'll be building. It includes features such as enumerating the NFTs minted by the contract as well as storing URIs associated with each token.

When you're done, you'll have this block of code on the editor to your right, we'll copy and paste it into `contracts/AvatarArena.sol`:

```solidity
// contracts/AvatarArena.sol

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract AvatarArena is ERC721, ERC721Enumerable, ERC721URIStorage, Ownable {
	using Counters for Counters.Counter;

	Counters.Counter private _tokenIdCounter;

	constructor() ERC721("AvatarArena", "AVR") {}

	function safeMint(address to, string memory uri) public onlyOwner {
    	uint256 tokenId = _tokenIdCounter.current();
    	_tokenIdCounter.increment();
    	_safeMint(to, tokenId);
    	_setTokenURI(tokenId, uri);
	}

	// The following functions are overrides required by Solidity.

	function _beforeTokenTransfer(address from, address to, uint256 tokenId, uint256 batchSize)
    	internal
    	override(ERC721, ERC721Enumerable)
	{
    	super._beforeTokenTransfer(from, to, tokenId, batchSize);
	}

	function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
    	super._burn(tokenId);
	}

	function tokenURI(uint256 tokenId)
    	public
    	view
    	override(ERC721, ERC721URIStorage)
    	returns (string memory)
	{
    	return super.tokenURI(tokenId);
	}

	function supportsInterface(bytes4 interfaceId)
    	public
    	view
    	override(ERC721, ERC721Enumerable)
    	returns (bool)
	{
    	return super.supportsInterface(interfaceId);
	}
}
```

We'll update the code to remove the `onlyOwner` modifier. It prevents anybody who's not the owner of the contract mint tokens but we don't want that restriction in our game. In our game, any user can mint a token. The updated snippet becomes:

```solidity

	constructor() ERC721("AvatarArena", "AVR") {}

	function safeMint(address to, string memory uri) public onlyOwner {
    	uint256 tokenId = _tokenIdCounter.current();
    	_tokenIdCounter.increment();
    	_safeMint(to, tokenId);
    	_setTokenURI(tokenId, uri);
	}
```

Next, we install the OpenZeppelin packages which our contract code depends on:

```bash
yarn add @openzeppelin/contracts
```

You'll notice that our `AvatarArena` contract code inherits from several other contracts: `ERC721, ERC721Enumerable, ERC721URIStorage, Ownable`. These contracts have methods and attributes which provide some functionality we need. We'll follow that same pattern to add our set of functionality. We'll create an `Arena` contract which the `AvatarArena` contract will inherit.

```solidity
// AvatarArena.sol

import "@openzeppelin/contracts/utils/Counters.sol";

abstract contract Arena is ERC721 {}

contract AvatarArena is ERC721Enumerable, ERC721URIStorage, Ownable, Arena {
	using Counters for Counters.Counter;
}
```

The Arena contract has to allow us to do a few things:

- start battles between avatars (nft): `startBattle`
- get the result of a user's most recent battle: `getLatestBattle`
- get the number of wins an avatar has: `getAvatarWins`
- simulate battle between avatars to get a winner: `_simulateBattle`

_Note: Subsequently, when we use `avatar`, we're referring to a minted NFT._

### 4.3. TDD

The TDD approach simplified = _Write failing test for expected behaviour -> Run the test (which fails) -> Fix the failing test -> Repeat_

Let's setup the test file `test/AvatarArena.js`:

```js
// test/AvatarArena.js
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("AvatarArena", function () {
  this.timeout(50000);

  let avatarArena;
  let owner;
  let acc1;
  let acc2;

  this.beforeEach(async function () {
	const AvatarArena = await ethers.getContractFactory("AvatarArena");
	[owner, acc1, acc2] = await ethers.getSigners();

	avatarArena = await AvatarArena.deploy();
  });
});
```

What's happening here?

1. We use the `describe` keyword from hardhat test environment to group our contract test cases.
2. We set the default timeout for each test case to 50 secs.
3. Before each test case runs, we re-deploy the contract and get signers which represent users ie owner, acc1, acc2. As the name implies, the "owner" signer represents the signer who was used to deploy the contract on the local test network.

To the tests!

Although, we'll only be writing tests for `startBattle`, it'll cover all of our tests since the tests will be more integration-focused due to the difficulty in mocking solidity contract code from JavaScript. Sadly we're restricted to using JavaScript when testing with Hardhat, a friend suggested I check out [Foundry](https://github.com/foundry-rs/foundry) as a test environment, I'll try that out at a later date and drop an update on how it goes.

_Note: Throughout the TDD process for the contract code, there will be code snippets which have "..." starting or ending them. I use that to indicate that some code has been omitted to keep the snippets short. Where necessary, I'll start and end the snippets with already existing lines in the specified file so you know where the snippet fits in, Thank you._

Now, let's think a bit before writing code, users might not want to battle at the same time, therefore we need a way to link users who want to battle together. The answer? A "pending" place for battles, this way, one user can start a battle and when another user tries to battle, we can match them up and "simulate" the result.

Starting with the tests:

### 4.3.1 - Test 1: Should Start a Pending Battle if No Pending Battle Is Available

```js
// test/AvatarArena.js
...
const { ethers } = require("hardhat");

const DEFAULT_TOKEN_URI = "https://example.com/1.png";

describe("AvatarArena", function () {
...

...
  this.beforeEach(async function () {
	const AvatarArena = await ethers.getContractFactory("AvatarArena");
	[owner, acc1, acc2] = await ethers.getSigners();

	avatarArena = await AvatarArena.deploy();
  });

  describe("startBattle", function () {
	it("should start a pending battle if no pending battle is available", async function () {
  	// mint NFT to battle with
  	const trx1 = await avatarArena
    	.connect(owner)
    	.safeMint(owner.address, DEFAULT_TOKEN_URI);
  	trx1.wait();

  	// start battle
  	const tokenID = 0;
  	const trx = await avatarArena.connect(owner).startBattle(tokenID);
  	await trx.wait();
	});
  });
});
```

We mint a token as the `owner` signer and try starting a battle with it.

Let's run this test:

```
$ yarn test
yarn run v1.22.19
$ hardhat test


    AvatarArena
   	 startBattle
   		 1) should start a pending battle if no pending battle is available


    0 passing (1s)
    1 failing

    1) AvatarArena
   		 startBattle
   			 should start a pending battle if no pending battle is available:
   	 TypeError: avatarArena.connect(...).startBattle is not a function
   		 at Context.<anonymous> (test/AvatarArena.js:31:52)
   		 at processTicksAndRejections (node:internal/process/task_queues:96:5)
   		 at runNextTicks (node:internal/process/task_queues:65:3)
   		 at listOnTimeout (node:internal/timers:528:9)
   		 at processTimers (node:internal/timers:502:7)
```

Of course, it fails, the line most important to us here is:

```
TypeError: avatarArena.connect(...).startBattle is not a function
```

Let's fix the problem by defining the missing function:

```solidity
// contracts/AvatarArena.sol


abstract contract Arena is ERC721 {

    /**
    Creates a new battle for the sender or adds sender
    to a pending battle
    */
    function startBattle(uint256 tokenId) external {}
}

```

You might be wondering [why we choose the `external`](://ethereum.stackexchange.com/a/19391) keyword here, rather than `public`.

Re-run the tests, they should pass now.

We need to make sure a battle is in fact created so we test the data stored on a battle. This is a good time to think about what our data structure would look like. we'll start with this and explain as we make the test more useful.

```js
// test/AvatarArena.js

const { expect } = require("chai");
const { ethers } = require("hardhat");
const { BigNumber } = require("ethers");

  	// start battle
  	const tokenID = 0;
  	const trx = await avatarArena.connect(owner).startBattle(tokenID);
  	await trx.wait();

  	const battle = await avatarArena.connect(owner).getLatestBattle();
  	expect(battle.players[0].player).to.eql(owner.address);
  	expect(battle.players[0].nft).to.eq(BigNumber.from(tokenID));

  	// no winner should exist until game is completed
  	expect(battle.winner).to.eq(-1);
	});
  });
});
```

From the updated test above, you can tell that:

- a battle should be a kind of object which has a `players` property which holds an array of player objects which in turn contain details of a player
- a battle should also have a `winner` property which we expect to be -1 by default unless a winner is picked

Re-run test

```
$ yarn test
yarn run v1.22.19
$ hardhat test


    AvatarArena
   	 startBattle
   		 1) should start a pending battle if no pending battle is available


    0 passing (1s)
    1 failing

    1) AvatarArena
   		 startBattle
   			 should start a pending battle if no pending battle is available:
   	 TypeError: avatarArena.connect(...).getLatestBattle is not a function
   		 at Context.<anonymous> (test/AvatarArena.js:35:55)
   		 at processTicksAndRejections (node:internal/process/task_queues:96:5)
   		 at runNextTicks (node:internal/process/task_queues:65:3)
   		 at listOnTimeout (node:internal/timers:528:9)
   		 at processTimers (node:internal/timers:502:7)
```

Yep! it failed as expected. Our point of focus here is:

```
TypeError: avatarArena.connect(...).getLatestBattle is not a function
```

That function does not exist in our `Arena` contract. Let's fix this error:

```solidity
// contracts/AvatarArena.sol

	function startBattle(uint256 tokenId) external {}

	/**
	Get sender's current battle
	*/
	function getLatestBattle() external view {}


contract AvatarArena is ERC721Enumerable, ERC721URIStorage, Ownable, Arena {
}
```

Re-run the tests:

```
$ yarn test
yarn run v1.22.19
$ hardhat test
Compiled 1 Solidity file successfully


    AvatarArena
   	 startBattle
   		 1) should start a pending battle if no pending battle is available


    0 passing (1s)
    1 failing

    1) AvatarArena
   		 startBattle
   			 should start a pending battle if no pending battle is available:
   	 TypeError: Cannot read properties of undefined (reading '0')
   		 at Context.<anonymous> (test/AvatarArena.js:36:28)
  	at processTicksAndRejections (node:internal/process/task_queues:95:5)
  	at runNextTicks (node:internal/process/task_queues:64:3)
  	at listOnTimeout (node:internal/timers:533:9)
  	at processTimers (node:internal/timers:507:7)
```

New error, progress?

```
TypeError: Cannot read properties of undefined (reading '0')
    at Context.<anonymous> (test/AvatarArena.js:36:24)
```

If we trace the test code, we see this error is due to trying to access players in a battle and of course, it errors out since `getLatestBattle` doesn't return anything yet. Let's fix it:

```solidity
// contracts/AvatarArena.sol


abstract contract Arena is ERC721 {
	struct Player {
        	address player;
        	uint256 nft;
	}
	struct Battle {
        	Player[] players;
        	uint256 createdAt;
        	int256 winner;
	}
	Battle[] private _battles;
	mapping(address => uint256) private _userBattles;

	/**
	Creates a new battle for the sender or adds sender
	to a pending battle
	*/
	function  startBattle(uint256  tokenId) external {}
}
```

Note the subtle difference in data types between nft index - `uint256` in `Player` and `winner` index - `int256` in `Battle`. Winner has to be int256 since it needs to contain negative values on initialization which is only possible with signed integers. We also need to return something from `getLatestBattle`:

```solidity
// contracts/AvatarArena.sol


	/**
	Get sender's current battle
	*/
	function getLatestBattle() external view returns (Battle memory) {
    	uint256 battleIndex = _userBattles[msg.sender];

    	return (_battles[battleIndex]);
	}

```

Re-run the tests:

```
$ yarn test
yarn run v1.22.19
$ hardhat test
Compiled 1 Solidity file successfully


    AvatarArena
   	 startBattle
   		 1) should start a pending battle if no pending battle is available


    0 passing (1s)
    1 failing

    1) AvatarArena
   		 startBattle
   			 should start a pending battle if no pending battle is available:
   	 Error: call revert exception; VM Exception while processing transaction: reverted with panic code 50 [ See: https://links.ethers.org/v5-errors-CALL_EXCEPTION ] (method="getLatestBattle()", data="0x4e487b710000000000000000000000000000000000000000000000000000000000000032", errorArgs=[{"type":"BigNumber","hex":"0x32"}], errorName="Panic", errorSignature="Panic(uint256)", reason=null, code=CALL_EXCEPTION, version=abi/5.7.0)
  	at Logger.makeError (node_modules/@ethersproject/logger/src.ts/index.ts:269:28)
  	at Logger.throwError (node_modules/@ethersproject/logger/src.ts/index.ts:281:20)
  	at Interface.decodeFunctionResult (node_modules/@ethersproject/abi/src.ts/interface.ts:427:23)
  	at Contract.<anonymous> (node_modules/@ethersproject/contracts/src.ts/index.ts:400:44)
  	at step (node_modules/@ethersproject/contracts/lib/index.js:48:23)
  	at Object.next (node_modules/@ethersproject/contracts/lib/index.js:29:53)
  	at fulfilled (node_modules/@ethersproject/contracts/lib/index.js:20:58)
  	at processTicksAndRejections (node:internal/process/task_queues:95:5)
  	at runNextTicks (node:internal/process/task_queues:64:3)
  	at listOnTimeout (node:internal/timers:533:9)
```

This is a tricky one, the most we have to go on is this line here:

```
Error: call revert exception; VM Exception while processing transaction: reverted with panic code 50 [ See: https://links.ethers.org/v5-errors-CALL_EXCEPTION ] (method="getLatestBattle()", data="0x4e487b710000000000000000000000000000000000000000000000000000000000000032", errorArgs=[{"type":"BigNumber","hex":"0x32"}], errorName="Panic", errorSignature="Panic(uint256)", reason=null, code=CALL_EXCEPTION, version=abi/5.7.0)
```

There's this snippet `(method="getLatestBattle()"`. On closer analysis of the `getLatestBattle` method, we notice there is infact something there that could lead to a panic:

```
return (_battles[battleIndex]);
```

The `_battles` array is initially empty, also the `_userBattles` mapping does not return `null` when it can't find an entry for a key ie `msg.sender`, instead of returns the default value for the data type of the value in the mapping which is `uint256` here which is `0` by default.

This means by default our function will try to return the battle at position 0 if a user hasn't participated in a battle yet. There're several ways we could handle this, we could revert with an appropriate error message when the battle index is 0; the problem with approach is I haven't been able to find a good way to access the `reason` message from a revert on a frontend. This means it'd be difficult to handle the error appropriately on the frontend, so if you do find a way to extract the `reason`, feel free to drop a comment or send me a message about it.

What we'll do instead is push a placeholder battle in the `_battles` array that way we always return a battle from that function call and by examining the players in the battle we can determine if it's _the_ placeholder battle or an actual battle.

```solidity
// contracts/AvatarArena.sol


	Battle[] private _battles;
	mapping(address => uint256) private _userBattles;

	constructor() {
    	// initialize battles list with placeholder battle
    	_battles.push();
	}

	/**
	Creates a new battle for the sender or adds sender
	to a pending battle
 	*/
	function startBattle(uint256 tokenId) external {}

```

Re-run the test

```
$ yarn test
yarn run v1.22.19
$ hardhat test
Compiled 1 Solidity file successfully


    AvatarArena
   	 startBattle
   		 1) should start a pending battle if no pending battle is available


    0 passing (1s)
    1 failing

    1) AvatarArena
   	startBattle
     	should start a pending battle if no pending battle is available:
 	TypeError: Cannot read properties of undefined (reading 'player')
  	at Context.<anonymous> (test/AvatarArena.js:36:32)
  	at processTicksAndRejections (node:internal/process/task_queues:95:5)
  	at runNextTicks (node:internal/process/task_queues:64:3)
  	at listOnTimeout (node:internal/timers:533:9)
  	at processTimers (node:internal/timers:507:7)
```

Alright!

We're not out of the woods yet, we have a placeholder battle the method keeps erroring out because there're no players in the placeholder battle. Let's address that:

```solidity
// contracts/AvatarArena.sol


	function startBattle(uint256 tokenId) external {
    	Battle storage newBattle = _battles.push();

    	newBattle.players.push(Player(msg.sender, tokenId));
    	newBattle.createdAt = block.timestamp;
    	newBattle.winner = -1;

    	_userBattles[msg.sender] = _battles.length - 1;
	}

```

We now make sure to initialize a battle by adding a player when it is started. We could try putting a dummy player to make the test pass as fast as possible but it would be trivial at the point.

Re-run the test, it should pass now.

### 4.3.2 - Test 2: Should Put User in Pending Battle if Available

```js
// test/AvatarArena.js

  	// no winner should exist until game is completed
  	expect(battle.winner).to.eq(-1);
	});

	it("should put user in pending battle if available", async function () {
  	// mint battle nfts for both users
  	const nft1Trx = await avatarArena
    	.connect(owner)
    	.safeMint(owner.address, DEFAULT_TOKEN_URI);
  	await nft1Trx.wait();
  	const nft2Trx = await avatarArena
    	.connect(acc1)
    	.safeMint(acc1.address, DEFAULT_TOKEN_URI);
  	await nft2Trx.wait();

  	const tokenID_1 = 0;
  	const tokenID_2 = 1;

  	// start battles
  	const ownerBattleTrx = await avatarArena
    	.connect(owner)
    	.startBattle(tokenID_1);
  	const acc1BattleTrx = await avatarArena
    	.connect(acc1)
    	.startBattle(tokenID_2);
  	await Promise.all([ownerBattleTrx, acc1BattleTrx]);
  	const battle = await avatarArena.connect(acc1).getLatestBattle();

  	expect(battle.players[0].player).to.eql(owner.address);
  	expect(battle.players[1].player).to.eql(acc1.address);
	});
  });
});
```

Run the tests

```
$ yarn test
yarn run v1.22.19
$ hardhat test


  AvatarArena
	startBattle
  	✔ should start a pending battle if no pending battle is available (104ms)
  	1) should put user in pending battle if available


  1 passing (1s)
  1 failing

  1) AvatarArena
  	startBattle
    	should put user in pending battle if available:

  	AssertionError: expected '0x70997970C51812dc3A010C7d01b50e0d17d…' to deeply equal '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb…'
  	+ expected - actual

  	-0x70997970C51812dc3A010C7d01b50e0d17dc79C8
  	+0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266

  	at Context.<anonymous> (test/AvatarArena.js:67:43)
  	at processTicksAndRejections (node:internal/process/task_queues:95:5)
  	at runNextTicks (node:internal/process/task_queues:64:3)
  	at listOnTimeout (node:internal/timers:533:9)
  	at processTimers (node:internal/timers:507:7)
```

Errors again? Getting kind of annoying right? Well better here than when the contract is handling tokens with real value.

You already know how this goes, we follow the error message and the line error the error happened in our test code.

In the test, we expect the first player in the battle that `acc1` is involved in to be the signer - `owner` that first started a battle but that isn't the case, we haven't added any logic to put players together in battles so the first player when `acc1` fetches its latest battle is `acc1` because it was added to a new battle. To to fix:

```solidity
// contract/AvatarArena.sol


	function startBattle(uint256 tokenId) external {
    	// skip placeholder battle
    	if (_battles.length > 1) {
        	uint256 currentBattleIndex = _battles.length - 1;
        	Battle storage currentBattle = _battles[currentBattleIndex];

        	// try to join an existing battle
        	if (currentBattle.players.length == 1) {
            	currentBattle.players.push(Player(msg.sender, tokenId));
            	_userBattles[msg.sender] = currentBattleIndex;

            	return;
        	}
    	}

    	Battle storage newBattle = _battles.push();
	}

```

Re-run your tests, they should pass now

### _Brief Intermission_

A significant part of the TDD process is refactoring, your code isn't all that useful if it is difficult to maintain/understand. We need to examine what we've written and see if there's an opportunity to abstract or extract repetitive logic into some reusable component.

The most obvious thing here is minting and starting battles, we're repeating the same logic over and over, and we should probably move that into a reusable component:

```js
// test/AvatarArena.js


  	expect(battle.players[1].player).to.eql(acc1.address);
	});
  });
});

const newAvatarArenaUtils = (contractInstance) => {
  return {
	mintNFT: (as, to, tokenURI = DEFAULT_TOKEN_URI) =>
  	contractInstance
    	.connect(as)
    	.safeMint(to, tokenURI)
    	.then((trx) => trx.wait()),
	startBattle: (as, tokenID) =>
  	contractInstance
    	.connect(as)
    	.startBattle(tokenID)
    	.then((trx) => trx.wait()),
  };
};
```

The goal here is to reduce the overhead when calling these methods so we can focus on the logic of what we're testing. this removes the verbosity of waiting for these transactions and specifying the contract instance every time we're using either of these methods.

Now to use the reusable component, update the test setup:

```js
// test/AvatarArena.js


  let acc2;
  let aaUtils;

  this.beforeEach(async function () {
	const AvatarArena = await ethers.getContractFactory("AvatarArena");
	[owner, acc1, acc2] = await ethers.getSigners();

	avatarArena = await AvatarArena.deploy();
	aaUtils = newAvatarArenaUtils(avatarArena);
  });

```

Update the test cases:

```js
// test/AvatarArena.js


   	 it("should start a pending battle if no pending battle is available", async function () {
    	await aaUtils.mintNFT(owner, owner.address);

    	const tokenID = 0;
    	await aaUtils.startBattle(owner, tokenID);

    	const battle = await avatarArena.connect(owner).getLatestBattle();



	it("should put user in pending battle if available", async function () {
  	await aaUtils.mintNFT(owner, owner.address);
  	await aaUtils.mintNFT(acc1, acc1.address);

  	const tokenID_1 = 0;
  	const tokenID_2 = 1;

  	await aaUtils.startBattle(owner, tokenID_1);
  	await aaUtils.startBattle(acc1, tokenID_2);

  	const battle = await avatarArena.connect(acc1).getLatestBattle();

```

Re-run tests just to make sure everything still works. They should work as normal, if an error comes up then something broke while substituting the code snippets, try to figure out what's out of place and resolve it before continuing.

### 4.3.3 - Test 3: Should Simulate Battle Results Once Two Users Join a Battle

Simulating the result of a battle involves:

- Updating the number of wins the winning NFT has.
- Determining the winner among the players in the battle and optionally raising a notification that a battle is complete. The notification could be used for example for listening to the result of a battle and using that to update the user interface in real time when a battle is completed.

Let's write a test which expresses the behaviour we wish to see.

```js
// test/AvatarArena.js

  	expect(battle.players[1].player).to.eql(acc1.address);
	});

	it("should simulate battle results once two users join a battle", async function () {
  	await aaUtils.mintNFT(owner, owner.address);
  	await aaUtils.mintNFT(acc1, acc1.address);

  	const tokenID_1 = 0;
  	const tokenID_2 = 1;
  	const firstBattleID = 1;

  	// both avatar NFTs start with a default number of 0 wins
  	expect(await avatarArena.connect(owner).getAvatarWins(0)).to.eq(0);
  	expect(await avatarArena.connect(owner).getAvatarWins(1)).to.eq(0);

  	await aaUtils.startBattle(owner, tokenID_1);
  	const trx = avatarArena.connect(acc1).startBattle(tokenID_2);
  	await expect(trx)
    	.to.emit(avatarArena, "BattleComplete")
    	.withArgs(firstBattleID);

  	const battle = await avatarArena.connect(acc1).getLatestBattle();
  	const winningNftId = battle.players[battle.winner].nft;

  	expect(BigNumber.from(battle.winner).toNumber()).to.be.oneOf([0, 1]);
  	expect(
    	await avatarArena.connect(owner).getAvatarWins(winningNftId)
  	).to.eq(1);
	});
  });
});

const newAvatarArenaUtils = (contractInstance) => {

```

Run the tests:

```
$ yarn test
yarn run v1.22.19
$ hardhat test
Compiled 1 Solidity file successfully


  AvatarArena
	startBattle
  	✔ should start a pending battle if no pending battle is available (74ms)
  	✔ should put user in pending battle if available (91ms)
  	1) should simulate battle results once two users join a battle


  2 passing (2s)
  1 failing

  1) AvatarArena
  	startBattle
    	should simulate battle results once two users join a battle:
	TypeError: avatarArena.connect(...).getAvatarWins is not a function
  	at Context.<anonymous> (test/AvatarArena.js:64:47)
  	at processTicksAndRejections (node:internal/process/task_queues:96:5)
  	at runNextTicks (node:internal/process/task_queues:65:3)
  	at listOnTimeout (node:internal/timers:528:9)
  	at processTimers (node:internal/timers:502:7)
```

You know the drill, let's add the missing `getAvatarWins` function and get our test to pass as fast as possible:

```solidity
// contract/AvatarArena.sol


    	return (_battles[battleIndex]);
	}

	/**
	Returns no of wins an avatar has
	*/
	function getAvatarWins(uint256 tokenId) external view returns (uint256) {}
}

contract AvatarArena is ERC721Enumerable, ERC721URIStorage, Ownable, Arena {

```

Re-run the tests

```
$ yarn test
yarn run v1.22.19
$ hardhat test


  AvatarArena
	startBattle
  	✔ should start a pending battle if no pending battle is available (73ms)
  	✔ should put user in pending battle if available (104ms)
  	1) should simulate battle results once two users join a battle


  2 passing (2s)
  1 failing

  1) AvatarArena
  	startBattle
    	should simulate battle results once two users join a battle:
	AssertionError: Event "BattleComplete" doesn't exist in the contract
  	at onSuccess (node_modules/@nomicfoundation/hardhat-chai-matchers/src/internal/emit.ts:61:17)
  	at processTicksAndRejections (node:internal/process/task_queues:96:5)
  	at runNextTicks (node:internal/process/task_queues:65:3)
  	at listOnTimeout (node:internal/timers:528:9)
  	at processTimers (node:internal/timers:502:7)
  	at Context.<anonymous> (test/AvatarArena.js:69:7)
```

Add the missing event and fix the test:

```solidity
	mapping(address => uint256) private _userBattles;

	event BattleComplete(uint256 battleIndex);

```

Re-run the tests:

```
$ yarn test
yarn run v1.22.19
$ hardhat test
Compiled 1 Solidity file successfully


  AvatarArena
	startBattle
  	✔ should start a pending battle if no pending battle is available (73ms)
  	✔ should put user in pending battle if available (84ms)
  	1) should simulate battle results once two users join a battle


  2 passing (1s)
  1 failing

  1) AvatarArena
  	startBattle
    	should simulate battle results once two users join a battle:
	AssertionError: Expected event "BattleComplete" to be emitted, but it wasn't
  	at processTicksAndRejections (node:internal/process/task_queues:96:5)
  	at runNextTicks (node:internal/process/task_queues:65:3)
  	at listOnTimeout (node:internal/timers:528:9)
  	at processTimers (node:internal/timers:502:7)
  	at Context.<anonymous> (test/AvatarArena.js:69:7)
```

Make sure the event is emitted:

```solidity
//contracts/AvatarArena.sol

        	// try to join an existing battle
        	if (currentBattle.players.length == 1) {
          	currentBattle.players.push(Player(msg.sender, tokenId));
          	_userBattles[msg.sender] = currentBattleIndex;

          	emit BattleComplete(currentBattleIndex);
          	return;
        	}

```

Re-run the tests:

```
$ yarn test
yarn run v1.22.19
$ hardhat test
Compiled 1 Solidity file successfully


  AvatarArena
	startBattle
  	✔ should start a pending battle if no pending battle is available (76ms)
  	✔ should put user in pending battle if available (115ms)
  	1) should simulate battle results once two users join a battle


  2 passing (2s)
  1 failing

  1) AvatarArena
  	startBattle
    	should simulate battle results once two users join a battle:
	TypeError: Cannot read properties of undefined (reading 'nft')
  	at Context.<anonymous> (test/AvatarArena.js:74:58)
  	at processTicksAndRejections (node:internal/process/task_queues:96:5)
  	at runNextTicks (node:internal/process/task_queues:65:3)
  	at listOnTimeout (node:internal/timers:528:9)
  	at processTimers (node:internal/timers:502:7)
```

Following the error back to our test code, `nft` is undefined, and that makes sense because we're indexing the players array with the winner index but our contract code doesn't do anything to determine the winner at the moment so the winner index is still the default `-1`. Let's fix it:

```solidity
// contracts/AvatarArena.sol

        	// try to join an existing battle
        	if (currentBattle.players.length == 1) {
          	currentBattle.players.push(Player(msg.sender, tokenId));
          	_userBattles[msg.sender] = currentBattleIndex;

          	_simulateBattle(currentBattleIndex);
          	return;
        	}


	function getAvatarWins(uint256 tokenId) external view returns (uint256) {}

	/**
	Get the winner of a battle
	*/
	function _simulateBattle(uint256 _battleIndex) internal {
  	int256 winnerIndex = 1;

  	Battle storage battle = _battles[_battleIndex];
  	battle.winner = winnerIndex;

  	emit BattleComplete(_battleIndex);
  }
}

contract AvatarArena is ERC721Enumerable, ERC721URIStorage, Ownable, Arena {

```

We've moved the event emission to a dedicated `_simulateBattle` method and set the winner index to a static value that the `players` array can be indexed by. This will do for now, we just want our test to pass.

Re-run the tests:

```
$ yarn test
yarn run v1.22.19
$ hardhat test


  AvatarArena
	startBattle
  	✔ should start a pending battle if no pending battle is available (76ms)
  	✔ should put user in pending battle if available (89ms)
  	1) should simulate battle results once two users join a battle


  2 passing (2s)
  1 failing

  1) AvatarArena
  	startBattle
    	should simulate battle results once two users join a battle:

  	AssertionError: expected 0 to equal 1. The numerical values of the given "ethers.BigNumber" and "number" inputs were compared, and they differed.
  	+ expected - actual

  	-0
  	+1

  	at Context.<anonymous> (test/AvatarArena.js:79:12)
  	at processTicksAndRejections (node:internal/process/task_queues:96:5)
  	at runNextTicks (node:internal/process/task_queues:65:3)
  	at listOnTimeout (node:internal/timers:528:9)
  	at processTimers (node:internal/timers:502:7)
```

Following the error, we see that the `getAvatarWins` function has nothing in the function body so the test code gets the default reurn value for the `uint256` data type. Let's fix that:

```solidity
// contracts/AvatarArena.sol

   function getAvatarWins(uint256 tokenId) external view returns (uint256) {
   	return 1;
   }

```

Let's re-run the tests:

```
$ yarn test
yarn run v1.22.19
$ hardhat test
Warning: Unused function parameter. Remove or comment out the variable name to silence this warning.
  --> contracts/AvatarArena.sol:74:28:
   |
74 | 	function getAvatarWins(uint256 tokenId) external view returns (uint256) {
   |                        	^^^^^^^^^^^^^^^


Warning: Function state mutability can be restricted to pure
  --> contracts/AvatarArena.sol:74:5:
   |
74 | 	function getAvatarWins(uint256 tokenId) external view returns (uint256) {
   | 	^ (Relevant source part starts here and spans across multiple lines).


Compiled 1 Solidity file successfully


  AvatarArena
	startBattle
  	✔ should start a pending battle if no pending battle is available (108ms)
  	✔ should put user in pending battle if available (138ms)
  	1) should simulate battle results once two users join a battle


  2 passing (2s)
  1 failing

  1) AvatarArena
   	startBattle
     	should simulate battle results once two users join a battle:

  	AssertionError: expected 1 to equal 0. The numerical values of the given "ethers.BigNumber" and "number" inputs were compared, and they differed.
  	+ expected - actual

  	-1
  	+0

  	at Context.<anonymous> (test/AvatarArena.js:64:68)
  	at processTicksAndRejections (node:internal/process/task_queues:95:5)
  	at runNextTicks (node:internal/process/task_queues:64:3)
  	at listOnTimeout (node:internal/timers:533:9)
  	at processTimers (node:internal/timers:507:7)
```

Okay, we're seeing a similar error but on a different line in the test condition. This could be a pointer that we need to think through the condition required to make the test pass, the test code expects the `getAvatarWins` function to return `0` when an avatar hasn't won a battle and expects that value to be incremented whenever an avatar wins a battle.

Let's address the problem:

```
// contracts/AvatarArena.sol

	mapping(address => uint256) private _userBattles;
	mapping(uint256 => uint256) private _avatarWins;

	event BattleComplete(uint256 battleIndex);


	function getAvatarWins(uint256 tokenId) external view returns (uint256) {
    	return _avatarWins[tokenId];
	}

	function _simulateBattle(uint256 _battleIndex) internal {
    	uint256 winnerIndex = 1;

    	Battle storage battle = _battles[_battleIndex];
    	battle.winner = int256(winnerIndex);
    	uint256 winningNft = battle.players[winnerIndex].nft;

    	_avatarWins[winningNft] += 1;

    	emit BattleComplete(_battleIndex);
	}
}

contract AvatarArena is ERC721Enumerable, ERC721URIStorage, Ownable, Arena {

```

We create a mapping to track the number of wins for each avatar. Now, when a battle is simulated, we get the nft attached to the player object at the winning index, and increment its wins.

Re-run the tests, they should pass now.

The test passes now and we get a winner but it's the same every time, that's not very useful. A good game should present all parties involved with a reasonable chance of success. There are some ways we could do that but I choose the easy path, choosing winners randomly! That brings us to the new test case.

### 4.3.4 - Test 4: Should Simulate Battle Results Randomly

```js
// test/AvatarArena.js

...
    	await avatarArena.connect(owner).getAvatarWins(winningNftId)
  	).to.eq(1);
	});

	it("should simulate battle results randomly", async function () {
  	await aaUtils.mintNFT(owner, owner.address);
  	await aaUtils.mintNFT(acc1, acc1.address);

  	const tokenID_1 = 0;
  	const tokenID_2 = 1;

  	let winnerIndexOld;
  	let winnerIndexNew;
  	let runs = 0;
  	const maxRuns = 10;

  	while (
    	(!winnerIndexOld && !winnerIndexNew) ||
    	winnerIndexOld.eq(winnerIndexNew)
  	) {
    	await aaUtils.startBattle(owner, tokenID_1);
    	await aaUtils.startBattle(acc1, tokenID_2);

    	const battle = await avatarArena.connect(acc1).getLatestBattle();

    	if (runs === 0) {
      	winnerIndexOld = battle.winner;
      	winnerIndexNew = battle.winner;
    	} else {
      	winnerIndexOld = winnerIndexNew;
      	winnerIndexNew = battle.winner;
    	}

    	++runs;

    	expect(runs).lt(
      	maxRuns,
      	`Contract failed to generate different results within ${maxRuns} calls`
    	);
  	}
	});
  });
});

const newAvatarArenaUtils = (contractInstance) => {
...
```

Testing randomness here is tricky, you want to be sure that within a range of runs, the value being generated changes. The problem is, that range could also change, how? well, it might produce a different value every two calls sometimes every single call, point is - _it's a fragile test_.

The way around it now is to keep simulating battles till we get a different winner, the downside to this is tests could go on for a long time (thankfully, all the times I've run this test, it's taken around the same time as a normal one test case). If it does take too long we have a maximum number of runs after which we forcibly fail the test.

I wouldn't be very comfortable putting this in production, but for the purpose of this tutorial, it'll do. Run the test

```
$ yarn test
yarn run v1.22.19
$ hardhat test
Compiled 1 Solidity file successfully


 AvatarArena
   startBattle
 	✔ should start a pending battle if no pending battle is available (73ms)
 	✔ should put user in pending battle if available (90ms)
 	✔ should simulate battle results once two users join a battle (86ms)
 	1) should simulate battle results randomly


 3 passing (2s)
 1 failing

 1) AvatarArena
 	startBattle
   	should simulate battle results randomly:

 	Contract failed to generate different results within 10 calls
 	+ expected - actual


 	at Context.<anonymous> (test/AvatarArena.js:113:22)
 	at processTicksAndRejections (node:internal/process/task_queues:96:5)
 	at runNextTicks (node:internal/process/task_queues:65:3)
 	at listOnTimeout (node:internal/timers:528:9)
 	at processTimers (node:internal/timers:502:7)
```

Let's add the logic for randomness in battle simulation:

```
// contracts/AvatarArena.sol

	function _simulateBattle(uint256 _battleIndex) internal {
    	uint256 random = uint256(
        	keccak256(abi.encodePacked(block.timestamp, msg.sender))
    	);
    	uint256 winnerIndex = random % 2;

    	Battle storage battle = _battles[_battleIndex];

```

What's happening? five things:

1. `uint256()`: here we cast the data to uint256 because that's the data type used in indexing the array of battle players.
2. `keccak256`: used for computing the Keccak-256 hash of the data input
3. `abi.encodePacked`: generates bytes which is the acceptable argument to keccak256, from `block.timestamp` and `msg.sender`. [Why are we doing it?](https://github.com/owanhunte/ethereum-solidity-course-updated-code/issues/1#issuecomment-569996795)
4. `block.timestamp` and `msg.sender` provide the randomness.
5. Finally, we use `%` to make sure the winner's index is within the bound of 0 or 1, since there are only two players in a battle.

_Note: this is a method of generating pseudo-random numbers. It isn't full-proof and shouldn't
be used in a live contract, see: https://stackoverflow.com/a/67332959/11990762_

Re-run the tests, they should pass now.

Now that the happy scenarios have been tested, let's look at some undesirable scenarios:

### 4.3.5 - Test 5: Should Fail to Start a Battle With a Token Sender Does Not Own

We want to make sure that whoever starts a battle with an avatar owns that avatar.

```js
// test/AvatarArena.js

      	`Contract failed to generate different results within ${maxRuns} calls`
    	);
  	}
	});

	it("should fail to start a battle with a token sender does not own", async function () {
  	await aaUtils.mintNFT(acc1, acc1.address);

  	const tokenID_1 = 0;

  	await expect(aaUtils.startBattle(owner, tokenID_1)).to.be.revertedWith(
    	"Arena: Cannot start battle with non-owned token"
  	);
	});
  });
});

const newAvatarArenaUtils = (contractInstance) => {

```

Run the test

```
$ yarn test
yarn run v1.22.19
$ hardhat test


  AvatarArena
	startBattle
  	✔ should start a pending battle if no pending battle is available (86ms)
  	✔ should put user in pending battle if available (89ms)
  	✔ should simulate battle results once two users join a battle (86ms)
  	✔ should simulate battle results randomly (126ms)
  	1) should fail to start a battle with a token sender does not own


  4 passing (2s)
  1 failing

  1) AvatarArena
  	startBattle
    	should fail to start a battle with a token sender does not own:
	AssertionError: Expected transaction to be reverted with reason 'Arena: Cannot start battle with non-owned token', but it didn't revert
  	at processTicksAndRejections (node:internal/process/task_queues:96:5)
  	at runNextTicks (node:internal/process/task_queues:65:3)
  	at listOnTimeout (node:internal/timers:528:9)
  	at processTimers (node:internal/timers:502:7)
  	at Context.<anonymous> (test/AvatarArena.js:125:7)
```

Let's make sure the contract reverts as expected:

```solidity
// contracts/AvatarArena.sol

	function startBattle(uint256 tokenId) external {
    	require(
        	this.ownerOf(tokenId) == msg.sender,
        	"Arena: Cannot start battle with non-owned token"
    	);

    	// skip placeholder battle
    	if (_battles.length > 1) {
        	uint256 currentBattleIndex = _battles.length - 1;

```

Re-run the tests, they should pass now.

### 4.3.6 - Test 6: Should Fail to Start Another Battle While in a Pending Battle

Only one battle can happen at a time so if a user can start another battle while in the middle of a pending battle, we run the risk of a user battling themselves.

```js
// test/AvatarArena.js

    	"Arena: Cannot start battle with non-owned token"
  	);
	});

	it("should fail to start another battle while in a pending battle", async function () {
  	await aaUtils.mintNFT(owner, owner.address);

  	const tokenID = 0;
  	await aaUtils.startBattle(owner, tokenID);

  	await expect(aaUtils.startBattle(owner, tokenID)).to.be.revertedWith(
    	"Arena: Cannot start another battle while in a pending battle"
  	);
	});
  });
});

const newAvatarArenaUtils = (contractInstance) => {

```

Run the tests:

```
$ yarn test
yarn run v1.22.19
$ hardhat test


  AvatarArena
	startBattle
  	✔ should start a pending battle if no pending battle is available (99ms)
  	✔ should put user in pending battle if available (93ms)
  	✔ should simulate battle results once two users join a battle (100ms)
  	✔ should simulate battle results randomly (184ms)
  	✔ should fail to start a battle with a token sender does not own (93ms)
  	1) should fail to start another battle while in a pending battle


  5 passing (2s)
  1 failing

  1) AvatarArena
  	startBattle
    	should fail to start another battle while in a pending battle:
	AssertionError: Expected transaction to be reverted with reason 'Arena: Cannot start another battle while in a pending battle', but it didn't revert
  	at processTicksAndRejections (node:internal/process/task_queues:96:5)
  	at runNextTicks (node:internal/process/task_queues:65:3)
  	at listOnTimeout (node:internal/timers:528:9)
  	at processTimers (node:internal/timers:502:7)
  	at Context.<anonymous> (test/AvatarArena.js:136:7)
```

Failing test... let's make sure the contract reverts correctly:

```solidity
// contracts/AvatarArena.sol

    	// skip placeholder battle
    	if (_battles.length > 1) {
        	uint256 currentBattleIndex = _battles.length - 1;
        	Battle storage currentBattle = _battles[currentBattleIndex];

        	if (
            	currentBattle.players.length == 1 &&
            	currentBattle.players[0].player == msg.sender
        	) {
            	revert("Arena: Cannot start another battle while in a pending battle");
        	}

        	// try to join an existing battle
        	if (currentBattle.players.length == 1) {

```

Re-run the tests, they should pass now.

And with that our `Arena` contract is complete!

One final thing before we close the curtains here, the `startBattle` function is looking bulky, we can break up the logic into smaller function, effectively reducing the cognitive load when us/someone else has to read the contract code:

```
// contracts/AvatarArena.sol


	function startBattle(uint256 tokenId) external {
    	require(
        	this.ownerOf(tokenId) == msg.sender,
        	"Arena: Cannot start battle with non-owned token"
    	);

    	// skip placeholder battle
    	if (_battles.length > 1) {
        	uint256 currentBattleIndex = _battles.length - 1;

        	if (
            	_battles[currentBattleIndex].players.length == 1 &&
            	_battles[currentBattleIndex].players[0].player == msg.sender
        	) {
            	revert("Arena: Cannot start another battle while in a pending battle");
        	}

        	if (_battles[currentBattleIndex].players.length == 1) {
            	_joinExistingBattle(tokenId, currentBattleIndex);

            	return;
        	}
    	}

    	_createNewBattle(tokenId);
	}



    	_avatarWins[winningNft] += 1;

    	emit BattleComplete(_battleIndex);
	}

	function _createNewBattle(uint256 tokenId) internal {
    	Battle storage newBattle = _battles.push();

    	newBattle.players.push(Player(msg.sender, tokenId));
    	newBattle.createdAt = block.timestamp;
    	newBattle.winner = -1;

    	_userBattles[msg.sender] = _battles.length - 1;
	}

	function _joinExistingBattle(uint256 tokenId, uint256 battleIndex) internal {
    	_battles[battleIndex].players.push(Player(msg.sender, tokenId));
    	_userBattles[msg.sender] = battleIndex;

    	_simulateBattle(battleIndex);
	}
}

contract AvatarArena is ERC721Enumerable, ERC721URIStorage, Ownable, Arena {

```

The tests should still pass, re-run them to be sure.

### 4.4. Contract Deployment

We're almost there, to deploy our smart contract to the Celo blockchain programmatically, we need to get the secret recovery phrase for our account from Metamask. This is used in generating our private key which is in turn used in signing transactions on the blockchain. (Therefore it goes without saying that you should keep the recovery phrase hidden and _not_ push it to GitHub)

We need to add the Celo Alfajores test network to our Metamask wallet, [here's a simple guide on that](https://docs.celo.org/blog/tutorials/3-simple-steps-to-connect-your-metamask-wallet-to-celo).

Once that's done, we need to get some testnet tokens which we'll be needing to make transactions, go to [this faucet](https://faucet.celo.org/) to get some.

Now that we've added the Alfajores test network and gotten some testnet tokens, to get the phrase from Metamask, we follow the path `settings -> security & privacy -> Reveal Secret Recovery Phrase -> copy phrase`.

Next, we create a `.env` file in the root of the repo and put the phrase in it just like this:

```
MNEMONIC="YOUR_SECRET_RECOVERY_PHRASE"
```

By default, the .env file is added to the `.gitignore` file so worry not.

We need to configure a few more files and we're done. First, `hardhat.config.js`.

```js
require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config({ path: ".env" });


/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.17",
  networks: {
	alfajores: {
  	url: "https://alfajores-forno.celo-testnet.org",
  	accounts: {
    	mnemonic: process.env.MNEMONIC,
    	path: "m/44'/60'/0'/0",
  	},
  	chainId: 44787,
	},
  },
};
```

Two main things are happening here:

1. We use `dotenv` to load the contents of our `.env` file as environmental variables.
2. We configure the `alfajores` network (a Celo testnet) in our hardhat config, the `accounts.path` value is unique to Metamask, each wallet application has its own derivation path, for example, if you were using the CeloExtensionWallet the path would be: "m/44'/52752'/0'/0", etc

Next, overwrite `scripts/deploy.js`

```js
// scripts/deploy.js

// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");

async function main() {
  const avatarArena = await deployContract();
  console.log("AvatarArena deployed to:", avatarArena.address);

  storeContractData(avatarArena);
}

async function deployContract() {
  const AvatarArena = await hre.ethers.getContractFactory("AvatarArena");
  const avatarArena = await AvatarArena.deploy();

  await avatarArena.deployed();

  return avatarArena;
}

function storeContractData(contract) {
  const fs = require("fs");
  const contractsDir = __dirname + "/../frontend/src/contracts";

  if (!fs.existsSync(contractsDir)) {
	fs.mkdirSync(contractsDir, { recursive: true });
  }

  fs.writeFileSync(
	contractsDir + "/AvatarArena-address.json",
	JSON.stringify({ AvatarArena: contract.address }, undefined, 2)
  );

  const AvatarArenaArtifact = artifacts.readArtifactSync("AvatarArena");

  fs.writeFileSync(
	contractsDir + "/AvatarArena.json",
	JSON.stringify(AvatarArenaArtifact, null, 2)
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
	console.error(error);
	process.exit(1);
  });
```

What sorcery is this? Not a lot it turns out, the main function does two things:

1. Deploy the smart contract - `AvatarArena`
2. Store the contract abi and address in a designated directory, we're storing it in a _frontend_ directory. We'll be building our front end in that directory.

Finally, in `package.json`. We need to add some scripts:

```json
// package.json

"scripts": {
    "compile": "hardhat compile",
    "test": "hardhat test",
    "deploy": "hardhat run --network alfajores scripts/deploy.js"
},
```

Run `yarn deploy`

```
$ yarn deploy
yarn run v1.22.19
$ hardhat run --network alfajores scripts/deploy.js
Compiled 1 Solidity file successfully
AvatarArena deployed to: 0xA28858B06EB2747909D257D01BffbE53C6B4f521
Done in 14.93s.
```

And we have lift-off!!

That was great, we've deployed our game on the Alfajores test network, and now we need to build the frontend web app for the game.

### 4.5. Frontend: Setup

Our frontend will be a React + [ChakraUI](https://v1.chakra-ui.com/) webapp. Let's go.

Our directory currently looks like this:

```
.
├── artifacts
├── cache
├── contracts
├── frontend
├── hardhat.config.js
├── node_modules
├── package.json
├── README.md
├── scripts
├── test
└── yarn.lock
```

We'll create a new React app in the frontend directory. Run `yarn create react-app frontend` in the project base directory:

```
$ yarn create react-app frontend
yarn create v1.22.19
[1/4] Resolving packages...
warning create-react-app > tar-pack > tar@2.2.2: This version of tar is no longer supported, and will not receive security updates. Please upgrade asap.
[2/4] Fetching packages...
[3/4] Linking dependencies...
[4/4] Building fresh packages...

success Installed "create-react-app@5.0.1" with binaries:
  	- create-react-app
[####################################################################] 68/68The directory frontend contains files that could conflict:

  src/

Either try using a new directory name or remove the files listed above.
error Command failed.
Exit code: 1
```

Remember that the previous contract deployment step copied some files into this frontend directory? We're going to delete them to allow CRA (create react-app) to set up the react project successfully and simply redeploy the contract again (you could also copy them somewhere and paste them after CRA finishes).

```bash
rm -rf ./frontend/*
yarn create react-app frontend
yarn deploy
```

A few more things before we start writing react. By default, CRA installs React v18 which is a pain when you're trying to use web3 libraries which depend on certain modules from the core node.js modules. React v18 uses webpack v5 which no longer polyfills those modules resulting in some errors when you try to run react with those web3 libraries installed. Here's an [example issue](https://stackoverflow.com/questions/71162471/error-message-with-web3-create-react-app-webpack-5).

There're many suggestions on how to resolve it, I didn't have a lot of luck with it so I chose the simplest option - I reverted to React v17 and that's what we're going to do here. Let's update the dependencies in `frontend/package.json`:

```json
// frontend/package.json

...
  "dependencies": {
	"@testing-library/jest-dom": "^5.14.1",
	"@testing-library/react": "^10.4.9",
	"@testing-library/user-event": "^12.8.3",
	"react": "^17.0.2",
	"react-dom": "^17.0.2",
	"react-scripts": "4.0.3",
	"web-vitals": "^2.1.0"
  },
...
```

We also need to update `frontend/src/index.js`:

```js
import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";

ReactDOM.render(
  <React.StrictMode>
	<App />
  </React.StrictMode>,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
```

Run

```bash
cd frontend
yarn install
yarn start
```

We're all good!

You might encounter an error that looks like this:

```
Starting the development server...

/home/rinwa/projects/avatar-arena/frontend/node_modules/react-scripts/scripts/start.js:19
  throw err;
  ^

Error: error:0308010C:digital envelope routines::unsupported
	at new Hash (node:internal/crypto/hash:71:19)
	at Object.createHash (node:crypto:133:10)
	at module.exports (/home/rinwa/projects/avatar-arena/frontend/node_modules/webpack/lib/util/createHash.js:135:53)
	at NormalModule._initBuildHash (/home/rinwa/projects/avatar-arena/frontend/node_modules/webpack/lib/NormalModule.js:417:16)
	at /home/rinwa/projects/avatar-arena/frontend/node_modules/webpack/lib/NormalModule.js:452:10
	at /home/rinwa/projects/avatar-arena/frontend/node_modules/webpack/lib/NormalModule.js:323:13
	at /home/rinwa/projects/avatar-arena/frontend/node_modules/loader-runner/lib/LoaderRunner.js:367:11
	at /home/rinwa/projects/avatar-arena/frontend/node_modules/loader-runner/lib/LoaderRunner.js:233:18
	at context.callback (/home/rinwa/projects/avatar-arena/frontend/node_modules/loader-runner/lib/LoaderRunner.js:111:13)
	at /home/rinwa/projects/avatar-arena/frontend/node_modules/react-scripts/node_modules/babel-loader/lib/index.js:59:103 {
  opensslErrorStack: [ 'error:03000086:digital envelope routines::initialization error' ],
  library: 'digital envelope routines',
  reason: 'unsupported',
  code: 'ERR_OSSL_EVP_UNSUPPORTED'
}
```

In which case you probably aren't using the right node version so double check to make sure you're using node v16.

Let's setup install our dependencies:

```bash
cd frontend
yarn add @chakra-ui/react@1.8.8 @emotion/react@^11 @emotion/styled@^11 framer-motion@^4.1.17 @celo/contractkit @celo-tools/use-contractkit bignumber.js react-icons @metamask/jazzicon eth-rpc-errors web3.storage axios react-router-dom
cd ..
```

You might notice that even though ChakraUI already has a v2, we're installing v1 here. That's because v2 requires a minimum React version of 18 which as I mentioned earlier was a bust for me. I might make a post about doing a setup that works for React 18 + ChakraUI v2 + web3 libraries in the future.. _might._

Now that we've installed the base dependencies, let's update `index.js`:

```js
// frontend/src/index.js

import React from "react";
import ReactDOM from "react-dom";
import {
  ContractKitProvider,
  Alfajores,
  NetworkNames,
} from "@celo-tools/use-contractkit";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import "@celo-tools/use-contractkit/lib/styles.css";
import { ChakraProvider } from "@chakra-ui/react";
import theme from "./theme";

ReactDOM.render(
  <React.StrictMode>
	<ContractKitProvider
  	networks={[Alfajores]}
  	network={{
    	name: NetworkNames.Alfajores,
    	rpcUrl: "https://alfajores-forno.celo-testnet.org",
    	graphQl: "https://alfajores-blockscout.celo-testnet.org/graphiql",
    	explorer: "https://alfajores-blockscout.celo-testnet.org",
    	chainId: 44787,
  	}}
  	dapp={{
    	name: "Avatar Arena",
    	description: "An NFT battle ground",
  	}}
	>
  	<ChakraProvider theme={theme}>
    	<App />
  	</ChakraProvider>
	</ContractKitProvider>
  </React.StrictMode>,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
```

What's this? Simple:

- The `ContractKitProvider` component is used to wrap the App component. It provides the necessary configuration to connect to the Celo blockchain through the Alfajores network.
- The `ChakraProvider` component is used to provide the necessary configuration to use the Chakra UI library.

Next, let's create the `theme.js` file. It'll contain the customizations we want on ChakraUI's theme, the only thing we're customizing is the font:

```js
// frontend/src/theme.js

import { extendTheme } from "@chakra-ui/react";

const theme = extendTheme({
  fonts: {
	heading: `"Space Grotesk", sans-serif`,
	body: `"Space Grotesk", sans-serif`,
  },
});

export default theme;
```

Also, let's not forget to [get the font from google](https://fonts.google.com/specimen/Space+Grotesk). Add this in the head document of `frontend/public/index.html`. Also, while we're here, let's change the html document title:

```
// frontend/public/index.html
...
  	Learn how to configure a non-root public URL by running `npm run build`.
	-->
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
	<link
  	href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap"
  	rel="stylesheet"
	/>
	<title>Avatar Arena</title>
  </head>
...
```

### 4.6. Frontend: Laying Bricks - Building Components

Apologies friends, we won't be using the TDD approach here. The TDD focus was in building the contract, the goal here is to get a nice interface to interact with the contract. Now, I already went through the trouble of hitting my head while figuring things out so we now have the luxury of going through each piece of the frontend as we assemble them, I'll do my best to explain what's going on in each component and we'll keep things moving. Si?

### 4.6.1 - Utilities

Let's create two files in the utils directory - `frontend/src/utils`:

```bash
mkdir frontend/src/utils
touch frontend/src/utils/index.js frontend/src/utils/arena.js
```

```js
// frontend/src/utils/index.js

export const truncateMidText = (text) => {
  return String(text).slice(0, 4) + "..." + String(text).slice(text.length - 4);
};

// convert from big number
export const formatBigNumber = (num) => {
  const ERC20_DECIMALS = 18;

  if (!num) return;
  return num.shiftedBy(-ERC20_DECIMALS).toFixed(2);
};

export const formatName = (name) => {
  // replace all spaces with %20
  return encodeURI(name);
};

// object to convert to file
export const convertObjectToFile = (data) => {
  const blob = new Blob([JSON.stringify(data)], { type: "application/json" });
  const files = [new File([blob], `${data.name}.json`)];
  return files;
};
```

This file exports four utility functions:

1.  `truncateMidText`: Truncates a string, keeping the first 4 characters, adding "...", and then appending the last 4 characters. Useful for displaying a minimized version of a blockchain address.
2.  `formatBigNumber`: Converts a BigNumber value to a human-readable number by shifting the decimal point and rounding to 2 decimal places.
3.  `formatName`: Encodes a string as a URI, replacing spaces with %20.
4.  `convertObjectToFile`: Converts an object to a JSON file, creating a Blob with the object's data and returning a new File array.

```js
// frontend/src/utils/arena.js

import { Web3Storage } from "web3.storage/dist/bundle.esm.min.js";
import axios from "axios";
import { BigNumber } from "@ethersproject/bignumber";
import { convertObjectToFile, formatName } from ".";
import { nanoid } from "nanoid";

// Initialize the client with an API key
const client = new Web3Storage({
  token: process.env.REACT_APP_STORAGE_API_KEY,
});

export const createNft = async (
  arenaContract,
  performActions,
  { name, description, ipfsImage }
) => {
  await performActions(async (kit) => {
	if (!name || !description || !ipfsImage)
  	throw new Error("Missing NFT meta fields");

	const { defaultAccount } = kit;

	// convert NFT metadata to JSON format
	const data = {
  	name,
  	description,
  	image: ipfsImage,
	};

	// trim any extra whitespaces from the name and
	// replace the whitespace between the name with %20
	const fileName = formatName(name);

	//  bundle nft metadata into a file
	const files = convertObjectToFile(data);

	// save NFT metadata to web3 storage
	const cid = await client.put(files);

	// IPFS url for uploaded metadata
	const url = `https://${cid}.ipfs.w3s.link/${fileName}.json`;

	// mint the NFT and save the IPFS url to the blockchain
	let transaction = await arenaContract.methods
  	.safeMint(defaultAccount, url)
  	.send({ from: defaultAccount });

	return transaction;
  });
};

export const fetchNft = (arenaContract, tokenId) =>
  new Promise(async (resolve) => {
	const tokenUri = await arenaContract.methods.tokenURI(tokenId).call();
	const wins = await arenaContract.methods.getAvatarWins(tokenId).call();
	const meta = await fetchNftMeta(tokenUri);
	const owner = await fetchNftOwner(arenaContract, tokenId);
	resolve({
  	index: tokenId,
  	owner,
  	wins,
  	name: meta.data.name,
  	image: meta.data.image,
  	description: meta.data.description,
	});
  });

export const getAllNfts = async (arenaContract) => {
  const nfts = [];
  const nftsLength = await arenaContract.methods.totalSupply().call();
  for (let i = 0; i < Number(nftsLength); i++) {
	const nft = fetchNft(arenaContract, i);
	nfts.push(nft);
  }
  return Promise.all(nfts);
};

export const getMyNfts = async (arenaContract, ownerAddress) => {
  const userTokensLength = await arenaContract.methods
	.balanceOf(ownerAddress)
	.call();

  let userTokenIds = [];
  for (let i = 0; i < Number(userTokensLength); i++) {
	const tokenId = arenaContract.methods
  	.tokenOfOwnerByIndex(ownerAddress, i)
  	.call();
	userTokenIds.push(tokenId);
  }
  userTokenIds = await Promise.all(userTokenIds);

  const nfts = [];
  userTokenIds.forEach((tokenId) => {
	const nft = fetchNft(arenaContract, tokenId);

	nfts.push(nft);
  });

  return Promise.all(nfts);
};

export const fetchNftMeta = async (ipfsUrl) => {
  if (!ipfsUrl) return null;
  const meta = await axios.get(ipfsUrl);
  return meta;
};

export const fetchNftOwner = async (arenaContract, index) => {
  return await arenaContract.methods.ownerOf(index).call();
};

export const fetchLatestBattle = async (arenaContract) => {
  let battle = await arenaContract.methods.getLatestBattle().call();

  if (battle.players.length === 0) return null;

  return formatBattleData(arenaContract, battle);
};

const getWinnerAddress = (battle) => {
  const winner = BigNumber.from(battle.winner).toNumber();

  if (winner === -1) return "";

  if (winner === 0 || winner === 1) return battle.players[winner].player;
};

const formatBattleData = async (arenaContract, battle) => {
  const formattedBattle = {
	players: [{}, {}],
	createdAt: "",
	winner: "",
  };

  formattedBattle.createdAt = new Date(battle.createdAt * 1000);

  // fetch battle players nfts
  [formattedBattle.players[0].nft, formattedBattle.players[1].nft] =
	await Promise.all([
  	fetchNft(arenaContract, battle.players[0].nft),
  	battle.players[1] ? fetchNft(arenaContract, battle.players[1].nft) : null,
	]);

  formattedBattle.winner = getWinnerAddress(battle);

  return formattedBattle;
};

export const generateAvatarImage = async () => {
  const avatarId = nanoid();
  const response = await axios.get(`https://robohash.org/${avatarId}`, {
	responseType: "arraybuffer",
  });

  const blob = new Blob([response.data]);
  const file = new File([blob], `${avatarId}.png`, { type: "image/png" });
  return file;
};

export const uploadFileToWeb3Storage = async (file) => {
  const fileName = file.name;
  const imageName = formatName(fileName);

  const cid = await client.put([file]);
  return `https://${cid}.ipfs.w3s.link/${imageName}`;
};

export const startBattle = async (arenaContract, performActions, tokenId) => {
  await performActions(async (kit) => {
	const { defaultAccount } = kit;

	await arenaContract.methods
  	.startBattle(tokenId)
  	.send({ from: defaultAccount });
  });
};
```

These are helper functions, we'll be using them later on but here's an overview on them:

1.  `createNft`: Creates and mints a new NFT with the given metadata, stores it on Web3.Storage, and saves the IPFS URL on the blockchain.
2.  `fetchNft`: Fetches an NFT's data, including owner, wins, and metadata, by its token ID.
3.  `getAllNfts`: Fetches data for all NFTs stored in the contract.
4.  `getMyNfts`: Fetches data for all NFTs owned by the given address.
5.  `fetchNftMeta`: Fetches NFT metadata from an IPFS URL.
6.  `fetchNftOwner`: Fetches the owner of an NFT by its token ID.
7.  `fetchLatestBattle`: Fetches the latest battle information from the contract.
8.  `formatBattleData`: Formats battle data for display.
9.  `generateAvatarImage`: Generates an avatar image using the Robohash API and nanoid. That way users get random avatars each time with a low rate of collision.
10. `uploadFileToWeb3Storage`: Uploads a file to Web3.Storage and returns its URL.

11. `startBattle`: Starts a battle using the given NFT token ID.

We'll use web3storage for storing our NFT data on IPFS and axios for making API requests.

[Here's nice tutorial](https://web3.storage/docs/#quickstart) on setting up an account on web3storage and getting your API token.

When you've gotten your API token, add it to the `frontend/.env` file:
`REACT_APP_STORAGE_API_KEY=your API token`

### 4.6.2 - Contracts

You already know about the contracts directory (`frontend/src/contracts`) from the contract deployment step.

```
frontend/src/contracts/
├── AvatarArena-address.json
└── AvatarArena.json
```

### 4.6.3 - Hooks

We'll create a few hooks that we'll be needing. Let's create the files:

```bash
mkdir frontend/src/hooks
touch frontend/src/hooks/useContract.js frontend/src/hooks/useArenaContract.js frontend/src/hooks/useBalance.js
```

```js
// frontend/src/hooks/useContract.js

import { useState, useEffect, useCallback } from "react";
import { useContractKit } from "@celo-tools/use-contractkit";

export const useContract = (abi, contractAddress) => {
  const { getConnectedKit, address } = useContractKit();
  const [contract, setContract] = useState(null);

  const getContract = useCallback(async () => {
	const kit = await getConnectedKit();
	setContract(new kit.web3.eth.Contract(abi, contractAddress));
  }, [getConnectedKit, abi, contractAddress]);

  useEffect(() => {
	if (address) getContract();
  }, [address, getContract]);

  return contract;
};
```

`useContract` takes an ABI and a contract address as input. It sets up a connection to the contract using the `ContractKit` and returns the contract instance. The hook updates the contract instance when the user's address changes, making sure we always hold a correcct reference to the contract instance.

```js
// frontend/src/hooks/useArenaContract.js

import { useContract } from "./useContract";
import AvatarArenaAbi from "../contracts/AvatarArena.json";
import AvatarArenaContractAddress from "../contracts/AvatarArena-address.json";

const useArenaContract = () =>
  useContract(AvatarArenaAbi.abi, AvatarArenaContractAddress.AvatarArena);

export default useArenaContract;
```

`useArenaContract` utilizes the `useContract` hook to create an instance of the AvatarArena contract.

```js
// frontend/src/hooks/useBalance.js

import { useState, useEffect, useCallback } from "react";
import { useContractKit } from "@celo-tools/use-contractkit";

export const useBalance = () => {
  const { address, kit } = useContractKit();
  const [balance, setBalance] = useState(0);

  const getBalance = useCallback(async () => {
	// fetch a connected wallet token balance
	const value = await kit.getTotalBalance(address);
	setBalance(value);
  }, [address, kit]);

  useEffect(() => {
	if (address) getBalance();
  }, [address, getBalance]);

  return {
	balance,
	getBalance,
  };
};
```

`useBalance` fetches the connected wallet's token balance (CELO on Alfajores testnet is our situation) using Celo's `ContractKit`. It updates the balance when the user's address changes and returns the balance and a `getBalance` function to refresh the balance.

Great! Now the components.

### 4.6.4 - Components

Let's create the files

```bash
mkdir frontend/src/components
touch frontend/src/components/{cover,identicon,card,card-list,wallet,header,layout,create-avatar-modal,create-avatar-button,start-battle-modal,start-battle-button,versus}.js
```

```js
// frontends/src/components/cover.js

import { Button, Flex, Heading, Icon, Text, useToast } from "@chakra-ui/react";
import { GiBattleGear } from "react-icons/gi";

const Cover = ({ connect }) => {
  const toast = useToast();

  const handleConnectWallet = () => {
	try {
  	connect();
	} catch (error) {
  	console.log(error);
  	toast({
    	title: "Error connecting to wallet",
    	description: error.message,
    	position: "top",
    	status: "error",
    	duration: 5000,
    	variant: "solid",
  	});
	}
  };

  return (
	<Flex
  	flexDir={"column"}
  	alignItems={"center"}
  	justifyContent={"center"}
  	h="100vh"
  	bg="gray.900"
  	color="gray.200"
  	rowGap={"3"}
	>
  	<Icon as={GiBattleGear} width="14" height="14" />
  	<Heading mb="7" size="lg" textTransform="uppercase">
    	Avatar Arena
  	</Heading>
  	<Text fontSize={"sm"}>Connect your wallet to continue</Text>
  	<Button size="md" color="gray.900" onClick={handleConnectWallet}>
    	Connect Wallet
  	</Button>
  	<Text position={"fixed"} bottom={"10"} fontWeight={"semibold"}>
    	Powered by Celo
  	</Text>
	</Flex>
  );
};

export default Cover;
```

`Cover` displays a simple welcome screen with a button to connect the user's wallet. When the button is clicked, it attempts to connect the wallet, and shows an error toast if there's a problem.

```js
// frontends/src/components/identicon.js

import { useEffect, useRef } from "react";
import Jazzicon from "@metamask/jazzicon";

const Identicon = ({ address, size, ...rest }) => {
  const ref = useRef();

  useEffect(() => {
	if (address && ref.current) {
  	ref.current.innerHTML = "";
  	ref.current.appendChild(
    	Jazzicon(size, parseInt(address.slice(2, 10), 16))
  	);
	}
  }, [address, size]);

  return (
	<div {...rest}>
  	<div ref={ref} style={{ width: `${size}px`, height: `${size}px` }} />
	</div>
  );
};

export default Identicon;
```

`Identicon` displays a Jazzicon image for a given address. We make sure to update the image if the address or speicified size changes. This makes it easier to identify addresses.

```js
// frontends/src/components/card.js

import { Box, Divider, Flex, Image, Text, Link } from "@chakra-ui/react";
import { truncateMidText } from "../utils";
import Identicon from "./identicon";
import { Link as ReactRouterLink } from "react-router-dom";

const Card = ({ nft, isOwner, showBattle, ...props }) => {
  const { image, description, owner, name, index, wins } = nft;

  const renderHeader = () => {
	return (
  	<Flex
    	alignItems={"center"}
    	fontWeight={"semibold"}
    	justifyContent={"space-between"}
    	p="3"
  	>
    	<Flex columnGap={"3"} alignItems={"center"}>
      	<Identicon address={owner} size="20" />
      	<Text>{truncateMidText(owner)}</Text>
    	</Flex>

    	<Text bg="gray.200" color={"gray.900"} px="2" borderRadius={"md"}>
      	#{index}
    	</Text>
  	</Flex>
	);
  };

  const renderImage = () => {
	return (
  	<Box
    	boxSize={"full"}
    	overflow={"hidden"}
    	borderX={"none"}
    	borderY={"1.5px"}
    	borderColor={"gray.200"}
  	>
    	<Image
      	transitionDuration={"300ms"}
      	src={image}
      	alt={description}
      	width={"full"}
    	/>
  	</Box>
	);
  };

  const renderContent = () => {
	return (
  	<Flex rowGap={"1"} flexDir={"column"} p="3">
    	<Text fontWeight={"semibold"}>{name}</Text>
    	<Text fontSize={"sm"} noOfLines={2}>
      	{description}
    	</Text>
    	<Divider my="2" />
    	<Text
      	textAlign={"center"}
      	fontSize={"lg"}
      	textTransform={"uppercase"}
      	fontWeight={"bold"}
      	letterSpacing={"widest"}
    	>
      	Wins: {wins}
    	</Text>

    	{isOwner && showBattle ? (
      	<Link
        	as={ReactRouterLink}
        	to={`/arena?tokenId=${index}`}
        	mt="2"
        	bg="gray.600"
        	p="2"
        	display={"flex"}
        	borderRadius={"md"}
        	fontWeight={"semibold"}
        	color={"gray.400"}
        	transitionDuration="300ms"
        	_hover={{
          	textDecoration: "none",
          	bg: "gray.200",
          	color: "gray.900",
        	}}
        	justifyContent={"center"}
        	w="full"
      	>
        	Battle
      	</Link>
    	) : null}
  	</Flex>
	);
  };

  return (
	<Flex
  	w="full"
  	flexDir={"column"}
  	color={"gray.200"}
  	borderWidth="1.5px"
  	borderColor={"gray.600"}
  	borderRadius="md"
  	className="battle-card"
  	{...props}
	>
  	{renderHeader()}
  	{renderImage()}
  	{renderContent()}
	</Flex>
  );
};

export default Card;
```

The `Card` component displays an NFT card with various information about the NFT including its image, description, owner, name, index, and the number of wins. and a "Battle" button, if the user is the owner and `showBattle`, is `true`.

The content of the card is broken between three helper functions. By separating the details, it becomes easy to tell what the component is returning with a glance at its return statement:

1.  `renderHeader()`: This function renders the header section of the card, which displays the owner's address and the NFT's index.
2.  `renderImage()`: This function renders the image section of the card, which displays the NFT's image.
3.  `renderContent()`: This function renders the content section of the card, which displays the NFT's name, description, number of wins, and a "Battle" button if the user is the owner and `showBattle` is `true`.

```js
// frontends/src/components/cardlist.js

import { useCallback, useEffect, useState } from "react";
import { useContractKit } from "@celo-tools/use-contractkit";
import { SimpleGrid, Skeleton, Text, useToast } from "@chakra-ui/react";
import useArenaContract from "../hooks/useArenaContract";
import { getAllNfts, getMyNfts } from "../utils/arena";
import Card from "./card";
import { useLocation } from "react-router-dom";

const CardList = ({ userNFTsOnly, emptyMessage }) => {
  const location = useLocation();
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const arenaContract = useArenaContract();
  const { address } = useContractKit();
  const [nfts, setNfts] = useState([]);

  const getAssets = useCallback(async () => {
	try {
  	setIsLoading(true);

  	const allNfts = userNFTsOnly
    	? await getMyNfts(arenaContract, address)
    	: await getAllNfts(arenaContract);
  	if (!allNfts) return;
  	setNfts(allNfts);
	} catch (error) {
  	console.log({ error });
	} finally {
  	setIsLoading(false);
	}
  }, [arenaContract, address, userNFTsOnly]);

  useEffect(() => {
	try {
  	if (address && arenaContract) {
    	getAssets();
  	}
	} catch (error) {
  	toast(error);
	}
  }, [arenaContract, address, getAssets, toast, location.key]);

  const renderLoader = () => {
	return (
  	<SimpleGrid minChildWidth={"250px"} spacing={"10"}>
    	<Skeleton startColor="gray.700" endColor="gray.800" height="400px" />
    	<Skeleton startColor="gray.700" endColor="gray.800" height="400px" />
    	<Skeleton startColor="gray.700" endColor="gray.800" height="400px" />
    	<Skeleton startColor="gray.700" endColor="gray.800" height="400px" />
    	<Skeleton startColor="gray.700" endColor="gray.800" height="400px" />
  	</SimpleGrid>
	);
  };

  const renderCards = () => {
	return nfts.length ? (
  	<SimpleGrid
    	minChildWidth={"250px"}
    	spacing={"10"}
    	justifyItems={{ base: "center", md: "flex-start" }}
  	>
    	{nfts.map((nft) => (
      	<Card
        	nft={nft}
        	isOwner={nft.owner === address}
        	showBattle
        	maxW={{ base: "330px" }}
      	/>
    	))}

    	{
      	// Use dummy cards to pad card list in order to keep grid consistent
      	// when cards are not up to 4
      	Array(4)
        	.fill(null)
        	.map((_, idx) => (
          	<div key={idx}></div>
        	))
    	}
  	</SimpleGrid>
	) : (
  	<Text
    	mt="5%"
    	color={"gray.200"}
    	textAlign={"center"}
    	fontWeight={"semibold"}
    	fontSize={"xl"}
  	>
    	{emptyMessage}
  	</Text>
	);
  };

  return <>{isLoading ? renderLoader() : renderCards()}</>;
};
export default CardList;
```

`CardList` displays a list of NFT cards using a grid layout. We'll use it everywhere we need to display a list of cards.

Content is distributed across three function functions here as well:

1.  `getAssets()`: This function fetches the NFTs either for all users or only for the current user, depending on the `userNFTsOnly` prop. It then updates the `nfts` state with the fetched NFTs.
2.  `renderLoader()`: This function renders a skeleton loader while the component is waiting for the NFT data to load.
3.  `renderCards()`: This function renders the list of NFT cards using the `Card` component. It first checks whether the `nfts` array is empty and displays the `emptyMessage` if it is. Otherwise, it maps through the `nfts` array and renders a `Card` component for each one. It also includes a series of dummy `div` elements to pad the list and maintain a consistent grid layout.

```js
// frontends/src/components/wallet.js

import {
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  Text,
  Flex,
  Icon,
  Spinner,
} from "@chakra-ui/react";
import Identicon from "./identicon";
import { formatBigNumber, truncateMidText } from "../utils";
import { BiExit } from "react-icons/bi";
import { BsPersonCircle } from "react-icons/bs";

const Wallet = ({ address, amount, symbol, destroy }) => {
  return (
	<Menu>
  	<MenuButton
    	px={4}
    	py={2}
    	transition="all 0.2s"
    	borderRadius="sm"
    	borderWidth="2px"
    	borderColor={"gray.200"}
    	_hover={{ bg: "gray.200", color: "gray.900" }}
    	_expanded={{ bg: "blue.400" }}
  	>
    	<Flex columnGap={2} alignItems={"center"}>
      	{amount ? (
        	<Text fontWeight={"bold"}>
          	{formatBigNumber(amount)} {symbol}
        	</Text>
      	) : (
        	<Spinner size="sm" />
      	)}
      	<Identicon address={address} size="28" />
    	</Flex>
  	</MenuButton>
  	<MenuList boxShadow={"2xl"} bg={"gray.900"} color={"gray.200"}>
    	<MenuItem
      	columnGap={"1"}
      	_hover={{ bg: "gray.200", color: "gray.900", fontWeight: "semibold" }}
      	_focus={{ bg: "gray.200", color: "gray.900", fontWeight: "semibold" }}
    	>
      	<Icon as={BsPersonCircle} width="6" height="6" />
      	<Text>{truncateMidText(address)}</Text>
    	</MenuItem>
    	<MenuDivider />
    	<MenuItem
      	columnGap={"1"}
      	_hover={{ bg: "gray.200", color: "gray.900", fontWeight: "semibold" }}
      	_focus={{ bg: "gray.200", color: "gray.900", fontWeight: "semibold" }}
      	onClick={destroy}
    	>
      	<Icon as={BiExit} width="6" height="6" />
      	<Text>Disconnect</Text>
    	</MenuItem>
  	</MenuList>
	</Menu>
  );
};

export default Wallet;
```

The `Wallet` component is a dropdown menu that displays the user's wallet address, balance, and an identicon representing their address (using the `Identicon` component). It receives `address`, `amount`, `symbol`, and `destroy` props.

When the user clicks on the menu button, it expands to show a menu list that contains two items. The first item displays the user's address and an icon, while the second item displays a "Disconnect" text and an icon. When the user clicks on the "Disconnect" item, it calls the `destroy` function, which disconnects the application from the user's wallet.

```js
// frontends/src/components/header.js

import { NavLink } from "react-router-dom";
import { useContractKit } from "@celo-tools/use-contractkit";
import { Flex, Heading, Icon, Text } from "@chakra-ui/react";
import { GiBattleGear } from "react-icons/gi";
import Wallet from "./wallet";
import { useBalance } from "../hooks/useBalance";

const pages = [
  {
	text: "Arena",
	link: "/arena",
  },
  {
	text: "All Avatars",
	link: "/all-avatars",
  },
  {
	text: "My Avatars",
	link: "/my-avatars",
  },
];

const Header = ({ ...props }) => {
  const { address, destroy } = useContractKit();
  const { balance } = useBalance();

  return (
	<Flex
  	color={"gray.200"}
  	py="5"
  	justifyContent="space-between"
  	alignItems="center"
  	{...props}
	>
  	<Flex alignItems="center" columnGap="1">
    	<Icon as={GiBattleGear} width="8" height="8" />
    	<Heading size="md" textTransform="uppercase">
      	Avatar Arena
    	</Heading>
  	</Flex>

  	<Flex columnGap={10} alignItems={"center"}>
    	<Flex columnGap={10}>
      	{pages.map((page) => (
        	<NavLink to={page.link}>
          	{({ isActive }) => (
            	<Text
              	fontWeight={isActive ? "bold" : "medium"}
              	textTransform="uppercase"
              	color={isActive ? "gray.200" : "gray.500"}
              	_hover={{
                	color: "gray.200",
                	fontWeight: "bold",
              	}}
            	>
              	{page.text}
            	</Text>
          	)}
        	</NavLink>
      	))}
    	</Flex>

    	<Wallet
      	address={address}
      	amount={balance.CELO}
      	symbol={"CELO"}
      	destroy={destroy}
    	/>
  	</Flex>
	</Flex>
  );
};

export default Header;
```

Like the name sounds, `Header` is the header of the web application. It has a logo and a navigation bar, and the `Wallet` component. The navigation bar has three links, 'Arena', 'All Avatars', and 'My Avatars', that direct the user to the three different pages we'll have in the application.

Also, we use `react-router-dom`'s `NavLink` component here and leverage it's inbuilt functionality to highlight the link that matches the application's current route.

```js
// frontends/src/components/layout.js

import { Box } from "@chakra-ui/react";
import Header from "./header";

const Layout = ({ children }) => {
  return (
	<Box bg="gray.900" px="10" pb="20" minH={"100vh"}>
  	<Header maxW="1600px" marginX="auto" />

  	<Box maxW={"1200px"} width={["90%", "70%"]} marginX="auto">
    	{children}
  	</Box>
	</Box>
  );
};

export default Layout;
```

`Layout` is the default layout that we'll be using on the pages in the web application. We include the `Header` component by default and that helps to reduce repitition. The rest of the content of the page is passed to the `Layout` component using the `children` prop and displayed below the header.

```js
// frontends/src/components/create-avatar-modal.js

import { useEffect, useState } from "react";
import {
  FormControl,
  FormLabel,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  Text,
  Input,
  VStack,
  Textarea,
  Flex,
  Image,
  useToast,
} from "@chakra-ui/react";
import { useContractKit } from "@celo-tools/use-contractkit";
import useArenaContract from "../hooks/useArenaContract";
import {
  createNft,
  generateAvatarImage,
  uploadFileToWeb3Storage,
} from "../utils/arena";
import { useNavigate } from "react-router-dom";

const CreateAvatarModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const toast = useToast();
  const { performActions } = useContractKit();
  const arenaContract = useArenaContract();

  const [newAvatarImage, setNewAvatarImage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateAvatar = async (event) => {
	event.preventDefault();

	setIsLoading(true);
	try {
  	const image = await generateAvatarImage();
  	const ipfsImageUrl = await uploadFileToWeb3Storage(image);
  	const data = {
    	name: event.target.elements.name.value,
    	description: event.target.elements.description.value,
    	ipfsImage: ipfsImageUrl,
  	};

  	await createNft(arenaContract, performActions, data);
  	setNewAvatarImage(ipfsImageUrl);
  	toast({
    	title: "NFT minted!",
    	position: "top",
    	status: "success",
    	duration: 5000,
    	variant: "top-accent",
  	});
	} catch (error) {
  	console.log({ error });
  	toast({
    	title: "Error minting NFT!",
    	description: error.message,
    	position: "top",
    	status: "error",
    	duration: 5000,
    	variant: "top-accent",
  	});
	} finally {
  	setIsLoading(false);
	}
  };

  // clear avatar image when modal reopens
  useEffect(() => setNewAvatarImage(""), [isOpen]);

  const handleClose = () => {
	onClose();

	// show user new list of avatars if user just finished
	// creating new avatar
	if (newAvatarImage) navigate("/my-avatars");
  };

  return (
	<Modal
  	size="lg"
  	isOpen={isOpen}
  	onClose={isLoading ? () => {} : handleClose}
	>
  	<ModalOverlay
    	bg="none"
    	backdropFilter="auto"
    	backdropBlur="2px"
    	// make chakra UI modal play nice with metamask
    	visibility={isLoading ? "hidden" : "initial"}
  	/>
  	<ModalContent
    	bg="gray.900"
    	color="gray.200"
    	border="1px"
    	borderColor={"gray.200"}
    	// make chakra UI modal play nice with metamask
    	visibility={isLoading ? "hidden" : "initial"}
  	>
    	<ModalHeader>Mint NFT</ModalHeader>
    	<ModalCloseButton />

    	<ModalBody>
      	<Text mb="3">Create an avatar</Text>

      	<form id="create-avatar" onSubmit={handleCreateAvatar}>
        	<VStack gap="5">
          	<FormControl>
            	<FormLabel htmlFor="name">Name</FormLabel>
            	<Input isRequired id="name" type="name" />
          	</FormControl>
          	<FormControl>
            	<FormLabel htmlFor="description">
              	<Flex columnGap={"2"} alignItems={"flex-end"}>
                	<Text>Description</Text>
                	<Text fontSize={"sm"}>(max 100 chars)</Text>
              	</Flex>
            	</FormLabel>
            	<Textarea
              	isRequired
              	maxLength={100}
              	id="description"
              	type="description"
            	/>
          	</FormControl>
        	</VStack>
      	</form>

      	{newAvatarImage ? (
        	<Image
          	transitionDuration={"300ms"}
          	src={newAvatarImage}
          	alt={"new avatar"}
          	width={"full"}
          	maxW={"330px"}
          	marginX={"auto"}
        	/>
      	) : null}
    	</ModalBody>

    	<ModalFooter>
      	<Button color="gray.900" mr={3} onClick={handleClose}>
        	Close
      	</Button>
      	<Button
        	type="submit"
        	form="create-avatar"
        	variant="ghost"
        	isLoading={isLoading}
      	>
        	Create
      	</Button>
    	</ModalFooter>
  	</ModalContent>
	</Modal>
  );
};

export default CreateAvatarModal;
```

`CreateAvatarModal` renders a modal window that allows a user to create a new avatar as an NFT.

When the component mounts, it initializes the state by setting the newAvatarImage to an empty string, which makes the modal hide the image component.

The `handleCreateAvatar` function is triggered when the user clicks the "Create" button, after filling in the name and description fields. It first generates an image file for the new avatar using the `generateAvatarImage` function, then uploads the generated file to Web3 storage using the `uploadFileToWeb3Storage` function. Finally, it creates the new NFT by calling the `createNft` function with the appropriate data.

If the createNft function is successful, it sets the `newAvatarImage` to the ipfsImageUrl of the newly created avatar image and displays it in the modal window. Otherwise, an error message is displayed using the toast function.

The `handleClose` function is called when the user clicks the "Close" button or when the modal window is closed in any other way. It sets the newAvatarImage back to an empty string and calls the onClose function that was passed as a prop to the component. If a new avatar was successfully created, it navigates the user to the "My Avatars" page on closing the modal.

Also you'll notice these snippets:

- `onClose={isLoading  ? () => {} :  handleClose}`
- `visibility={isLoading  ?  "hidden"  :  "initial"}`

The ChakraUI modal is higher than the Celo `ContractKit` action overlay which is displayed when performing an action, we don't want that so this is a hacky way to hide the modal and prevent user from accidentally closing the modal while the contract kit is trying to complete the action.

This leads to a few seconds where the modal isn't showing and the Celo `ContractKit` action overlay hasn't come up yet, it'll have to do for now.

```js
// frontends/src/components/create-avatar-button.js

import { Button, Icon, Text, useDisclosure } from "@chakra-ui/react";
import { FaPlus } from "react-icons/fa";
import CreateAvatarModal from "./create-avatar-modal";

const CreateAvatarButton = () => {
  const { isOpen, onToggle } = useDisclosure();

  return (
	<>
  	<Button onClick={onToggle}>
    	<Icon as={FaPlus} mr="2" width={"3"} height={"3"} />
    	<Text>New Avatar</Text>
  	</Button>

  	<CreateAvatarModal isOpen={isOpen} onClose={onToggle} />
	</>
  );
};

export default CreateAvatarButton;
```

`CreateAvatarButton` renders a button that, when clicked, opens a modal that allows the user to create a new avatar using the `CreateAvatarModal`. The component uses the `useDisclosure` hook from Chakra UI to handle the modal state.

```js
// frontends/src/components/start-battle-modal.js

import {
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
} from "@chakra-ui/react";
import CardList from "./card-list";

const StartBattleModal = ({ isOpen, onToggle }) => {
  return (
	<Modal size="4xl" isOpen={isOpen} onClose={onToggle}>
  	<ModalOverlay bg="none" backdropFilter="auto" backdropBlur="2px" />
  	<ModalContent
    	bg="gray.900"
    	color="gray.200"
    	border="1px"
    	borderColor={"gray.200"}
  	>
    	<ModalHeader>Choose battle avatar</ModalHeader>
    	<ModalCloseButton />

    	<ModalBody maxH={"70vh"} overflow={"auto"}>
      	<CardList
        	title={"Choose avatar"}
        	emptyMessage={"You haven't minted any avatars yet"}
        	userNFTsOnly
      	/>
    	</ModalBody>

    	<ModalFooter>
      	<Button color="gray.900" mr={3} onClick={onToggle}>
        	Close
      	</Button>
    	</ModalFooter>
  	</ModalContent>
	</Modal>
  );
};

export default StartBattleModal;
```

`StartBattleModal` displays a modal for the user to select their battle avatar. It uses the `CardList` component is used to display the user's available avatars for selection. Only shows the current user's avatars.

```js
// frontends/src/components/start-battle-button.js

import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Button, useDisclosure } from "@chakra-ui/react";
import StartBattleModal from "./start-battle-modal";

const StartBattleButton = () => {
  const { isOpen, onToggle } = useDisclosure();
  const [searchParams] = useSearchParams();
  const tokenId = searchParams.get("tokenId");

  useEffect(() => {
	if (!!tokenId && isOpen) onToggle();
  }, [tokenId, isOpen, onToggle]);

  return (
	<>
  	<Button onClick={onToggle} w="max-content" size="lg" color="gray.900">
    	Start Battle
  	</Button>

  	<StartBattleModal isOpen={isOpen} onToggle={onToggle} />
	</>
  );
};

export default StartBattleButton;
```

`StartBattleButton` renders a button that, when clicked, opens a modal that displays a list of the user's avatars that can be selected to start a battle using the `StartBattleModal`.

Additionally, the component also uses the `useSearchParams` hook from `react-router-dom` to retrieve the `tokenId` parameter from the URL query string. If `tokenId` is present in the query string and the modal is open, it will automatically close the modal. This ensures that modal closes when a user selects an avatar.

```js
// frontends/src/components/versus.js

import { Box, Flex, Text } from "@chakra-ui/react";
import Card from "./card";

const Versus = ({ latestBattle, address }) => {
  const nft1 = latestBattle?.players[0].nft;
  const nft2 = latestBattle?.players[1].nft;

  const getCardProps = (nft) => {
	if (!latestBattle.winner) return {};

	if (nft.owner === latestBattle.winner)
  	return { borderColor: "green.500", borderWidth: "2px" };

	return { borderColor: "red.500", borderWidth: "2px" };
  };

  const renderAvatars = () => (
	<Flex w={"full"} justifyContent={"space-between"}>
  	<Card
    	nft={nft1}
    	maxW={"330px"}
    	minW="200px"
    	w="50%"
    	{...getCardProps(nft1)}
  	/>

  	<Text
    	bg="gray.200"
    	p="5"
    	borderRadius={"3xl"}
    	fontSize={["2xl", "4xl"]}
    	fontWeight={"bold"}
    	h="min-content"
    	alignSelf={"center"}
  	>
    	VS
  	</Text>

  	{nft2 ? (
    	<Card
      	nft={nft2}
      	maxW={"330px"}
      	minW="200px"
      	w="50%"
      	{...getCardProps(nft2)}
    	/>
  	) : (
    	<Flex
      	maxW={"330px"}
      	w="50%"
      	minW="200px"
      	color={"gray.200"}
      	borderWidth="1.5px"
      	borderColor={"gray.600"}
      	borderRadius="md"
      	alignItems={"center"}
      	justifyContent={"center"}
    	>
      	<Text fontWeight={"bold"} fontSize={"8xl"}>
        	?
      	</Text>
    	</Flex>
  	)}
	</Flex>
  );

  const renderResult = () => {
	const isWinner = latestBattle.winner === address;

	return (
  	<Flex
    	color="gray.200"
    	flexDir={"column"}
    	alignItems={"center"}
    	py="10"
    	rowGap={"5"}
  	>
    	<Box>
      	<Text textAlign={"center"}>Started at:</Text>
      	<Text fontWeight={"bold"} fontSize={"xl"} textAlign={"center"}>
        	{latestBattle.createdAt.toString()}
      	</Text>
    	</Box>
    	<Box>
      	{!latestBattle.winner ? (
        	<Text textAlign={"center"} fontWeight={"semibold"}>
          	Waiting for opponent to join battle....
        	</Text>
      	) : (
        	<>
          	<Text textAlign={"center"}>RESULT:</Text>
          	<Text
            	letterSpacing={"widest"}
            	fontWeight={"bold"}
            	fontSize={"5xl"}
            	textAlign={"center"}
            	color={isWinner ? "green.500" : "red.500"}
          	>
            	{isWinner ? "WINNER" : "LOSER"}
          	</Text>
        	</>
      	)}
    	</Box>
  	</Flex>
	);
  };

  return (
	<>
  	{renderAvatars()}
  	{renderResult()}
	</>
  );
};

export default Versus;
```

The `Versus` component is responsible for rendering the battle screen with the two avatars facing each other and displaying the result of the battle.

The component first extracts the two avatars that participated in the battle from the `latestBattle` object. It uses `getCardProps` to get an object with style properties for the avatar card border, depending on whether the avatar was the winner or the loser of the battle.

The component then defines a `renderAvatars` function that displays two `Card` components, one for each avatar, and a "VS" text in the middle to make it look cool.

The component also defines a `renderResult` function that displays the result of the battle. If the battle is still ongoing, the component displays a message stating that it's waiting for an opponent to join the battle. If the battle is over, the component displays the winner or loser status of the user based on the `address` prop and the `winner` property of the `latestBattle` object.

Finally, the component calls both `renderAvatars` and `renderResult` to display the battle screen.

Phew! That was a lot, I know but it had to be done.

We're almost there, bear with me.

### 4.6.5 - Routes

The routes represent individual pages in the web application, we'll put the components together like lego bricks here. Let's create the files:

```bash
mkdir -p frontend/src/routes
touch frontend/src/routes/{all-avatars,arena,my-avatars,error,root,index}.js
```

```js
// frontend/src/routes/all-avatars.js

import { Flex, Heading } from "@chakra-ui/react";
import CreateAvatarButton from "../components/create-avatar-button";
import CardList from "../components/card-list";

const AllAvatarsRoute = () => {
  return (
	<Flex flexDir={"column"} py="14">
  	<Flex justifyContent={"space-between"}>
    	<Heading size="lg" color="gray.200" mb="5">
      	All avatars
    	</Heading>

    	<CreateAvatarButton />
  	</Flex>
  	<CardList emptyMessage="No avatar minted yet" />;
	</Flex>
  );
};

export default AllAvatarsRoute;
```

The `AllAvatarsRoute` component provides the UI for the "All Avatars" page, allowing users to view all avatars minted by all users in the app and providing a button to create their own avatar.

```js
// frontend/src/routes/arena.js

import { Flex, Skeleton, Text, useToast } from "@chakra-ui/react";
import { useSearchParams } from "react-router-dom";
import { useCallback, useEffect, useState } from "react";
import useArenaContract from "../hooks/useArenaContract";
import { useContractKit } from "@celo-tools/use-contractkit";
import { fetchLatestBattle, startBattle } from "../utils/arena";
import StartBattleButton from "../components/start-battle-button";
import Versus from "../components/versus";

const ArenaRoute = () => {
  const { performActions, address } = useContractKit();
  const arenaContract = useArenaContract();
  const [searchParams, setSearchParams] = useSearchParams();
  const tokenId = searchParams.get("tokenId");
  const toast = useToast();

  const [loading, setLoading] = useState(false);
  const [latestBattle, setLatestBattle] = useState(null);

  const shouldShowStartBattleButton =
	!latestBattle || (latestBattle && latestBattle.winner);

  const getAssets = useCallback(async () => {
	try {
  	setLoading(true);

  	let battleResult = await fetchLatestBattle(arenaContract);

  	if (tokenId) {
    	if (!battleResult || battleResult.winner) {
      	toast({
        	title: "Starting battle..",
        	position: "top",
        	status: "info",
        	duration: 5000,
        	variant: "top-accent",
      	});
      	await startBattle(arenaContract, performActions, tokenId);

      	toast({
        	title: "Fetching battle result",
        	position: "top",
        	status: "info",
        	duration: 5000,
        	variant: "top-accent",
      	});

      	battleResult = await fetchLatestBattle(arenaContract);
    	} else {
      	toast({
        	title:
          	"Cannot start a new battle until current battle is completed.",
        	position: "top",
        	status: "error",
        	duration: 5000,
        	variant: "top-accent",
      	});
    	}
  	}

  	setLatestBattle(battleResult);
	} catch (error) {
  	console.log({ error });
  	toast({
    	title: "Failed to load data",
    	description: error.message,
    	position: "top",
    	status: "error",
    	duration: 5000,
    	variant: "top-accent",
  	});
	} finally {
  	setSearchParams({});
  	setLoading(false);
	}
  }, [arenaContract, performActions, setSearchParams, toast, tokenId]);

  useEffect(() => {
	if (address && arenaContract) getAssets();
  }, [arenaContract, address, getAssets]);

  const renderNoBattle = () => {
	return (
  	<Flex
    	w="full"
    	flexDir={"column"}
    	color={"gray.200"}
    	borderWidth="1.5px"
    	borderColor={"white"}
    	// borderColor={"gray.600"}
    	borderRadius="md"
    	alignItems={"center"}
    	p="10"
    	rowGap={"5"}
  	>
    	<Text fontWeight={"semibold"} fontSize={"xl"}>
      	You haven't participated in a battle yet
    	</Text>
  	</Flex>
	);
  };

  if (loading) {
	return (
  	<Flex maxW="1024px" rowGap="5" marginX="auto" flexDirection={"column"}>
    	<Skeleton startColor="gray.700" endColor="gray.800" height="50px" />
    	<Skeleton startColor="gray.700" endColor="gray.800" height="400px" />
    	<Skeleton startColor="gray.700" endColor="gray.800" height="200px" />
  	</Flex>
	);
  }

  return (
	<Flex maxW="1024px" marginX="auto" flexDirection={"column"}>
  	<Flex my="5" justifyContent={"space-between"}>
    	<Text color="gray.200" fontSize={"2xl"} fontWeight={"bold"}>
      	Arena
    	</Text>

    	{shouldShowStartBattleButton ? <StartBattleButton /> : null}
  	</Flex>

  	{!latestBattle ? (
    	renderNoBattle()
  	) : (
    	<Versus latestBattle={latestBattle} address={address} />
  	)}
	</Flex>
  );
};

export default ArenaRoute;
```

The `ArenaRoute` component provides the UI for the "Arena” page, showing a user's latest battle and allows users to start a new battle if there is no ongoing battle.

We define a `getAssets` callback function, which is responsible for fetching the latest battle information and starting a new battle if necessary.

Let's break down `getAssets` in steps:

1.  Set the `loading` state to `true`, indicating that data fetching has started.
2.  Fetch the latest battle data using `fetchLatestBattle` .
3.  Check if there's a `tokenId` available in the search parameters (URL query string).
    - If there is a `tokenId` and either there's no ongoing battle or the current battle has a winner, try to start a new battle.
    - After starting a new battle, fetch the new battle.
    - If there is an ongoing battle and the user tries to start a new one, we inform them that a new battle cannot be started until the current battle is completed.
4.  Update the `latestBattle` state with the fetched battle data.
5.  If there's an error while fetching data, log the error and display a toast notification with an error message.
6.  In the `finally` block, reset the search parameters and set the `loading` state to `false`, indicating that data fetching has completed.

The `useEffect` hook is used to call `getAssets` when the `address` and `arenaContract` are available.

To put the functions together and render content we follow the logic:

- If the component is still loading, a skeleton UI is rendered.
- If no battle data is available after loading, this means the user has not yet participated in a battle and the component renders an appropriate message.
- If battle data is available, the component renders the `Versus` component, passing in the latest battle data and the user's wallet address.

```js
// frontend/src/routes/error.js

import { Flex, Heading, Text } from "@chakra-ui/react";
import { useRouteError } from "react-router-dom";
import Layout from "../components/layout";

const ErrorRoute = () => {
  const error = useRouteError();

  return (
	<Layout>
  	<Flex
    	flexDir={"column"}
    	color={"gray.200"}
    	alignItems={"center"}
    	justifyContent={"center"}
    	pt="20%"
  	>
    	<Heading mb={"10"} size="4xl">
      	Oops!
    	</Heading>
    	<Text mb="5">Sorry, an unexpected error has occurred</Text>
    	<Text fontWeight="semibold" fontSize={"xl"}>
      	{error.statusText || error.message}
    	</Text>
  	</Flex>
	</Layout>
  );
};

export default ErrorRoute;
```

`ErrorRoute` will be used as a fallback page when any unhandled error happens in the application. You'll notice that unlike the other route components, the `ErrorRoute` component includes the `Layout` component. We'll be using `react-route-dom` to render the pages and it allows us define a layout to be used for all the page of our application except the error page. That's why we need to specifically include the layout here.

```js
// frontend/src/routes/my-avatars.js

import { Flex, Heading } from "@chakra-ui/react";
import CardList from "../components/card-list";
import CreateAvatarButton from "../components/create-avatar-button";

const MyAvatarsRoute = () => {
  return (
	<Flex flexDir={"column"} py="14">
  	<Flex justifyContent={"space-between"}>
    	<Heading size="lg" color="gray.200" mb="5">
      	My avatars
    	</Heading>

    	<CreateAvatarButton />
  	</Flex>

  	<CardList
    	emptyMessage="You haven't minted any Avatars yet"
    	userNFTsOnly
  	/>
	</Flex>
  );
};

export default MyAvatarsRoute;
```

The `MyAvatarsRoute` component provides the UI for the "My Avatars" page, allowing users to view all avatars they've minted and providing a button to create their own avatar.

```js
// frontend/src/routes/root.js

import { Outlet } from "react-router-dom";
import Layout from "../components/layout";

const Root = () => {
  return (
	<Layout>
  	<Outlet />
	</Layout>
  );
};

export default Root;
```

The `Root` component is a layout component that wraps the main content of the application, providing components needed in all the pages using the `Layout` component. It also renders the `Outlet` component which is a placeholder for child routes to be rendered.

```js
// frontend/src/routes/index.js

import { Navigate, createBrowserRouter } from "react-router-dom";
import Root from "./root";
import ErrorRoute from "./error";
import ArenaRoute from "./arena";
import AllAvatarsRoute from "./all-avatars";
import MyAvatarsRoute from "./my-avatars";

const router = createBrowserRouter([
  {
	path: "/",
	element: <Root />,
	errorElement: <ErrorRoute />,
	children: [
  	{
    	path: "arena",
    	element: <ArenaRoute />,
  	},
  	{
    	path: "all-avatars",
    	element: <AllAvatarsRoute />,
  	},
  	{
    	path: "my-avatars",
    	element: <MyAvatarsRoute />,
  	},
  	{ index: true, element: <Navigate to="/all-avatars" /> },
	],
  },
]);

export default router;
```

This file exports a default `router` component that defines all the routes of the application using `createBrowserRouter` from `react-router-dom`, the routes are defined as an array of objects.

The `Root` component is the parent component that contains the common layout and is rendered on every page. We can see that the `Root` component has no route path defined. Instead, it acts as a parent component for other routes to be nested under. The `ErrorRoute` component is rendered in case of any unexpected error.

The routes are defined as children of the `Root` component and are defined with a `path` and an `element` property, which specifies the component that will be rendered when that path is accessed. The `index` property is used to specify the default route if none of the defined paths match.

The routes defined in this router are:

- `/arena`: Renders the `ArenaRoute` component, which displays the latest battle and allows the user to start a new battle.
- `/all-avatars`: Renders the `AllAvatarsRoute` component, which displays all the avatars available in the application.
- `/my-avatars`: Renders the `MyAvatarsRoute` component, which displays the avatars owned by the current user.
- Default: Redirects to the `/all-avatars` route.

Putting the bow on everything in `frontend/src/app.js`:

```js
// frontend/src/app.js

import { RouterProvider } from "react-router-dom";
import { useContractKit } from "@celo-tools/use-contractkit";
import Cover from "./components/cover";
import router from "./routes";
import "./App.css";

const App = () => {
  const { address, connect } = useContractKit();

  if (!address) return <Cover connect={connect} />;

  return <RouterProvider router={router} />;
};

export default App;
```

We show the `Cover` component if the application is not connected to the browser's wallet (metamask here) instance otherwise we display the web application using `RouterProvider` to render the routes.

Let's update `frontend/src/App.css`, replace its content with this snippet:

```
.battle-card:hover img {
  transform: scale(1.1);`
}
```

![Battle Image] - (./images/avatar-arena-battle-result.png)

## 5. Conclusion

Well done! Congratulations for completing the tutorial, in this tutorial, we covered:

- the TDD process, and applied it to building an NFT smart contract.
- using the hardhat development environment to test smart contracts and deploy smart contracts.
- interacting with our deployed smart contract on the Celo Alfajores network in React

[Here's](https://github.com/RinwaOwuogba/avatar-arena-tutorial) the completed source code.

Check out a deployed version of the webapp [here!](https://avatar-arena.netlify.app)

## 6. Next Steps

If you enjoyed this, there's so much you can do; you could add more functionality to both the smart contract and the frontend still following the TDD process, deploy your own version to the CELO mainnet, explore other testing environments, you could even try adding test to some public contract code to beef up your understanding of both the contracts and the TDD process.

## 7. About the Author

Bolarinwa Owuogba is a software engineer and a student of the University of Lagos, Nigeria. You'll find him [here on twitter](www.twitter.com/__rinwa), feel free to say hi.

## 8. References

- This article was inspired by [this dacade tutorial](https://dacade.org/communities/celo/courses/celo-201/)
- [Solidity cheatsheet](https://docs.soliditylang.org/en/v0.8.9/cheatsheet.html)

Thank you and goodbye!

---
