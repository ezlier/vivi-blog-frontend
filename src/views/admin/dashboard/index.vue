<template>
  <div class="page admin-dashboard">
    <div class="dashboard-grid">
      <!-- 访客统计 -->
      <section class="dashboard-section">
        <div class="section-header">
          <h2>访客统计</h2>
        </div>
        <el-table
          :data="visitors"
          stripe
          v-loading="visitorLoading"
          empty-text="暂无访客数据"
        >
          <el-table-column prop="ip" label="IP 地址" min-width="150" />
          <el-table-column prop="device_type" label="设备类型" width="110" />
          <el-table-column
            prop="user_agent"
            label="User Agent"
            min-width="260"
            show-overflow-tooltip
          />
          <el-table-column prop="visit_time" label="访问时间" width="180" />
          <el-table-column label="操作" width="100" fixed="right">
            <template #default="{ row }">
              <el-button
                size="small"
                type="warning"
                @click="openBlacklistDialog(row.ip)"
              >
                封禁
              </el-button>
            </template>
          </el-table-column>
        </el-table>
        <Pagination
          v-if="visitorTotal > pageSize"
          :current="visitorPage"
          :total="visitorTotal"
          :page-size="pageSize"
          @change="onVisitorPageChange"
        />
      </section>

      <!-- 黑名单管理 -->
      <section class="dashboard-section">
        <div class="section-header">
          <h2>黑名单管理</h2>
          <el-button type="primary" @click="openBlacklistDialog()">
            新建黑名单
          </el-button>
        </div>

        <el-table
          :data="blacklists"
          stripe
          v-loading="blacklistLoading"
          empty-text="暂无黑名单记录"
        >
          <el-table-column prop="ip_address" label="IP 地址" min-width="160" />
          <el-table-column
            prop="reason"
            label="封禁原因"
            min-width="180"
            show-overflow-tooltip
          />
          <el-table-column label="状态" width="90">
            <template #default="{ row }">
              <el-tag :type="row.is_active ? 'danger' : 'info'" size="small">
                {{ row.is_active ? "生效中" : "已停用" }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="有效期" width="180">
            <template #default="{ row }">
              {{ formatDate(row.expires_at, "永久") }}
            </template>
          </el-table-column>
          <el-table-column label="创建时间" width="180">
            <template #default="{ row }">
              {{ formatDate(row.created_at) }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="180" fixed="right">
            <template #default="{ row }">
              <el-button
                size="small"
                :type="row.is_active ? 'warning' : 'success'"
                @click="handleToggleBlacklist(row)"
              >
                {{ row.is_active ? "停用" : "启用" }}
              </el-button>
              <el-button
                size="small"
                type="danger"
                @click="handleDeleteBlacklist(row)"
              >
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
        <Pagination
          v-if="blacklistTotal > pageSize"
          :current="blacklistPage"
          :total="blacklistTotal"
          :page-size="pageSize"
          @change="onBlacklistPageChange"
        />
        <p v-if="blacklistError" class="request-error">{{ blacklistError }}</p>
      </section>
    </div>

    <el-dialog
      v-model="blacklistDialogVisible"
      title="新建黑名单"
      width="min(92vw, 520px)"
      destroy-on-close
    >
      <el-form
        ref="blacklistFormRef"
        :model="blacklistForm"
        :rules="blacklistRules"
        label-position="top"
      >
        <el-form-item label="IP 地址" prop="ip_address">
          <el-input
            v-model="blacklistForm.ip_address"
            placeholder="例如：127.0.0.1 或 17.*.*.*"
            clearable
          />
        </el-form-item>
        <el-form-item label="封禁原因" prop="reason">
          <el-input
            v-model="blacklistForm.reason"
            type="textarea"
            :rows="3"
            maxlength="200"
            show-word-limit
            placeholder="请输入封禁原因"
          />
        </el-form-item>
        <el-form-item label="解除时间">
          <el-date-picker
            v-model="blacklistForm.expires_at"
            type="datetime"
            value-format="YYYY-MM-DDTHH:mm:ss"
            placeholder="留空表示永久封禁"
            clearable
            style="width: 100%"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="blacklistDialogVisible = false">取消</el-button>
        <el-button
          type="primary"
          :loading="blacklistSaving"
          @click="handleCreateBlacklist"
        >
          确认封禁
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from "vue";
import {
  ElMessage,
  ElMessageBox,
  type FormInstance,
  type FormRules,
} from "element-plus";
import Pagination from "@/components/Pagination.vue";
import {
  batchDeleteBlacklists,
  createBlacklist,
  getBlacklist,
  getVisitorLogs,
  updateBlacklist,
} from "@/api/visitor";

interface Visitor {
  ip: string;
  device_type: string;
  user_agent: string;
  visit_time: string;
}

interface Blacklist {
  id: number;
  ip_address: string;
  reason: string;
  is_active: boolean;
  created_at: string;
  expires_at: string | null;
}

const pageSize = 10;
const visitors = ref<Visitor[]>([]);
const visitorLoading = ref(false);
const visitorPage = ref(1);
const visitorTotal = ref(0);
const blacklists = ref<Blacklist[]>([]);
const blacklistLoading = ref(false);
const blacklistPage = ref(1);
const blacklistTotal = ref(0);
const blacklistError = ref("");
const blacklistDialogVisible = ref(false);
const blacklistSaving = ref(false);
const blacklistFormRef = ref<FormInstance>();
const blacklistForm = reactive({
  ip_address: "",
  reason: "",
  expires_at: "",
});

const blacklistRules: FormRules = {
  ip_address: [{ required: true, message: "请输入 IP 地址", trigger: "blur" }],
  reason: [{ required: true, message: "请输入封禁原因", trigger: "blur" }],
};

async function fetchVisitors(page = 1) {
  visitorLoading.value = true;
  try {
    const res = await getVisitorLogs({ page, page_size: pageSize });
    const payload = res.data.data.logs;
    visitors.value = payload.items.map(
      (visitor: {
        ip_address: string;
        user_agent: string;
        device_type?: string;
        visited_at: string;
      }) => ({
        ip: visitor.ip_address,
        device_type: visitor.device_type || "unknown",
        user_agent: visitor.user_agent,
        visit_time: visitor.visited_at,
      }),
    );
    visitorPage.value = page;
    visitorTotal.value = payload.total;
  } catch {
    ElMessage.error("获取访客数据失败");
  } finally {
    visitorLoading.value = false;
  }
}

async function fetchBlacklists(page = 1) {
  blacklistLoading.value = true;
  blacklistError.value = "";
  try {
    const res = await getBlacklist({ page, page_size: pageSize });
    const payload = res.data.data.blacklists;
    blacklists.value = payload.items;
    blacklistPage.value = page;
    blacklistTotal.value = payload.total;
  } catch (error) {
    blacklistError.value =
      error instanceof Error ? error.message : "获取黑名单失败";
  } finally {
    blacklistLoading.value = false;
  }
}

function formatDate(value: string | null, emptyText = "—") {
  if (!value) return emptyText;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("zh-CN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function openBlacklistDialog(ip = "") {
  blacklistForm.ip_address = ip;
  blacklistForm.reason = "";
  blacklistForm.expires_at = "";
  blacklistDialogVisible.value = true;
}

async function handleCreateBlacklist() {
  const valid = await blacklistFormRef.value?.validate().catch(() => false);
  if (!valid) return;

  blacklistSaving.value = true;
  try {
    await createBlacklist({
      ip_address: blacklistForm.ip_address.trim(),
      reason: blacklistForm.reason.trim(),
      expires_at: blacklistForm.expires_at || null,
    });
    ElMessage.success("黑名单创建成功");
    blacklistDialogVisible.value = false;
    await fetchBlacklists(blacklistPage.value);
  } catch {
    ElMessage.error("创建黑名单失败");
  } finally {
    blacklistSaving.value = false;
  }
}

async function handleToggleBlacklist(row: Blacklist) {
  try {
    await updateBlacklist(row.id, { is_active: !row.is_active });
    row.is_active = !row.is_active;
    ElMessage.success(row.is_active ? "黑名单已启用" : "黑名单已停用");
  } catch {
    ElMessage.error("更新黑名单状态失败");
  }
}

async function handleDeleteBlacklist(row: Blacklist) {
  try {
    await ElMessageBox.confirm(
      `确定删除 ${row.ip_address} 的黑名单记录？`,
      "删除黑名单",
      { type: "warning" },
    );
    await batchDeleteBlacklists([row.id]);
    ElMessage.success("黑名单已删除");
    const nextTotal = Math.max(0, blacklistTotal.value - 1);
    const lastPage = Math.max(1, Math.ceil(nextTotal / pageSize));
    await fetchBlacklists(Math.min(blacklistPage.value, lastPage));
  } catch (error) {
    if (error === "cancel" || error === "close") return;
    ElMessage.error("删除黑名单失败");
  }
}

function onVisitorPageChange(page: number) {
  void fetchVisitors(page);
}

function onBlacklistPageChange(page: number) {
  void fetchBlacklists(page);
}

onMounted(() => {
  void fetchVisitors();
  void fetchBlacklists();
});
</script>

<style scoped>
.dashboard-grid {
  display: flex;
  flex-direction: column;
  gap: 32px;
  margin-top: 20px;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
}

.dashboard-section h2 {
  font-size: 17px;
  margin: 0;
  color: var(--color-heading, #1a1a1a);
}

.request-error {
  margin: 12px 0 0;
  color: var(--color-heading);
  font-size: 13px;
  text-align: center;
}

@media (max-width: 640px) {
  .section-header {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
