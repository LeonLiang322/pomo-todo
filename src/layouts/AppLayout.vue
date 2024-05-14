<script setup lang="ts">
import { Menu, Package2 } from 'lucide-vue-next'

import { Button } from '@/components/ui/button'

import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import WindowCtl from "@/components/WindowCtl.vue";
import { Toaster } from "@/components/ui/toast";
</script>

<template>
  <div class="flex min-h-screen w-full flex-col">
    <header class="sticky top-0 flex h-14 items-center gap-4 border-b bg-background px-4 md:px-6 drag-enabled">
      <nav class="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6 drag-disabled">
        <a
            href="/dashboard"
            class="flex items-center gap-2 text-lg font-semibold md:text-base"
        >
          <Package2 class="h-6 w-6" />
          <span class="sr-only">Acme Inc</span>
        </a>
        <a
            href="/dashboard"
            class="text-foreground transition-colors hover:text-foreground"
        >
          数据面板
        </a>
        <a
            href="/today"
            class="text-muted-foreground transition-colors hover:text-foreground"
        >
          我的一天
        </a>
        <a
            href="/todo"
            class="text-muted-foreground transition-colors hover:text-foreground"
        >
          计划任务
        </a>
        <a
            href="/pomo"
            class="text-muted-foreground transition-colors hover:text-foreground"
        >
          专注时钟
        </a>
      </nav>
      <Sheet>
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
        <SheetContent side="left">
          <nav class="grid gap-6 text-lg font-medium">
            <a
                href="#"
                class="flex items-center gap-2 text-lg font-semibold"
            >
              <Package2 class="h-6 w-6" />
              <span class="sr-only">Acme Inc</span>
            </a>
            <a href="#" class="hover:text-foreground">
              Dashboard
            </a>
            <a
                href="#"
                class="text-muted-foreground hover:text-foreground"
            >
              Orders
            </a>
            <a
                href="#"
                class="text-muted-foreground hover:text-foreground"
            >
              Products
            </a>
            <a
                href="#"
                class="text-muted-foreground hover:text-foreground"
            >
              Customers
            </a>
            <a
                href="#"
                class="text-muted-foreground hover:text-foreground"
            >
              Analytics
            </a>
          </nav>
        </SheetContent>
      </Sheet>
      <WindowCtl />
    </header>
    <main class="py-4 px-6">
      <RouterView />
    </main>
    <Toaster />
  </div>
</template>
