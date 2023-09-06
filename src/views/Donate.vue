<template>
  <div>
    <div class="crumbs">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item>
          <i class="el-icon-lx-redpacket_fill"></i>
          支持作者
        </el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div class="payparent">
      <div class="container">
        <div class="plugins-tips">如果该框架对你有帮助，那就请作者喝杯饮料吧！</div>
        <div class="paycode">
          <img src="https://image.unusebamboo.top/bamboo/zhifubao.JPG" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {};
</script>

<style scope>
/* 设置图片的固定高度 */
.paycode {
  width: 100%;
  height: 400px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.paycode img {
  height: 100%;
}

/* 居中 */
.payparent {
  position: relative;
  height: 800px;
}
</style>
