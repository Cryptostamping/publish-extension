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
	FRONTEND_BASE_URL,
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

function ListerHeader({
	loading,
	clickRefresh,
	closeWindow,
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
	const dataTheme = useSelector((state) => state.stamper.dataTheme);


	const { web3, setWeb3Provider } = useHttpWeb3();
	useEffect(() => {
		setWeb3Provider(ethereumProvider);
	}, [ethereumProvider]);

	const getFavicon = () => {
		var favicon = undefined;
		var nodeList = document.getElementsByTagName("link");
		for (var i = 0; i < nodeList.length; i++) {
			if (
				nodeList[i].getAttribute("rel") === "icon" ||
				nodeList[i].getAttribute("rel") === "shortcut icon"
			) {
				favicon = nodeList[i].getAttribute("href");
			}
		}
		return favicon;
	};

	return (
		<div className={`${styles.header_container} shadowed`}>
			<div className={styles.header}>
				<div className={`${styles.icon_btns} ${styles.header_infobar}`}>
					<div className={`${styles.icon_btn} ${styles.compact}`}>
						<img
							className={styles.logo_icon}
							src={getFavicon()}
							alt={``}
						/>
					</div>
					<div className={styles.header_info}>
						<h3 className={styles.bold_title}>{title}</h3>
						<p className={styles.normal_subtitle}>{url ? decodeURI(url) : "WARNING: ERROR"}</p>
					</div>
				</div>
				<div className={styles.icon_btns}>
					<Tooltip
						delay={0}
						on={["hover"]}
						position={"bottom center"}
						arrow={true}
						theme={dataTheme}
						trigger={
							<div
								onClick={clickRefresh}
								className={styles.icon_btn}
							>
								<span
									className={`${styles.icon} ${styles.refresh}`}
								/>
							</div>
						}
					>
						<p className="csbs-p-2"> Refresh </p>
					</Tooltip>
					<Tooltip
						delay={0}
						on={["hover"]}
						position={"bottom right"}
						arrow={true}
						theme={dataTheme}
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

export default ListerHeader;

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
