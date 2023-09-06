<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script>
export default {
  methods: {
    /*
      功能: 看板娘的鼠标拖动移动功能
    */
    addKBNMouseClickEvent() {
      const waifu = document.getElementById("waifu");
      const waifuTool = document.getElementById("waifu-tool");
      if (!waifu || !waifuTool) {
        return;
      }

      // 记录鼠标按下时的初始位置
      let startX;
      let startY;

      const mousedown = (event) => {
        // 这个表示鼠标移动的距离
        let innerX = event.clientX - waifu.offsetLeft;
        let innerY = event.clientY - waifu.offsetTop;

        // 移动时
        document.onmousemove = function (event) {
          // 这两个auto非常有必要, 否则移动的时候其他组件不会一起移动
          waifu.style.bottom = "auto";
          waifu.style.right = "auto";

          waifu.style.left = event.clientX - innerX + "px";
          waifu.style.top = event.clientY - innerY + "px";
        };

        // 抬起时
        document.onmouseup = function () {
          document.onmousemove = null;
          document.mousedown = null;
          control();
          waifu.style.borderWidth = "";
          waifu.style.borderStyle = "";
          waifu.style.borderColor = "";
        };
      };

      // 超出边界处理
      const control = function () {
        if (waifu.offsetLeft < 0) {
          waifu.style.left = 0 + "px";
        }

        if (waifu.offsetTop < 0) {
          waifu.style.top = 0 + "px";
        }

        if (waifu.offsetLeft + parseInt(waifu.style.width) > window.innerWidth) {
          waifu.style.left = window.innerWidth - parseInt(waifu.style.width) + "px";
        }

        if (waifu.offsetTop + parseInt(waifu.style.height) > window.innerHeight) {
          waifu.style.top = window.innerHeight - parseInt(waifu.style.height) + "px";
        }
        waifu.style.bottom = "auto";
        waifu.style.right = "auto";
      };

      // 按下时
      waifu.addEventListener("mousedown", mousedown, false);
    },
  },
  // 使用最原始的方法, 给看板娘增加鼠标点击事件, 进行移动
  mounted() {
    setTimeout(() => {
      this.addKBNMouseClickEvent();
    }, 5000);
  },
};
</script>

<style>
@import "~@/assets/css/main.css";
@import "~@/assets/css/kanbanniang.css";
@import "~@/assets/css/color-dark.css"; /*深色主题*/
/*@import "./assets/css/theme-green/color-green.css";   浅绿色主题*/
</style>
