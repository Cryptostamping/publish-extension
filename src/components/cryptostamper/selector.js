import React, { useState, useEffect, useRef } from "react";
import { useMoralis, useMoralisWeb3Api } from "react-moralis";
import { useSelector, useDispatch } from "react-redux";
import Popup from "reactjs-popup";

import card from "~/src/components/cryptostamper/card.module.scss";
import styles from "~/src/components/cryptostamper/selector.module.scss";
import SelectorHeader from "~/src/components/cryptostamper/selectorheader";
import StampSyncer from "~/src/components/cryptostamper/syncer";
import AddStamp from "~/src/components/cryptostamper/addstamp";
import UserSettings from "~/src/components/cryptostamper/usersettings";
import Tooltip from "~/src/components/modals/tooltip";

import { useImageFade, printAddress, printBalance } from "~/src/lib/utils";
import { useHttpWeb3 } from "~/src/lib/web3";
import { ecs_abi } from "~/src/lib/abi";
import { getSimple } from "~/src/lib/api";
import { availableMainChains, availableTestChains } from "~/src/lib/data";

import {
	setURL,
	setUser,
	setCurrentChain,
	setTestnet,
	setStampSelector,
	setMyStamps,
	setUserStampsCount,
	setUserBalance,
	setCurrentStamping,
} from "~/src/lib/redux/features/stamperSlice";

function StampCard({ myStamp, clickSelectStamp }) {
	const fadeBinding = useImageFade();
	const subTag = (_myStamp) => {
		if (_myStamp.stamped === true) {
			return (
				<p className={card.stamp_number}>
					<span className={card.verified} />
				</p>
			);
		}
		if (_myStamp.rarity === 0) {
			return (
				<p className={card.stamp_number}>
					<span className={card.infinity} />
				</p>
			);
		}
		if (_myStamp.rarity > 0) {
			return (
				<p className={card.stamp_number}>
					<span className={card.bold}>
						{_myStamp.rarity - myStamp.rarity_used}
					</span>
					/{_myStamp.rarity}
				</p>
			);
		}
	};
	return (
		<div className={`csbs-col-3`}>
			<div className={card.stamp_card}>
				{myStamp.metadata.stamp_vid && (
					<video
						onClick={() => {
							clickSelectStamp(myStamp);
						}}
						className={`${card.stamp_img} ${card.stamp_vid}`}
						src={myStamp.metadata.stamp_vid}
						controls={false}
						autoPlay={true}
						muted
						loop
						playsInline
					/>
				)}
				{!myStamp.metadata.stamp_vid && (
					<img
						onClick={() => {
							clickSelectStamp(myStamp);
						}}
						className={`${card.stamp_img}`}
						src={myStamp.metadata.stamp || myStamp.metadata.image}
						alt=""
						{...fadeBinding}
					/>
				)}
				<div className={card.stamp_info}>
					<div className="">{subTag(myStamp)}</div>
				</div>
			</div>
		</div>
	);
}

function StampSelector({
	stampsets,
	Web3Api,
	Moralis,
	ethereumProvider,
	chainId,
}) {
	const boxRef = useRef();
	const [currentTab, setCurrentTab] = useState("explorer");
	const [message, setMessage] = useState(null);
	const [loading, setLoading] = useState(false);
	const [currentStamp, setCurrentStamp] = useState(null);

	const dispatch = useDispatch();
	const currentStamping = useSelector(
		(state) => state.stamper.currentStamping
	);
	const address = useSelector((state) => state.stamper.userAddress);
	const stampings = useSelector((state) => state.stamper.stampings);
	const myStamps = useSelector((state) => state.stamper.myStamps);
	const testnet = useSelector((state) => state.stamper.testnet);
	const user = useSelector((state) => state.stamper.user);
	const userBalance = useSelector((state) => state.stamper.userBalance);
	const userStampsCount = useSelector(
		(state) => state.stamper.userStampsCount
	);
	const currentChain = useSelector((state) => state.stamper.currentChain);
	const showStampSelector = useSelector(
		(state) => state.stamper.showStampSelector
	);
	const url = useSelector((state) => state.stamper.url);
	const embedId = useSelector((state) => state.stamper.embedId);
	const dataTheme = useSelector((state) => state.stamper.dataTheme);

	useEffect(() => {
		if (showStampSelector && address) {
			const MoralisStamp = Moralis.Object.extend("Stamp");
			const stampQuery = new Moralis.Query(MoralisStamp);
			const userStampQuery = new Moralis.Query(MoralisStamp);
			setLoading(true);

			const promA = [];
			promA.push(
				stampQuery
					.equalTo("chain", currentChain)
					.equalTo("owner_address", address)
					.descending("updatedAt")
					.limit(100)
					.find()
			);
			promA.push(
				userStampQuery
					.equalTo("token_address", currentStamping?.token_address)
					.equalTo("token_id", currentStamping?.token_id)
					.equalTo("owner_address", address)
					.find()
			);
			Promise.all(promA)
				.then((responses) => {
					const user_stamps_all = responses[0];
					const user_stamps_here = responses[1];
					if (user_stamps_all.length <= 0) {
						setMessage({
							title: "Hello Stamper!",
							message: `There are currently no stamps in your dashboard. 
								This might be because you are here for the first time 
								and your NFTs have not been synced at.`,
							button: "Sync my Stamps.",
							type: "message",
						});
						dispatch(setMyStamps([]));
						if (user_stamps_here.length > 0) {
							const u_stamp = user_stamps_here[0].toJSON();
							u_stamp.stamped = true;
							setCurrentStamp(u_stamp);
							setCurrentTab("stamp");
						} else {
							setCurrentStamp(null);
							setCurrentTab("explorer");
						}
					} else {
						setMessage(null);
						if (user_stamps_here.length > 0) {
							const u_stamp = user_stamps_here[0].toJSON();
							u_stamp.stamped = true;
							setCurrentStamp(u_stamp);
							setCurrentTab("stamp");
							dispatch(setMyStamps([u_stamp]));
						} else {
							setCurrentTab("explorer");
							dispatch(
								setMyStamps(
									Array.from(user_stamps_all, (x) => {
										let _stamp = x.toJSON();
										return _stamp;
									})
								)
							);
						}
					}
				})
				.catch((err) => {
					setMessage({
						title: "There is an Error.",
						message: `Check your internet connection, and please refresh the page.`,
						type: "message",
					});
					console.log(err);
				})
				.finally(() => {
					setLoading(false);
				});
		}
	}, [currentChain, currentStamping, address, showStampSelector]);

	const closeWindow = (evt) => {
		if (
			boxRef.current.contains(evt?.target) &&
			evt?.target?.id !== "close"
		) {
			return;
		}
		dispatch(setMyStamps([]));
		setMessage(null);
		setLoading(false);
		setCurrentStamp(null);
		setCurrentTab("explorer");
		dispatch(setStampSelector(false));
	};

	const clickSyncStamps = () => {
		if (currentStamp) return;
		setMessage({ type: "progress" });
		setCurrentTab("explorer");
	};

	const clickSettings = () => {
		setCurrentTab("settings");
	};

	const clickSelectStamp = (_stamp) => {
		setCurrentStamp(_stamp);
		setCurrentTab("stamp");
	};

	if (!showStampSelector) {
		return <div></div>;
	}

	return (
		<Popup
			className={`${dataTheme}-cryptostamping-popup`}
			open={showStampSelector}
			modal
			nested={true}
		>
			<div
				onClick={closeWindow}
				className={`${styles.container} ${
					showStampSelector ? styles.active : ""
				} `}
			>
				<div
					ref={boxRef}
					className={`${styles.box} ${
						showStampSelector ? styles.active : ""
					} shadowed`}
				>
					<SelectorHeader
						loading={loading}
						chainId={chainId}
						closeWindow={closeWindow}
						clickSyncStamps={clickSyncStamps}
						clickSettings={clickSettings}
						setLoading={setLoading}
						ethereumProvider={ethereumProvider}
						Moralis={Moralis}
					/>
					{currentTab === "explorer" && (
						<div className={`${styles.scrollbox} vert_scroll`}>
							<div className={`${styles.tab_list} horiz_scroll`}>
								{(testnet
									? availableTestChains
									: availableMainChains
								).map((chainObject) => {
									return (
										<div
											key={chainObject.symbol}
											onClick={() =>
												dispatch(
													setCurrentChain(
														chainObject.symbol
													)
												)
											}
											className={`${styles.tab_item} ${
												chainObject.symbol ===
													currentChain &&
												styles.active
											} unselectable`}
										>
											<span
												className={`${styles.tab_icon} 
							${chainObject.logo === "eth" && styles.etherium_icon}
							${chainObject.logo === "polygon" && styles.polygon_icon}
							${chainObject.logo === "binance" && styles.binance_icon}
							${chainObject.logo === "avalanche" && styles.avalanche_icon}`}
											/>
											{chainObject.name}
										</div>
									);
								})}
							</div>
							{message?.type === "message" && (
								<div
									className={`${styles.message_box} vert_scroll`}
								>
									<h1 className={styles.message_title}>
										{message.title}
									</h1>
									<p className={styles.message}>
										{message.message}
									</p>
									{message.button && !message.button_link && (
										<div
											onClick={clickSyncStamps}
											className={styles.message_btn}
										>
											{message.button}
										</div>
									)}
									{message.button && message.button_link && (
										<a
											href={message.button_link}
											target="_blank"
											rel="noreferrer"
											className={`${styles.message_btn} ${styles.blue}`}
										>
											{message.button}
										</a>
									)}
								</div>
							)}
							{message?.type === "progress" && (
								<StampSyncer
									Web3Api={Web3Api}
									Moralis={Moralis}
									setMessage={setMessage}
								/>
							)}
							{!message && myStamps?.length > 0 && (
								<div
									className={`${card.stamp_list} vert_scroll`}
								>
									{myStamps.map((myStamp) => {
										return (
											<StampCard
												key={
													myStamp.token_id +
													myStamp.token_address
												}
												clickSelectStamp={
													clickSelectStamp
												}
												myStamp={myStamp}
											/>
										);
									})}
								</div>
							)}
						</div>
					)}
					{currentTab === "stamp" && currentStamp && (
						<div className={`${styles.scrollbox} vert_scroll`}>
							<AddStamp
								setCurrentTab={setCurrentTab}
								currentStamp={currentStamp}
								setCurrentStamp={setCurrentStamp}
								closeWindow={closeWindow}
								ethereumProvider={ethereumProvider}
								Moralis={Moralis}
								setLoading={setLoading}
							/>
						</div>
					)}
					{currentTab === "settings" && (
						<div className={`${styles.scrollbox} vert_scroll`}>
							<UserSettings
								ethereumProvider={ethereumProvider}
								Moralis={Moralis}
								setLoading={setLoading}
								setCurrentTab={setCurrentTab}
							/>
						</div>
					)}
				</div>
			</div>
		</Popup>
	);
}

export default StampSelector;

/*

							<a
								href={`https://crypstamping.org/u/${address}`}
								target="_blank"
								rel="noreferrer"
								className={styles.icon_btn}
							>
								<span
									className={`${styles.icon} ${styles.goto}`}
								/>
							</a>
							*/
