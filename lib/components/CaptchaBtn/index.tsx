import type { ReactNode } from "react";

import "./styles.css";

import DefaultImg from "./images/default.svg";
import CheckImg from "./images/check.svg";
import ErrorImg from "./images/error.svg";
import SuccessImg from "./images/success.svg";

const iconMap: {
  readonly [_ in Status]: string;
} = {
  default: DefaultImg,
  check: CheckImg,
  error: ErrorImg,
  over: ErrorImg,
  success: SuccessImg,
  timeout: ErrorImg,
};

const messageMap: {
  readonly [_ in Status]: ReactNode;
} = {
  default: <>点击按键开始验证</>,
  check: <>正在验证···</>,
  error: (
    <>
      验证失败，不妨<b>再试一次</b>？
    </>
  ),
  over: <>失败次数过多，等会再来吧</>,
  success: <>验证通过</>,
  timeout: (
    <>
      验证超时，<b>再试一次</b>吧
    </>
  ),
};

interface CaptchaBtnProps {
  captStatus: Status;
  openCaptchaBody: () => void;
}
const CaptchaBtn = ({ captStatus, openCaptchaBody }: CaptchaBtnProps) => (
  <button
    onClick={openCaptchaBody}
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
);

export default CaptchaBtn;
