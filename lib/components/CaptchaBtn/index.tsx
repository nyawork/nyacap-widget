import { Fragment, useState } from "react";

import Tooltip from "rc-tooltip";
import "./tooltip-styles.css";

import CaptchaBody from "../CaptchaBody";

import "./styles.css";

import DefaultImg from "./images/default.svg";
import CheckImg from "./images/check.svg";
import ErrorImg from "./images/error.svg";
import SuccessImg from "./images/success.svg";

const iconMap = {
  default: DefaultImg,
  check: CheckImg,
  error: ErrorImg,
  over: ErrorImg,
  success: SuccessImg,
};

const messageMap = {
  default: <>点击按键开始验证</>,
  check: <>正在验证···</>,
  error: (
    <>
      验证失败，不妨<b>再试一次</b>？
    </>
  ),
  over: <>失败次数过多，等会再来吧</>,
  success: <>验证通过</>,
};

interface CaptchaBtnProps {
  captStatus: Status;
  width: string;
  height: string;
  maxDots: number;
  imageBase64: string | null;
  thumbBase64: string | null;

  refresh: () => void;
  confirm: (dots: Dot[]) => void;
  cancel: () => void;
}
const CaptchaBtn = ({
  captStatus,
  width,
  height,
  maxDots,
  imageBase64,
  thumbBase64,
  refresh,
  confirm,
  cancel,
}: CaptchaBtnProps) => {
  const [popoverVisible, setPopoverVisible] = useState(false);

  // ================= Methods ================
  // const handleCancelEvent = (e: React.MouseEvent<HTMLButtonElement>) => {
  //   // 阻止合成事件的冒泡
  //   e.stopPropagation();
  //   // 阻止与原生事件的冒泡
  //   e.nativeEvent.stopImmediatePropagation();
  //   return false;
  // };

  const handleVisibleChange = (visible: boolean) => {
    if (visible) {
      // 从关到开，更新验证码状态
      setPopoverVisible(true);
      handleRefreshEvent();
    } else {
      // 从开到关，清理验证码状态
      handleCancelEvent();
    }
  };

  const handleBtnEvent = () => {
    setPopoverVisible(true); // 打开验证码界面
  };

  const handleRefreshEvent = () => {
    refresh(); // 加载验证码
  };

  const handleConfirmEvent = (data: Dot[]) => {
    confirm(data); // 提交
    handleCloseEvent();
  };

  const handleCloseEvent = () => {
    setPopoverVisible(false); // 关闭验证码界面
  };

  const handleCancelEvent = () => {
    cancel();
    handleCloseEvent();
  };

  return (
    <Fragment>
      <div
        className="cap-btn"
        style={{
          width: width,
          height: height,
        }}
      >
        <div className={`cap-btn__inner cap-active__${captStatus}`}>
          {/*弹出验证码*/}
          <Tooltip
            overlay={
              <CaptchaBody
                // value={popoverVisible}
                width="300px"
                height="240px"
                maxDots={maxDots}
                calcPosType="screen"
                imageBase64={imageBase64}
                thumbBase64={thumbBase64}
                cancel={handleCancelEvent}
                refresh={handleRefreshEvent}
                confirm={handleConfirmEvent}
              />
            }
            trigger={"click"}
            visible={popoverVisible}
            onVisibleChange={handleVisibleChange}
            placement="top"
            forceRender={true}
            motion={{
              motionName: "nc-popup-zoom",
              motionDeadline: 1000,
            }}
            overlayInnerStyle={{
              backgroundColor: "#fff",
              padding: "12px",
            }}
            prefixCls="nc-popup"
            align={{
              offset: [0, -12],
            }}
          >
            {/*按钮*/}
            <button
              onClick={handleBtnEvent}
              className={`cap-state__${captStatus}`}
              disabled={
                captStatus === "check" ||
                captStatus === "success" ||
                captStatus === "over"
              }
            >
              <div
                className={`cap-btn__ico${captStatus === "default" ? " cap-btn__verify" : ""}`}
              >
                <img src={iconMap[captStatus]} alt={captStatus} />
              </div>
              <span className="cap-btn__text">{messageMap[captStatus]}</span>
            </button>
          </Tooltip>
        </div>
      </div>
    </Fragment>
  );
};

export default CaptchaBtn;
