import { ref, watch, getCurrentInstance, onMounted } from 'vue'
import { getUser, updateUser, addUser, deptTreeSelect } from '@/api/system/user'

export default function useUserForm(props, emit) {
  const open = ref(false)
  const form = ref({})
  const rules = ref({
    userName: [
      { required: true, message: '用户账号不能为空', trigger: 'blur' },
      { min: 2, max: 20, message: '用户账号长度必须介于 2 和 20 之间', trigger: 'blur' }
    ],
    nickName: [{ required: true, message: '用户昵称不能为空', trigger: 'blur' }],
    password: [
      { required: true, message: '用户密码不能为空', trigger: 'blur' },
      { min: 5, max: 20, message: '用户密码长度必须介于 5 和 20 之间', trigger: 'blur' }
    ],
    email: [{ type: 'email', message: '请输入正确的邮箱地址', trigger: ['blur', 'change'] }],
    phonenumber: [{ pattern: /^1[3|4|5|6|7|8|9][0-9]\d{8}$/, message: '请输入正确的手机号码', trigger: 'blur' }]
  })
  const { proxy } = getCurrentInstance()
  console.log('proxy:', proxy, proxy.useDict)
  const { sys_user_sex, sys_normal_disable } = proxy.useDict('sys_normal_disable', 'sys_user_sex')
  const deptOptions = ref([])
  const postOptions = ref([])
  const roleOptions = ref([])

  watch(
    () => props.visible,
    (val) => {
      open.value = val
      const userId = props.userInfo.userId
      if (userId) {
        getUser(userId).then((res) => {
          const response = res.data
          form.value = response.data
          postOptions.value = response.posts
          roleOptions.value = response.roles
          form.value.postIds = response.postIds
          form.value.roleIds = response.roleIds
        })
      }
    }
  )
  watch(
    () => open.value,
    (val) => {
      emit('update:visible', val)
    }
  )
  // 获取部门树结构
  const getDeptOptions = () => {
    deptTreeSelect().then((response) => {
      deptOptions.value = response.data
    })
  }
  // 获取岗位、角色下拉框数据源
  const getPostAndRoleOptions = () => {
    getUser().then((response) => {
      const { posts, roles } = response.data
      postOptions.value = posts
      roleOptions.value = roles
    })
  }
  const submitForm = () => {
    proxy.$refs['userRef'].validate((valid) => {
      if (valid) {
        if (form.value.userId) {
          updateUser(form.value).then((response) => {
            proxy.$modal.msgSuccess('修改成功')
            emit('ok', form.value)
          })
        } else {
          addUser(form.value).then((response) => {
            proxy.$modal.msgSuccess('新增成功')
            emit('ok', form.value)
          })
        }
        open.value = false
        form.value = {}
      }
    })
  }

  const cancel = () => {
    open.value = false
    form.value = {}
  }
  onMounted(() => {
    getDeptOptions()
    getPostAndRoleOptions()
  })
  return {
    open,
    form,
    rules,
    deptOptions,
    sys_user_sex,
    sys_normal_disable,
    postOptions,
    roleOptions,
    submitForm,
    cancel
  }
}
