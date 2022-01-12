import { useState, useEffect, useRef } from "react";

import { DATE_START } from "~/src/lib/data";

export const refreshTokenSetup = (res) => {
  // Timing to renew access token
  let refreshTiming = (res.tokenObj.expires_in || 3600 - 5 * 60) * 1000;

  const refreshToken = async () => {
    const newAuthRes = await res.reloadAuthResponse();
    refreshTiming = (newAuthRes.expires_in || 3600 - 5 * 60) * 1000;
    console.log("newAuthRes:", newAuthRes);
    // saveUserToken(newAuthRes.access_token);  <-- save new token
    localStorage.setItem("authToken", newAuthRes.id_token);

    // Setup the other timer after the first one
    setTimeout(refreshToken, refreshTiming);
  };

  // Setup first refresh timer
  setTimeout(refreshToken, refreshTiming);
};

export const generateUID = () => {
  // I generate the UID from two parts here
  // to ensure the random number provide enough bits.
  var firstPart = (Math.random() * 46656) | 0;
  var secondPart = (Math.random() * 46656) | 0;
  firstPart = ("000" + firstPart.toString(36)).slice(-3);
  secondPart = ("000" + secondPart.toString(36)).slice(-3);
  return firstPart + secondPart;
};

export const getCurrentStampDay = () => {
  const date = new Date(DATE_START).setHours(0, 0, 0, 0);
  const now = new Date().setHours(0, 0, 0, 0);
  const days = (now - date) / (1000 * 3600 * 24);
  return parseInt(days) + 1;
};

const monthNames = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export const useImageFade = () => {
  const [style, setStyle] = useState({ opacity: 0 });

  return {
    style,
    onLoad: () => {
      setStyle({ opacity: 1 });
    },
  };
};

export const useTimer = (dateString) => {
  const [timer, setTimer] = useState({});
  let prevInterval = useRef();
  const launchDate = new Date(dateString);
  const launchDateUTC = Date.UTC(
    launchDate.getUTCFullYear(),
    launchDate.getUTCMonth(),
    launchDate.getUTCDate(),
    0,
    0,
    0
  );

  useEffect(() => {
    function updateTimer() {
      const nowDate = new Date();
      var duration =
        launchDateUTC -
        Date.UTC(
          nowDate.getUTCFullYear(),
          nowDate.getUTCMonth(),
          nowDate.getUTCDate(),
          nowDate.getUTCHours(),
          nowDate.getUTCMinutes(),
          nowDate.getUTCSeconds()
        );
      const seconds = Math.floor((duration / 1000) % 60);
      const minutes = Math.floor((duration / (1000 * 60)) % 60);
      let hours = Math.floor(duration / (1000 * 60 * 60));
      if (hours > 24) hours = hours % 24;
      const days = Math.floor(duration / (1000 * 60 * 60 * 24));
      setTimer({
        days: days > 9 ? "" + days : "0" + days,
        hours: hours > 9 ? "" + hours : "0" + hours,
        minutes: minutes > 9 ? "" + minutes : "0" + minutes,
        seconds: seconds > 9 ? "" + seconds : "0" + seconds,
      });
    }
    if (prevInterval.current) {
      clearInterval(prevInterval.current);
    }
    updateTimer();
    prevInterval.current = setInterval(updateTimer, 1000);
  }, [dateString, launchDateUTC]);

  return {
    timer,
  };
};

export const isPrime = (num) => {
  for (let i = 2; i < num; i++) if (num % i === 0) return false;
  return num > 1;
};

export const getVideoDisplayLink = (num) => {
  if (num <= 9) return `/videos/00${num}.mp4`;
  if (num <= 99) return `/videos/0${num}.mp4`;
  return `/videos/${num}.mp4`;
};

export function prettyPrintDate(date_string, must) {
  if (!date_string) return "";
  const dt = new Date(date_string);
  if (!dt) return "";
  const seconds = Math.floor((new Date() - dt) / 1000);
  let interval = seconds / 86400;
  // if more than a week ago print date
  if (interval > 7 || must || seconds < 0) {
    const printedDates = dt.toDateString().split(" ");
    if (printedDates.length > 3)
      return `${printedDates[1]} ${printedDates[2]}, ${printedDates[3]}`;
    return `${printedDates[0]} ${printedDates[1]}, ${printedDates[2]}`;
  }
  if (interval > 1) {
    const days = Math.floor(interval);
    return `${days} day${days > 1 ? "s" : ""} ago`;
  }
  interval = seconds / 3600;
  if (interval > 1) {
    const hourse = Math.floor(interval);
    return `${hourse} hour${hourse > 1 ? "s" : ""} ago`;
  }
  interval = seconds / 60;
  if (interval > 1) {
    return `${Math.floor(interval)} minutes ago`;
  }
  return `${Math.floor(seconds)} seconds ago`;
}

export function randomIntFromInterval(min, max) {
  // min and max included
  return Math.floor(Math.random() * (max - min + 1) + min);
}

export const toHex = (num) => {
  return "0x" + num.toString(16);
};

export const fromHex = (hexString) => {
  return parseInt(hexString, 16);
};

export const getWithCommas = (value) => {
  if (value <= 0) return "...";
  return value
    .toFixed(0)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

export const printAddress = (_add) => {
    if(!_add) return "0x000";
    return (
      _add?.substr(0, 6).toUpperCase() +
      "..." +
      _add?.substr(_add.length - 4).toUpperCase()
    );
  };

export const printBalance = (_bal) => {
    if(!_bal) return "0";
    return parseFloat(_bal).toFixed(3)
            ?.toString()
            ?.substring(0, 11);
}

export const getRandPrice = (_index) => {
  if(_index === 0)
    return "0.000";
  if(_index >= 0)
  return _index/1000;
  return Math.floor((Math.random() * 999) + 1)/1000;
}

