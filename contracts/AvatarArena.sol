// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

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
    mapping(uint256 => uint256) private _avatarWins;

    event BattleComplete(uint256 battleIndex);

    constructor() {
        // initialize battles list with placeholder battle
        _battles.push();
    }

    /**
    Creates a new battle for the sender or adds sender
    to a pending battle
     */
    function startBattle(uint256 tokenId) external {
        require(
            this.ownerOf(tokenId) == msg.sender,
            "Arena: Cannot start battle with non-owned token"
        );

        // skip placeholder battle in battle starting logic
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

    /**
    Get sender's current battle
     */
    function getLatestBattle() external view returns (Battle memory) {
        uint256 battleIndex = _userBattles[msg.sender];

        return (_battles[battleIndex]);
    }

    /**
    Returns no of wins an avatar has
    */
    function getAvatarWins(uint256 tokenId) external view returns (uint256) {
        return _avatarWins[tokenId];
    }

    /**
    Get the winner of a battle
     */
    function _simulateBattle(uint256 _battleIndex) internal {
        uint256 random = uint256(
        	keccak256(abi.encodePacked(block.timestamp, msg.sender))
        );
        uint256 winnerIndex = random % 2;

        Battle storage battle = _battles[_battleIndex];
        battle.winner = int256(winnerIndex);
        uint256 winningNft = battle.players[winnerIndex].nft;

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
    using Counters for Counters.Counter;

    Counters.Counter private _tokenIdCounter;

    constructor() ERC721("AvatarArena", "AVR") {}

    function safeMint(address to, string memory uri) public {
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
    }

    // The following functions are overrides required by Solidity.

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId,
        uint256 batchSize
    ) internal override(ERC721, ERC721Enumerable) {
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
    }

    function _burn(uint256 tokenId)
        internal
        override(ERC721, ERC721URIStorage)
    {
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
