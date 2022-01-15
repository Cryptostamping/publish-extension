import React, { useState, useEffect, useRef } from "react";
import { useMoralis, useMoralisWeb3Api } from "react-moralis";
import { useSelector, useDispatch } from "react-redux";
import Popup from "reactjs-popup";

import card from "~/src/components/cryptostamper/card.module.scss";
import styles from "~/src/components/cryptostamper/selector.module.scss";
import ListerHeader from "~/src/components/cryptostamper/listerheader";
import Tooltip from "~/src/components/modals/tooltip";

import {
	useImageFade,
	printAddress,
	printBalance,
	prettyPrintDate,
	getRandPrice,
} from "~/src/lib/utils";
import { useHttpWeb3 } from "~/src/lib/web3";
import { ecs_abi } from "~/src/lib/abi";
import { getSimple } from "~/src/lib/api";
import {
	availableMainChains,
	availableTestChains,
	getChainObjectFromSymbol,
	getChainObject,
	supportedTestChains,
	supportedMainChains,
} from "~/src/lib/data";

import {
	setURL,
	setUser,
	setCurrentChain,
	setTestnet,
	setStampLister,
	setMyStamps,
	setUserStampsCount,
	setUserBalance,
	setCurrentStamping,
	setStampings,
	setStampingsCount,
} from "~/src/lib/redux/features/stamperSlice";

function StampCard({ stamping, clickSelectStamp, listView }) {
	const fadeBinding = useImageFade();
	const [chainObject, setChainObject] = useState(null);

	useEffect(() => {
		if (stamping) setChainObject(getChainObjectFromSymbol(stamping.chain));
	}, [stamping]);

	const getOpenseaLink = (_chain, _address, _id) => {
		if (_chain === "polygon")
			return "https://opensea.io/assets/matic/" + _address + "/" + _id;
		if (_chain === "ropsten")
			return "https://opensea.io/assets/" + _address + "/" + _id;
		return "https://opensea.io/assets/" + _address + "/" + _id;
	};

	const handleCopyAddress = () => {
		navigator.clipboard.writeText(stamping?.user_address);
	};

	if (listView === "grid")
		return (
			<div className={"csbs-col-4 csbs-px-1 csbs-px-md-2 csbs-col-md-3"}>
				<div className={card.stamp_card}>
					{stamping.metadata.stamp_vid && (
						<video
							onClick={() => {
								clickSelectStamp(stamping);
							}}
							className={`${card.stamp_img} ${card.stamp_vid}`}
							src={stamping.metadata.stamp_vid}
							controls={false}
							autoPlay={true}
							muted
							loop
							playsInline
						/>
					)}
					{!stamping.metadata.stamp_vid && (
						<img
							onClick={() => {
								clickSelectStamp(stamping);
							}}
							className={`${card.stamp_img}`}
							src={
								stamping.metadata.stamp ||
								stamping.metadata.image
							}
							alt=""
							{...fadeBinding}
						/>
					)}
					<p className={card.title2}>{stamping.metadata.name}</p>
					<div className="csbs-d-flex csbs-align-items-center csbs-mb-2">
						<a
							href={`https://cryptostamping.org/c/${stamping.token_address}`}
							className={`${card.subtitle} ${card.fixed} csbs-d-flex csbs-align-items-center`}
						>
							{stamping.token_name}
							<span className={`${card.icon} ${card.check}`} />
						</a>
					</div>
				</div>
			</div>
		);

	return (
		<div className={`${card.stamping_bar} shadowed`}>
			<div className={card.stamp_card}>
				{stamping.metadata.stamp_vid && (
					<video
						onClick={() => {
							clickSelectStamp(stamping);
						}}
						className={`${card.stamp_img} ${card.stamp_vid}  ${card.noshadow}`}
						src={stamping.metadata.stamp_vid}
						controls={false}
						autoPlay={true}
						muted
						loop
						playsInline
					/>
				)}
				{!stamping.metadata.stamp_vid && (
					<img
						onClick={() => {
							clickSelectStamp(stamping);
						}}
						className={`${card.stamp_img} ${card.noshadow}`}
						src={stamping.metadata.stamp || stamping.metadata.image}
						alt=""
						{...fadeBinding}
					/>
				)}
			</div>
			<div className={card.stamping_info}>
				<div className={card.stamping_header2}>
					<div>
						<h3 className={card.title}>{stamping.metadata.name}</h3>
						<div className="csbs-d-flex csbs-align-items-center">
							<a
								href={`https://cryptostamping.org/c/${stamping.token_address}`}
								className={`${card.subtitle} csbs-d-flex csbs-align-items-center`}
							>
								{stamping.token_name}
								<span
									className={`${card.icon} ${card.check}`}
								/>
							</a>
							<div
								onClick={handleCopyAddress}
								className={card.address}
							>
								{printAddress(stamping.user_address)}
							</div>
						</div>
					</div>
				</div>
				<p
					className={`${card.description} ${
						stamping.comment ? card.dark : card.light
					}`}
				>
					<span className={card.subtag}>
						{prettyPrintDate(stamping.updatedAt)}{" "}
						&nbsp;-&nbsp;&nbsp;
					</span>
					{stamping.comment || `No Comment Added...`}
				</p>
			</div>
			<div className={card.stats_info}>
				<div className="csbs-pt-3">
					<div className="csbs-d-flex csbs-justify-content-start csbs-align-items-center csbs-pl-2 csbs-py-2">
						<span
							className={`${styles.tab_icon} ${card.icon_padded}
							${chainObject?.logo === "eth" && styles.etherium_icon}
							${chainObject?.logo === "polygon" && styles.polygon_icon}
							${chainObject?.logo === "binance" && styles.binance_icon}
							${chainObject?.logo === "avalanche" && styles.avalanche_icon}`}
						/>
						<h4 className={card.stamp_price}>
							{getRandPrice()}
							<span className={card.stamp_subtag}>
								{getChainObjectFromSymbol(stamping.chain).name}
							</span>
						</h4>
					</div>
				</div>
				<div className="csbs-pt-2">
					<div className="csbs-d-flex csbs-justify-content-start csbs-align-items-center csbs-pl-2 csbs-py-2">
						<span
							className={`${styles.tab_icon} ${card.icon_padded}
							${styles.rarity_icon}`}
						/>
						<h4 className={card.stamp_price}>
							{(100 / stamping.rarity).toFixed(1)?.toString()}
							<span className={card.stamp_subtag}>Rarity</span>
						</h4>
					</div>
				</div>
				<a
					className={`${card.btn} ${card.subtag} csbs-mt-auto`}
					href={`https://cryptostamping.org/scan/${stamping.nft_id}`}
					target="_blank"
					rel="noreferrer"
				>
					Stamp history
					<span className={`${card.icon} ${card.goto} csbs-ml-1`} />
				</a>
			</div>
		</div>
	);
}

function StampLister({ Web3Api, Moralis, ethereumProvider, chainId }) {
	const boxRef = useRef();
	const [loading, setLoading] = useState(false);
	const [message, setMessage] = useState(null);
	const [currentTab, setCurrentTab] = useState("explorer");
	const [listView, setListView] = useState("list");
	const [sortParams, setSortParams] = useState({
		name: "Latest",
		params: { type: "updatedAt", order: true, id: "created-desc" },
	});

	const sortTypes = [
		{
			name: "Latest",
			params: { type: "updatedAt", order: true, id: "created-desc" },
		},
		{
			name: "Oldest",
			params: { type: "createdAt", order: true, id: "created-asc" },
		},
		{
			name: "Rarest",
			params: { type: "rarity", order: false, id: "rarity-asc" },
		},
	];

	const dispatch = useDispatch();
	const currentStamping = useSelector(
		(state) => state.stamper.currentStamping
	);
	const address = useSelector((state) => state.stamper.userAddress);
	const stampings = useSelector((state) => state.stamper.stampings);
	const myStamps = useSelector((state) => state.stamper.myStamps);
	const testnet = useSelector((state) => state.stamper.testnet);
	const user = useSelector((state) => state.stamper.user);
	const showStampLister = useSelector(
		(state) => state.stamper.showStampLister
	);
	const stampingsCount = useSelector((state) => state.stamper.stampingsCount);
	const url = useSelector((state) => state.stamper.url);
	const embedId = useSelector((state) => state.stamper.embedId);
	const dataTheme = useSelector((state) => state.stamper.dataTheme);

	const closeWindow = (evt) => {
		if (
			boxRef.current.contains(evt?.target) &&
			evt?.target?.id !== "close"
		) {
			return;
		}
		setLoading(false);
		setMessage(null);
		setCurrentTab("explorer");
		dispatch(setStampLister(false));
	};

	const clickSelectStamp = (_stamp) => {
		//dispatch(setStampSelector(true));
	};

	const clickRefresh = (in_sort_pararams) => {
		if(!in_sort_pararams)
			in_sort_pararams = sortParams;
		setLoading(true);
		const promA = [];
		const Stamping = Moralis.Object.extend("Stamping");
		const query1 = new Moralis.Query(Stamping).equalTo(
			"web_id",
			`${url}${embedId ? "-embed-" + embedId : ""}`
		);
		const query2 = new Moralis.Query(Stamping);
		query2.equalTo("web_id", `${url}${embedId ? "-embed-" + embedId : ""}`);
		if (testnet) query2.containedIn("chain", supportedTestChains);
		else query2.containedIn("chain", supportedMainChains);
		if (in_sort_pararams?.params?.order)
			query2.descending(in_sort_pararams?.params?.type);
		else 
			query2.ascending(in_sort_pararams?.params?.type);
		promA.push(query2.limit(30).find());
		promA.push(query1.count());
		Promise.all(promA)
			.then((response) => {
				const results = response[0];
				dispatch(setStampings(Array.from(results, (x) => x.toJSON())));
				dispatch(setStampingsCount(response[1]));
				setLoading(false);
			})
			.catch((err) => {
				console.log(err);
				setLoading(false);
			});
	};

	useEffect(() => {}, [showStampLister]);

	if (!showStampLister) {
		return <div></div>;
	}

	return (
		<Popup
			open={showStampLister}
			modal
			className={`${dataTheme}-cryptostamping-popup`}
			nested
		>
			<div
				onClick={closeWindow}
				className={`${styles.container} ${
					showStampLister ? styles.active : ""
				}`}
			>
				<div
					ref={boxRef}
					className={`${styles.box} ${
						showStampLister ? styles.active : ""
					} shadowed`}
				>
					<ListerHeader
						loading={loading}
						closeWindow={closeWindow}
						setLoading={setLoading}
						ethereumProvider={ethereumProvider}
						Moralis={Moralis}
						clickRefresh={clickRefresh}
					/>
					{currentTab === "explorer" && (
						<div className={`${styles.scrollbox} vert_scroll`}>
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
										<div className={styles.message_btn}>
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
							{!message && (
								<div
									className={`${card.stamping_list} vert_scroll`}
								>
									<div className="csbs-d-flex csbs-w-100 csbs-justify-content-between csbs-align-items-center">
										<div className={styles.tab_icons}>
											<div
												onClick={() => {
													setListView("list");
												}}
												className={`${styles.tab_btn} ${
													styles.start
												} 
									${listView === "list" && styles.active}`}
											>
												<span
													className={`${styles.tab_mini_icon} ${styles.list}`}
												/>
											</div>
											<div
												onClick={() => {
													setListView("grid");
												}}
												className={`${styles.tab_btn} ${
													styles.end
												} 
									${listView === "grid" && styles.active}`}
											>
												<span
													className={`${styles.tab_mini_icon} ${styles.grid}`}
												/>
											</div>
										</div>
										<div className="csbs-d-flex csbs-flex-column csbs-w-100 csbs-align-items-center csbs-mb-4">
											<h1 className={styles.bold_title2}>
												{stampingsCount}
											</h1>
											<p className={styles.bold_subtitle}>
												STAMPS
											</p>
										</div>
										<div className={styles.tab_icons}>
											<Tooltip
												delay={0}
												on={["click"]}
												position={"bottom right"}
												theme={dataTheme}
												trigger={
													<div
														className={`${styles.tab_btn} ${styles.fill} ${styles.active}`}
													>
														{sortParams?.name}
														<span
															className={`${styles.tab_mini_icon} ${styles.down}`}
														/>
													</div>
												}
												closeOnClick={true}
											>
												<div
													className={styles.sort_list}
												>
													{sortTypes.map(
														(sortType) => {
															return (
																<div
																	key={
																		sortType.name
																	}
																	onClick={() => {
																		setSortParams(sortType);
																		clickRefresh(sortType);
																	}}
																	className={`${
																		styles.tab_btn
																	} ${
																		styles.vertical
																	} ${
																		sortType
																			.params
																			.id ===
																			sortParams
																				?.params
																				?.id &&
																		styles.active
																	}`}
																>
																	{
																		sortType.name
																	}
																</div>
															);
														}
													)}
												</div>
											</Tooltip>
										</div>
									</div>
									{stampings.map((stamping) => {
										return (
											<StampCard
												key={stamping.nft_id}
												listView={listView}
												clickSelectStamp={
													clickSelectStamp
												}
												stamping={stamping}
											/>
										);
									})}
								</div>
							)}
						</div>
					)}
				</div>
			</div>
		</Popup>
	);
}

export default StampLister;

/*

					<a
						className={card.link}
						href={`${getOpenseaLink(stamping.chain, stamping.token_address, stamping.token_id)}`}
						target="_blank"
						rel="noreferrer"
					>
						Open Sea
						<span className={`${card.icon} ${card.goto} ml-1`} />
					</a>
					*/
