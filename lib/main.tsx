import React from "react";
import ReactDOM from "react-dom/client";

import Captcha from "./components/Captcha";

interface NewCaptchaProps {
  el: HTMLElement;
  instance: string;
  siteKey: string;
  maxDots?: number;
  maxFailCount?: number;
}
export const NewCaptcha = ({
  el,
  instance,
  siteKey,
  maxDots = 5,
  maxFailCount = 3,
}: NewCaptchaProps) => {
  return ReactDOM.createRoot(el).render(
    <React.StrictMode>
      <Captcha
        instance={instance}
        siteKey={siteKey}
        maxDots={maxDots}
        maxFailCount={maxFailCount}
      />
    </React.StrictMode>,
  );
};

export default NewCaptcha;
