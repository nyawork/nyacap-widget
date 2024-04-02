import { Fragment, useRef, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import CaptchaBtn from "../CaptchaBtn";
import Tooltip from "rc-tooltip";
import CaptchaBody from "../CaptchaBody";

import "./styles.css";
import "./tooltip-styles.css";

interface CaptchaProps {
  instance: string;
  siteKey: string;
  maxDots: number;
  maxFailCount: number;
  inputName: string;
}
const Captcha = ({
  instance,
  siteKey,
  maxDots,
  maxFailCount,
  inputName,
}: CaptchaProps) => {
  const [captKey, setCaptKey] = useState("");
  const [captStatus, setCaptStatus] = useState<Status>("default");
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [thumbBase64, setThumbBase64] = useState<string | null>(null);

  const captAutoRefreshCount = useRef(0);

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
    } catch (e) {
      console.log(e);
      toast.error("获取验证数据失败");
    }
  };

  const handleSubmitCaptcha = async (dots: Dot[]) => {
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
        toast.success("验证通过");
        setCaptStatus("success");
        captAutoRefreshCount.current = 0;
      } else {
        toast.error("验证失败");

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
      toast.error("获取验证数据失败");
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
  };

  const [isCaptchaBodyOpen, setIsCaptchaBodyOpen] = useState(false);

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
                  maxDots={maxDots}
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
              <CaptchaBtn
                captStatus={captStatus}
                openCaptchaBody={handleOpenCaptchaBody}
              />
            </Tooltip>
          </div>
        </div>
      </Fragment>

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

      <Toaster />
    </>
  );
};

export default Captcha;
