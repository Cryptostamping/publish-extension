import { useState, useEffect } from "react";

const IMAGE_BASE_URL = "https://cdn.jingle.fm/images";

export function constructImageUrl(imageName, size) {
  if (size === "full") return `${IMAGE_BASE_URL}/full/${imageName}`;
  /* Defaulting both 30x30, 60x60 to 60x60 */
  if (size === "30x30") return `${IMAGE_BASE_URL}/thumbs/60x60/${imageName}`;
  if (size === "60x60") return `${IMAGE_BASE_URL}/thumbs/60x60/${imageName}`;
  /* 100x100 */
  if (size === "100x100")
    return `${IMAGE_BASE_URL}/thumbs/100x100/${imageName}`;
  /* 160x160 */
  if (size === "160x160")
    return `${IMAGE_BASE_URL}/thumbs/160x160/${imageName}`;
  /* 300x300 */
  if (size === "300x300")
    return `${IMAGE_BASE_URL}/thumbs/300x300/${imageName}`;
  /* 600x600 */
  if (size === "600x600")
    return `${IMAGE_BASE_URL}/thumbs/600x600/${imageName}`;
  return `${IMAGE_BASE_URL}/full/${imageName}`;
}

export function getContainerWidth(media, _windowResp) {
  if (media === "sm") return _windowResp.width * 1 - 25;
  if (media === "md") return _windowResp.width * 1 - 40;
  /* 3% margins on both sides - 6% for container, 20px padding of tray-inner */
  if (media === "lg") return _windowResp.width * 0.94 - 10;
  /* 3% margins on both sides - 6% for container, px padding of tray-inner */
  if (media === "xl") return _windowResp.width * 0.75 - 15;
  return _windowResp.width * 0.75 - 15;
}

function getWindowDimensions() {
  if (window !== null && typeof window !== "undefined") {
    const { width, height } = window.screen;
    return {
      width,
      height,
    };
  }
  return { width: 1440, height: 635 };
}

export const useSize = (init_size) => {
  const [sizeLoaded, setSizeLoaded] = useState(false);
  const [currentSize, setCurrentSize] = useState(init_size || "xl");
  const [windowSize, setWindowSize] = useState({ width: 1440, height: 635 });

  useEffect(() => {
    let xlSize;
    let largeSize;
    let mediumSize;
    let smallSize;

    const handleResize = () => {
      setWindowSize(getWindowDimensions());
    };

    /* Define Media Queries */
    xlSize = window.matchMedia("(min-width: 1200px)");
    largeSize = window.matchMedia(
      "(min-width: 992px) and (max-width: 1199.98px)"
    );
    mediumSize = window.matchMedia(
      "(min-width: 768px) and (max-width: 991.98px)"
    );
    smallSize = window.matchMedia("(max-width: 767.98px)");
    /* Define Callback Changes */
    const handleXlChange = (e) => {
      if (e.matches) {
        setCurrentSize("xl");
        handleResize();
      }
    };
    const handleLgChange = (e) => {
      if (e.matches) {
        setCurrentSize("lg");
        handleResize();
      }
    };
    const handleMdChange = (e) => {
      if (e.matches) {
        setCurrentSize("md");
        handleResize();
      }
    };
    const handleSmChange = (e) => {
      if (e.matches) {
        setCurrentSize("sm");
        handleResize();
      }
    };
    /* Attatch Listeners to MediaQueries */
    xlSize.addListener(handleXlChange);
    largeSize.addListener(handleLgChange);
    mediumSize.addListener(handleMdChange);
    smallSize.addListener(handleSmChange);
    window.addEventListener("resize", handleResize);
    /* Quick Initial Check of Queries */
    handleXlChange(xlSize);
    handleLgChange(largeSize);
    handleMdChange(mediumSize);
    handleSmChange(smallSize);
    handleResize();
    setSizeLoaded(true);
    return () => {
      /* Remove Listeners to MediaQueries */
      xlSize.removeListener(handleXlChange);
      largeSize.removeListener(handleLgChange);
      mediumSize.removeListener(handleMdChange);
      smallSize.removeListener(handleSmChange);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return {
    currentSize,
    windowSize,
    sizeLoaded,
  };
};
