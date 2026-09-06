<template>
    <main class="content">
        <CommentSection title="留言墙" :comments="messageList" :on-submit="handleMessage" />
    </main>
</template>

<script setup lang="ts">
import CommentSection from "@/components/CommentSection.vue";
import { getMessages, createMessage } from "@/api/message";
import { onMounted, ref } from "vue";


const messageList = ref<any[]>([]);

async function fetchMessages() {
    try {
        const res = await getMessages();
        const payload = res.data.data.messages;
        messageList.value = payload.items.map(
            (message: {
                id: number;
                nickname: string;
                content: string;
                created_at: string;
            }) => ({
                id: message.id,
                name: message.nickname,
                text: message.content,
                time: message.created_at,
            }),
        );
    } catch {
        messageList.value = [];
    }
}

async function handleMessage(data: {
    name: string;
    text: string;
    QQ?: string;
    email?: string;
}) {
    await createMessage(data as any);
    await fetchMessages();
}

onMounted(async () => {
    await fetchMessages();
});
</script>

<style scoped>
.content {
    width: 100%;
    background-color: var(--color-background);
    border-radius: var(--border-radius-xs);
    padding: 20px;
}
</style>