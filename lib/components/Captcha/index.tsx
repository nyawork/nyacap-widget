import { Fragment } from "preact";
import { useRef, useState } from "preact/hooks";
import CaptchaBtn from "../CaptchaBtn";
import Tooltip from "rc-tooltip";
import CaptchaBody from "../CaptchaBody";

import "./styles.css";
import "./tooltip-styles.css";

interface CaptchaProps {
  instance: string;
  siteKey: string;
  maxFailCount: number;

  // 两种调用方式：构建一个 input ，或者用 callbacks
  inputName?: string;

  cbSuccess?: (key: string) => void;
  cbError?: () => void;
  cbTimeout?: () => void;
}
const Captcha = ({
  instance,
  siteKey,
  maxFailCount,
  inputName,
  cbSuccess,
  cbError,
  cbTimeout,
}: CaptchaProps) => {
  const [captKey, setCaptKey] = useState("");

  const [isCaptchaBodyOpen, setIsCaptchaBodyOpen] = useState(false);

  const [captStatus, setCaptStatus] = useState<Status>("default");
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [thumbBase64, setThumbBase64] = useState<string | null>(null);

  const captAutoRefreshCount = useRef(0);

  const captTimeoutHandler = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cancelTimeout = () => {
    if (captTimeoutHandler.current) {
      clearTimeout(captTimeoutHandler.current);
      captTimeoutHandler.current = null;
    }
  };
  const setCaptTimeoutEvent = (when: number) => {
    // 清除上一个超时事件
    cancelTimeout();

    // 设置新的超时事件
    captTimeoutHandler.current = setTimeout(() => {
      handleCloseEvent();

      // 设置为超时状态
      setCaptStatus("timeout");

      // 回调超时事件
      if (cbTimeout) {
        cbTimeout();
      }
    }, when - new Date().getTime());
  };

  const handleRequestCaptcha = async () => {
    // 清理当前的
    setImageBase64(null);
    setThumbBase64(null);

    // 更新验证码状态
    setCaptStatus("check");
    try {
      const captcha = await fetch(
        `${instance}/captcha/request/${siteKey}`,
      ).then(async (res) => {
        if (res.ok) {
          return res.json();
        } else {
          const errRes = await res.json();
          throw new Error(errRes.message);
        }
      });
      setCaptKey(captcha.k);
      setImageBase64(captcha.b);
      setThumbBase64(captcha.t);
      setCaptTimeoutEvent(captcha.e * 1000); // 将 Unix 秒转换为毫秒
    } catch (e) {
      console.log(e);
      if (cbError) {
        cbError();
      }
    }
  };

  const handleSubmitCaptcha = async (dots: Dot[]) => {
    // 提交了就不用再在意是否超时了
    cancelTimeout();

    try {
      const res = await fetch(`${instance}/captcha/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          d: dots,
          k: captKey,
        }),
      }).then((res) => res.json());

      if (res.s) {
        setCaptStatus("success");
        captAutoRefreshCount.current = 0;
        if (cbSuccess) {
          cbSuccess(captKey);
        }
        setCaptTimeoutEvent(res.e * 1000); // 将 Unix 秒转换为毫秒
      } else {
        if (captAutoRefreshCount.current > maxFailCount) {
          // 错误次数太多，歇一会吧
          setCaptStatus("over");
        } else {
          // 可以重试
          setCaptStatus("error");
          captAutoRefreshCount.current += 1;
        }
      }
    } catch (e) {
      console.log(e);
      if (cbError) {
        cbError();
      }
    }
  };

  const handleOpenCaptchaBody = () => {
    setIsCaptchaBodyOpen(true);
    handleRequestCaptcha();
  };

  const handleConfirmEvent = (data: Dot[]) => {
    handleSubmitCaptcha(data); // 提交
    handleCloseEvent();
  };

  const handleCloseEvent = () => {
    setIsCaptchaBodyOpen(false); // 关闭验证码界面
  };

  const handleCancelEvent = () => {
    setCaptStatus("default");
    handleCloseEvent();

    // 取消了就不用再在意是否超时了
    cancelTimeout();
  };

  const handleCaptchaBodyVisibleChange = (visible: boolean) => {
    if (visible) {
      // 从关到开，更新验证码状态
      handleOpenCaptchaBody();
    } else {
      // 从开到关，清理验证码状态
      handleCancelEvent();
    }
  };

  return (
    <>
      <Fragment>
        <div className="cap-btn">
          <div className={`cap-btn__inner cap-active__${captStatus}`}>
            {/*弹出验证码*/}
            <Tooltip
              overlay={
                <CaptchaBody
                  width="300px"
                  height="240px"
                  calcPosType="screen"
                  imageBase64={imageBase64}
                  thumbBase64={thumbBase64}
                  cancel={handleCancelEvent}
                  refresh={handleRequestCaptcha}
                  confirm={handleConfirmEvent}
                />
              }
              trigger={"click"}
              visible={isCaptchaBodyOpen}
              onVisibleChange={handleCaptchaBodyVisibleChange}
              placement="top"
              destroyTooltipOnHide={true}
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
              <CaptchaBtn
                captStatus={captStatus}
                openCaptchaBody={handleOpenCaptchaBody}
              />
            </Tooltip>
          </div>
        </div>
      </Fragment>

      {inputName && (
        <input
          style={{
            visibility: "hidden",
          }}
          name={inputName}
          value={captStatus === "success" ? captKey : ""}
          type="password"
          required
          readOnly
        />
      )}
    </>
  );
};

export default Captcha;
