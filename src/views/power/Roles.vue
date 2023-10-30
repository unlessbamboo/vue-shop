<template>
  <div>
    <!-- 1. 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/dashboard' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 2. 卡片视图: 将信息聚合在卡片容器中展示 -->
    <el-card>
      <!-- 添加角色按钮区域 -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="addDialogVisible = true">添加角色</el-button>
        </el-col>
      </el-row>

      <!-- 角色列表区域 -->
      <el-table :data="roleList" border stripe>
        <!-- 展开列, 其中slot-scope="scope"表示即将访问当前行(整行)数据 -->
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row
              :class="['bdbottom', index1 === 0 ? 'bdtop' : '', 'vcenter']"
              v-for="(item1, index1) in scope.row.permission_infos"
              :key="item1.id">
              <!-- 渲染一级权限 -->
              <el-col :span="5">
                <el-tag closable @close="removeRightById(scope.row, item1.id)">{{ item1.name }}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 渲染二级、三级权限 -->
              <el-col :span="19">
                <el-row
                  :class="[index2 === 0 ? '' : 'bdtop', 'vcenter']"
                  v-for="(item2, index2) in item1.children"
                  :key="item2.id">
                  <!-- 渲染二级权限 -->
                  <el-col :span="6">
                    <el-tag type="success" closable @close="removeRightById(scope.row, item2.id)">
                      {{ item2.name }}
                    </el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <!-- 渲染三级权限 -->
                  <el-col :span="18">
                    <el-tag
                      type="warning"
                      v-for="item3 in item2.children"
                      :key="item3.id"
                      closable
                      @close="removeRightById(scope.row, item3.id)">
                      {{ item3.name }}
                    </el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <!-- 索引列 -->
        <el-table-column type="index"></el-table-column>
        <el-table-column label="角色名称" prop="name"></el-table-column>
        <el-table-column label="角色描述" prop="desc"></el-table-column>
        <el-table-column label="操作" width="300px">
          <template slot-scope="scope">
            <el-button size="mini" type="primary" icon="el-icon-edit" @click="showEditDialog(scope.row.id)">
              编辑
            </el-button>
            <el-button
              size="mini"
              type="danger"
              icon="el-icon-delete"
              :disabled="!scope.row.can_delete"
              @click="removeRoleById(scope.row.id)">
              删除
            </el-button>
            <el-button size="mini" type="warning" icon="el-icon-setting" @click="showSetRightDialog(scope.row)">
              分配权限
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 3. 添加角色的对话框 -->
    <el-dialog title="添加角色" v-model="addDialogVisible" width="50%" @close="addDialogClosed">
      <!-- 内容主体区域 -->
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="80px">
        <el-form-item label="角色值" prop="value">
          <el-input v-model="addForm.value" placeholder="请输入角色值(英文字母)"></el-input>
        </el-form-item>
        <el-form-item label="角色名称" prop="name">
          <el-input v-model="addForm.name" placeholder="请输入角色名称"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="desc">
          <el-input v-model="addForm.desc" placeholder="请输入角色描述"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addRole">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 4. 修改用户的对话框 -->
    <el-dialog title="修改角色" v-model="editDialogVisible" width="50%">
      <!-- 内容主体区域 -->
      <el-form :model="editForm" :rules="addFormRules" ref="editFormRef" label-width="80px">
        <el-form-item label="角色名称" prop="name">
          <el-input v-model="editForm.name"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="desc">
          <el-input v-model="editForm.desc"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editUserInfo">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 5. 分配权限的对话框 -->
    <el-dialog title="分配权限" v-model="setRightDialogVisible" width="50%" @close="setRightDialogClosed">
      <!-- 内容主体区域 树形控件: 
          data: 数据
          props: 数据的格式指定
          default-checked-keys: 被选中的keys
          default-expaned-all: 是否展开所有行, 其中false表示闭合
      -->
      <el-tree
        :data="permissionInfoList"
        :props="treeProps"
        show-checkbox
        node-key="id"
        :default-expand-all="false"
        :default-checked-keys="defKeys"
        ref="treeRef"></el-tree>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRightDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allotRights">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import SimpleApi from "@/api/simpleApi";
import requestMixin from "@/mixins/requestMixin";
import { ElMessageBox } from "element-plus";
import { checkRequestResult } from "@/mixins/requestCommon";

export default {
  data() {
    return {
      // 所有角色列表数据
      roleList: [],
      addDialogVisible: false,
      addForm: { value: "", name: "", desc: "" },
      addFormRules: {
        value: [
          { required: true, message: "请输入角色值(英文字母)", trigger: "blur" },
          { validator: this.validateEnglishOnly, trigger: "blur" },
        ],
        name: [{ required: true, message: "请输入角色名称", trigger: "blur" }],
        desc: [{ message: "请输入角色描述", trigger: "blur" }],
      },
      // 控制修改用户对话框的显示与隐藏
      editDialogVisible: false,
      // 查询到的角色的信息对象
      editForm: {},
      // 控制分配权限对话框显示与隐藏
      setRightDialogVisible: false,
      // 所有权限数据
      permissionInfoList: [],
      // 树形控件的属性绑定对象
      treeProps: {
        children: "children",
        label: "name",
      },
      // 默认选中的节点id值数组
      defKeys: [],
      // 当前即将分配权限的角色id
      roleId: "",
    };
  },
  created() {
    this.getRolesList();
  },
  methods: {
    // validator: 限制输入框只能输入英文
    validateEnglishOnly(rule, value, callback) {
      const englishLetterRegex = /^[A-Za-z]+$/;
      if (!englishLetterRegex.test(value)) {
        callback(new Error("角色值只能包含英文字母"));
      } else {
        callback();
      }
    },
    // 获取所有角色的列表
    async getRolesList() {
      const { data: result } = await this.$http.get("auth/roles");
      if (!checkRequestResult(result, "获取角色列表失败！")) {
        return;
      }
      this.roleList = result.data;
    },

    // 监听添加用户对话框的关闭事件
    addDialogClosed() {
      this.$refs.addFormRef.resetFields();
    },
    // 添加角色操作
    addRole() {
      this.$refs.addFormRef.validate(async (valid) => {
        if (!valid) return;
        const { data: result } = await this.$http.post("auth/roles", this.addForm);
        if (!checkRequestResult(result, "添加角色失败！")) {
          return;
        }
        $eMessage.success("添加角色成功！");
        this.addDialogVisible = false;
        this.getRolesList();
      });
    },
    // 展示编辑用户的对话框
    async showEditDialog(id) {
      this.editDialogVisible = true;
      const { data: result } = await this.$http.get("auth/roles/" + id);
      if (!checkRequestResult(result, "查询用户信息失败！")) {
        return;
      }
      this.editForm = result.data;
    },
    editUserInfo() {
      this.$refs.editFormRef.validate(async (valid) => {
        // console.log(valid)
        if (!valid) return;
        // 发起修改用户信息的数据请求
        const { data: result } = await this.$http.put("auth/roles/" + this.editForm.roleId, {
          name: this.editForm.name,
          desc: this.editForm.desc,
        });
        if (!checkRequestResult(result, "更新角色失败")) {
          return;
        }
        // 关闭对话框
        this.editDialogVisible = false;
        // 重新获取用户列表
        this.getRolesList();
        // 提示修改成功
        $eMessage.success("更新角色信息成功");
      });
    },
    // 根据id删除对应的用户信息
    async removeRoleById(id) {
      // 弹框提示用户是否删除数据
      const confirmResult = await ElMessageBox.confirm("此操作将永久删除该角色，是否继续？", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      }).catch((error) => error);
      if (confirmResult !== "confirm") {
        return $eMessage.info("已经取消删除");
      }

      const { data: result } = await this.$http.delete("auth/roles/" + id);
      if (!checkRequestResult(result, "删除角色失败")) {
        return;
      }
      $eMessage.success("删除角色成功");
      this.getRolesList();
    },

    /*
     * 功能: 根据Id删除对应的权限
     * 使用: 在角色权限树中, 叉掉某个权限的时候会相应的调用该逻辑
     */
    async removeRightById(role, permissionId) {
      // a. 弹框提示用户是否删除数据
      const confirmResult = await ElMessageBox.confirm("此操作将永久删除该权限，是否继续？", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      }).catch((error) => error);
      if (confirmResult !== "confirm") {
        return $eMessage.info("已经取消删除");
      }

      // b. 执行删除操作, 返回删除完成之后role的新值(role + permission)
      const { data: result } = await this.$http.delete("auth/roles/" + role.id + "/permission/" + permissionId);
      if (!checkRequestResult(result, "删除权限失败！")) {
        return;
      }
      $eMessage.success("删除权限成功");
      role.permission_infos = result.data.permission_infos;
    },

    // 展示分配权限的对话框
    async showSetRightDialog(role) {
      this.roleId = role.id;
      // 获取所有权限数据
      const { data: result } = await this.$http.get("auth/permissions/tree");
      if (!checkRequestResult(result, "获取权限数据失败！")) {
        return;
      }
      // 获取到的权限数据保存到permissionInfoList中
      this.permissionInfoList = result.data.infos;
      // 递归获取三级节点的id
      this.getLeafKeys(role, this.defKeys);
      this.setRightDialogVisible = true;
    },

    /*
     * 通过递归的形式，获取角色下所有三级权限的id，并保存到defKeys数组中
     * 注意: 该函数决定了属性列表的勾选项
     */
    getLeafKeys(node, arr) {
      // 如果当前节点不包含children属性，则是三级权限节点
      if (!node.permission_infos) {
        return arr.push(node.id);
      }
      node.permission_infos.forEach((item) => this.getLeafKeys(item, arr));
    },

    // 监听分配权限对话框的关闭事件
    setRightDialogClosed() {
      this.defKeys = [];
    },

    /*
     * 功能: 根据已选择ID列表从给出的树中构建新树
     */
    buildSelectedPermissionTree(infos, selectKeys) {
      let newTree = [];
      for (let node of infos) {
        if (selectKeys.includes(node.id)) {
          // 将节点及其所有子节点添加到新树中
          newTree.push(node);
        } else if (node.children) {
          // 递归地对子节点进行同样的操作
          let filteredChildren = this.buildSelectedPermissionTree(node.children, selectKeys);
          if (filteredChildren.length > 0) {
            // 如果有被选中的子节点，将它们添加到新的父节点中
            let newNode = { ...node };
            newNode.children = filteredChildren;
            newTree.push(newNode);
          }
        }
      }
      return newTree;
    },

    /*
     * 功能: 根据全部权限树结构, 点击为角色分配需要权限
     */
    async allotRights() {
      const keys = [...this.$refs.treeRef.getCheckedKeys(), ...this.$refs.treeRef.getHalfCheckedKeys()];

      var newPermissionInfos = this.buildSelectedPermissionTree(this.permissionInfoList, keys);

      const idStr = keys.join(",");
      const { data: result } = await this.$http.put(`auth/roles/${this.roleId}`, {
        permission_ids: newPermissionInfos,
      });
      if (!checkRequestResult(result, "分配权限失败！")) {
        return;
      }
      $eMessage.success("分配权限成功");
      this.getRolesList();
      this.setRightDialogVisible = false;
    },
  },
};
</script>

<style scoped>
.el-tag {
  margin: 7px;
}
.bdtop {
  border-top: 1px solid #eee;
}
.bdbottom {
  border-bottom: 1px solid #eee;
}
.vcenter {
  display: flex;
  align-items: center;
}
</style>
