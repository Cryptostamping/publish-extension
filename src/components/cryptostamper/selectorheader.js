import React, { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";

import styles from "~/src/components/cryptostamper/selector.module.scss";
import Tooltip from "~/src/components/modals/tooltip";

import { useImageFade, printAddress, printBalance } from "~/src/lib/utils";
import { useHttpWeb3 } from "~/src/lib/web3";
import { ecs_abi } from "~/src/lib/abi";
import { getSimple } from "~/src/lib/api";
import {
	getChainObject,
	availableMainChains,
	availableTestChains,
} from "~/src/lib/data";

import {
	setURL,
	setUser,
	setCurrentChain,
	setTestnet,
	setStampSelector,
	setUserStampsCount,
	setUserBalance,
} from "~/src/lib/redux/features/stamperSlice";

function SelectorHeader({
	chainId,
	loading,
	closeWindow,
	clickSyncStamps,
	clickSettings,
	ethereumProvider,
	Moralis,
	setLoading,
	setCurrentTab,
}) {
	const dispatch = useDispatch();

	const url = useSelector((state) => state.stamper.url);
	const embedId = useSelector((state) => state.stamper.embedId);
	const title = useSelector((state) => state.stamper.title);
	const address = useSelector((state) => state.stamper.userAddress);
	const userBalance = useSelector((state) => state.stamper.userBalance);
	const dataTheme = useSelector((state) => state.stamper.dataTheme);
	const userStampsCount = useSelector(
		(state) => state.stamper.userStampsCount
	);

	const { web3, setWeb3Provider } = useHttpWeb3();
	useEffect(() => {
		setWeb3Provider(ethereumProvider);
	}, [ethereumProvider]);

	const [lastChain, setLastChain] = useState(null);
	const onLinkPopup = () => {
		if (!web3) return;
		if (lastChain === chainId) return;
		dispatch(setUserBalance(0));
		web3.eth
			.getBalance(address)
			.then((response) => {
				setLastChain(chainId);
				dispatch(setUserBalance(web3.utils.fromWei(response)));
			})
			.catch((err) => {
				console.log(err);
			});
		const MoralisStamp = Moralis.Object.extend("Stamp");
		const query2 = new Moralis.Query(MoralisStamp);
		query2
			.equalTo("owner_address", address)
			.count()
			.then((response) => {
				dispatch(setUserStampsCount(response));
			})
			.catch((err) => {
				console.log(err);
			});
	};

	const handleDisconnect = () => {
		Moralis.User.logOut();
		dispatch(setUser(null));
		closeWindow();
	};

	return (
		<div className={`${styles.header_container} shadowed`}>
			<div className={styles.header}>
				<div className={styles.icon_btns}>
					<Tooltip
						delay={0}
						on={["click"]}
						position={"bottom left"}
						arrow={true}
						onOpen={onLinkPopup}
						theme={dataTheme}
						trigger={
							<div
								className={`${styles.icon_btn} ${styles.green} ${styles.active} ${styles.hover}`}
							>
								<span
									className={`${styles.icon} ${styles.connect}`}
								/>
							</div>
						}
						closeOnClick={true}
					>
						<div className="csbs-d-flex csbs-flex-column csbs-align-items-center csbs-py-3">
							<div className="">
								<div className={`${styles.section_item}`}>
									<div className="csbs-d-block csbs-mr-2">
										<span
											className={`${styles.tab_icon} 
											${getChainObject(chainId).logo === "eth" && styles.etherium_icon}
											${getChainObject(chainId).logo === "polygon" && styles.polygon_icon}
											${getChainObject(chainId).logo === "binance" && styles.binance_icon}
											${getChainObject(chainId).logo === "avalanche" && styles.avalanche_icon}`}
										/>
									</div>
									<div>
										<h3
											className={`${styles.stamp_number}`}
										>
											<span className={styles.bold}>
												{printBalance(userBalance)}
											</span>
										</h3>
										<p
											className={`${styles.bold_subtitle}`}
										>
											Balance
										</p>
									</div>
								</div>
								<div className={`${styles.section_item}`}>
									<div className="csbs-d-block csbs-mr-2">
										<span
											className={`${styles.tab_icon} ${styles.stamps_icon}`}
										/>
									</div>
									<div>
										<h3
											className={`${styles.stamp_number}`}
										>
											<span className={styles.bold}>
												{userStampsCount}
											</span>
										</h3>
										<p
											className={`${styles.bold_subtitle}`}
										>
											Stamps
										</p>
									</div>
								</div>
								<h3
									onClick={clickSyncStamps}
									className={`${styles.section_item} ${styles.bold_title} csbs-mx-2 csbs-justify-content-start`}
								>
									<span
										className={`${styles.icon} ${styles.resync} csbs-mr-2`}
									/>
									Resync Stamps
								</h3>
								<h3
									onClick={handleDisconnect}
									className={`${styles.section_item} ${styles.bold_title} csbs-mx-2 csbs-justify-content-start`}
								>
									<span
										className={`${styles.icon} ${styles.disconnect} csbs-mr-2`}
									/>
									Disconnect Wallet
								</h3>
							</div>
						</div>
					</Tooltip>
					<div className={styles.header_info}>
						<h3 className={styles.bold_title}>
							MY &nbsp;&nbsp;&nbsp; STAMPS.
						</h3>
						<p className={styles.bold_subtitle}>
							{printAddress(address)}
						</p>
					</div>
				</div>
				<div className={styles.icon_btns}>
					<Tooltip
						delay={0}
						position={"bottom center"}
						arrow={true}
						trigger={
							<div
								onClick={clickSyncStamps}
								className={styles.icon_btn}
							>
								<span
									className={`${styles.icon} ${styles.resync}`}
								/>
							</div>
						}
						theme={dataTheme}
					>
						<p className="csbs-p-2"> Sync NFTs </p>
					</Tooltip>
					<Tooltip
						delay={0}
						position={"bottom right"}
						arrow={true}
						trigger={
							<div
								id="close"
								onClick={closeWindow}
								className={`${styles.icon_btn}`}
							>
								<span
									id="close"
									className={`${styles.icon} ${styles.close}`}
								/>
							</div>
						}
						theme={dataTheme}
					>
						<p className="csbs-p-2"> Close Window </p>
					</Tooltip>
				</div>
			</div>
			<span
				className={`${styles.progress_loader} ${
					loading ? styles.active : styles.none
				} `}
			/>
		</div>
	);
}

export default SelectorHeader;

/*
<Tooltip
								delay={0}
								on={["hover"]}
								position={"bottom center"}
								arrow={true}
								trigger={
									<div 
									onClick={clickSettings}
									className={styles.icon_btn}>
										<span
											className={`${styles.icon} ${styles.settings}`}
										/>
									</div>
								}
							>
								<p className="p-2"> Settings </p>
							</Tooltip>
							*/
