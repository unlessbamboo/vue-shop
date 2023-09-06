import Vue from "vue";

/*
 * v-dialogDrag: 弹窗拖拽属性自定义指令,  可以将<el-dialog> 组件绑定到鼠标拖拽事件上，实现拖拽弹框的效果
 * el-dialog__header: 它用于定位和样式化对话框的头部元素, 如设置背景颜色、字体样式、边框等
 */
Vue.directive("dialogDrag", {
  bind(el, binding, vnode, oldVnode) {
    const dialogHeaderEl = el.querySelector(".el-dialog__header");
    const dragDom = el.querySelector(".el-dialog");

    // a. 更改css样式
    dialogHeaderEl.style.cssText += ";cursor:move;";
    dragDom.style.cssText += ";top:0px;";

    /*
     * b. IIFE自调用, 根据浏览器返回返回一个用于获取元素样式的函数, 匿名函数如下:
     *    window.document.currentStyle: IE, 使用 currentStyle 属性来获取元素样式
     *    标准浏览器: 使用 getComputedStyle 函数来获取元素样式
     *
     *  getComputedStyle(element, pseudoElement): 获取元素计算后的样式的方法
     *  getComputedStyle(dom, false)中false被当成空串, 等价于getComputedStyle(dom)
     *  例子:
     *    getComputedStyle(dom).width: 获取dom元素的宽度
     */
    const sty = (() => {
      if (window.document.currentStyle) {
        return (dom, attr) => dom.currentStyle[attr];
      } else {
        return (dom, attr) => getComputedStyle(dom, false)[attr];
      }
    })();

    /*
     * c. 鼠标按下的回调函数, 其处理逻辑如下:
     *    1) 获取当前位置X,Y, 获取当前body的宽和高, 对话框自身的高宽,由此计算出最小的往左移动距离,最大的距离
     *    2) 在每次鼠标移动之后, 需要重新计算距离并重新渲染对话框: dom.style.cssType: left:?; top:?
     *    3) 鼠标放开之后将两个回调事件注销.
     */
    dialogHeaderEl.onmousedown = (e) => {
      // 计算当前元素距离可视区的距离
      const disX = e.clientX - dialogHeaderEl.offsetLeft;
      const disY = e.clientY - dialogHeaderEl.offsetTop;

      const screenWidth = document.body.clientWidth; // body当前宽度
      const screenHeight = document.documentElement.clientHeight; // 可见区域高度(应为body高度，可某些环境下无法获取)

      const dragDomWidth = dragDom.offsetWidth; // 对话框宽度
      const dragDomheight = dragDom.offsetHeight; // 对话框高度

      const minDragDomLeft = dragDom.offsetLeft; // 获取元素相对于其父元素的左边水平偏移量
      const maxDragDomLeft = screenWidth - dragDom.offsetLeft - dragDomWidth;

      const minDragDomTop = dragDom.offsetTop; // 获取元素相对于其父元素的上边垂直偏移量
      const maxDragDomTop = screenHeight - dragDom.offsetTop - dragDomheight;

      // 获取到的值带px 正则匹配替换
      let styL = sty(dragDom, "left");
      let styT = sty(dragDom, "top");

      // 注意在ie中 第一次获取到的值为组件自带50% 移动之后赋值为px
      if (styL.includes("%")) {
        styL = +document.body.clientWidth * (+styL.replace(/\%/g, "") / 100);
        styT = +document.body.clientHeight * (+styT.replace(/\%/g, "") / 100);
      } else {
        styL = +styL.replace(/\px/g, "");
        styT = +styT.replace(/\px/g, "");
      }

      document.onmousemove = function (e) {
        // 通过事件委托，计算移动的距离
        let left = e.clientX - disX;
        let top = e.clientY - disY;

        // 边界处理
        if (-left > minDragDomLeft) {
          left = -minDragDomLeft;
        } else if (left > maxDragDomLeft) {
          left = maxDragDomLeft;
        }

        if (-top > minDragDomTop) {
          top = -minDragDomTop;
        } else if (top > maxDragDomTop) {
          top = maxDragDomTop;
        }

        // 移动当前元素
        dragDom.style.cssText += `;left:${left + styL}px;top:${top + styT}px;`;
      };

      document.onmouseup = function (e) {
        document.onmousemove = null;
        document.onmouseup = null;
      };
    };
  },
});
