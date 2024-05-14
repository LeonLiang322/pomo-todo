<script setup>
import { Button } from '@/components/ui/button'
import { getCurrentInstance } from "vue";

const { proxy } = getCurrentInstance();
const msgToast = () => {
  proxy.$toast('休息一下吧~', '专注暂停');
}
</script>

<template>
  <Button
      variant="outline" @click="msgToast"
  >
    Show Toast
  </Button>
</template>
