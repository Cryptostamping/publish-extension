import React, { useState, useEffect, useRef } from "react";
import { useMoralis, useMoralisWeb3Api } from "react-moralis";
import { useSelector, useDispatch } from "react-redux";

import styles from "~/src/components/cryptostamper/selector.module.scss";

import { useImageFade } from "~/src/lib/utils";
import { useHttpWeb3 } from "~/src/lib/web3";
import { ecs_abi } from "~/src/lib/abi";
import { getSimple } from "~/src/lib/api";
import {
	availableMainChains,
	availableTestChains,
	supportedChains,
	getProviderUrl,
} from "~/src/lib/data";

import {
	setURL,
	setUser,
	setCurrentChain,
	setTestnet,
	setStampSelector,
	setMyStamps,
} from "~/src/lib/redux/features/stamperSlice";

function StampSyncer({ Web3Api, setMessage, Moralis }) {
	const stampsets = useRef({tokens: [], data: []});
	const dispatch = useDispatch();
	const address = useSelector((state) => state.stamper.userAddress);
	const currentChain = useSelector((state) => state.stamper.currentChain);

	const [progress, setProgress] = useState(0);
	const [progressTag, setProgressTag] = useState("");

	const { web3 } = useHttpWeb3(getProviderUrl(currentChain));

	useEffect(() => {
		const syncStamps = () => {
			setProgress(1);
			setProgressTag("Importing Stamp Contracts in " + currentChain);
			const MoralisStamp = Moralis.Object.extend("Stamp");
			const Stampset = Moralis.Object.extend("Stampset");
			const query = new Moralis.Query(Stampset);
			query
				.containedIn("chain", [currentChain])
				.equalTo("enabled", true)
				.limit(100)
				.find()
				.then((stampsets_results) => {
					setProgress(5);
					setProgressTag("Importing your NFTs");
					stampsets.current.tokens = Array.from(stampsets_results, (x) =>
						x.attributes.token_address.toUpperCase()
					);
					stampsets.current.data = Array.from(stampsets_results, (x) =>
						x.toJSON()
					);
					const promA = [];
					for (const stampset of stampsets_results) {
						promA.push(
							Web3Api.account.getNFTsForContract({
								chain: currentChain,
								address: address,
								token_address:
									stampset.attributes.token_address.toLowerCase(),
							})
						);
					}
					return Promise.all(promA);
				})
				.then((responses) => {
					let nft_results = [];
					for (const response of responses) {
						nft_results = nft_results.concat(response.result);
					}
					const stamps_filtered = nft_results?.filter((result) => {
						return stampsets.current.tokens.includes(
							result.token_address.toUpperCase()
						);
					});
					if (stamps_filtered.length <= 0) {
						throw "No Stamps";
					}
					setProgressTag("Filtering your NFTs for Stamps.");
					setProgress(10);
					const promA = [];
					promA.push(stamps_filtered);
					for (const x of stamps_filtered) {
						if (!x.metadata) promA.push(getSimple(x.token_uri));
					}
					return Promise.all(promA);
				})
				.then((response) => {
					const stamps_filtered = response[0];
					const stamps_metadata = response.slice(1,response.length);
					for (var i = 0; i < stamps_metadata.length; i++) {
						for (var x = 0; x < stamps_filtered.length; x++) {
							if (
								stamps_filtered[x].token_uri ===
								stamps_metadata[i].config.url
							) {
								stamps_filtered[x].metadata = JSON.stringify(
									stamps_metadata[i].data
								);
							}
						}
					}
					const stamps_modified = Array.from(stamps_filtered, (x) => {
						return {
							token_address: x.token_address.toUpperCase(),
							metadata: JSON.parse(x.metadata),
							token_id: x.token_id,
							owner_address: x.owner_of,
							symbol: x.symbol,
							token_uri: x.token_uri,
							name: x.name,
							nft_id:
								x.token_address.toUpperCase() +
								"-" +
								x.token_id,
							synced_at: x.synced_at,
							chain: currentChain,
							linked: x.linked,
						};
					});
					setProgress(15);
					setProgressTag("Fetching Stamp Rarities from On-chain.");
					const attachRarities = async (stamps) => {
						for (var i = 0; i < stamps.length; i++) {
							const x = stamps[i];
							if (x.linked) continue;
							const contract = new web3.eth.Contract(
								ecs_abi,
								x.token_address
							);
							x.rarity = await contract.methods
								.getRarity(x.token_id)
								.call();
							setProgress(
								15 + parseInt(((i + 1) * 75) / stamps.length)
							);
							setProgressTag(x.name + " - " + x.metadata.name);
							stamps[i] = x;
						}
						return stamps;
					};
					const promA = [];
					promA.push(attachRarities(stamps_modified));
					for (const x of stamps_modified) {
						promA.push(
							new Moralis.Query(MoralisStamp)
								.equalTo("nft_id", x.nft_id)
								.find()
						);
					}
					return Promise.all(promA);
				})
				.then((responses) => {
					const stamps_rarified = responses[0];
					const stamps_moralisdb = responses.slice(
						1,
						responses.length
					);
					const promA = [];
					setProgress(90);
					setProgressTag("Syncing to your Dashboard");
					for (var i = 0; i < stamps_moralisdb.length; i++) {
						if (stamps_moralisdb[i].length > 0) {
							const moralis_stamp = stamps_moralisdb[i][0];
							moralis_stamp.set(
								"rarity",
								stamps_rarified[i].rarity
							);
							moralis_stamp.set(
								"owner_address",
								stamps_rarified[i].owner_address
							);
							moralis_stamp.set(
								"metadata",
								stamps_rarified[i].metadata
							);
							promA.push(moralis_stamp.save());
						} else {
							const moralis_stamp = new MoralisStamp();
							stamps_rarified[i].rarity_used = 0;
							promA.push(moralis_stamp.save(stamps_rarified[i]));
						}
					}
					setProgressTag("Syncing " + promA.length + " new stamps");
					return Promise.all(promA);
				})
				.then((results) => {
					dispatch(
						setMyStamps(Array.from(results, (x) => x.toJSON()))
					);
					setProgress(100);
					setMessage(null);
				})
				.catch((err) => {
					if (err === "No Stamps") {
						setMessage({
							title: "No Stamps!",
							message:
								"There are currently no stamps in your NFTs. you can buy a few or ask your NFT creator to link the collection at cryptostamping.org.",
							button: "Buy Stamps",
							button_link: "https://cryptostamping.org/stamps",
							type: "message",
						});
					}
					console.log(err);
				});
		};
		if (web3 && progress == 0) syncStamps();
	}, [web3, progress, currentChain]);

	const getProgressStyle = (_progress) => {
		return {
			right: `${100 - _progress}%`,
			left: `0%`,
		};
	};

	return (
		<div className={styles.message_box}>
			<h3 className={styles.message_title}>{progress} %</h3>
			<p className={styles.message}>{progressTag}</p>
			<div className={styles.progress_box}>
				<div className={styles.progress_rail}></div>
				<div
					className={styles.progress_track}
					style={getProgressStyle(progress)}
				></div>
			</div>
		</div>
	);
}

export default StampSyncer;
