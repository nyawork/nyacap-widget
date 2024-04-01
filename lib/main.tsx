import React from "react";
import ReactDOM from "react-dom/client";

import Captcha from "./components/Captcha";

interface NewCaptchaProps {
  el: HTMLElement;
  instance: string;
  siteKey: string;
  maxDots?: number;
  maxFailCount?: number;
  inputName?: string;
}
export const NewCaptcha = ({
  el,
  instance,
  siteKey,
  maxDots = 5,
  maxFailCount = 3,
  inputName = "captcha",
}: NewCaptchaProps) =>
  ReactDOM.createRoot(el).render(
    <React.StrictMode>
      <Captcha
        instance={instance}
        siteKey={siteKey}
        maxDots={maxDots}
        maxFailCount={maxFailCount}
        inputName={inputName}
      />
    </React.StrictMode>,
  );

export default NewCaptcha;
