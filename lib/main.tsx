import { render } from "preact";
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
  cbError?: () => void;
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
  cbError,
  cbTimeout,
}: NewCaptchaProps) => {
  return render(
    <Captcha
      instance={instance}
      siteKey={siteKey}
      maxDots={maxDots}
      maxFailCount={maxFailCount}
      inputName={inputName}
      cbSuccess={cbSuccess}
      cbError={cbError}
      cbTimeout={cbTimeout}
    />,
    el,
  );
};

// Classic captcha wrapper
(window as any).nyacap = {
  render: (
    el: HTMLElement,
    options: {
      sitekey: string; // https://mini.nyacap.com/widget?sitekey=demo
      instance?: string;
      theme?: "light" | "dark";
      callback?: (key: string) => void;
      "expired-callback"?: () => void;
      "error-callback"?: () => void;
    },
  ) => {
    let instance, siteKey;

    // 两种配置方式：分别指定 instance 和 siteKey ，或合并到一起
    if (options.instance) {
      instance = options.instance;
      siteKey = options.sitekey;
    } else {
      const parsedSiteKey = new URL(options.sitekey);
      instance = parsedSiteKey.origin;
      siteKey = parsedSiteKey.searchParams.get("sitekey");
    }

    if (siteKey === null) {
      throw new Error("未定义 sitekey");
    }

    NewCaptcha({
      el,
      instance,
      siteKey,
      inputName: undefined,
      cbSuccess: options.callback,
      cbError: options["error-callback"],
      cbTimeout: options["expired-callback"],
    });
  },

  // remove: (id?: string) => {
  //   // TODO
  // },

  // execute: (id: string) => {
  //   // TODO
  // };
  // reset: (id?: string) => {
  //   // TODO
  // };
  // getResponse: (id: string) => {
  //   // TODO
  // };
};
