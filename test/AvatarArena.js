const { expect } = require("chai");
const { ethers } = require("hardhat");
const { BigNumber } = require("ethers");

const DEFAULT_TOKEN_URI = "https://example.com/1.png";

describe("AvatarArena", function () {
  this.timeout(50000);

  let avatarArena;
  let owner;
  let acc1;
  let acc2;
  let aaUtils;

  this.beforeEach(async function () {
    const AvatarArena = await ethers.getContractFactory("AvatarArena");
    [owner, acc1, acc2] = await ethers.getSigners();

    avatarArena = await AvatarArena.deploy();
    aaUtils = newAvatarArenaUtils(avatarArena);
  });

  describe("startBattle", function () {
    it("should start a pending battle if no pending battle is available", async function () {
      await aaUtils.mintNFT(owner, owner.address);

      const tokenID = 0;
      await aaUtils.startBattle(owner, tokenID);

      const battle = await avatarArena.connect(owner).getLatestBattle();
      expect(battle.players[0].player).to.eql(owner.address);
      expect(battle.players[0].nft).to.eq(BigNumber.from(tokenID));

      // no winner should exist until game is completed
      expect(battle.winner).to.eq(-1);
    });

    it("should put user in pending battle if available", async function () {
      await aaUtils.mintNFT(owner, owner.address);
      await aaUtils.mintNFT(acc1, acc1.address);

      const tokenID_1 = 0;
      const tokenID_2 = 1;

      await aaUtils.startBattle(owner, tokenID_1);
      await aaUtils.startBattle(acc1, tokenID_2);

      const battle = await avatarArena.connect(acc1).getLatestBattle();

      expect(battle.players[0].player).to.eql(owner.address);
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

    it("should fail to start a battle with a token sender does not own", async function () {
      await aaUtils.mintNFT(acc1, acc1.address);

      const tokenID_1 = 0;

      await expect(aaUtils.startBattle(owner, tokenID_1)).to.be.revertedWith(
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
