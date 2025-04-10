<template>
  <div class="app-container">
    <el-row :gutter="20">
      <el-col :span="4" :xs="24">
        <div class="head-container">
          <!-- 部门树 -->
          <el-input v-model="deptName" placeholder="请输入部门名称" clearable prefix-icon="Search" style="margin-bottom: 20px" />
          <div class="head-container">
            <el-tree
              :data="deptOptions"
              :props="{ label: 'label', children: 'children' }"
              :expand-on-click-node="false"
              :filter-node-method="filterNode"
              ref="deptTreeRef"
              node-key="id"
              highlight-current
              default-expand-all
              @node-click="handleNodeClick"
            />
          </div>
        </div>
      </el-col>
      <el-col :span="20" :xs="24">
        <!-- 查询区域 -->
        <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
          <el-form-item label="用户账号" prop="userName">
            <el-input v-model="queryParams.userName" placeholder="请输入用户账号" clearable style="width: 240px" @keyup.enter="handleQuery" />
          </el-form-item>
          <el-form-item label="手机号码" prop="phonenumber">
            <el-input v-model="queryParams.phonenumber" placeholder="请输入手机号码" clearable style="width: 240px" @keyup.enter="handleQuery" />
          </el-form-item>
          <el-form-item label="状态" prop="status">
            <el-select v-model="queryParams.status" placeholder="用户状态" clearable style="width: 240px">
              <el-option v-for="dict in sys_normal_disable" :key="dict.value" :label="dict.label" :value="dict.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="创建时间" style="width: 308px">
            <el-date-picker v-model="queryParams.dateRange" value-format="YYYY-MM-DD" type="daterange" range-separator="-" start-placeholder="开始日期" end-placeholder="结束日期"></el-date-picker>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
            <el-button icon="Refresh" @click="resetQuery">重置</el-button>
          </el-form-item>
        </el-form>
        <!-- 顶部操作按钮 -->
        <el-row :gutter="10" class="mb8">
          <el-col :span="1.5">
            <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['system:user:add']">新增</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="success" plain icon="Edit" :disabled="multipleSelection.length !== 1" @click="handleUpdate(multipleSelection, true)" v-hasPermi="['system:user:edit']">修改</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="danger" plain icon="Delete" :disabled="multipleSelection.length === 0" @click="handleDelete(multipleSelection, true)" v-hasPermi="['system:user:remove']">删除</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="info" plain icon="Upload" @click="handleImport" v-hasPermi="['system:user:import']">导入</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="warning" plain icon="Download" @click="handleExport" v-hasPermi="['system:user:export']">导出</el-button>
          </el-col>
          <!-- <right-toolbar v-model:showSearch="showSearch" @queryTable="getList" :columns="columns"></right-toolbar> -->
        </el-row>
        <!-- 用户列表 -->
        <el-table :data="dataOptions" @selection-change="handleSelectionChange">
          <el-table-column type="selection" width="50" align="center" />
          <el-table-column label="用户编号" align="center" key="userId" prop="userId" />
          <el-table-column label="用户账号" align="center" key="userName" prop="userName" :show-overflow-tooltip="true" />
          <el-table-column label="用户昵称" align="center" key="nickName" prop="nickName" :show-overflow-tooltip="true" />
          <el-table-column label="部门" align="center" key="deptName" prop="dept.deptName" :show-overflow-tooltip="true" />
          <el-table-column label="手机号码" align="center" key="phonenumber" prop="phonenumber" width="120" />
          <el-table-column label="状态" align="center" key="status">
            <template #default="scope">
              <el-switch v-model="scope.row.status" active-value="0" inactive-value="1" @change="handleStatusChange(scope.row)"></el-switch>
            </template>
          </el-table-column>
          <el-table-column label="创建时间" align="center" prop="createTime" width="160">
            <template #default="scope">
              <span>{{ parseTime(scope.row.createTime) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" align="center" width="150" class-name="small-padding fixed-width">
            <template #default="scope">
              <el-tooltip content="修改" placement="top" v-if="scope.row.userId !== 1">
                <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['system:user:edit']"></el-button>
              </el-tooltip>
              <el-tooltip content="删除" placement="top" v-if="scope.row.userId !== 1">
                <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['system:user:remove']"></el-button>
              </el-tooltip>
              <!-- <el-tooltip content="重置密码" placement="top" v-if="scope.row.userId !== 1">
                <el-button link type="primary" icon="Key" @click="handleResetPwd(scope.row)" v-hasPermi="['system:user:resetPwd']"></el-button>
              </el-tooltip>
              <el-tooltip content="分配角色" placement="top" v-if="scope.row.userId !== 1">
                <el-button link type="primary" icon="CircleCheck" @click="handleAuthRole(scope.row)" v-hasPermi="['system:user:edit']"></el-button>
              </el-tooltip> -->
            </template>
          </el-table-column>
        </el-table>
      </el-col>
    </el-row>
  </div>
  <userForm v-model:visible="userFormVisible" :userInfo="userInfo" @ok="getUserList" />
  <uploadDialog v-model:uploadParams="uploadParams" />
</template>

<script setup>
import { onMounted, ref, watch, getCurrentInstance } from 'vue'
import useTree from './hooks/useTree'
import useUser from './hooks/useUser'
import userForm from './components/userForm.vue'
import uploadDialog from './components/uploadDialog.vue'

// 获取组件实例，用于访问组件上下文和refs
const { proxy } = getCurrentInstance()
const { deptName, deptId, deptOptions, getDeptTree, handleNodeClick, filterNode } = useTree()

const {
  queryParams,
  sys_normal_disable,
  showSearch,
  dataOptions,
  userFormVisible,
  userInfo,
  multipleSelection,
  uploadParams,
  handleSelectionChange,
  resetQuery,
  handleQuery,
  handleStatusChange,
  handleAdd,
  handleUpdate,
  handleDelete,
  handleImport,
  handleExport,
  getUserList,
  updateDeptId
} = useUser(proxy)

watch(deptId, (newVal) => {
  updateDeptId(newVal)
})
watch(deptName, (val) => {
  proxy.$refs['deptTreeRef'].filter(val)
})
onMounted(() => {
  getDeptTree()
  getUserList()
})
</script>

<style lang="scss" scoped></style>
