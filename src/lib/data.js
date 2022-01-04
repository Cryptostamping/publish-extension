export const APP_TITLE = "Cryptostamping";
export const APP_TITLE_HEADER =
	"Cryptostamping - Open-Source, Ownerless, Decentralized.";

const forceTESTNET = false;
export const IN_DEV_ENV = process && process.env.NODE_ENV === "development";

export const MOLARIS_SERVER_URL = forceTESTNET
	? process.env.REACT_APP_MORALIS_TESTNET_URL
	: process.env.REACT_APP_MORALIS_PROD_URL;

export const MOLARIS_APP_ID = forceTESTNET
	? process.env.REACT_APP_MORALIS_TESTNET_ID
	: process.env.REACT_APP_MORALIS_PROD_ID;

export const FRONTEND_BASE_URL = IN_DEV_ENV
	? "http://localhost:3000"
	: "https://embed.cryptostamping.org";
export const API_BASE_URL = IN_DEV_ENV
	? "http://localhost:3000/api"
	: "https://embed.cryptostamping.org/api";

export const GS_CLIENT_ID = process.env.REACT_APP_GS_CLIENT_ID;

export const availableMainChains = [
	{
		symbol: "eth",
		logo: "eth",
		name: "Ethereum",
		chainId: 1,
		rpc: "https://api.mycryptoapi.com/eth",
	},
	{
		symbol: "polygon",
		logo: "polygon",
		name: "Polygon",
		chainId: 137,
		rpc: "https://polygon-rpc.com/",
	},
	{
		symbol: "bsc",
		logo: "binance",
		name: "Binance",
		chainId: 56,
		rpc: "https://bsc-dataseed1.binance.org",
	},
	{
		symbol: "avalanche",
		logo: "avalanche",
		name: "Avalanche",
		chainId: 43114,
		rpc: "https://api.avax.network/ext/bc/C/rpc",
	},
];
export const availableTestChains = [
	{
		symbol: "ropsten",
		logo: "eth",
		name: "Ropsten",
		chainId: 3,
		rpc: "https://ropsten.infura.io/v3/03471b96bc3f4e539cb9fe22a60c3710",
	},
	{
		symbol: "mumbai",
		logo: "polygon",
		name: "Mumbai",
		chainId: 137,
		rpc: "https://rpc-mumbai.maticvigil.com",
	},
	{
		symbol: "bsc testnet",
		logo: "binance",
		name: "BSC-Test",
		chainId: 97,
		rpc: "https://data-seed-prebsc-1-s1.binance.org:8545",
	},
	{
		symbol: "avalanche testnet",
		logo: "avalanche",
		name: "Fuji",
		chainId: 43113,
		rpc: "https://api.avax-test.network/ext/bc/C/rpc",
	},
];
export const supportedChains = [
	"eth",
	"ropsten",
	"bsc",
	"bsc testnet",
	"polygon",
	"mumbai",
	"avalanche",
	"avalanche testnet",
];

export const supportedTestChains = [
	"ropsten",
	"bsc testnet",
	"mumbai",
	"avalanche testnet"
];

export const supportedMainChains = [
	"eth",
	"bsc",
	"polygon",
	"avalanche"
];
/*

	{
		symbol: "rinkeby",
		logo: "eth",
		name: "Rinkeby",
		chainId: 4,
		rpc: "https://rinkeby.infura.io/v3/03471b96bc3f4e539cb9fe22a60c3710",
	},
*/
export const DATE_START="";
export const PINATA_API_BASE_URL="";
export const PINATA_API_KEY="";
export const PINATA_API_SECRET="";

export const availableChains = [
	{
		name: "Ethereum Mainnet",
		chain: "ETH",
		network: "mainnet",
		icon: "ethereum",
		rpc: [
			"https://mainnet.infura.io/v3/${INFURA_API_KEY}",
			"wss://mainnet.infura.io/ws/v3/${INFURA_API_KEY}",
			"https://api.mycryptoapi.com/eth",
			"https://cloudflare-eth.com",
		],
		faucets: [],
		nativeCurrency: {
			name: "Ether",
			symbol: "ETH",
			decimals: 18,
		},
		infoURL: "https://ethereum.org",
		shortName: "eth",
		chainId: 1,
		networkId: 1,
		slip44: 60,
		ens: {
			registry: "0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e",
		},
		explorers: [
			{
				name: "etherscan",
				url: "https://etherscan.io",
				standard: "EIP3091",
			},
		],
	},
	{
		name: "Ethereum Testnet Ropsten",
		chain: "ETH",
		network: "ropsten",
		rpc: [
			"https://ropsten.infura.io/v3/${INFURA_API_KEY}",
			"wss://ropsten.infura.io/ws/v3/${INFURA_API_KEY}",
		],
		faucets: ["https://faucet.ropsten.be?${ADDRESS}"],
		nativeCurrency: {
			name: "Ropsten Ether",
			symbol: "ROP",
			decimals: 18,
		},
		infoURL: "https://github.com/ethereum/ropsten",
		shortName: "rop",
		chainId: 3,
		networkId: 3,
		ens: {
			registry: "0x112234455c3a32fd11230c42e7bccd4a84e02010",
		},
	},
	{
		name: "Ethereum Testnet Rinkeby",
		chain: "ETH",
		network: "rinkeby",
		rpc: [
			"https://rinkeby.infura.io/v3/${INFURA_API_KEY}",
			"wss://rinkeby.infura.io/ws/v3/${INFURA_API_KEY}",
		],
		faucets: ["https://faucet.rinkeby.io"],
		nativeCurrency: {
			name: "Rinkeby Ether",
			symbol: "RIN",
			decimals: 18,
		},
		infoURL: "https://www.rinkeby.io",
		shortName: "rin",
		chainId: 4,
		networkId: 4,
		ens: {
			registry: "0xe7410170f87102df0055eb195163a03b7f2bff4a",
		},
		explorers: [
			{
				name: "etherscan-rinkeby",
				url: "https://rinkeby.etherscan.io",
				standard: "EIP3091",
			},
		],
	},
	{
		name: "Binance Smart Chain Mainnet",
		chain: "BSC",
		network: "mainnet",
		rpc: [
			"https://bsc-dataseed1.binance.org",
			"https://bsc-dataseed2.binance.org",
			"https://bsc-dataseed3.binance.org",
			"https://bsc-dataseed4.binance.org",
			"https://bsc-dataseed1.defibit.io",
			"https://bsc-dataseed2.defibit.io",
			"https://bsc-dataseed3.defibit.io",
			"https://bsc-dataseed4.defibit.io",
			"https://bsc-dataseed1.ninicoin.io",
			"https://bsc-dataseed2.ninicoin.io",
			"https://bsc-dataseed3.ninicoin.io",
			"https://bsc-dataseed4.ninicoin.io",
			"wss://bsc-ws-node.nariox.org",
		],
		faucets: ["https://free-online-app.com/faucet-for-eth-evm-chains/"],
		nativeCurrency: {
			name: "Binance Chain Native Token",
			symbol: "BNB",
			decimals: 18,
		},
		infoURL: "https://www.binance.org",
		shortName: "bnb",
		chainId: 56,
		networkId: 56,
		slip44: 714,
		explorers: [
			{
				name: "bscscan",
				url: "https://bscscan.com",
				standard: "EIP3091",
			},
		],
	},
	{
		name: "Binance Smart Chain Testnet",
		chain: "BSC",
		network: "Chapel",
		rpc: [
			"https://data-seed-prebsc-1-s1.binance.org:8545",
			"https://data-seed-prebsc-2-s1.binance.org:8545",
			"https://data-seed-prebsc-1-s2.binance.org:8545",
			"https://data-seed-prebsc-2-s2.binance.org:8545",
			"https://data-seed-prebsc-1-s3.binance.org:8545",
			"https://data-seed-prebsc-2-s3.binance.org:8545",
		],
		faucets: ["https://testnet.binance.org/faucet-smart"],
		nativeCurrency: {
			name: "Binance Chain Native Token",
			symbol: "tBNB",
			decimals: 18,
		},
		infoURL: "https://testnet.binance.org/",
		shortName: "bnbt",
		chainId: 97,
		networkId: 97,
		explorers: [
			{
				name: "bscscan-testnet",
				url: "https://testnet.bscscan.com",
				standard: "EIP3091",
			},
		],
	},
	{
		name: "Polygon Mainnet",
		chain: "Polygon",
		network: "mainnet",
		rpc: [
			"https://polygon-rpc.com/",
			"https://rpc-mainnet.matic.network",
			"https://matic-mainnet.chainstacklabs.com",
			"https://rpc-mainnet.maticvigil.com",
			"https://rpc-mainnet.matic.quiknode.pro",
			"https://matic-mainnet-full-rpc.bwarelabs.com",
		],
		faucets: [],
		nativeCurrency: {
			name: "MATIC",
			symbol: "MATIC",
			decimals: 18,
		},
		infoURL: "https://polygon.technology/",
		shortName: "MATIC",
		chainId: 137,
		networkId: 137,
		slip44: 966,
		moralisChainId: "matic",
		explorers: [
			{
				name: "polygonscan",
				url: "https://polygonscan.com",
				standard: "EIP3091",
			},
		],
	},
	{
		name: "Polygon Testnet",
		chain: "Polygon",
		network: "testnet",
		rpc: [
			"https://rpc-mumbai.maticvigil.com",
			"https://matic-mumbai.chainstacklabs.com",
			"https://matic-testnet-archive-rpc.bwarelabs.com",
		],
		faucets: ["https://faucet.polygon.technology/"],
		nativeCurrency: {
			name: "MATIC",
			symbol: "MATIC",
			decimals: 18,
		},
		infoURL: "https://polygon.technology/",
		provider: "https://rpc-mumbai.matic.today",
		shortName: "maticmum",
		chainId: 80001,
		networkId: 80001,
		moralisChainId: "mumbai",
		explorers: [
			{
				name: "polygonscan",
				url: "https://mumbai.polygonscan.com",
				standard: "EIP3091",
			},
		],
	},
	{
		name: "Avalanche Fuji Testnet",
		chain: "AVAX",
		network: "testnet",
		rpc: ["https://api.avax-test.network/ext/bc/C/rpc"],
		faucets: ["https://faucet.avax-test.network/"],
		nativeCurrency: {
			name: "Avalanche",
			symbol: "AVAX",
			decimals: 18,
		},
		infoURL: "https://cchain.explorer.avax-test.network",
		shortName: "Fuji",
		chainId: 43113,
		networkId: 1,
		explorers: [
			{
				name: "snowtrace",
				url: "https://testnet.snowtrace.io/",
				standard: "EIP3091",
			},
		],
	},
	{
		name: "Avalanche Mainnet",
		chain: "AVAX",
		network: "mainnet",
		rpc: ["https://api.avax.network/ext/bc/C/rpc"],
		faucets: ["https://free-online-app.com/faucet-for-eth-evm-chains/"],
		nativeCurrency: {
			name: "Avalanche",
			symbol: "AVAX",
			decimals: 18,
		},
		infoURL: "https://www.avax.network/",
		shortName: "Avalanche",
		chainId: 43114,
		networkId: 43114,
		slip44: 9000,
		explorers: [
			{
				name: "snowtrace",
				url: "https://snowtrace.io/",
				standard: "EIP3091",
			},
		],
	},
];

export const generateUID = () => {
	var firstPart = (Math.random() * 46656) | 0;
	var secondPart = (Math.random() * 46656) | 0;
	firstPart = ("00" + firstPart.toString(36)).slice(-2);
	secondPart = ("00" + secondPart.toString(36)).slice(-2);
	return firstPart + secondPart;
};

export const getChainObject = (_chainId, type) => {
	if (type === "mainnet") {
		for (const chainObject of availableMainChains) {
			if (chainObject.chainId === _chainId) return chainObject;
		}
		return;
	}
	if (type === "testnet") {
		for (const chainObject of availableTestChains) {
			if (chainObject.chainId === _chainId) return chainObject;
		}
		return;
	}
	for (const chainObject of availableMainChains) {
		if (chainObject.chainId === _chainId) return chainObject;
	}
	for (const chainObject of availableTestChains) {
		if (chainObject.chainId === _chainId) return chainObject;
	}
};


export const getChainObjectFromSymbol = (_symbol) => {
	for (const chainObject of availableMainChains) {
		if (chainObject.symbol === _symbol) return chainObject;
	}
	for (const chainObject of availableTestChains) {
		if (chainObject.symbol === _symbol) return chainObject;
	}
};

export const getProviderUrl = (_chain) => {
		for (var i = 0; i < availableMainChains.length; i++) {
			if (availableMainChains[i].symbol === _chain)
				return availableMainChains[i].rpc;
		}
		for (var i = 0; i < availableTestChains.length; i++) {
			if (availableTestChains[i].symbol === _chain)
				return availableTestChains[i].rpc;
		}
};

//🎯 🎲 📌 📐 🔑 🔐 ⚔ ⚙ 🧲 ⚠ ➡ ✅ 🏃  🦴 ✍ 💯 ☠ 📅
