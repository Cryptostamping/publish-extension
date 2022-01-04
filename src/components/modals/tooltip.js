/* eslint-disable react/destructuring-assignment */
import React, {memo, useState } from "react";
import Popup from "reactjs-popup";

import styles from "~/src/components/modals/tooltip.module.scss";

import { prettyPrintDate } from "~/src/lib/utils";

// eslint-disable-next-line react/display-name
const Tooltip = memo((props) => {
  return (
    <Popup
      key={props.key}
      open={props.open}
      onOpen={props.onOpen}
      arrow={props.arrow ? props.arrow : false}
      mouseEnterDelay={props.delay ? props.delay : 500}
      trigger={() => props.trigger}
      position={props.position ? props.position : "top left"}
      on={props.on ? props.on : ["hover", "focus"]}
      keepTooltipInside={true}
      className={`${props.theme}-cryptostamping-popup cryptostamping-popup`}
      nested={false || props.nested}
    >
      {(close) => (
        <div onClick={()=> {
          if(props.closeOnClick) close();
        }}
        className={`${styles.popup_tooltip} ${props.popupClass}`}>
          {props.description && (
            <div className={styles.popup_box}>
              <p>{props.description}</p>
            </div>
          )}
          {props.children}
        </div>
      )}
    </Popup>
  );
});
Tooltip.displayName ="popup-tooltip"

export default Tooltip;
