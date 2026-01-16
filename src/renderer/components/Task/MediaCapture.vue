<template>
  <div class="media-capture">
    <el-form ref="form" :model="form" :rules="rules" label-width="80px">
      <el-form-item :label="$t('task.url')" prop="url">
        <el-input
          v-model="form.url"
          :placeholder="$t('task.url-placeholder')"
          @keydown.enter.native="handleAnalyze"
        >
          <el-button slot="append" @click="handleAnalyze" :loading="analyzing">
            {{ $t('task.analyze') }}
          </el-button>
        </el-input>
      </el-form-item>
    </el-form>

    <div class="media-result" v-if="mediaInfo">
      <div class="media-info">
        <div class="media-thumb" v-if="mediaInfo.thumbnail">
          <img :src="mediaInfo.thumbnail" alt="thumbnail">
        </div>
        <div class="media-details">
          <div class="media-title" :title="mediaInfo.title">{{ mediaInfo.title }}</div>
          <div class="media-meta" v-if="mediaInfo.duration">Dictionary: {{ formatDuration(mediaInfo.duration) }}</div>
        </div>
      </div>

      <div class="media-formats" v-if="mediaInfo.formats && mediaInfo.formats.length">
        <el-table :data="mediaInfo.formats" style="width: 100%" height="200" @row-click="handleRowClick">
           <el-table-column property="ext" label="Ext" width="80"></el-table-column>
           <el-table-column property="resolution" label="Resolution" width="120"></el-table-column>
           <el-table-column property="filesize" label="Size">
             <template slot-scope="scope">
               {{ scope.row.filesize ? formatBytes(scope.row.filesize) : 'N/A' }}
             </template>
           </el-table-column>
           <el-table-column label="Action" width="100">
             <template slot-scope="scope">
               <el-button size="mini" @click.stop="handleDownload(scope.row)">Download</el-button>
             </template>
           </el-table-column>
        </el-table>
      </div>
    </div>
  </div>
</template>

<script>
  import { ipcRenderer } from 'electron'
  import { bytesToSize } from '@shared/utils'

  export default {
    name: 'mo-media-capture',
    data () {
      return {
        form: {
          url: ''
        },
        rules: {
          url: [
            { required: true, message: 'URL is required', trigger: 'blur' }
          ]
        },
        analyzing: false,
        mediaInfo: null
      }
    },
    methods: {
      async handleAnalyze () {
        this.$refs.form.validate(async (valid) => {
          if (!valid) return

          this.analyzing = true
          this.mediaInfo = null

          try {
            const data = await ipcRenderer.invoke('application:media-analyze', this.form.url)
            this.mediaInfo = data
          } catch (error) {
            this.$message.error('Analyze failed: ' + error.message)
          } finally {
            this.analyzing = false
          }
        })
      },
      handleRowClick (row) {
        // Optional: highlight row
      },
      handleDownload (format) {
        const file = {
          name: `${this.mediaInfo.title}.${format.ext}`,
          path: format.url
        }
        // Emit changes so AddTask parent can pick it up
        // The structure needs to match what AddTask expects.
        // For SiteGrabber it expects an array of files. We can do the same.
        this.$emit('change', [file])

        // Auto-trigger submit in parent if possible, or just let user click submit.
        // But AddTask logic for SITE_GRABBER expects us to have set 'siteGrabberFiles' in the form.
        // Let's rely on the user clicking "Submit" or we can try to automate it?
        // For now, let's behave like Site Grabber: update the list in parent.
        this.$message.success('Selected format added to task list. Click "Submit" to start.')
      },
      formatDuration (seconds) {
        // Simple formatter
        const h = Math.floor(seconds / 3600)
        const m = Math.floor((seconds % 3600) / 60)
        const s = seconds % 60
        return [h, m, s].map(v => v < 10 ? '0' + v : v).filter((v, i) => v !== '00' || i > 0).join(':')
      },
      formatBytes (bytes) {
        return bytesToSize(bytes)
      }
    }
  }
</script>

<style lang="scss">
.media-capture {
  .media-result {
      margin-top: 20px;
  }
  .media-info {
      display: flex;
      margin-bottom: 15px;

      .media-thumb {
          width: 120px;
          margin-right: 15px;
          img {
              width: 100%;
              border-radius: 4px;
          }
      }
      .media-details {
          flex: 1;
          .media-title {
              font-weight: bold;
              font-size: 14px;
              margin-bottom: 5px;
              display: -webkit-box;
              -webkit-line-clamp: 2;
              -webkit-box-orient: vertical;
              overflow: hidden;
          }
          .media-meta {
              color: #909399;
              font-size: 12px;
          }
      }
  }
}
</style>
