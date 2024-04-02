import React from "react";
import ReactDOM from "react-dom/client";

import Captcha from "./components/Captcha";

interface NewCaptchaProps {
  el: HTMLElement;
  instance: string;
  siteKey: string;
  maxDots?: number;
  maxFailCount?: number;

  // 两种调用方式：构建一个 input ，或者用 callbacks
  inputName?: string;

  cbSuccess?: (key: string) => void;
  cbFail?: () => void;
  cbTimeout?: () => void;
}
export const NewCaptcha = ({
  el,
  instance,
  siteKey,
  maxDots = 5,
  maxFailCount = 3,

  inputName = "captcha",
  cbSuccess,
  cbFail,
  cbTimeout,
}: NewCaptchaProps) =>
  ReactDOM.createRoot(el).render(
    <React.StrictMode>
      <Captcha
        instance={instance}
        siteKey={siteKey}
        maxDots={maxDots}
        maxFailCount={maxFailCount}
        inputName={inputName}
        cbSuccess={cbSuccess}
        cbFail={cbFail}
        cbTimeout={cbTimeout}
      />
    </React.StrictMode>,
  );

// Classic captcha wrapper
(window as any).nyacap = {
  render: (
    el: HTMLElement,
    options: {
      sitekey: string; // https://mini.nyacap.com/widget?sitekey=demo
      theme?: "light" | "dark";
      callback?: (key: string) => void;
      "expired-callback"?: () => void;
      "error-callback"?: () => void;
    },
  ) => {
    const parsedSiteKey = new URL(options.sitekey);
    const instance = parsedSiteKey.origin;
    const siteKey = parsedSiteKey.searchParams.get("sitekey");

    if (siteKey === null) {
      throw new Error("未定义 sitekey");
    }

    NewCaptcha({
      el,
      instance,
      siteKey,
      inputName: undefined,
      cbSuccess: options.callback,
      cbFail: options["error-callback"],
      cbTimeout: options["expired-callback"],
    });
  },
};
