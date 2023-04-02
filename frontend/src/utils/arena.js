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
