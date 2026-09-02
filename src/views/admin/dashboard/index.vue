<template>
  <div class="page admin-dashboard">
    <h1>仪表盘</h1>

    <div class="dashboard-grid">
      <!-- 访客统计 -->
      <section class="dashboard-section">
        <h2>访客统计</h2>
        <el-table :data="visitors" stripe v-loading="visitorLoading" empty-text="暂无访客数据">
          <el-table-column prop="ip" label="IP 地址" />
          <el-table-column prop="user_agent" label="User Agent" show-overflow-tooltip />
          <el-table-column prop="visit_time" label="访问时间" />
        </el-table>
        <Pagination v-if="visitorTotal > 10" :current="visitorPage" :total="visitorTotal" :page-size="10"
          @change="onVisitorPageChange" />
      </section>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getVisitorLogs } from '@/api/visitor'
import { ElMessage } from 'element-plus'
import Pagination from '@/components/Pagination.vue'

interface Visitor {
  ip: string
  path: string
  referer: string
  user_agent: string
  visit_time: string
}

const visitors = ref<Visitor[]>([])
const visitorLoading = ref(false)
const visitorPage = ref(1)
const visitorTotal = ref(0)

async function fetchVisitors(page = 1) {
  visitorLoading.value = true
  try {
    const res = await getVisitorLogs({ page, page_size: 10 })
    const payload = res.data.data.logs
    visitors.value = payload.items.map((visitor: {
      ip_address: string
      user_agent: string
      visited_at: string
    }) => ({
      ip: visitor.ip_address,
      path: '',
      referer: '',
      user_agent: visitor.user_agent,
      visit_time: visitor.visited_at,
    }))
    visitorTotal.value = payload.total
  } catch {
    ElMessage.error('获取访客数据失败')
  } finally {
    visitorLoading.value = false
  }
}

function onVisitorPageChange(page: number) {
  visitorPage.value = page
  fetchVisitors(page)
}

onMounted(() => {
  fetchVisitors()
})
</script>

<style scoped>
.dashboard-grid {
  display: flex;
  flex-direction: column;
  gap: 32px;
  margin-top: 20px;
}

.dashboard-section h2 {
  font-size: 17px;
  margin-bottom: 14px;
  color: var(--color-heading, #1a1a1a);
}
</style>
