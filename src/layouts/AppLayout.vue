<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";
import router from "@/router";
import { Menu, Package2, Timer, Pause, FolderSync } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Separator } from '@/components/ui/separator'
import WindowCtl from "@/components/WindowCtl.vue";
import routerConfig from "@/lib/routerConfig.ts";
import { debounce } from 'lodash';

const ipc = (window as any).ipcRenderer;
const pomoStatus = ref('stopped');
const pomoIsFocusPeriod = ref(true);
const sheet = ref(false);
const mainHeight = ref(window.innerHeight);

const updateMainHeight = () => {
  mainHeight.value = window.innerHeight - 48;
};

const debouncedUpdateMainHeight = debounce(updateMainHeight, 200);

const redirect = (path: string) => {
  router.push(path);
};

onMounted(() => {
  updateMainHeight();
  window.addEventListener('resize', debouncedUpdateMainHeight);
  ipc.on('pomo-update-badge', (event: any, data: any) => {
    pomoStatus.value = data.status;
    pomoIsFocusPeriod.value = data.isFocusPeriod;
  });
});

onUnmounted(() => {
  ipc.removeAllListeners('pomo-update-badge');
  window.removeEventListener('resize', debouncedUpdateMainHeight);
});

</script>

<template>
  <div class="w-full h-full">
    <header class="sticky top-0 flex justify-between h-12 items-center border-b-2 drag-enabled">
      <nav class="flex items-center gap-2 h-full px-4 text-sm drag-disabled">
        <div class="hidden sm:flex gap-4 ">
          <div
              class="flex items-center gap-2 text-lg font-semibold md:text-base"
              @click="redirect('/dashboard')"
          >
            <Package2 class="size-5" />
          </div>
          <div class="menu-item" v-for="route in routerConfig" @click="redirect(route.path)">
            {{ route.name }}
          </div>
        </div>
        <Sheet v-model:open="sheet">
          <SheetTrigger as-child>
            <Button
                variant="ghost"
                size="icon"
                class="shrink-0 sm:hidden drag-disabled"
            >
              <Menu class="size-5" />
              <span class="sr-only">Toggle navigation menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left">
            <SheetDescription />
            <SheetTitle>
              <Package2 class="size-6 mb-6" />
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
        <Separator class="ml-4 mr-2 hidden sm:block" orientation="vertical" />
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

      </nav>

      <WindowCtl />
    </header>
    <main class="w-full"
          :style="{ height: mainHeight + 'px' }">
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
</style>
