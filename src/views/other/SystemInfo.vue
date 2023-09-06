<template>
  <div>
    <!-- 1. 面包屑导航栏 -->
    <div class="crumbs">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item>
          <i class="el-icon-lx-cascades"></i>
          系统监控信息
        </el-breadcrumb-item>
      </el-breadcrumb>
    </div>

    <div class="container">
      <el-row :gutter="15" class="py-1">
        <el-col :span="12">
          <el-card v-if="state.os" class="card_item card_item_15">
            <template #header>
              <div>运行时信息</div>
            </template>
            <div>
              <el-row :gutter="10">
                <el-col :span="12">os:</el-col>
                <el-col :span="12" v-text="state.os.goos" />
              </el-row>
              <el-row :gutter="10">
                <el-col :span="12">cpu nums:</el-col>
                <el-col :span="12" v-text="state.os.numCpu" />
              </el-row>
              <el-row :gutter="10">
                <el-col :span="12">compiler:</el-col>
                <el-col :span="12" v-text="state.os.compiler" />
              </el-row>
              <el-row :gutter="10">
                <el-col :span="12">go version:</el-col>
                <el-col :span="12" v-text="state.os.goVersion" />
              </el-row>
              <el-row :gutter="10">
                <el-col :span="12">goroutine nums:</el-col>
                <el-col :span="12" v-text="state.os.numGoroutine" />
              </el-row>
            </div>
          </el-card>
        </el-col>
        <el-col :span="12">
          <el-card v-if="state.disk" class="card_item card_item_15">
            <template #header>
              <div>磁盘</div>
            </template>
            <div>
              <el-row :gutter="10">
                <el-col :span="12">
                  <el-row :gutter="10">
                    <el-col :span="12">总量 (MB)</el-col>
                    <el-col :span="12" v-text="state.disk.totalMb" />
                  </el-row>
                  <el-row :gutter="10">
                    <el-col :span="12">已使用 (MB)</el-col>
                    <el-col :span="12" v-text="state.disk.usedMb" />
                  </el-row>
                  <el-row :gutter="10">
                    <el-col :span="12">总量 (GB)</el-col>
                    <el-col :span="12" v-text="state.disk.totalGb" />
                  </el-row>
                  <el-row :gutter="10">
                    <el-col :span="12">已使用 (GB)</el-col>
                    <el-col :span="12" v-text="state.disk.usedGb" />
                  </el-row>
                </el-col>
                <el-col :span="12">
                  <el-progress type="dashboard" :percentage="state.disk.usedPercent" :color="colors" />
                </el-col>
              </el-row>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <el-row :gutter="15" class="py-1">
        <el-col :span="12">
          <el-card v-if="state.cpu" class="card_item card_item_18" :body-style="{ height: '200px' }">
            <template #header>
              <div>CPU</div>
            </template>
            <div>
              <el-row :gutter="10">
                <el-col :span="12">physical number of cores:</el-col>
                <el-col :span="12" v-text="state.cpu.cores" />
              </el-row>
              <el-row v-for="(item, index) in state.cpu.cpus" :key="index" :gutter="10">
                <el-col :span="12">core {{ index }}:</el-col>
                <el-col :span="12"><el-progress type="line" :percentage="+item.toFixed(0)" :color="colors" /></el-col>
              </el-row>
            </div>
          </el-card>
        </el-col>
        <el-col :span="12">
          <el-card v-if="state.ram" class="card_item card_item_18">
            <template #header>
              <div>内存</div>
            </template>
            <div>
              <el-row :gutter="10">
                <el-col :span="12">
                  <el-row :gutter="10">
                    <el-col :span="12">total (MB)</el-col>
                    <el-col :span="12" v-text="state.ram.totalMb" />
                  </el-row>
                  <el-row :gutter="10">
                    <el-col :span="12">used (MB)</el-col>
                    <el-col :span="12" v-text="state.ram.usedMb" />
                  </el-row>
                  <el-row :gutter="10">
                    <el-col :span="12">total (GB)</el-col>
                    <el-col :span="12" v-text="state.ram.totalMb / 1024" />
                  </el-row>
                  <el-row :gutter="10">
                    <el-col :span="12">used (GB)</el-col>
                    <el-col :span="12" v-text="(state.ram.usedMb / 1024).toFixed(2)" />
                  </el-row>
                </el-col>
                <el-col :span="12">
                  <el-progress type="dashboard" :percentage="state.ram.usedPercent" :color="colors" />
                </el-col>
              </el-row>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script>
import SimpleApi from "@/api/simpleApi";
import requestMixin from "@/mixins/requestMixin";

export default {
  name: "State",
  mixins: [requestMixin],
  data() {
    return {
      timer: null,
      state: {},
      colors: [
        { color: "#5cb87a", percentage: 20 },
        { color: "#e6a23c", percentage: 40 },
        { color: "#f56c6c", percentage: 80 },
      ],
    };
  },
  methods: {
    async reload() {
      const { data: result } = await SimpleApi.fetchSystemInfo();
      if (!this.checkRequestResult(result, "获取系统基本监控信息异常")) {
        return;
      }
      this.state = result.data;
    },
  },
  created() {
    this.reload();
    this.timer = setInterval(() => {
      this.reload();
    }, 1000 * 10);
  },
  destroyed() {
    clearInterval(this.timer);
    this.timer = null;
  },
};
</script>

<style scoped>
.card_item {
  font-size: 1.2rem;
}

.card_item_15 {
  height: 15rem;
}

div.card_item_18 {
  height: 20rem;
}

.card_item >>> .el-card__header {
  padding-top: 5px;
  padding-bottom: 5px;
}

/* 当屏幕或容器宽度较小时 */
@media (max-height: 800px) {
  .card_item {
    font-size: 1rem;
  }
}
</style>
