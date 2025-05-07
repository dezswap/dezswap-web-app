import { isMobile } from "@xpla/wallet-controller/utils/browser-check";
import SimpleBar from "simplebar";

function initCustomScrollbar() {
  if (isMobile()) {
    return;
  }
  if (document.body.getAttribute("data-simplebar") === "init") {
    return;
  }
  const simpleBar = new SimpleBar(document.body, {
    scrollableNode: document.body,
    autoHide: false,
  });
  window.addEventListener("scroll", simpleBar.onScroll);

  simpleBar.positionScrollbar = function positionScrollbar(
    axis: "x" | "y" = "y",
  ) {
    const { scrollbar, track } = this.axis[axis];

    if (
      !this.axis[axis].isOverflowing ||
      !this.contentWrapperEl ||
      !scrollbar.el ||
      !track.el ||
      !this.elStyles
    ) {
      return;
    }

    const contentSize = this.contentWrapperEl[this.axis[axis].scrollSizeAttr];
    const trackSize = parseInt(
      window.getComputedStyle(track.el)[this.axis[axis].sizeAttr],
      10,
    );

    this.axis.x.scrollbar.size = this.getScrollbarSize("x");
    this.axis.y.scrollbar.size = this.getScrollbarSize("y");

    let scrollOffset = axis === "x" ? window.scrollX : window.scrollY;

    scrollOffset =
      axis === "x" && this.isRtl && SimpleBar.rtlHelpers?.isScrollOriginAtZero
        ? -scrollOffset
        : scrollOffset;

    if (axis === "x" && this.isRtl) {
      scrollOffset = SimpleBar.rtlHelpers?.isScrollingToNegative
        ? scrollOffset
        : -scrollOffset;
    }

    const scrollPercent = scrollOffset / (contentSize - trackSize);

    let handleOffset = (trackSize - scrollbar.size) * scrollPercent;
    handleOffset =
      axis === "x" && this.isRtl
        ? -handleOffset + (trackSize - scrollbar.size)
        : handleOffset;

    scrollbar.el.style.transform =
      axis === "x"
        ? `translate3d(${handleOffset}px, 0, 0)`
        : `translate3d(0, ${handleOffset}px, 0)`;
  };
}

initCustomScrollbar();
