import { Fragment } from "preact";
import { useEffect, useState } from "preact/hooks";

import "./styles.css";

import LoadingImg from "./images/loading.svg";
import CloseImg from "./images/close.svg";
import RefreshImg from "./images/refresh.svg";

interface CaptchaBodyProps {
  width: string;
  height: string;
  calcPosType: "dom" | "screen";
  imageBase64: string | null;
  thumbBase64: string | null;

  cancel: () => void;
  refresh: () => void;
  confirm: (dots: Dot[]) => void;
}
const CaptchaBody = ({
  width,
  height,
  calcPosType,
  imageBase64,
  thumbBase64,
  cancel,
  refresh,
  confirm,
}: CaptchaBodyProps) => {
  const [dots, setDots] = useState<Dot[]>([]);

  useEffect(() => {
    // 图片更换时重设标记点
    setDots([]);
  }, [imageBase64]);

  // ================= Methods ================
  /**
   * @Description: 处理关闭事件
   */
  const handleCancelEvent = () => {
    setDots([]);
    cancel();
    // setImageBase64Code("")
    // setThumbBase64Code("")
  };

  /**
   * @Description: 处理刷新事件
   */
  const handleRefreshEvent = () => {
    setDots([]);
    refresh();
  };

  /**
   * @Description: 处理确认事件
   */
  const handleConfirmEvent = () => {
    confirm(dots);
  };

  /**
   * @Description: 处理dot
   * @param e
   */
  const handleClickPos = (e: MouseEvent | TouchEvent) => {
    e.preventDefault();
    const dom = e.currentTarget;

    const { domX, domY } = getDomXY(dom as HTMLElement);
    // ===============================================
    // @notice 如 getDomXY 不准确可尝试使用 calcLocationLeft 或 calcLocationTop
    // const domX = this.calcLocationLeft(dom)
    // const domY = this.calcLocationTop(dom)
    // ===============================================

    let dotX, dotY;
    if (
      window.TouchEvent && // Firefox 不支持触摸事件
      e instanceof TouchEvent
    ) {
      // 触摸事件
      dotX = e.touches[0].clientX;
      dotY = e.touches[0].clientY;
    } else if (e instanceof MouseEvent) {
      // 鼠标点击事件
      dotX = e.clientX;
      dotY = e.clientY;
    } // 其他就没办法了
    if (calcPosType === "dom") {
      dotX += document.body.offsetLeft;
      dotY += document.body.offsetTop;
    }

    // 计算点击的相对位置
    const relX = dotX - domX;
    const relY = dotY - domY;

    // 减去点的一半
    const newDots = [
      ...dots,
      {
        x: Math.round(relX),
        y: Math.round(relY),
        index: dots.length + 1,
      },
    ];

    setDots(newDots);

    return false;
  };
  /**
   * @Description: 找到元素的屏幕位置
   * @param dom
   */
  const getDomXY = (dom: HTMLElement) => {
    let x = 0;
    let y = 0;
    if (dom.getBoundingClientRect) {
      let box = dom.getBoundingClientRect();
      let D = document.documentElement;
      x =
        box.left +
        Math.max(D.scrollLeft, document.body.scrollLeft) -
        D.clientLeft;
      y =
        box.top + Math.max(D.scrollTop, document.body.scrollTop) - D.clientTop;
    } else {
      let dp: HTMLElement | null = dom;
      while (dp && dp !== document.body) {
        x += dp.offsetLeft;
        y += dp.offsetTop;
        dp = dp.offsetParent as HTMLElement | null;
      }
    }
    return {
      domX: x,
      domY: y,
    };
  };

  // useEffect(() => {
  //   if (value) {
  //     refresh()
  //   }
  // }, [value]);

  return (
    <Fragment>
      <div className="cap-wrap">
        <div className="cap-wrap__header">
          <span>
            请在下图<em>依次</em>点击：
          </span>
          {thumbBase64 && (
            <img
              className="cap-wrap__thumb"
              src={thumbBase64}
              alt="待点击文字"
            />
          )}
        </div>
        <div
          className="cap-wrap__body"
          style={{
            width: width,
            height: height,
          }}
        >
          <img
            className="cap-wrap__loading"
            src={LoadingImg}
            alt="正在加载中..."
          />
          {imageBase64 && (
            <img
              className="cap-wrap__picture"
              src={imageBase64}
              alt="验证码主图"
              onClick={handleClickPos}
              draggable={false}
            />
          )}

          {/*渲染定位*/}
          {dots.map((dot) => (
            <Fragment key={dot.index}>
              <div
                className="cap-wrap__dot"
                style={{ top: `${dot.y}px`, left: `${dot.x}px` }}
              >
                <span>{dot.index}</span>
              </div>
            </Fragment>
          ))}
        </div>
        <div className="cap-wrap__footer">
          <div className="cap-wrap__ico">
            <img onClick={handleCancelEvent} src={CloseImg} alt="关闭" />
            <img onClick={handleRefreshEvent} src={RefreshImg} alt="刷新" />
          </div>
          <div className="cap-wrap__btn">
            <button onClick={handleConfirmEvent}>确认</button>
          </div>
        </div>
      </div>
    </Fragment>
  );
};

export default CaptchaBody;
