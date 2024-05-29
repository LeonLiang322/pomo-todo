<script setup lang='ts'>
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
</script>

<template>
  <div class="border-2 grid grid-cols-4 gap-2 p-4 w-full h-full">
    <div v-for="i in 8" class="border flex flex-col gap-4 w-full">
      <Card class="w-full h-full">
        <CardHeader>
          <CardTitle>Create project</CardTitle>
          <CardDescription>Deploy your new project in one-click.</CardDescription>
        </CardHeader>
        <CardContent>
          <form>
            <div class="grid items-center w-full gap-4">
              <div class="flex flex-col space-y-1.5">
                <Label for="name">Name</Label>
                <Input id="name" placeholder="Name of your project" />
              </div>
              <div class="flex flex-col space-y-1.5">
                <Label for="framework">Framework</Label>
                <Select>
                  <SelectTrigger id="framework">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    <SelectItem value="nuxt">
                      Nuxt.js
                    </SelectItem>
                    <SelectItem value="next">
                      Next.js
                    </SelectItem>
                    <SelectItem value="sveltekit">
                      SvelteKit
                    </SelectItem>
                    <SelectItem value="astro">
                      Astro
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter class="flex justify-between px-6 pb-6">
          <Button variant="outline">
            Cancel
          </Button>
          <Button>Deploy</Button>
        </CardFooter>
      </Card>
    </div>



  </div>

</template>
