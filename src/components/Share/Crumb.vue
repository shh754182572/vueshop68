<template>
  <el-breadcrumb separator-class="el-icon-arrow-right">
    <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
    <el-breadcrumb-item>{{nm}}管理</el-breadcrumb-item>
    <el-breadcrumb-item>{{xnm}}列表</el-breadcrumb-item>
  </el-breadcrumb>
</template>

<script>
export default {
  props: ['nm', 'xnm']
}
</script>

<style lang="less" scoped>
</style>
