<template>
  <div class="site-grabber">
    <el-form ref="form" :model="form" :rules="rules" label-width="80px">
      <el-form-item :label="$t('task.url')" prop="url">
        <el-input
          v-model="form.url"
          :placeholder="$t('task.url-placeholder')"
          @keydown.enter.native="handleScan"
        >
          <el-button slot="append" @click="handleScan" :loading="scanning">
            {{ $t('task.scan') }}
          </el-button>
        </el-input>
      </el-form-item>
      <el-form-item :label="$t('task.extensions')" prop="extensions">
        <el-input
          v-model="form.extensions"
          :placeholder="$t('task.extensions-placeholder')"
        ></el-input>
      </el-form-item>
    </el-form>

    <div class="scan-result" v-if="files.length > 0">
      <mo-task-files
        ref="siteGrabberFileList"
        mode="ADD"
        :files="files"
        :height="200"
        @selection-change="handleSelectionChange"
      />
    </div>
    <div class="empty-result" v-else-if="scanned">
      {{ $t('task.no-files-found') }}
    </div>
  </div>
</template>

<script>
  import { ipcRenderer } from 'electron'
  import TaskFiles from '@/components/TaskDetail/TaskFiles'
  import {
    NONE_SELECTED_FILES,
    SELECTED_ALL_FILES
  } from '@shared/constants'

  export default {
    name: 'mo-site-grabber',
    components: {
      [TaskFiles.name]: TaskFiles
    },
    data () {
      return {
        form: {
          url: '',
          extensions: 'pdf, mobi'
        },
        rules: {
          url: [
            { required: true, message: 'URL is required', trigger: 'blur' },
            { type: 'url', message: 'Invalid URL format', trigger: 'blur' }
          ]
        },
        scanning: false,
        scanned: false,
        files: [],
        selectedFiles: []
      }
    },
    methods: {
      async handleScan () {
        this.$refs.form.validate(async (valid) => {
          if (!valid) return

          this.scanning = true
          this.scanned = false
          this.files = []
          try {
            // Note: This simple implementation might be blocked by CORS on some sites.
            // A more robust solution would be to use the main process to fetch the URL.
            const data = await ipcRenderer.invoke('application:fetch-url', this.form.url)
            const parser = new DOMParser()
            const doc = parser.parseFromString(data, 'text/html')
            const links = Array.from(doc.querySelectorAll('a'))
            const extensions = this.form.extensions.split(',').map(ext => ext.trim().toLowerCase().replace(/^\./, ''))

            const foundFiles = links
              .map(link => link.href)
              .filter(href => {
                try {
                  const url = new URL(href, this.form.url)
                  const ext = url.pathname.split('.').pop().toLowerCase()
                  return extensions.includes(ext)
                } catch (e) {
                  return false
                }
              })
              .map((href, index) => {
                const url = new URL(href, this.form.url)
                const name = url.pathname.split('/').pop() || `file_${index}`
                return {
                  name,
                  path: href,
                  length: 0, // Unknown size without HEAD request
                  extension: url.pathname.split('.').pop().toLowerCase()
                }
              })

            // Remove duplicates
            const uniqueFiles = []
            const seen = new Set()
            foundFiles.forEach(file => {
              if (!seen.has(file.path)) {
                seen.add(file.path)
                uniqueFiles.push(file)
              }
            })

            this.files = uniqueFiles
            this.scanned = true

            // Select all by default
            this.$nextTick(() => {
              if (this.$refs.siteGrabberFileList) {
                this.$refs.siteGrabberFileList.toggleAllSelection()
              }
            })
          } catch (error) {
            this.$message.error('Scan failed: ' + error.message)
          } finally {
            this.scanning = false
          }
        })
      },
      handleSelectionChange (val) {
        if (val === NONE_SELECTED_FILES) {
          this.selectedFiles = []
        } else if (val === SELECTED_ALL_FILES) {
          this.selectedFiles = this.files
        } else {
          // TaskFiles component returns index string "0,1,2"
          const indices = val.split(',').map(Number)
          this.selectedFiles = this.files.filter((_, index) => indices.includes(index))
        }
        this.$emit('change', this.selectedFiles)
      }
    }
  }
</script>

<style lang="scss">
.site-grabber {
  .empty-result {
    text-align: center;
    padding: 20px;
    color: #909399;
  }
}
</style>
