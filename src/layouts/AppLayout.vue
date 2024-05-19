<script setup lang="ts">
import { onMounted, ref } from "vue";
import router from "@/router";
import { Menu, Package2 } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Toaster } from "@/components/ui/toast";
import WindowCtl from "@/components/WindowCtl.vue";

const ipc = (window as any).ipcRenderer;
const sheet = ref(false);

const redirect = (path: string) => {
  router.push(path);
};

</script>

<template>
  <div class="flex w-full h-full flex-col">
    <header class="sticky top-0 flex h-14 items-center gap-4 border-b bg-background px-4 md:px-6 drag-enabled">

      <nav class="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6 drag-disabled">
        <div
            class="flex items-center gap-2 text-lg font-semibold md:text-base"
            @click="redirect('/dashboard')"
        >
          <Package2 class="h-6 w-6" />
          <span class="sr-only">Acme Inc</span>
        </div>
        <div
            class="menu-item"
            @click="redirect('/dashboard')"
        >
          数据面板
        </div>
        <div
            class="menu-item"
            @click="redirect('/today')"
        >
          我的一天
        </div>
        <div
            class="menu-item"
            @click="redirect('/todo')"
        >
          计划任务
        </div>
        <div
            class="menu-item"
            @click="redirect('/pomo')"
        >
          专注时钟
        </div>
      </nav>
      <Sheet v-model:open="sheet">
        <SheetTrigger as-child>
          <Button
              variant="outline"
              size="icon"
              class="shrink-0 md:hidden drag-disabled"
          >
            <Menu class="h-5 w-5" />
            <span class="sr-only">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>

        <SheetContent side="left" @click="sheet = false">
          <SheetDescription />
          <SheetTitle>
            <Package2 class="h-6 w-6 mb-6" />
          </SheetTitle>
          <nav class="grid gap-6 text-lg font-medium">

            <div
                class="menu-item"
                @click="redirect('/dashboard')"
            >
              数据面板
            </div>
            <div
                class="menu-item"
                @click="redirect('/today')"
            >
              我的一天
            </div>
            <div
                class="menu-item"
                @click="redirect('/todo')"
            >
              计划任务
            </div>
            <div
                class="menu-item"
                @click="redirect('/pomo')"
            >
              专注时钟
            </div>
          </nav>
        </SheetContent>
      </Sheet>
      <WindowCtl />
    </header>
    <main class="px-8 h-full w-full flex items-center justify-center overflow-auto">
      <RouterView/>
    </main>
    <Toaster />
  </div>
</template>
