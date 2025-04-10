<template>
  <el-dialog :title="uploadParams.title" v-model="visible" width="600px" append-to-body>
    <el-upload
        ref="uploadRef"
        :limit="1"
        accept=".xlsx, .xls"
        :headers="uploadParams.headers"
        :action="uploadParams.action"
        :disabled="false"
        :on-progress="handleFileUploadProgress"
        :on-success="handleFileSuccess"
        :auto-upload="false"
        drag
      >
        <el-icon class="el-icon--upload"><upload-filled /></el-icon>
        <div class="el-upload__text">
          将文件拖到此处，或
          <em>点击上传</em>
        </div>
        <template #tip>
          <div class="el-upload__tip text-center">
            <div class="el-upload__tip">
              <el-checkbox v-model="uploadParams.updateSupport" />
              是否更新已经存在的用户数据
            </div>
            <span>仅允许导入xls、xlsx格式文件。</span>
            <el-link type="primary" :underline="false" style="font-size: 12px; vertical-align: baseline" @click="importTemplate">下载模板</el-link>
          </div>
        </template>
      </el-upload>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitFileForm">确 定</el-button>
          <el-button @click="cancelUpload">取 消</el-button>
        </div>
      </template>
  </el-dialog>
</template>

<script setup name="uploadDialog">
import { watch } from 'vue'

const props = defineProps({
  uploadParams: {
    type: Object,
    default: () => {
      return {
        visible: false,
        action: '',
        title: ''
      }
    }
  }
})
const emit = defineEmits(['update:uploadParams'])
const visible = ref(props.uploadParams.visible)
watch(
  () => props.uploadParams.visible,
  (val) => {
    visible.value = val
  }
)
watch(visible, (val) => {
  props.uploadParams.visible = val
  emit('update:uploadParams', props.uploadParams)
})
const handleFileSuccess = () => {}
const handleFileUploadProgress = () => {
  return false
}
const submitFileForm = () => {
  visible.value = false
}
const cancelUpload = () => {
  visible.value = false
}
const importTemplate = () => {

}
</script>

<style lang="scss" scoped></style>
