import React from "react";
import ReactDOM from "react-dom";

import { MoralisProvider } from "react-moralis";
import { Provider } from "react-redux";

import "./index.css";
import "./styles/globals.scss";
//import "./styles/ui_lib/bootstrap-reboot.min.css";
import "./styles/ui_lib/bootstrap-grid.css";
//import 'reactjs-popup/dist/index.css';
 import Layout from "./Layout";
// import App from "./App";
// Find all widget divs


const RootDiv = document.querySelector("#root");

ReactDOM.render(
  <React.StrictMode>
    <Layout domElement={RootDiv} />
  </React.StrictMode>,
  RootDiv
);
