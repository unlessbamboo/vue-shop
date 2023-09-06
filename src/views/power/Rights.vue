<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/dashboard' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <el-table :data="rightsList" border stripe>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="权限名称" prop="name"></el-table-column>
        <el-table-column label="路径" prop="path"></el-table-column>
        <el-table-column label="权限等级" prop="level">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.level === '0'">一级</el-tag>
            <el-tag type="success" v-else-if="scope.row.level === '1'">二级</el-tag>
            <el-tag type="warning" v-else>三级</el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script>
import SimpleApi from "@/api/simpleApi";
import requestMixin from "@/mixins/requestMixin";

export default {
  mixins: [requestMixin],
  data() {
    return {
      // 权限列表
      rightsList: [],
    };
  },
  created() {
    // 获取所有的权限
    this.getRightsList();
  },
  methods: {
    async getRightsList() {
      const { data: result } = await this.$http.get("auth/permissions");
      if (!this.checkRequestResult(result, "获取权限列表失败！")) {
        return;
      }
      this.rightsList = result.data.infos;
    },
  },
};
</script>

<style scoped></style>
