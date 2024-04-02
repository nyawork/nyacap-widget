import React from "react";
import { createRoot, type Root } from "react-dom/client";

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
}: NewCaptchaProps): Root => {
  const reactRoot = createRoot(el);
  reactRoot.render(
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

  return reactRoot;
};

// Classic captcha wrapper
const nyacapManager = {
  idMap: new Map<string, Root>(), // 记录 ID 和对应的 DOM 元素，方便下面的管理相关操作
  counter: 0, // 记录当前页面上生成了多少个 NyaCap
};
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

    const captchaRoot = NewCaptcha({
      el,
      instance,
      siteKey,
      inputName: undefined,
      cbSuccess: options.callback,
      cbFail: options["error-callback"],
      cbTimeout: options["expired-callback"],
    });

    nyacapManager.counter++; // 计数器自增
    const captchaID = `nyacap-${nyacapManager.counter.toString()}`;
    nyacapManager.idMap.set(captchaID, captchaRoot); // 记录映射关系，方便在下面使用 ID 来管理
  },

  remove: (id: string) => {
    if (nyacapManager.idMap.has(id)) {
      nyacapManager.idMap.get(id)?.unmount();
      nyacapManager.idMap.delete(id);
    }
  },

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
