import { ref } from 'vue'
import { changeUserStatus, listUser, resetUserPwd, delUser, getUser, updateUser, addUser, deptTreeSelect } from '@/api/system/user'

export default function useUser(proxy) {
  const queryParams = ref({
    pageNum: 1,
    pageSize: 10,
    userName: '',
    phonenumber: '',
    status: '',
    dateRange: '',
    deptId: ''
  })
  const showSearch = ref(true)
  const dataOptions = ref([])
  const userFormVisible = ref(false)
  const userInfo = ref({})
  const multipleSelection = ref([])

  const { sys_normal_disable } = proxy.useDict('sys_normal_disable')
  const handleQuery = () => {
    getUserList()
  }
  const resetQuery = () => {
    queryParams.value = {
      pageNum: 1,
      pageSize: 10,
      userName: '',
      phonenumber: '',
      status: '',
      dateRange: '',
      deptId: ''
    }
  }
  const handleStatusChange = (row) => {
    changeUserStatus(row.userId, row.status).then((response) => {
      if (response.code === 200) {
        proxy.$modal.msgSuccess('修改成功')
      } else {
        proxy.$modal.msgError(response.msg)
      }
    })
  }

  const handleSelectionChange = (val) => {
    multipleSelection.value = val
  }
  const getUserList = () => {
    listUser(queryParams.value).then((response) => {
      dataOptions.value = response.data.list
    })
  }

  const handleAdd = () => {
    userFormVisible.value = true
  }
  const handleUpdate = (row, isMultiple) => {
    if (isMultiple) {
      if (row.length === 1) {
        userInfo.value = row[0]
      } else if (row.length > 1) {
        proxy.$modal.msgWarning('请选择单个用户')
        return
      } else {
        proxy.$modal.msgWarning('请选择要修改的用户')
        return
      }
    } else {
      userInfo.value = row
    }
    userFormVisible.value = true
  }
  const handleDelete = (row, isMultiple = false) => {
    if (isMultiple && row.length === 0) {
      proxy.$modal.msgWarning('请选择用户')
      return
    }
    const ids = isMultiple ? row.map((item) => item.userId) : [row.userId]
    proxy.$modal.confirm(`是否确认删除用户编号为${ids.toString()}的数据项?`).then(function () {
      delUser(ids.toString()).then((response) => {
        if (response.code === 200) {
          getUserList()
          proxy.$modal.msgSuccess('删除成功')
        } else {
          proxy.$modal.msgError(response.msg)
        }
      })
    })
  }
  const handleImport = () => {}
  const handleExport = () => {}
  const updateDeptId = (val) => {
    queryParams.value.deptId = val
    getUserList() // 更新部门ID后重新获取用户列表
  }
  return {
    queryParams,
    sys_normal_disable,
    showSearch,
    dataOptions,
    userFormVisible,
    userInfo,
    multipleSelection,
    handleQuery,
    resetQuery,
    handleStatusChange,
    handleSelectionChange,
    getUserList,
    handleAdd,
    handleUpdate,
    handleDelete,
    handleImport,
    handleExport,
    updateDeptId
  }
}
