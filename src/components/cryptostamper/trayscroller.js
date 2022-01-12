import React, { useRef, useState, useEffect, forwardRef } from "react";

// styles
import main from "~/src/components/cryptostamper/main.module.scss";

const TrayScroller = forwardRef((props, ref) => {
  const tray_outer = useRef(ref);
  const [listScroll, setListScroll] = useState(0);
  const [isLeft, setIsLeft] = useState(false);
  const [isRight, setIsRight] = useState(true);
  const [isScrollable, setScrollable] = useState(true);

  /* display left or right button depending on scrollOffset */
  const setButtons = (offset) => {
    if (offset > 10) {
      setIsLeft(true);
    } else {
      setIsLeft(false);
    }
    if (offset < 990) {
      setIsRight(true);
    } else {
      setIsRight(false);
    }
  };

  /* configure btns based on Scroll Position */
  const handleOuterScroll = (evt) => {
    const percent =
      evt.target.scrollLeft /
      (props.children.props.style.width - props.style.width);
    setListScroll(percent * 1000);
    setButtons(percent * 1000);
    props.onScroll(evt);
  };

  const scrollRight = () => {
    const scroll_left =
      tray_outer.current.scrollLeft + (props.style.width - 120);
    tray_outer.current.scrollTo({ left: scroll_left, behavior: "smooth" });
  };

  const scrollLeft = () => {
    const scroll_left =
      tray_outer.current.scrollLeft - (props.style.width - 120);
    tray_outer.current.scrollTo({ left: scroll_left, behavior: "smooth" });
  };

  useEffect(() => {
    if (
      tray_outer?.current?.childNodes &&
      tray_outer.current.childNodes.length > 0
    )
      tray_outer.current.childNodes[0].style.minWidth =
        tray_outer.current.childNodes[0].style.width;
  }, [props.children]);

  const getTrayWidth = (given_width) => {
    let width = parseInt(given_width);
    if(width > 941) 
      return width - 120;
    return width;
  }

  return (
    <div className="csbs-d-flex csbs-align-items-stretch">
      <div className={main.arrow_container}>
        <div onClick={scrollLeft} className={`${main.btn_arrow} ${isLeft && main.enabled}`}>
          <span className={`${main.left} ${main.icon_arrow} ${!isLeft && main.disabled}`} />
        </div>
      </div>
      <div style={{ flexGrow: 1 }}>
        <div
          ref={tray_outer}
          className={props.className}
          style={{
            ...props.style,
            width: `${getTrayWidth(props.style.width)}px`,
          }}
          onScroll={handleOuterScroll}
        >
          {props.children}
        </div>
      </div>
      <div className={main.arrow_container}>
        <div onClick={scrollRight} className={`${main.btn_arrow} ${isRight && main.enabled}`}>
          <span className={`${main.right} ${main.icon_arrow} ${!isRight && main.disabled}`} />
        </div>
      </div>
    </div>
  );
});
TrayScroller.displayName = "TrayScroller";

export default TrayScroller;
//width: props.style.width, position: "relative"
