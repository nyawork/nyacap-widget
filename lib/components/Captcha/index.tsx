import { useRef, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import CaptchaBtn from "../CaptchaBtn";

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
      ).then((res) => res.json());
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

  const handleCancel = () => {
    setCaptStatus("default");
  };

  return (
    <>
      <CaptchaBtn
        captStatus={captStatus}
        width="100%"
        height="50px"
        maxDots={maxDots}
        imageBase64={imageBase64}
        thumbBase64={thumbBase64}
        confirm={handleSubmitCaptcha}
        refresh={handleRequestCaptcha}
        cancel={handleCancel}
      />
      <input
        style={{
          visibility: "hidden",
        }}
        name={inputName}
        value={captKey}
        readOnly
      />
      <Toaster />
    </>
  );
};

export default Captcha;
