import React, { memo, useState, useEffect, useRef } from "react";
import Web3 from "web3";
import { recoverPersonalSignature } from "@metamask/eth-sig-util";
import { useMoralis } from "react-moralis";

import {
  IN_DEV_ENV,
  forceTESTNET,
  polygonMainChain,
  polygonTestNetChain,
  BALLOON_TOKEN_ADDRESS,
} from "~/src/lib/data";
import { fromHex, toHex } from "~/src/lib/utils";

import CONTRACT_ABI from "~/src/lib/abi";

//const provider = new Web3.providers.HttpProvider(networkChainUrl);
//const w3 = new Web3(networkChainUrl);

export const useSigning = (provider_in) => {
  const [web3, setWeb3] = useState();
  const [provider, setProvider] = useState(provider_in);

  useEffect(() => {
    if (provider_in) {
      setWeb3(new Web3(provider_in));
      setProvider(provider_in);
    } else {
      setWeb3(new Web3(window.ethereum));
      setProvider(window.ethereum);
    }
  }, [provider_in]);

  const signMessage = (message, from) => {
    if (!provider || !web3) return alert("Please connect your wallet!");
    var msg = `0x${Buffer.from(message, "utf8").toString("hex")}`;
    var from_address = from || web3.eth.accounts[0];
    if (!from_address) return alert("Please connect your wallet!");

    return new Promise((resolve, reject) => {
      web3.currentProvider.sendAsync(
        {
          method: "personal_sign",
          params: [msg, from_address],
          from: from_address,
        },
        function (err, result) {
          if (err) {
            console.log(err);
            reject(err);
          }
          if (result.error) {
            reject(result.error.message);
          } else {
            const msgParams = { data: msg };
            msgParams.signature = result.result;

            const recovered = recoverPersonalSignature(msgParams);

            if (recovered === from_address) {
              resolve({
                from: from_address,
                signature: JSON.stringify(result.result),
                signature_data: JSON.stringify(msgParams),
              });
            } else {
              reject(
                "SigUtil Failed to verify signer when comparing " +
                  recovered.result +
                  " to " +
                  from
              );
              console.log("Failed, comparing %s to %s", recovered, from);
            }
          }
        }
      );
    });
  };

  const signMessageTypedData = (message, verfication, from) => {
    if (!provider || !web3) return alert("Please connect your wallet!");
    const msgParams = {
      domain: {
        chainId: window.ethereum?.chainId,
        name: verfication?.name || "CutOuts",
      },
      message: message,
      primaryType: "EIP712Domain",
      types: {
        EIP712Domain: [
          { name: "name", type: "string" },
          { name: "chainId", type: "uint256" },
        ],
        //Verfication: [{ name: "verfication_id", type: "string" }],
      },
    };
    if (verfication.contract)
      msgParams.domain.verifyingContract = verfication.contract;
    if (verfication.version)
      msgParams.domain.verifyingContract = verfication.version;

    return new Promise((resolve, reject) => {
      web3.currentProvider.sendAsync(
        {
          method: "eth_signTypedData_v4",
          params: [from, JSON.stringify(msgParams)],
          from: from,
        },
        function (err, result) {
          console.log(result);
          if (err) {
            console.log(err);
            reject(err);
          }
          if (result.error) {
            alert(result.error.message);
            reject(result.error.message);
          } else {
            console.log(JSON.stringify(result.result));
            resolve({
              from: from,
              signature: JSON.stringify(result.result),
              signature_data: JSON.stringify(msgParams),
            });
          }
        }
      );
    });
  };

  return {
    web3: web3,
    signMessage,
  };
};

export const useHttpWeb3 = (PROVIDER_URL) => {
  const [web3, setWeb3] = useState(null);

  useEffect(() => {
    if (PROVIDER_URL) setWeb3(new Web3(PROVIDER_URL));
  }, [PROVIDER_URL]);

  const setWeb3Provider = (provider) => {
    if (provider) setWeb3(new Web3(provider));
  };

  return {
    web3,
    setWeb3Provider,
  };
};

export const useConnect = (provider_in) => {
  const [accounts, setAccounts] = useState([]);
  const [address, setAddress] = useState(provider_in?.selectedAddress);
  const [provider, setProvider] = useState(provider_in);
  const [isConnected, setConnected] = useState(false);
  const _isMounted = useRef(true);
  const _isConnectCalled = useRef(false);

  useEffect(() => {
    _isMounted.current = true;

    const handleAccountsChanged = (accounts) => {
      if (!accounts.length) {
        setAccounts([]);
        setConnected(false);
        setAddress(null);
        return;
      }
      setAccounts(accounts);
      setAddress(provider?.selectedAddress);
      setConnected(true);
    };

    const handleConnect = (connectInfo) => {
    };

    const handleDisconnect = (connectInfo) => {
      setAccounts([]);
      setConnected(false);
      setAddress(null);
    };

    if (provider && provider?.type !== "cryptostamping") {
      if (provider?.selectedAddress) {
        getAccounts({ requestPermission: true }).then(handleAccountsChanged);
      }

      provider.on("accountsChanged", handleAccountsChanged);
      provider.on("connect", handleConnect);
      provider.on("disconnect", handleDisconnect);
    }

    if (provider?.type === "cryptostamping") {
      if (window.cryptostamping.isConnected()) {
        window.cryptostamping.ethereum.getAccounts(handleAccountsChanged);
      }
      window.cryptostamping.on("accountsChanged", handleAccountsChanged);
      window.cryptostamping.on("connect", handleConnect);
      window.cryptostamping.on("disconnect", handleDisconnect);
    }

    return () => {
      _isMounted.current = false;
      _isConnectCalled.current = false;
      if (provider && provider?.type !== "cryptostamping") {
        provider.removeListener("accountsChanged", handleAccountsChanged);
        provider.removeListener("connect", handleConnect);
        provider.removeListener("disconnect", handleDisconnect);
      }
      if (provider?.type === "cryptostamping") {
        window.cryptostamping.removeListener(
          "accountsChanged",
          handleAccountsChanged
        );
        window.cryptostamping.removeListener("connect", handleConnect);
        window.cryptostamping.removeListener("disconnect", handleDisconnect);
      }
    };
  }, [provider, setAccounts, setConnected, setAddress]);

  const connectWallet = () => {
    if (!provider) throw Error("Metamask is not available.");
    if (provider.type === "cryptostamping")
      throw Error("Metamask is connected to cryptostamping.");
    if (!_isMounted.current) throw Error("Component is not mounted.");
    // if (_isConnectCalled.current) throw Error("Connect method already called.");
    _isConnectCalled.current = true;

    return getAccounts({ requestPermission: true });
    _isConnectCalled.current = false;
  };

  const getAccounts = (
    { requestPermission } = { requestPermission: false }
  ) => {
    if (!provider && provider.type !== "cryptostamping") {
      console.warn("Metamask is not available.");
      return;
    }
    return provider
      .request({
        method: requestPermission ? "eth_requestAccounts" : "eth_accounts",
        params: [],
      })
      .then((accounts) => {
        setAccounts(accounts);
        setAddress(provider?.selectedAddress);
        setConnected(true);
        return accounts;
      })
      .catch((err) => {
        throw err;
        setConnected(false);
      });
  };

  const reConnectWallet = () => {
    return provider.request({
      method: "wallet_requestPermissions",
      params: [
        {
          eth_accounts: {},
        },
      ],
    });
  };

  return {
    address,
    accounts,
    connectWallet,
    reConnectWallet,
    isConnected,
    setProvider,
    provider,
  };
};

/** USE CHAIN REACT HOOK */
export const useChain = () => {
  const [chainId, setChainId] = useState(null);

  useEffect(() => {
    const handleChainChanged = (_chainId) => {
      setChainId(fromHex(_chainId));
    };

    if (window.ethereum) {
      window.ethereum.on("chainChanged", handleChainChanged);
      setChainId(fromHex(window.ethereum.chainId));
    }
    return () => {
      if (window.ethereum)
        window.ethereum.removeListener("chainChanged", handleChainChanged);
    };
  }, []);

  /**
   * @param { object } chain - chain object to switch to.
   * get your chain from here - https://chainid.network/chains.json
   */
  const switchChain = (chain) => {
    const params = {
      chainId: toHex(chain.chainId), // A 0x-prefixed hexadecimal string
      chainName: chain.name,
      nativeCurrency: {
        name: chain.nativeCurrency.name,
        symbol: chain.nativeCurrency.symbol, // 2-6 characters long
        decimals: chain.nativeCurrency.decimals,
      },
      rpcUrls: chain.rpc,
      blockExplorerUrls: [
        chain.explorers && chain.explorers.length > 0 && chain.explorers[0].url
          ? chain.explorers[0].url
          : chain.infoURL,
      ],
    };
    let promise;
    if (
      chain.chainId === 1 ||
      chain.chainId === 3 ||
      chain.chainId === 4 ||
      chain.chainId === 5 ||
      chain.chainId === 42
    ) {
      promise = window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: toHex(chain.chainId) }],
      });
    }
    promise = window.ethereum.request({
      method: "wallet_addEthereumChain",
      params: [params],
    });
    promise
      .then((chainCh) => {
        setChainId(chain.chainId);
      })
      .catch((err) => {
        console.log(err);
      });
    return promise;
  };

  return {
    chainId,
    setChainId,
    switchChain,
  };
};