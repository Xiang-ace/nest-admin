import { ref } from 'vue'
import { deptTreeSelect } from '@/api/system/user'

let deptName = ref('')
let deptId = ref('')

const deptOptions = ref([])
/** 查询部门下拉树结构 */
function getDeptTree() {
  deptTreeSelect().then((response) => {
    deptOptions.value = response.data
  })
}
const filterNode = (value, data) => {
  if (!value) return true
  return data.label.indexOf(value) !== -1
}
const handleNodeClick = (data) => {
  deptId.value = data.id
}
export default function useTree() {
  return {
    deptName,
    deptId,
    deptOptions,
    getDeptTree,
    filterNode,
    handleNodeClick
  }
}
