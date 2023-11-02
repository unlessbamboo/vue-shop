<template>
  <div class="login-wrap">
    <div class="ms-login">
      <div class="ms-login-title-container">
        <div class="ms-login-title">登录</div>
        <div class="ms-login-title-goto">
          <el-button class="ms-login-title-goto-btn" type="primary" link @click="goToRegisterPage">
            前往注册
            <Icon icon="ArrowRight" class="shopIcon" style="width: 20px" />
          </el-button>
        </div>
      </div>
      <el-form :model="loginForm" :rules="rules" ref="loginRef" label-width="0px" class="ms-content">
        <el-form-item prop="username" class="custom-form-item">
          <el-input v-model="loginForm.username" placeholder="用户名"></el-input>
        </el-form-item>
        <el-form-item prop="password" class="custom-form-item">
          <el-input
            type="password"
            placeholder="密码"
            v-model="loginForm.password"
            @keyup.enter="submitForm()"></el-input>
          <div class="login-forget-passwd" @click="goToResetPwdPage">忘记密码</div>
        </el-form-item>
        <div class="login-btn">
          <el-button type="primary" @click="submitForm()">登录</el-button>
        </div>
        <div><span class="ms-login-tips">tips: 使用admin/admin123账号进行测试</span></div>
      </el-form>
    </div>
  </div>
</template>

<script setup name="login">
import { ref, computed, watch, onBeforeMount, getCurrentInstance } from "vue";
import { useStore } from "vuex";
import { useRouter, useRoute } from "vue-router";
import AuthLayout from "@/views/auth/AuthLayout.vue";

// 全局变量
const { proxy } = getCurrentInstance();
const router = useRouter();

const loginRef = ref(null);
const loginForm = ref({ username: "", password: "" });
const rules = ref({
  username: [{ required: true, message: "请输入用户名", trigger: "blur" }],
  password: [{ required: true, message: "请输入密码", trigger: "blur" }],
});

function submitForm() {
  loginRef.value.validate(async (valid) => {
    if (!valid) {
      proxy.$eMessage.error("请输入账号和密码");
      console.log("error submit!!");
      return false;
    }
    const { data: result } = await proxy.$http.post("auth/login", loginForm.value);
    if (result.code !== 100000) return proxy.$eMessage.error("登录失败");

    proxy.$eMessage.success("登录成功");

    // 存储在local storage中
    localStorage.setItem("ms_username", loginForm.value.username);
    localStorage.setItem("ms_id", loginForm.value.id);
    localStorage.setItem("ms_other", JSON.stringify(result.data.location));
    router.push("/");
    return true;
  });
}

/* 进入注册页面 */
function goToRegisterPage() {
  router.push("/auth/register");
}

/* 进入密码忘记页面 */
function goToResetPwdPage() {
  router.push("/auth/reset");
}
</script>

<style scoped>
.login-wrap {
  position: relative;
  width: 100%;
  height: 100%;
  background-image: url(@/assets/img/login-bg.jpg);
  background-size: 100%;
}

/* 登录框首行样式设置: 标题, 跳转链接, 布局等 */
.ms-login-title-container {
  display: flex;
  width: 100%;
  justify-content: space-between;
  align-items: center;
}
.ms-login-title-container div {
  flex: 1;
  line-height: 50px;
  border-bottom: 1px solid #ddd;
}
.ms-login-title {
  text-align: center;
  font-size: 20px;
  color: #fff;
}
.ms-login-title-goto {
  text-align: right;
  padding-right: 20px;
}
.ms-login-title-goto-btn {
  font-size: 12px;
  color: #fff;
}

.ms-login-tips {
  font-size: 12px;
  color: #fff;
}

/* 登录页面输入框 */
.ms-login {
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
.login-btn {
  text-align: center;
}
.login-btn button {
  width: 100%;
  height: 36px;
  margin-bottom: 10px;
}

/* 通过自定义类来确保el-form-item的样式生效 */
.custom-form-item {
  width: 280px;
}
.login-forget-passwd {
  cursor: pointer;
  transition: right ease 150ms;
  color: blue;
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translate(0, -50%);
}

.login-tips {
  font-size: 12px;
  line-height: 30px;
  color: #fff;
}
</style>
