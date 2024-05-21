<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";
import router from "@/router";
import { Menu, Package2, Timer, Pause, FolderSync } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Separator } from '@/components/ui/separator'
import WindowCtl from "@/components/WindowCtl.vue";
import routerConfig from "@/lib/routerConfig.ts";

const ipc = (window as any).ipcRenderer;
const pomoStatus = ref('stopped')
const pomoIsFocusPeriod = ref(true);

const sheet = ref(false);

const redirect = (path: string) => {
  router.push(path);
};

onMounted(() => {
  ipc.on('pomo-update-badge', (event: any, data: any) => {
    pomoStatus.value = data.status;
    pomoIsFocusPeriod.value = data.isFocusPeriod;
  });
})

onUnmounted(() => {
  ipc.removeAllListeners('pomo-update-badge');
})

</script>

<template>
  <div class="flex w-full h-full flex-col">
    <header class="sticky top-0 flex h-12 items-center gap-2 sm:gap-4 border-b bg-background px-4 md:px-6 drag-enabled">
      <nav class="hidden flex-col gap-2 md:gap-4 text-lg font-medium md:flex md:flex-row md:items-center md:text-sm drag-disabled">
        <div
            class="flex items-center gap-2 text-lg font-semibold md:text-base"
            @click="redirect('/dashboard')"
        >
          <Package2 class="h-5 w-5" />
        </div>
        <div class="menu-item" v-for="route in routerConfig" @click="redirect(route.path)">
          {{ route.name }}
        </div>
      </nav>
      <Sheet v-model:open="sheet">
        <SheetTrigger as-child>
          <Button
              variant="ghost"
              size="icon"
              class="shrink-0 md:hidden drag-disabled"
          >
            <Menu class="h-5 w-5" />
            <span class="sr-only">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left">
          <SheetDescription />
          <SheetTitle>
            <Package2 class="h-6 w-6 mb-6" />
          </SheetTitle>
          <nav class="grid gap-6 text-lg font-medium">
            <div v-for="route in routerConfig" class="menu-item" @click="() => {
              redirect(route.path);
              sheet = false;
            }">
              {{ route.name }}
            </div>
          </nav>
        </SheetContent>
      </Sheet>
      <Separator class="ml-4 mr-2 hidden md:block" orientation="vertical" />
      <div class="toolbar">
        <Button v-if="pomoStatus !== 'stopped'" variant="ghost" size="icon" @click="redirect('pomo')">
          <span v-if="pomoStatus === 'started'">
            <Timer
                class="absolute inline-flex h-5 w-5 animate-ping-slow opacity-75"
                :class="pomoIsFocusPeriod ? 'text-yellow-500' : 'text-green-500'"
            />
            <Timer
                class="relative inline-flex h-5 w-5"
                :class="pomoIsFocusPeriod ? 'text-yellow-500' : 'text-green-500'"
            />
          </span>
          <Pause class="h-5 w-5 text-red-500" v-if="pomoStatus === 'paused'"/>
        </Button>
        <Button variant="ghost" size="icon" @click="">
          <FolderSync class="h-5 w-5 stroke-1" />
        </Button>
      </div>
      <WindowCtl />
    </header>
    <main class="h-full w-full flex items-center justify-center overflow-auto">
      <RouterView/>
    </main>
    <!--<Toaster />-->
  </div>
</template>

<style scoped>

</style>
