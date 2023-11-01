<template>
  <div class="reset-password-wrap">
    <div class="ms-reset-password">
      <div class="ms-reset-password-title-container">
        <div class="ms-reset-password-title">重置密码</div>
        <div class="ms-reset-password-title-goto">
          <el-button class="ms-reset-password-title-goto-btn" type="primary" link @click="goToLoginPage">
            返回登录
            <i class="el-icon-arrow-right"></i>
          </el-button>
        </div>
      </div>
      <el-form :model="resetForm" :rules="rules" ref="resetPasswordRef" label-width="0px" class="ms-content">
        <el-form-item prop="email" class="custom-form-item">
          <el-input v-model="resetForm.email" placeholder="请输入邮箱"></el-input>
          <div class="reset-send-code" @click="sendVerifyCode">发送验证码</div>
        </el-form-item>

        <el-form-item prop="verifyCode" class="custom-form-item">
          <el-input v-model="resetForm.verifyCode" placeholder="请输入邮箱验证码"></el-input>
        </el-form-item>

        <el-form-item prop="newPassword" class="custom-form-item">
          <el-input type="password" v-model="resetForm.newPassword" placeholder="请输入新密码"></el-input>
        </el-form-item>
        <el-form-item prop="confirmPassword" class="custom-form-item">
          <el-input type="password" v-model="resetForm.confirmPassword" placeholder="请确认新密码"></el-input>
        </el-form-item>
        <div class="reset-password-btn">
          <el-button type="primary" @click="resetPassword">确认重置密码</el-button>
        </div>
        <p class="reset-password-tips">Tips: 请输入新密码并确认。</p>
      </el-form>
    </div>
  </div>
</template>

<script setup name="reset">
import { ref, computed, watch, onBeforeMount, getCurrentInstance } from "vue";
import { useStore } from "vuex";
import { useRouter, useRoute } from "vue-router";
import provinceInfo from "@/data/province";

// 全局变量
const { proxy } = getCurrentInstance();
const router = useRouter();

const resetForm = ref({
  email: "",
  verifyCode: "",
  newPassword: "",
  confirmPassword: "",
});
const rules = ref({
  email: [{ required: true, message: "请输入邮箱", trigger: "blur" }],
  verifyCode: [{ required: true, message: "请输入邮箱验证码", trigger: "blur" }],
  newPassword: [{ required: true, message: "请输入新密码", trigger: "blur" }],
  confirmPassword: [
    { required: true, message: "请确认新密码", trigger: "blur" },
    {
      validator: (rule, value, callback) => {
        if (value === resetForm.value.newPassword) {
          callback();
        } else {
          callback(new Error("两次输入的密码不一致"));
        }
      },
      trigger: "blur",
    },
  ],
});

function resetPassword() {
  resetPasswordRef.value.validate((valid) => {
    if (valid) {
      // 处理重置密码逻辑，可以在这里提交新密码
      proxy.$eMessage.success("重置密码成功");
      router.push("/auth/login"); // 重置密码成功后跳转到登录页
    } else {
      proxy.$eMessage.error("请输入正确的新密码");
    }
  });
}
/* 进入登录页面 */
function goToLoginPage() {
  router.push("/auth/login");
}
/* 发送验证码 */
function sendVerifyCode() {
  resetForm.value.verifyCode = "V2334";
}
</script>

<style scoped>
.reset-password-wrap {
  position: relative;
  width: 100%;
  height: 100%;
  background-image: url(@/assets/img/login-bg.jpg);
  background-size: 100%;
}

/* 重置密码页面首行样式设置: 标题, 跳转链接, 布局等 */
.ms-reset-password-title-container {
  display: flex;
  width: 100%;
  justify-content: space-between;
  align-items: center;
}
.ms-reset-password-title-container div {
  flex: 1;
  line-height: 50px;
  border-bottom: 1px solid #ddd;
}
.ms-reset-password-title {
  text-align: center;
  font-size: 20px;
  color: #fff;
}
.ms-reset-password-title-goto {
  text-align: right;
  padding-right: 20px;
}
.ms-reset-password-title-goto .el-button--text {
  font-size: 12px;
  color: #fff;
}

/* 重置密码页面输入框 */
.ms-reset-password {
  position: absolute;
  width: 350px;
  /* 在宽度确定, 高度不确定的情况下, Y轴居中 */
  top: 50%;
  right: 0%;
  margin: 0 50px 0 0;
  transform: translateY(-50%);
  border-radius: 5px;
  background: rgba(255, 255, 255, 0.3);
  overflow: hidden;
}
.ms-content {
  padding: 30px 30px;
}
.reset-password-btn {
  text-align: center;
}
.reset-password-btn button {
  width: 100%;
  height: 36px;
  margin-bottom: 10px;
}

/* 通过自定义类来确保el-form-item的样式生效 */
.custom-form-item {
  width: 280px;
}

.reset-password-tips {
  font-size: 12px;
  line-height: 30px;
  color: #fff;
}
.reset-send-code {
  cursor: pointer;
  transition: right ease 150ms;
  color: blue;
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translate(0, -50%);
}
</style>
