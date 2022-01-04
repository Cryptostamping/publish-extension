import React, { useState, useEffect, useRef } from "react";
import { useMoralis, useMoralisWeb3Api } from "react-moralis";
import { useSelector, useDispatch } from "react-redux";

import styles from "~/src/components/cryptostamper/usersettings.module.scss";
import StampSyncer from "~/src/components/cryptostamper/syncer";
import Tooltip from "~/src/components/modals/tooltip";

import { useImageFade } from "~/src/lib/utils";
import { useSigning } from "~/src/lib/web3";
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
	updateStamping,
} from "~/src/lib/redux/features/stamperSlice";

function UserSettings({
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
	const currentStamping = useSelector(
		(state) => state.stamper.currentStamping
	);

	const [username, setUsername] = useState("");
	const [bio, setBio] = useState("");
	const { signMessage } = useSigning(ethereumProvider);

	const handleBack = () => {
		if (currentStamping) {
			return setCurrentTab("stamp");
		}
		setCurrentTab("explorer");
	};

	const handleCopy = () => {
		navigator.clipboard.writeText(address);
	};

	return (
		<div className={`${styles.box} vert_scroll`}>
			<div className={styles.top_bar}>
				<div
					onClick={handleBack}
					className={`${styles.option} ${styles.padded} `}
				>
					<span className={`${styles.icon} ${styles.back} csbs-mr-2`} />
					<span>Back.</span>
				</div>
			</div>
			<div className={styles.settings_box}>
				<div
					onClick={handleCopy}
					className={`${styles.option} ${styles.padded}  `}
				>
					<span>{address}</span>
					<span className={`${styles.icon} ${styles.copy} csbs-ml-2`} />
				</div>
				<div className={styles.form_box}>
					<div className={styles.input_btn}>
						<input
							className={`${styles.input_text}`}
							type="text"
							autoComplete="off"
							value={username}
							placeholder="Username"
							onChange={(evt) => {
								setUsername(evt.target.value);
							}}
						/>
					</div>
					<div className={styles.input_btn}>
						<textarea
							className={`${styles.input_text}`}
							type="text"
							autoComplete="off"
							rows="3"
							value={username}
							placeholder="A short Bio."
							onChange={(evt) => {
								setUsername(evt.target.value);
							}}
						/>
					</div>
				</div>
			</div>
			<div className={styles.bottom_bar}></div>
		</div>
	);
}

export default UserSettings;
