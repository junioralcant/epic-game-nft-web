import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import Arena from './Components/Arena';
import SelectCharacter from './Components/SelectCharacter';
import LoadingIndicator from './Components/LoadingIndicator';

import myEpicNft from './utils/MyEpicGame.json';

import twitterLogo from './assets/twitter-logo.svg';
import './App.css';

import {
  CONTRACT_ADDRESS,
  transformCharacterData,
} from './constants';

// Constants
const TWITTER_HANDLE = 'jrrmarques';
const TWITTER_LINK = `https://www.instagram.com/jrrmarques/`;

function App() {
  const [currentAccount, setCurrentAccount] = useState(null);
  const [characterNFT, setCharacterNFT] = useState(null);

  const [isLoading, setIsLoading] = useState(false);

  async function checkIfWalletIsConnected() {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        console.log('Eu acho que você não tem a metamask!');
        setIsLoading(false);
        return;
      } else {
        console.log('Nós temos o objeto ethereum', ethereum);
      }

      const accounts = await ethereum.request({
        method: 'eth_accounts',
      });

      if (accounts.length !== 0) {
        const account = accounts[0];
        console.log('Carteira conectada::', account);
        setCurrentAccount(account);
      } else {
        console.log('Não encontramos uma carteira conectada');
      }
    } catch (error) {
      console.log(error);
    }
    setIsLoading(false);
  }

  async function checkNetwork() {
    const { ethereum } = window;

    let chainId = await ethereum.request({
      method: 'eth_chainId',
    });

    try {
      if (chainId !== '0x4') {
        alert('Please connect to Rinkeby!');
      }
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    checkNetwork();
    setIsLoading(true);
    checkIfWalletIsConnected();
  }, []);

  useEffect(() => {
    async function fetchNFTMetadata() {
      const { ethereum } = window;

      console.log(
        'Verificando pelo personagem NFT no endereço:',
        currentAccount
      );

      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      const gameContract = new ethers.Contract(
        CONTRACT_ADDRESS,
        myEpicNft.abi,
        signer
      );

      const txn = await gameContract.checkIfUserHasNFT();
      if (txn.name) {
        console.log('Usuário tem um personagem NFT');
        setCharacterNFT(transformCharacterData(txn));
      } else {
        console.log('Nenhum personagem NFT foi encontrado');
      }
    }

    if (currentAccount) {
      console.log('Conta Atual:', currentAccount);
      fetchNFTMetadata();
    }
  }, [currentAccount]);

  function renderContent() {
    if (isLoading) {
      return <LoadingIndicator />;
    }

    if (!currentAccount) {
      return (
        <div className="connect-wallet-container">
          <img
            src="https://images-workbench.99static.com/b43P1rJfphvIeGWzzUI25Me0qeQ=/0x35:1044x1079/fit-in/500x500/filters:fill(white,true):format(jpeg)/99designs-work-samples/work-sample-designs/1324418/dd4eade4-f274-42fd-9f86-0ef2c60b4f46"
            alt="Foguetinho Gif"
          />
          <button
            className="cta-button connect-wallet-button"
            onClick={connectWalletAction}
          >
            Conecte sua carteira para começar
          </button>
        </div>
      );
    } else if (currentAccount && !characterNFT) {
      return <SelectCharacter setCharacterNFT={setCharacterNFT} />;
    } else if (currentAccount && characterNFT) {
      return (
        <Arena
          characterNFT={characterNFT}
          setCharacterNFT={setCharacterNFT}
        />
      );
    }
  }

  async function connectWalletAction() {
    try {
      console.log('Teste');
      const { ethereum } = window;

      if (!ethereum) {
        alert('Instale a MetaMask!');
        return;
      }

      const accounts = await ethereum.request({
        method: 'eth_requestAccounts',
      });

      console.log('Contectado', accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="header gradient-text">
            ⚔️ Batalhas no Metaverso ⚔️
          </p>
          <p className="sub-text">
            Junte-se a mim para vencer os inimigos do Metaverso!
          </p>
          <div className="connect-wallet-container">
            {renderContent()}
          </div>
        </div>
        <div className="footer-container">
          <img
            alt="Twitter Logo"
            className="twitter-logo"
            src={twitterLogo}
          />
          <a
            className="footer-text"
            href={TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >{`construído por @${TWITTER_HANDLE}`}</a>
        </div>
      </div>
    </div>
  );
}

export default App;
