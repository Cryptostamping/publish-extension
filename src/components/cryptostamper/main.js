import React, { useState, useEffect, useRef, memo } from "react";
import { useMoralis, useMoralisWeb3Api } from "react-moralis";
import { Provider } from "react-redux";
import { useSelector, useDispatch } from "react-redux";
import { FixedSizeList as List, areEqual } from "react-window";
import AutoSizer from "react-virtualized-auto-sizer";

import main from "~/src/components/cryptostamper/main.module.scss";
import card from "~/src/components/cryptostamper/card.module.scss";
import styles from "~/src/components/cryptostamper/selector.module.scss";

import StampSelector from "~/src/components/cryptostamper/selector";
import StampLister from "~/src/components/cryptostamper/lister";
import Tooltip from "~/src/components/modals/tooltip";

import { useConnect, useChain } from "~/src/lib/web3";
import {
	getChainObject,
	supportedChains,
	supportedTestChains,
	supportedMainChains,
	getChainObjectFromSymbol,
	FRONTEND_BASE_URL
} from "~/src/lib/data";
import {
	useImageFade,
	printAddress,
	prettyPrintDate,
	getRandPrice,
} from "~/src/lib/utils";

import {
	setURL,
	setUser,
	setSettings,
	setCurrentChain,
	setTestnet,
	setStampSelector,
	setStampLister,
	setMyStamps,
	setStampings,
	setTitle,
	setUserAddress,
	setEmbedId,
	setStampingsCount,
	setCurrentStamping,
	setDataTheme,
} from "~/src/lib/redux/features/stamperSlice";

const renderMiniStamp = memo(({ index, style, data }) => {
	const dispatch = useDispatch();
	const fadeBinding = useImageFade();

	if (!data[index]) return <div></div>;
	const stamping = data[index];
	const chainObject = getChainObjectFromSymbol(data[index]?.chain);
	const dataTheme = useSelector((state) => state.stamper.dataTheme);

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

	const clickOpenList = () => {
		dispatch(setStampLister(true));
	};

	return (
		<div className={main.stamp_frame_container} style={style}>
			<Tooltip
				delay={0}
				on={["hover", "click"]}
				position={[
					"top center",
					"top left",
					"top right",
					"bottom center",
					"bottom left",
					"bottom right"
				]}
				popupClass={main.zoomin_popup}
				closeOnClick={true}
				theme={dataTheme}
				nested={true}
				trigger={
					<div className={`${main.stamp_frame} ${main.borderless} `}>
						{stamping.metadata?.stamp_vid && (
							<video
								className={`${main.stamp_image} ${main.visible} ${main.hovarable}`}
								src={stamping.metadata?.stamp_vid}
								controls={false}
								autoPlay={true}
								poster={`${FRONTEND_BASE_URL}/images/blank_background.svg`}
								muted
								loop
								playsInline
							/>
						)}
						{!stamping.metadata?.stamp_vid && (
							<img
								className={`${main.stamp_image} ${main.visible} ${main.hovarable}`}
								src={
									stamping.metadata?.stamp ||
									stamping.metadata?.image
								}
								alt=""
								{...fadeBinding}
							/>
						)}
					</div>
				}
			>
				<div className={`${card.stamping_info} ${main.hover_card}`}>
					<div className={card.stamping_header}>
						<div className="csbs-d-flex csbs-justify-content-between csbs-align-items-center csbs-px-3">
							<div className="">
								<a href=""></a>
								<p className={`${card.title3} ${card.top_zero}`}>
									{stamping.metadata.name}
								</p>
								<div className="csbs-d-flex csbs-align-items-center">
									<a
										href={`https://cryptostamping.org/c/${stamping.token_address}`}
										target="_blank"
										rel="noreferrer"
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
							<div className="csbs-d-flex csbs-justify-content-start csbs-align-items-center csbs-pl-2">
								<Tooltip
									delay={0}
									position="top center"
									trigger={
										<a
											href={`https://cryptostamping.org/c/${stamping.token_address}`}
											target="_blank"
											rel="noreferrer"
											className={`${styles.tab_btn}`}
										>
											<span
												className={`${styles.tab_mini_icon} ${styles.goto}`}
											/>
										</a>
									}
								>
									<p className="csbs-p-2">Show stamping history</p>
								</Tooltip>
							</div>
						</div>
					</div>
					<p
						className={`${card.description} ${
							stamping.comment ? card.dark : card.light
						} ${card.big} csbs-px-3`}
					>
						<span className={card.subtag}>
							{prettyPrintDate(stamping.updatedAt)}{" "}
							&nbsp;-&nbsp;&nbsp;
						</span>
						{stamping.comment || `No Comment Added...`}
					</p>
					<div className="csbs-d-flex csbs-justify-content-between csbs-align-items-end csbs-px-2">
						<div className="csbs-d-flex csbs-justify-content-start csbs-align-items-center csbs-ml-1">
							<span
								className={`${card.icon} ${card.icon_padded_r}
							${chainObject?.logo === "eth" && styles.etherium_icon}
							${chainObject?.logo === "polygon" && styles.polygon_icon}
							${chainObject?.logo === "binance" && styles.binance_icon}
							${chainObject?.logo === "avalanche" && styles.avalanche_icon}`}
							/>
							<p className={card.subtitle}>
								{getRandPrice()}
								<span className={card.address}>
									/ {stamping.rarity}
								</span>
							</p>
						</div>
						<div
							onClick={clickOpenList}
							className={`${card.subtitle2} csbs-d-flex csbs-align-items-center`}
						>
							View all
							<span
								className={`${card.icon} ${card.small} ${card.list} csbs-ml-2 csbs-mr-1`}
							/>
						</div>
					</div>
				</div>
			</Tooltip>
		</div>
	);
}, areEqual);
renderMiniStamp.displayName = "card";

function StampFrame({ displayImage, currentStamping, handleAddStamp, animationState }) {
	return (
		<div onClick={handleAddStamp} className={main.stamp_frame}>
			<span
				className={`${main.stamp_icon} ${
					currentStamping ? main.edit_icon : main.add_icon
				}`}
			/>
			{currentStamping && displayImage && (
				<div>
					{currentStamping.metadata?.stamp_vid && (
						<video
							className={`${main.stamp_image} ${main.editable} ${animationState}`}
							src={currentStamping.metadata?.stamp_vid}
							controls={false}
							autoPlay={true}
							poster={`${FRONTEND_BASE_URL}/images/blank_background.svg`}
							muted
							loop
							playsInline
						/>
					)}
					{!currentStamping.metadata?.stamp_vid && (
						<img
							className={`${main.stamp_image} ${main.editable} ${animationState}`}
							src={
								currentStamping.metadata?.stamp ||
								currentStamping.metadata?.image
							}
							alt=""
						/>
					)}
				</div>
			)}
		</div>
	);
}

function CryptoStamper({ provider, settings, theme }) {
	const dispatch = useDispatch();
	const Web3Api = useMoralisWeb3Api();
	const { Moralis, isInitialized } = useMoralis();
	const listRef = useRef();

	const {
		provider: ethereumProvider,
		address,
		accounts,
		connectWallet,
		setProvider,
	} = useConnect();

	const { chainId } = useChain();

	const [view, setView] = useState("button");
	const url = useSelector((state) => state.stamper.url);
	const title = useSelector((state) => state.stamper.title);
	const embedId = useSelector((state) => state.stamper.embedId);
	const myStamps = useSelector((state) => state.stamper.myStamps);
	const testnet = useSelector((state) => state.stamper.testnet);
	const user = useSelector((state) => state.stamper.user);
	const currentChain = useSelector((state) => state.stamper.currentChain);
	const showStampSelector = useSelector(
		(state) => state.stamper.showStampSelector
	);
	const currentStamping = useSelector(
		(state) => state.stamper.currentStamping
	);
	const stampings = useSelector((state) => state.stamper.stampings);
	const stampingsCount = useSelector((state) => state.stamper.stampingsCount);
	const [animationState, setAnimeState] = useState(null);
	const dataTheme = useSelector((state) => state.stamper.dataTheme);

	useEffect(()=>{
		dispatch(setDataTheme(theme || "light"));
	},[theme])

	/* setup ethereum provider */
	useEffect(() => {
		if (provider) setProvider(provider);
		else setProvider(window.ethereum);
	}, [provider, setProvider]);

	/* setup moralis user */
	useEffect(() => {
		if (address) {
			dispatch(setUserAddress(address));
			const user = Moralis.User?.current();
			if (user) dispatch(setUser(user.toJSON()));
		}
	}, [address, Moralis.User, dispatch]);

	/* setup url, id, title */
	useEffect(() => {
		let _url = settings?.url || window.top.location?.href;
		let _title = settings?.title || window.top.document.title;
		let index = _url.indexOf("?");
		let display_url = index > -1 ? _url?.substr(0, index) : _url;
		let _testnet =
			settings?.testnet ||
			(_url.indexOf("testnet=true") > -1 ? true : false);

		dispatch(
			setSettings({
				url: display_url,
				title: _title,
				embedId: settings?.embedId,
				testnet: _testnet,
			})
		);

		if (settings?.view) setView(settings?.view);
	}, [settings, dispatch]);

	/* setup testnet & default chain */
	useEffect(() => {
		if (testnet) {
			const currentProviderChain = getChainObject(chainId, "testnet");
			dispatch(
				setCurrentChain(
					currentProviderChain
						? currentProviderChain.symbol
						: "ropsten"
				)
			);
		} else {
			const currentProviderChain = getChainObject(chainId, "mainnet");
			dispatch(
				setCurrentChain(
					currentProviderChain ? currentProviderChain.symbol : "eth"
				)
			);
		}
	}, [testnet, chainId, dispatch]);

	/* load stampings & stamps count */
	useEffect(() => {
		if (isInitialized && url) {
			const Stamping = Moralis.Object.extend("Stamping");
			const query1 = new Moralis.Query(Stamping);

			console.log(testnet);
			if (testnet) query1.containedIn("chain", supportedTestChains);
			else query1.containedIn("chain", supportedMainChains);
			query1
				.equalTo(
					"web_id",
					`${url}${embedId ? "-embed-" + embedId : ""}`
				)
				.descending("createdAt")
				.limit(30)
				.find()
				.then((results) => {
					dispatch(
						setStampings(Array.from(results, (x) => x.toJSON()))
					);
				})
				.catch((err) => {
					console.log(err);
				});

			const query3 = new Moralis.Query(Stamping);
			if (testnet) query3.containedIn("chain", supportedTestChains);
			else query3.containedIn("chain", supportedMainChains);
			query3
				.equalTo(
					"web_id",
					`${url}${embedId ? "-embed-" + embedId : ""}`
				)
				.count()
				.then((response) => {
					dispatch(setStampingsCount(response));
				})
				.catch((err) => {
					console.log(err);
				});
		}
	}, [url, embedId, testnet, dispatch, isInitialized]);

	/* load User Stamp Here */
	useEffect(() => {
		if (isInitialized && url && address) {
			const Stamping = Moralis.Object.extend("Stamping");
			const query2 = new Moralis.Query(Stamping);
			if (testnet) query2.containedIn("chain", supportedTestChains);
			else query2.containedIn("chain", supportedMainChains);
			query2
				.equalTo(
					"web_id",
					`${url}${embedId ? "-embed-" + embedId : ""}`
				)
				.equalTo("user_address", address)
				.find()
				.then((user_stampings) => {
					if (user_stampings?.length > 0) {
						dispatch(
							setCurrentStamping(user_stampings[0]?.toJSON())
						);
					}
				})
				.catch((err) => {
					console.log(err);
				});
		}
	}, [url, isInitialized, address, testnet, embedId, dispatch]);

	useEffect(() => {
		if (showStampSelector) {
			setAnimeState(null);
		}
		if (currentStamping) {
			return setAnimeState(main.stamp_added);
		} else {
			return setAnimeState(main.stamp_removed);
		}
	}, [currentStamping, showStampSelector]);

	const handleAddStamp = () => {
		if (user) {
			openSelector(address);
			return;
		}
		connectWallet()
			.then((res) => {
				const currentUser = Moralis.User.current();
				if (currentUser) {
					dispatch(setUser(currentUser.toJSON()));
					return;
				}
				return Moralis.authenticate({
					signingMessage:
						"Hey there, this seems to be your first time stamping here. Please sign to verify this is you. This will not charge any gas transaction fee.",
				});
			})
			.then(() => {
				openSelector(address);
			})
			.catch((err) => {
				console.log(err);
			});
	};

	const openSelector = (account) => {
		if (!account) return;
		dispatch(setStampSelector(true));
	};

	const handleStampsListing = () => {
		dispatch(setStampLister(true));
	};

	return (
		<div className="csbs-w-100">
			{view === "banner" && (
				<div
					className={`csbs-d-flex csbs-flex-column csbs-align-items-center csbs-justify-content-center csbs-p-2`}
				>
					<div
						className={`${main.banner_container} ${main.bottom_border} ${main.title_header}`}
					>
						<div className={`${main.banner_infobar}`}>
							<h2 className={main.title}>{title}</h2>
							<p className={main.url_subtitle}>{url ? decodeURI(url) : "WARNING: ERROR"}</p>
						</div>
						<div className="csbs-d-flex csbs-align-items-stretch">
							<div
								className={"csbs-d-flex csbs-flex-column csbs-align-items-end"}
							>
								<h3 className={`${main.title} csbs-mb-0`}>
									{getRandPrice(
										title?.length * stampingsCount
									)}
								</h3>
								<p
									onClick={handleStampsListing}
									className={card.address}
								>
									{stampingsCount} Stamps
								</p>
							</div>
							<div
								onClick={handleStampsListing}
								className={`${styles.tab_btn} csbs-py-2 ${styles.active} csbs-ml-3`}
							>
								<span
									className={`${styles.tab_mini_icon} ${styles.list}`}
								/>
							</div>
						</div>
					</div>
					<div className={`${main.banner_container}`}>
						<StampFrame
							displayImage={false}
							currentStamping={currentStamping}
							handleAddStamp={handleAddStamp}
							animationState={animationState}
						/>
						<div className={`${main.list_container}`}>
							<AutoSizer disableHeight>
								{({ width }) => (
									<List
										ref={listRef}
										height={120}
										className={`${main.list_lay} ${main.horiz_scroll} ${main.justify_start}`}
										itemCount={stampings?.length}
										itemData={stampings}
										itemSize={100}
										width={width}
										layout="horizontal"
									>
										{renderMiniStamp}
									</List>
								)}
							</AutoSizer>
						</div>
					</div>
				</div>
			)}
			{view === "button" && (
				<div className={`${main.stamp_conatiner} csbs-p-2`}>
					<StampFrame
						displayImage={true}
						currentStamping={currentStamping}
						handleAddStamp={handleAddStamp}
						animationState={animationState}
					/>
					<div
						onClick={handleStampsListing}
						className={main.stamp_count}
					>
						<p className={main.stamp_subtag}>
							{stampingsCount > 0
								? "+" + stampingsCount
								: stampingsCount}
						</p>
					</div>
				</div>
			)}

			{view === "list" && (

				<div className={`${main.list_container} csbs-container`}>
					<div className="csbs-d-block csbs-w-100">
					<AutoSizer disableHeight>
						{({ width }) => (
							<List
								ref={listRef}
								height={120}
								className={`${main.list_lay} ${main.horiz_scroll}`}
								itemCount={stampings?.length}
								itemData={stampings}
								itemSize={100}
								width={width}
								layout="horizontal"
							>
								{renderMiniStamp}
							</List>
						)}
					</AutoSizer>
					</div>
					<div className={` csbs-d-flex csbs-justify-content-center`}
					>
						<div  onClick={handleStampsListing}
						 className={main.stamp_count}>
						<p
						className={`${main.stamp_subtag} csbs-pr-3`}>
							{stampingsCount} &nbsp; nfts &nbsp; here.
						</p>
						</div>
						<div  onClick={handleAddStamp}
						 className={main.stamp_count}>
						<p className={`${main.stamp_subtag} `}>
							 Add.
						</p>
						</div>
					</div>
				</div>
			)}

			{isInitialized && (
				<StampSelector
					Web3Api={Web3Api}
					Moralis={Moralis}
					ethereumProvider={ethereumProvider}
					chainId={chainId}
				/>
			)}

			{isInitialized && (
				<StampLister
					Web3Api={Web3Api}
					Moralis={Moralis}
					ethereumProvider={ethereumProvider}
				/>
			)}
		</div>
	);
}

export default CryptoStamper;
