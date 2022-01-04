export function storeValue(key,value) {
	if (key && value) localStorage.setItem("cutouts_"+key, value);
}

export function retrieveValue(key) {
	return localStorage.getItem("cutouts_"+key);
}

export function storeGoogleInfo(googleProfile) {
	if (googleProfile) localStorage.setItem("cutouts_gp", JSON. stringify(googleProfile));
}

export function retrieveGoogleInfo() {
	const googleProfile =  localStorage.getItem("cutouts_gp");
	if(googleProfile)
		return JSON.parse(googleProfile);
	else
		return null;
}

export function clearGoogleInfo() {
	localStorage.setItem("cutouts_gp", null);
}

export function getPlayingEpisode() {
	const colId = localStorage.getItem("collectionId");
	const trackId = localStorage.getItem("trackId");
	const seekTo = localStorage.getItem("seekTo");
	return {
		collectionId: colId || null,
		trackId: trackId || null,
		seekTo: seekTo || null,
	};
}

export function syncLastVisitedUrl(path) {
	localStorage.setItem("path", path);
}

export function getLastVisitedUrl() {
	const path = localStorage.getItem("path");
	return path || null;
}
