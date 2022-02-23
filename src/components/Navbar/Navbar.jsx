import React , { useEffect, useState } from "react";
import store from "../../redux/store";
import cryptoIcon from "./crypto-com.svg";
import { connect, disconnect } from "../../redux/blockchain/blockchainActions";
import {DeFiWeb3Connector } from 'deficonnect';
import WalletConnectProvider from '@walletconnect/web3-provider';
import Web3Modal from 'web3modal';
import Logo from "./logo-white.png";
import Grave from "./grave.png";
import GraveBurn from "./grave-burn.png";
import Skull from "./skull.png";
import GraveMined from "./grave-mined.png";
import GraveAvailable from "./grave-available.png";
import SkullAdventure from './skull-adventure.png';
import { Link } from "react-router-dom";
import menuIcon from "./menu-icon.svg";
import { useDispatch, useSelector } from "react-redux";
import './navbar.css';
import { getSkullsData, getStakingData } from "../../redux/data/dataActions";

const Navbar = () => {
  const dispatch = useDispatch();
  let { blockchain, data } = store.getState();
  let { rewardPlusMalus, malusFee, soulsGenerated, userGraveBalance, croSkulls, rewards, croSkullsStaked } = data
  let { accountBalance, accountAddress, formatEther, loading, contractDetected, providerConnected } = blockchain
  if( providerConnected && contractDetected ){
    rewardPlusMalus = formatEther(rewardPlusMalus).split('.')[0]
    userGraveBalance = formatEther(userGraveBalance).split('.')[0]
    accountBalance = formatEther(accountBalance).split('.')[0]
    rewards = formatEther( rewards ).split('.')[0]
  }
  const [isHovered, setIsHovered] = useState(false)
  const [viewBalance, setViewBalance] = useState(false);

  useEffect( () => {
    if( window.ethereum.isConnected() && window.ethereum._state.accounts[0] && ! loading && ! contractDetected ){
      dispatch( connect() ) // try default provider es metamask
    }
  }, [window.ethereum._state.accounts])
  

  const toggleProvidersModal = async () => {
    await web3Modal._toggleModal();
    web3ModalConnection()
  }

  const web3ModalConnection = () => {
    web3Modal.on("connect", async (_provider) => {
      dispatch(connect( _provider ))
    })
  }

  const handleButton = () => {
    if( isHovered ){
      if( contractDetected ){
        dispatch(disconnect())
      }else{
        toggleProvidersModal()
      }
    }
  }

  return (
    <nav className="navbar navbar-expand-sm header">
      <Link to="/" className="crLogo">
        <img src={Logo} alt="CroSkull Logo" className="site-logo"/>
      </Link>
      <button
        className="navbar-toggler"
        data-toggle="collapse"
        data-target="#navbarNav"
      >
        <span className="navbar-toggler-icon">
          <img 
            src={menuIcon}
            className="toggler-icon"
             />
        </span>
      </button>
      <div 
        className="sk-flex sk-row balances"
      >
        <div className="main-balance">
          <span>
            <img 
              className="skull-icon"
              src={Skull}
            />
            { `${croSkulls.length ? croSkulls.length : 0}` }
            <span className="sk-tooltip">Free skulls</span>
          </span>
          <span>
            <img 
              className="skull-icon"
              src={Grave}
            />
            { `${ userGraveBalance }` }
            <span className="sk-tooltip">Owned Grave</span>
          </span>
        </div>
        <div class="balances-offcanvas">
          <button
            class="skull-button view-more"
          >
            More
          </button>
          <div className={`flex-v season ${viewBalance ? 'show': ''}`}>
              <span>Season</span>
              <span>
                <img 
                  className="skull-icon"
                  src={SkullAdventure}
                />
                { `${ croSkullsStaked.length ? croSkullsStaked.length : 0}` }
                <span className="sk-tooltip">Skulls in adventure</span>
              </span>
              <span>
                <img 
                  className="skull-icon"
                  src={GraveMined}
                />
                { `${ rewards }` }
                <span className="sk-tooltip">Generated Graves</span>
              </span>
              <span
                className="positive"
              >
                <img 
                  className="skull-icon"
                  src={GraveAvailable}
                />
                { `${ rewardPlusMalus }` }
                <span className="sk-tooltip">Withdrawable Graves</span>
              </span>
              <span className="negative">
                <img 
                  className="skull-icon"
                  src={GraveBurn}
                />
                { `${  String(rewards - rewardPlusMalus).split('.')[0] } -(${malusFee}%)` }
                <span className="sk-tooltip">Burned Graves</span>
              </span>
          </div>
        </div>
      </div>
      <div 
        id="navbarNav" 
        className={`collapse navMenu navbar-collapse`}
      >
        <ul
          style={{ fontSize: "0.8rem", letterSpacing: "0.2rem" }}
          className="navbar-nav ml-auto"
        >
          <li className="nav-item">
            <Link to="/" className="nav-link">
              Home
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/marketplace" className="nav-link">
              Marketplace
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/tavern" className="nav-link">
              Tavern
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/adventure" className="nav-link">
              Adventure
            </Link>
          </li>
          <li className="nav-item merchant-menu">
            <Link to="/merchant" className="nav-link">
              Merchant
            </Link>
          </li>
        </ul>
      </div>
      <div 
        className="flex-v"
      >
        <button
          className="account-button"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onClick={
            () => {
              handleButton()
            }
          }
        >
          { ! contractDetected ?
            `Connect` :
            isHovered ? `Disconnect` : `${accountAddress.substr(0, 5)}...${accountAddress.substr(39, 41)}` }
        </button>
      </div>
    </nav>
  );
};


const providerOptions = {
  injected: {
      display: {
          logo: "https://github.com/MetaMask/brand-resources/raw/master/SVG/metamask-fox.svg",
          name: "MetaMask",
          description: "Connect with MetaMask in your browser"
      },
      package: null
  },
  "custom-defiwallet": {
      display: {
          logo: cryptoIcon,
          name: "Crypto.com DeFi Wallet",
          description: "Connect with the CDC DeFi Wallet"
      },
      options: {},
      package: WalletConnectProvider,
      connector: async (ProviderPackage, options) =>  {
          const connector = new DeFiWeb3Connector({
              supportedChainIds: [25],
              rpc: {25: 'https://evm-cronos.crypto.org'},
              pollingInterval: 15000,
              metadata: {
                  icons: ['https://ebisusbay.com/vector%20-%20face.svg'],
                  description: "Cronos NFT Marketplace"
              }
          });

          await connector.activate();
          let provider = await connector.getProvider();
          return provider;
      }
  }
}

const web3Modal = new Web3Modal({
  cacheProvider: true, // optional
  providerOptions // required
});

export default Navbar;
