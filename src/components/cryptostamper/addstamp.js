import React, { useState, useEffect, useRef } from "react";
import { useMoralis, useMoralisWeb3Api } from "react-moralis";
import { useSelector, useDispatch } from "react-redux";

import styles from "~/src/components/cryptostamper/addstamp.module.scss";
import StampSyncer from "~/src/components/cryptostamper/syncer";
import Tooltip from "~/src/components/modals/tooltip";

import { useImageFade, prettyPrintDate, getRandPrice } from "~/src/lib/utils";
import { useSigning, useHttpWeb3 } from "~/src/lib/web3";
import { ecs_abi } from "~/src/lib/abi";
import { getSimple } from "~/src/lib/api";
import {
	availableMainChains,
	availableTestChains,
	getProviderUrl,
	FRONTEND_BASE_URL
} from "~/src/lib/data";

import {
	setURL,
	setUser,
	setCurrentChain,
	setTestnet,
	setStampSelector,
	setCurrentStamp,
	setMyStamps,
	updateStamping,
} from "~/src/lib/redux/features/stamperSlice";

function AddStamp({
	currentStamp,
	setCurrentStamp,
	setCurrentTab,
	closeWindow,
	ethereumProvider,
	Moralis,
	setLoading,
}) {
	const dispatch = useDispatch();

	const [comment, setComment] = useState("");
	const [visibility, setVisibility] = useState("public");
	const [stamping, setStamping] = useState(null);
	const [stamp, setStamp] = useState(null);

	const url = useSelector((state) => state.stamper.url);
	const embedId = useSelector((state) => state.stamper.embedId);
	const title = useSelector((state) => state.stamper.title);
	const address = useSelector((state) => state.stamper.userAddress);
	const dataTheme = useSelector((state) => state.stamper.dataTheme);

	const { signMessage } = useSigning(ethereumProvider);

	const { web3, setWeb3Provider } = useHttpWeb3();
	useEffect(() => {
		setWeb3Provider(getProviderUrl(currentStamp.chain));
	}, [currentStamp]);

	useEffect(() => {
		if (currentStamp && url && web3) {
			const Stamping = Moralis.Object.extend("Stamping");
			const query2 = new Moralis.Query(Stamping);
			setLoading(true);
			query2
				.equalTo(
					"nft_id",
					`${currentStamp.token_address}-${currentStamp.token_id}`
				)
				.equalTo(
					"web_id",
					`${url}${embedId ? "-embed-" + embedId : ""}`
				);
			query2
				.find()
				.then((response) => {
					if (response.length > 0) {
						setStamping(response[0]);
						if (response[0].attributes.comment)
							setComment(response[0].attributes.comment);
						setVisibility(response[0].attributes.visibility);
					}
					setLoading(false);
				})
				.catch((err) => {
					console.log(err);
					setLoading(false);
					closeWindow();
				});
			/* update currentStamp owner_address from web3 */
			const MoralisStamp = Moralis.Object.extend("Stamp");
			const query_stamp = new Moralis.Query(MoralisStamp);
			const promA = [];
			promA.push(
				query_stamp.equalTo("objectId", currentStamp.objectId).find()
			);
			const contract = new web3.eth.Contract(
				ecs_abi,
				currentStamp.token_address
			);
			/*promA.push(
				contract.methods.getRarity(currentStamp.token_id).call()
			);
			*/
			console.log(currentStamp.objectId);
			Promise.all(promA)
				.then((responses) => {
					const stamp_results = responses[0];
					console.log(stamp_results);
					if (stamp_results.length > 0) {
						setStamp(stamp_results[0]);
						if (
							stamp_results[0].attributes.owner_address !==
							address
						) {
							alert("There is an error! please reload webpage.");
							closeWindow();
						}
					}
				})
				.catch((error) => {
					console.log(error);
				});
		}
	}, [currentStamp, url, embedId, web3]);

	const handleAddStamp = () => {
		if (currentStamp.owner_address !== address)
			alert(
				"There is an error! please switch to the right account address"
			);
		const txt_msg = `Please confirm that you are stamping ${currentStamp?.metadata?.name} on the webapge ${url ? decodeURI(url) : "WARNING: ERROR"}.`;
		setLoading(true);
		signMessage(txt_msg, address)
			.then((response) => {
				const Stamping = Moralis.Object.extend("Stamping");
				if (!stamping?.id) {
					stamp.set(
						"rarity_used",
						stamp.attributes.rarity_used + 1 || 1
					);
				}
				let stamping_new = stamping || new Stamping();
				const promA = [];
				promA.push(
					stamping_new.save({
						signature_data: response.signature_data,
						user_address: response.from,
						token_name: currentStamp.name,
						token_address: currentStamp.token_address,
						token_id: currentStamp.token_id,
						nft_id: `${currentStamp.token_address}-${currentStamp.token_id}`,
						metadata: currentStamp.metadata,
						rarity: currentStamp.rarity,
						chain: currentStamp.chain,
						url: url,
						embed_id: embedId,
						web_id: `${url}${embedId ? "-embed-" + embedId : ""}`,
						title: title,
						visibility: visibility,
						comment: comment,
					})
				);
				promA.push(stamp.save());
				return Promise.all(promA);
			})
			.then((responses) => {
				const stamping_response = responses[0];
				setLoading(false);
				dispatch(updateStamping(stamping_response.toJSON()));
				closeWindow(null);
			})
			.catch((error) => {
				console.log(error);
				setLoading(false);
			});
	};

	const handleRemoveStamp = () => {
		if (currentStamp.owner_address !== address)
			alert(
				"There is an error! please switch to the right account address"
			);
		const txt_msg = `Please confirm that you are removing stamp ${currentStamp?.metadata?.name} from the webapge ${url ? decodeURI(url) : "WARNING: ERROR"}.`;
		setLoading(true);
		signMessage(txt_msg, address)
			.then((response) => {
				const promA = [];
				promA.push(stamping.destroy());
				stamp.set("rarity_used", stamp.attributes.rarity_used - 1 || 0);
				promA.push(stamp.save());
				return Promise.all(promA);
			})
			.then((responses) => {
				let removed = responses[0].toJSON();
				removed.destroyed = true;
				setLoading(false);
				dispatch(updateStamping(removed));
				closeWindow(null);
			})
			.catch((error) => {
				console.log(error);
				setLoading(false);
			});
	};

	const handleBack = () => {
		setCurrentStamp(null);
		setCurrentTab("explorer");
	};

	const fadeBinding = useImageFade();

	return (
		<div className={`${styles.box} vert_scroll`}>
			<div className={styles.top_bar}>
				{!currentStamp.stamped && !stamping && (
					<div
						onClick={handleBack}
						className={`${styles.option} ${styles.padded} `}
					>
						<span
							className={`${styles.icon} ${styles.back} csbs-mr-2`}
						/>
						<span>Back to Stamps.</span>
					</div>
				)}
				{currentStamp.stamped && !stamping && (
					<div className={`${styles.option} ${styles.padded} `}></div>
				)}
				{stamping && (
					<div
						onClick={handleRemoveStamp}
						className={`${styles.option} ${styles.padded} ${styles.red}`}
					>
						<span
							className={`${styles.icon} ${styles.delete} csbs-mr-2`}
						/>
						<span>Remove Stamping.</span>
					</div>
				)}
				{currentStamp && (
					<div
						className={`${styles.option} ${styles.padded} ${
							currentStamp.rarity > 0 ? styles.blue : ""
						}`}
					>
						<span>{getRandPrice()} ETH / {currentStamp.rarity}</span>
					</div>
				)}
			</div>
			<div className={styles.stamp_box}>
				{currentStamp.metadata.stamp_vid && (
					<video
						className={`${styles.image} ${styles.video}`}
						src={currentStamp.metadata.stamp_vid}
						controls={false}
						autoPlay={true}
						poster={`${FRONTEND_BASE_URL}/images/blank_background.svg`}
						muted
						loop
						playsInline
					/>
				)}
				{!currentStamp.metadata.stamp_vid && (
					<img
						className={`${styles.image}`}
						src={
							currentStamp.metadata.stamp ||
							currentStamp.metadata.image
						}
						alt=""
						{...fadeBinding}
					/>
				)}
				<div className={styles.info_box}>
					<h2 className={styles.title}>{title}</h2>
					<p className={styles.subtitle}>{url ? decodeURI(url) : "WARNING: ERROR"}</p>
					<div className={styles.input_btn}>
						<textarea
							className={`${styles.input_text}`}
							type="text"
							autoComplete="off"
							rows="5"
							value={comment}
							placeholder="What are your thoughts?"
							onChange={(evt) => {
								setComment(evt.target.value);
							}}
						/>
					</div>
					<div className="csbs-d-flex csbs-justify-content-between csbs-mt-3">
						<Tooltip
							delay={0}
							on={["click"]}
							position={"top left"}
							trigger={
								<div className={`${styles.option} `}>
									<span
										className={`${styles.icon} ${
											visibility === "public"
												? styles.global
												: styles.people
										}`}
									/>
									<span>
										{visibility === "public"
											? "Everyone."
											: "Holders."}
									</span>
								</div>
							}
							closeOnClick={true}
							theme={dataTheme}
						>
							<div className="csbs-d-flex csbs-flex-column csbs-align-items-start csbs-px-3 csbs-py-4">
								<div
									onClick={() => {
										setVisibility("public");
									}}
									className={`${styles.option} csbs-mb-3 ${
										visibility === "public"
											? styles.active
											: ""
									} ${styles.padded}`}
								>
									<span
										className={`${styles.icon} ${styles.global} csbs-mr-2`}
									/>
									<span>Everyone can see.</span>
								</div>
								<div
									onClick={() => {
										setVisibility("collection");
									}}
									className={`${styles.option} ${
										visibility === "collection"
											? styles.active
											: ""
									} ${styles.padded}`}
								>
									<span
										className={`${styles.icon} ${styles.people} csbs-mr-2`}
									/>
									<span>Collection holders.</span>
								</div>
							</div>
						</Tooltip>
						<div
							onClick={handleAddStamp}
							className={`${styles.btn} ${styles.black}`}
						>
							<span>
								{stamping ? "Update Stamp." : "Add my Stamp."}
							</span>
						</div>
					</div>
				</div>
			</div>
			<div className={styles.bottom_bar}>
				<div className={`${styles.subtitle} csbs-d-flex`}>
					{stamping && (
						<span>
							You Stamped here{" "}
							{prettyPrintDate(stamping.updatedAt)}{" "}
							&nbsp;&nbsp;&nbsp;
						</span>
					)}
					<a
						className={styles.link}
						href={`https://cryptostamping.org/scan/${currentStamp.nft_id}`}
						target="_blank"
						rel="noreferrer"
					>
						Stamp history
						<span
							className={`${styles.icon} ${styles.goto} csbs-ml-2`}
						/>
					</a>
				</div>
			</div>
		</div>
	);
}

export default AddStamp;
