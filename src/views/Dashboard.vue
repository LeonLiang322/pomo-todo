<script setup lang='ts'>
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
</script>

<template>
  <div class="border-2 flex justify-center flex-wrap gap-2 p-4 h-full overflow-y-auto">

    <Card class="h-72" v-for="i in 18">
      <CardHeader>
        <CardTitle>Card Title</CardTitle>
        <CardDescription>Card Description</CardDescription>
      </CardHeader>
      <CardContent>
        Card Content
      </CardContent>
      <CardFooter>
        Card Footer
      </CardFooter>
    </Card>



  </div>

</template>
