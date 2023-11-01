<template>
  <div class="register-wrap">
    <div class="ms-register">
      <div class="ms-register-title-container">
        <div class="ms-register-title">注册</div>
        <div class="ms-register-title-goto">
          <el-button class="ms-register-title-goto-btn" type="primary" link @click="goToLoginPage">
            返回登录
            <i class="el-icon-arrow-right"></i>
          </el-button>
        </div>
      </div>
      <el-form :model="registerForm" :rules="rules" ref="register" label-width="0px" class="ms-content">
        <el-form-item prop="username" class="custom-form-item">
          <el-input v-model="registerForm.username" placeholder="请输入用户名"></el-input>
        </el-form-item>

        <el-form-item prop="email" class="custom-form-item">
          <el-input v-model="registerForm.email" placeholder="请输入邮箱"></el-input>
        </el-form-item>

        <el-form-item prop="password" class="custom-form-item">
          <el-input type="password" placeholder="请输入密码" v-model="registerForm.password"></el-input>
        </el-form-item>
        <el-form-item prop="confirmPassword" class="custom-form-item">
          <el-input type="password" placeholder="请确认密码" v-model="registerForm.confirmPassword"></el-input>
        </el-form-item>

        <el-form-item prop="age" class="custom-form-item">
          <el-input v-model="registerForm.age" placeholder="请输入年龄" type="number"></el-input>
        </el-form-item>

        <!-- options是一个包含三级联动信息的对象数组
          props:
            + expandTrigger: hover-鼠标移动触发级联, 默认-鼠标点击
          filterable: true-开启搜索功能
        -->
        <el-form-item prop="city" class="custom-form-item">
          <el-cascader
            size="large"
            filterable
            :props="{ expandTrigger: 'hover' }"
            placeholder="请选择所在城市"
            v-model="registerForm.cityInfo"
            :options="twoLevelProvinceInfo"
            @change="onCityChange"
            popper-class="my-el-cascader-register"
            class="custom-form-item"></el-cascader>
        </el-form-item>

        <el-form-item prop="gender" class="custom-form-item">
          <!-- Element-UI 的 el-select 使用的其实是 input 标签 , 
              而 input 标签在浏览器中存在一个默认的宽度 , 大约是 100px (不同的浏览器表现不同) . 
            -->
          <el-select v-model="registerForm.gender" placeholder="请选择性别" class="custom-form-item">
            <el-option label="男" value="male" class="custom-el-select"></el-option>
            <el-option label="女" value="female" class="custom-el-select"></el-option>
          </el-select>
        </el-form-item>

        <div class="register-btn">
          <el-button type="primary" @click="submitForm()">确认注册</el-button>
        </div>
        <p class="register-tips">Tips: 请输入用户名和密码进行注册。</p>
      </el-form>
    </div>
  </div>
</template>

<script setupe name="register">
import provinceInfo from "@/data/province";

export default {
  data: function () {
    return {
      registerForm: {
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
        age: 16,
        cityInfo: [], // 省市
        city: "",
        province: "",
      },
      rules: {
        username: [{ required: true, message: "请输入用户名", trigger: "blur" }],
        password: [{ required: true, message: "请输入密码", trigger: "blur" }],
        email: [
          { required: true, message: "请输入电子邮件", trigger: "blur" },
          {
            validator: (rule, value, callback) => {
              // 使用正则表达式检查电子邮件格式
              const emailPattern = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,4}$/;
              if (emailPattern.test(value)) {
                callback();
              } else {
                callback(new Error("请输入有效的电子邮件地址"));
              }
            },
            trigger: "blur",
          },
        ],
        confirmPassword: [
          { required: true, message: "请确认密码", trigger: "blur" },
          {
            validator: (rule, value, callback) => {
              if (value === this.registerForm.password) {
                callback();
              } else {
                callback(new Error("两次输入的密码不一致"));
              }
            },
            trigger: "blur",
          },
        ],
        age: [
          {
            required: true,
            message: "请输入年龄",
            trigger: "blur",
            type: "number",
            transform: (value) => {
              const newValue = value !== "" ? Number(value) : 0;
              if (Number.isFinite(newValue)) {
                this.registerForm.age = newValue;
              }
              return newValue;
            },
          },
        ],
      },
    };
  },
  methods: {
    submitForm() {
      this.$refs.register.validate(async (valid) => {
        if (!valid) {
          $eMessage.error("请输入正确的账号和密码");
          return false;
        }
        this.registerForm.age = Number(this.registerForm.age);

        const { data: result } = await this.$http.post("auth/register", this.registerForm);
        if (result.code !== 100000) return $eMessage.error(result.msg || "注册失败");

        // 注册逻辑，可以在这里处理用户的注册信息
        $eMessage.success("注册成功");
        this.$router.push("/auth/login"); // 注册成功后跳转到登录页
        return true;
      });
    },
    /* 进入登录页面 */
    goToLoginPage() {
      this.$router.push("/auth/login");
    },
    // 注意, 这种回调函数报错, 在控制台中只可能看到如下错误: Error in v-on handler
    onCityChange() {
      if (this.registerForm.cityInfo.length < 2) {
        // 选择省信息
        this.registerForm.province = "";
        this.registerForm.city = "";
      } else {
        // 选择省和市
        this.twoLevelProvinceInfo.map((item) => {
          if (item.value === this.registerForm.cityInfo[0]) {
            this.registerForm.province = item.label;
            item.children.map((subItem) => {
              if (subItem.value === this.registerForm.cityInfo[1]) {
                this.registerForm.city = subItem.label;
              }
            });
          }
        });
      }
    },
  },
  computed: {
    twoLevelProvinceInfo() {
      return provinceInfo.map((province) => {
        return {
          value: province.value,
          label: province.label,
          children: province.children
            ? province.children.map((city) => {
                return {
                  value: city.value,
                  label: city.label,
                };
              })
            : null,
        };
      });
    },
  },
};
</script>

<style scoped>
/* 1. 外层container样式 */
.register-wrap {
  position: relative;
  width: 100%;
  height: 100%;
  background-image: url(@/assets/img/login-bg.jpg); /* 注册页的背景图片 */
  background-size: 100%;
}
.ms-register {
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

/* 2. 首行样式设置: 标题, 跳转链接, 布局等 */
.ms-register-title-container {
  display: flex;
  width: 100%;
  justify-content: space-between;
  align-items: center;
}
.ms-register-title-container div {
  flex: 1;
  line-height: 50px;
  border-bottom: 1px solid #ddd;
}
.ms-register-title {
  width: 100%;
  line-height: 50px;
  text-align: center;
  font-size: 20px;
  color: #fff;
  border-bottom: 1px solid #ddd;
}
.ms-register-title-goto {
  text-align: right;
  padding-right: 20px;
}
.ms-register-title-goto .el-button--text {
  font-size: 12px;
  color: #fff;
}

/* 3. 输入行样式: 按钮, 输入框等 */
.ms-content {
  padding: 30px 30px;
}

/* 通过自定义类来统一的让el-form-item的某些演示保持一致: 注意样式权重(类,伪类,属性都是10)
   -> 在相同权重的情况, 定义的位置决定了最终的样式(重要)
 */
.custom-form-item {
  width: 280px;
}
.register-btn {
  /* 设置按钮的布局方式 */
  display: flex;
  text-align: center;
}

.register-btn button {
  flex: 1;
  height: 36px;
  margin-bottom: 10px;
}
.custom-el-select {
  /* width: 200px; */
  width: 100%;
}

/* tips样式 */
.register-tips {
  font-size: 12px;
  line-height: 30px;
  color: #fff;
}

/* 注意: 使用 ::v-deep 深度选择器仅仅是可以将样式影响到子组件中
   .a::v-deep .b 变为 .a[data-vf3f3eg9] .b

在element-ui中, 大部分情况下特别是那种下拉框等情况, 此时就不能使用scoped了.
 */
.my-el-cascader-register .el-cascader-panel {
  /* 在这里设置您想要调整的样式 */
  flex-direction: row-reverse !important;
}
</style>
