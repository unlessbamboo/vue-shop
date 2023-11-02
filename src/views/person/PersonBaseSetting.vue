<template>
  <div class="personBaseSettingContainer">
    <div class="personTitle">基本设置</div>
    <div class="person-section-wrap">
      <!-- 左边部分：个人信息基本设置表单 -->
      <div class="person-left-section">
        <el-form :model="formData" label-width="100px" ref="profileForm" label-position="left">
          <el-form-item label="邮箱">
            <el-input v-model="formData.email"></el-input>
          </el-form-item>
          <el-form-item label="昵称">
            <el-input v-model="formData.nickname"></el-input>
          </el-form-item>
          <el-form-item label="国家地区">
            <el-select v-model="formData.country">
              <el-option label="中国" value="china"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item prop="city">
            <el-cascader
              size="large"
              filterable
              :props="{ expandTrigger: 'hover' }"
              placeholder="请选择"
              v-model="formData.cityInfo"
              :options="provinceInfo"
              @change="onCityChange"></el-cascader>
          </el-form-item>
          <el-form-item label="街道地址">
            <el-input v-model="formData.address"></el-input>
          </el-form-item>
          <el-form-item label="联系电话">
            <el-input v-model="formData.phone"></el-input>
          </el-form-item>
          <el-form-item label="个人简介">
            <el-input type="textarea" v-model="formData.bio"></el-input>
          </el-form-item>

          <div class="person-save-btn">
            <el-button type="primary" @click="submitPersonForm()">保存</el-button>
          </div>
        </el-form>
      </div>

      <!-- 右边部分：个人头像信息 -->
      <div class="person-right-section">
        <div class="person-avatar-container">
          <el-image class="person-avatar" :src="avatarUrl"></el-image>
          <el-button class="change-person-avatar-btn" @click="handleChangeAvatar">更换头像</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup name="PersonSecureSetting">
import { reactive, ref, onMounted, toRefs, computed, getCurrentInstance } from "vue";
import avatarUrl from "@/assets/img/img.jpg"; // 默认头像地址，注意, 导入本地图片的格式
import provinceInfo from "@/data/province";

const formData = ref({
  email: "",
  nickname: "",
  bio: "",
  country: "china",
  cityInfo: [],
  province: "",
  city: "",
  address: "",
  phone: "",
});
function handleChangeAvatar() {
  // 处理更换头像的逻辑，根据实际情况实现
}
function handleLocationChange(value) {
  // 处理所在省市的选择变化，根据实际情况实现
}
// 注意, 这种回调函数报错, 在控制台中只可能看到如下错误: Error in v-on handler
function onCityChange() {
  if (formData.value.cityInfo.length < 2) {
    // 选择省信息
    formData.value.province = "";
    formData.value.city = "";
  } else {
    // 选择省和市
    this.provinceInfo.map((item) => {
      if (item.value === formData.value.cityInfo[0]) {
        formData.value.province = item.label;
        item.children.map((subItem) => {
          if (subItem.value === formData.value.cityInfo[1]) {
            formData.value.city = subItem.label;
          }
        });
      }
    });
  }
}
function submitPersonForm() {}
</script>

<style scoped>
.personBaseSettingContainer {
  height: 400px;
  width: 100%;
  padding: 20px;
}

.personTitle {
  font-size: 18px;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #f0f0f0;
}

.person-section-wrap {
  display: flex;
}

.person-left-section {
  flex: 1;
  padding-right: 20px;
}

.person-save-btn {
  display: flex;
  flex-direction: center;
  margin-top: 20px;
}

.person-save-btn button {
  margin: 0 auto;
  width: 100px;
}

.person-right-section {
  flex: 1;
  /* 居中需要在父类设置, 这样才会影响person-avatar-container */
  display: flex;
  flex-direction: column;
  /* 垂直方向的居中 */
  /* justify-content: center; */
  /* 水平方向居中 */
  align-items: center;
}

.person-avatar-container {
  width: 200px;
  text-align: center;
}

.person-avatar {
  width: 150px;
  height: 150px;
  border-radius: 50%;
}

.change-person-avatar-btn {
  margin-top: 10px;
}
</style>
