<template>
  <div class="site-grabber">
    <el-form ref="form" :model="form" :rules="rules" label-width="80px">
      <el-form-item :label="$t('task.url')" prop="url">
        <el-input
          v-model="form.url"
          :placeholder="$t('task.url-placeholder')"
          @keydown.enter.native="handleScan"
        >
        </el-input>
      </el-form-item>

      <el-row>
        <el-col :span="12">
           <el-form-item :label="$t('task.extensions')" prop="extensions">
            <el-input
              v-model="form.extensions"
              :placeholder="$t('task.extensions-placeholder')"
            ></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item :label="$t('task.level')" prop="level">
            <el-input-number
              v-model="form.level"
              :min="1"
              :max="5"
              :placeholder="$t('task.level-placeholder')"
              style="width: 100%"
            ></el-input-number>
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item>
         <el-button type="primary" @click="handleScan" :loading="scanning && !cancelling" v-if="!scanning" style="width: 100%">
            {{ $t('task.scan') }}
          </el-button>
          <el-button type="danger" @click="handleStop" v-else style="width: 100%">
            Stop
          </el-button>
      </el-form-item>
    </el-form>

    <div class="scan-status" v-if="scanning || scanned">
       <div class="status-item text-overflow" :title="currentUrl" v-if="scanning">
         <strong>Scanning:</strong> {{ currentUrl }}
       </div>
       <div class="status-item" v-if="scanning">
         <strong>On Page:</strong> {{ currentPageFoundCount }} files / {{ currentLinksFoundCount }} links
       </div>
       <div class="status-item">
         <strong>Queue:</strong> {{ queueSize }} <span class="divider">|</span> <strong>Visited:</strong> {{ visitedCount }} <span class="divider">|</span> <strong>Total Found:</strong> {{ files.length }}
       </div>
    </div>

    <!-- Scanned Pages List -->
    <div class="visited-pages" v-if="visitedUrls.length > 0">
      <el-collapse>
        <el-collapse-item :title="`Scanned Pages (${visitedUrls.length})`" name="1">
          <ul class="visited-list">
            <li v-for="(url, index) in visitedUrls" :key="index" :title="url">
              {{ url }}
            </li>
          </ul>
        </el-collapse-item>
      </el-collapse>
    </div>

    <div class="scan-result" v-if="files.length > 0">
      <mo-task-files
        ref="siteGrabberFileList"
        mode="ADD"
        :files="files"
        :show-source="true"
        :height="200"
        @selection-change="handleSelectionChange"
      />
    </div>
    <div class="empty-result" v-else-if="scanned && !scanning">
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
          extensions: 'pdf, mobi, jpg, png, mp4, zip',
          level: 1
        },
        rules: {
          url: [
            { required: true, message: 'URL is required', trigger: 'blur' },
            { type: 'url', message: 'Invalid URL format', trigger: 'blur' }
          ]
        },
        scanning: false,
        cancelling: false,
        scanned: false,
        files: [],
        selectedFiles: [],
        visitedCount: 0,
        visitedUrls: [],
        currentUrl: '',
        currentPageFoundCount: 0,
        currentLinksFoundCount: 0,
        queueSize: 0
      }
    },
    methods: {
      handleStop () {
        this.cancelling = true
      },
      handleStop () {
        this.cancelling = true
        ipcRenderer.invoke('application:stop-crawl')
      },
      async handleScan () {
        this.$refs.form.validate(async (valid) => {
          if (!valid) return

          this.scanning = true
          this.cancelling = false
          this.scanned = false
          this.files = []
          this.visitedCount = 0
          this.visitedUrls = []
          this.queueSize = 0
          this.currentUrl = ''
          this.currentPageFoundCount = 0
          this.currentLinksFoundCount = 0

          // Setup listeners
          const onProgress = (event, status) => {
            this.queueSize = status.queue
            this.visitedCount = status.visited
            if (status.current) {
              this.currentUrl = status.current
              this.visitedUrls.push(status.current)
            }
          }

          const onFound = (event, newFiles) => {
            this.files = Object.freeze([...this.files, ...newFiles])
          }

          const onComplete = () => {
            this.scanning = false
            this.scanned = true
            this.currentUrl = 'Done'

            // Cleanup
            ipcRenderer.removeListener('crawl-progress', onProgress)
            ipcRenderer.removeListener('crawl-found', onFound)
            ipcRenderer.removeListener('crawl-complete', onComplete)
          }

          ipcRenderer.on('crawl-progress', onProgress)
          ipcRenderer.on('crawl-found', onFound)
          ipcRenderer.on('crawl-complete', onComplete)

          try {
            await ipcRenderer.invoke('application:start-crawl', {
              url: this.form.url,
              extensions: this.form.extensions,
              maxDepth: this.form.level
            })

            this.$nextTick(() => {
              if (this.$refs.siteGrabberFileList) {
                this.$refs.siteGrabberFileList.toggleAllSelection()
              }
            })
          } catch (error) {
            this.$message.error('Scan failed to start: ' + error.message)
            this.scanning = false

            ipcRenderer.removeListener('crawl-progress', onProgress)
            ipcRenderer.removeListener('crawl-found', onFound)
            ipcRenderer.removeListener('crawl-complete', onComplete)
          }
        })
      },

      handleSelectionChange (val) {
        if (val === NONE_SELECTED_FILES) {
          this.selectedFiles = []
        } else if (val === SELECTED_ALL_FILES) {
          this.selectedFiles = this.files
        } else {
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
  .scan-status {
    padding: 10px;
    margin-bottom: 10px;
    background-color: #f5f7fa;
    border-radius: 4px;
    color: #606266;
    font-size: 13px;

    .status-item {
      margin-bottom: 4px;
      &:last-child {
        margin-bottom: 0;
      }
    }

    .divider {
      color: #dcdfe6;
      margin: 0 8px;
    }

    .text-overflow {
       white-space: nowrap;
       overflow: hidden;
       text-overflow: ellipsis;
    }
  }

  .visited-pages {
    margin-bottom: 10px;
    .visited-list {
      max-height: 150px;
      overflow-y: auto;
      padding: 0 10px;
      margin: 0;
      list-style: none;
      li {
        font-size: 12px;
        color: #606266;
        line-height: 1.5;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }
  }
}
</style>
