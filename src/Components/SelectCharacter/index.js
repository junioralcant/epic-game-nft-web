import React, { useEffect, useState } from 'react';
import './SelectCharacter.css';
import { ethers } from 'ethers';
import {
  CONTRACT_ADDRESS,
  transformCharacterData,
} from '../../constants';
import myEpicGame from '../../utils/MyEpicGame.json';
import LoadingIndicator from '../LoadingIndicator';

const SelectCharacter = ({ setCharacterNFT }) => {
  const [characters, setCharacters] = useState([]);
  const [gameContract, setGameContract] = useState(null);

  const [mintingCharacter, setMintingCharacter] = useState(false);

  async function mintCharacterNFTAction(characterId) {
    try {
      if (gameContract) {
        setMintingCharacter(true);
        console.log('Mintando personagem...');
        const mintTxn = await gameContract.mintCharacterNFT(
          characterId
        );
        await mintTxn.wait();
        console.log('mintTxn:', mintTxn);

        setMintingCharacter(false);
      }
    } catch (error) {
      console.warn('MintCharacterAction Error:', error);
      setMintingCharacter(false);
    }
  }

  useEffect(() => {
    const { ethereum } = window;

    if (ethereum) {
      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      const gameContract = new ethers.Contract(
        CONTRACT_ADDRESS,
        myEpicGame.abi,
        signer
      );

      setGameContract(gameContract);
    } else {
      console.log('Objeto Ethereum não encontrado');
    }
  }, []);

  useEffect(() => {
    async function getCharacters() {
      try {
        console.log('Buscando contrato de personagens para mintar');

        console.log(gameContract);

        const charactersTxn =
          await gameContract.getAllDefaultChatacters();
        console.log('charactersTxn:', charactersTxn);

        const characters = charactersTxn.map((characterData) =>
          transformCharacterData(characterData)
        );

        setCharacters(characters);
      } catch (error) {
        console.error(
          'Algo deu errado ao buscar personagens:',
          error
        );
      }
    }

    async function onCharacterMint(sender, tokenId, characterIndex) {
      console.log(
        `CharacterNFTMinted - sender: ${sender} tokenId: ${tokenId.toNumber()} characterIndex: ${characterIndex.toNumber()}`
      );

      if (gameContract) {
        const characterNFT = await gameContract.checkIfUserHasNFT();
        console.log('CharacterNFT: ', characterNFT);
        setCharacterNFT(transformCharacterData(characterNFT));
        alert(
          `Seu NFT está pronto -- veja aqui: https://testnets.opensea.io/assets/${gameContract}/${tokenId.toNumber()}`
        );
      }
    }

    if (gameContract) {
      getCharacters();

      gameContract.on('CharacterNFTMinted', onCharacterMint);
    }

    return () => {
      if (gameContract) {
        gameContract.off('CharacterNFTMinted', onCharacterMint);
      }
    };
  }, [gameContract]);

  return (
    <div className="select-character-container">
      <h2>Minte seu Herói. Escolha com sabedoria.</h2>

      {characters.length > 0 && (
        <div className="character-grid">
          {characters.map((character, index) => (
            <div className="character-item" key={character.name}>
              <div className="name-container">
                <p>{character.name}</p>
              </div>
              <img src={character.imageURI} alt={character.name} />
              <button
                type="button"
                className="character-mint-button"
                onClick={() => mintCharacterNFTAction(index)}
              >{`Mintar ${character.name}`}</button>
            </div>
          ))}
        </div>
      )}

      {mintingCharacter && (
        <div className="loading">
          <div className="indicator">
            <LoadingIndicator />
            <p>Mintando personagem...</p>
          </div>
          <img
            src="http://pa1.narvii.com/6623/1d810c548fc9695d096d54372b625d207373130a_00.gif"
            alt="Indicador de Mintagem"
          />
        </div>
      )}
    </div>
  );
};

export default SelectCharacter;
