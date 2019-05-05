<template>
  <div>
    <com-crumb nm="商品管理" xnm="参数列表"/>

    <el-card class="box-card">
      <el-alert title="注意：只允许为第三级分类设置相关参数！" type="warning" show-icon></el-alert>

      <el-row>
        <el-col>选择商品分类：
          <el-cascader
            expand-trigger="hover"
            :options="catThreeList"
            v-model="catThreeSelected"
            :props="catThreeProps"
            @change="catThreeChange()"
            change-on-select
            clearable
          ></el-cascader>
        </el-col>
      </el-row>

      <el-tabs v-model="activeName" @tab-click="tabsClick()">
        <el-tab-pane label="动态参数" name="many">
          <el-button type="primary" size="mini" :disabled="showButton">添加动态参数</el-button>
          <el-table :data="manyParamList" border stripe style="width: 100%" row-key="cat_id">
            <el-table-column type="expand" width="50">
              <template slot-scope="info">
                <el-tag v-for="(v,k) in info.row.attr_vals_arr" :key="k">{{v}}</el-tag>
                <el-input
                  class="input-new-tag"
                  v-if="inputVisible"
                  v-model="inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(info.row)"
                  @blur="handleInputConfirm(info.row)"
                ></el-input>
                <el-button v-else class="button-new-tag" size="small" @click="showInput">+ New Tag</el-button>
              </template>
            </el-table-column>
            <el-table-column type="index" label="序号" width="200"></el-table-column>
            <el-table-column prop="attr_name" label="参数名称" width="200"></el-table-column>
            <el-table-column label="操作">
              <el-button type="primary" icon="el-icon-edit" size="mini">编辑</el-button>
              <el-button type="danger" icon="el-icon-delete" size="mini">删除</el-button>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="静态参数" name="only">
          <el-button type="primary" size="mini" :disabled="showButton">添加静态参数</el-button>
          <el-table :data="onlyParamList" border stripe style="width: 100%">
            <el-table-column type="expand" width="50">
              <template slot-scope="info">
                <el-tag v-for="(v,k) in info.row.attr_vals_arr" :key="k">{{v}}</el-tag>
              </template>
            </el-table-column>
            <el-table-column type="index" label="序号" width="200"></el-table-column>
            <el-table-column prop="attr_name" label="参数名称" width="200"></el-table-column>
            <el-table-column label="操作">
              <el-button type="primary" icon="el-icon-edit" size="mini">编辑</el-button>
              <el-button type="danger" icon="el-icon-delete" size="mini">删除</el-button>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script>
export default {
  created() {
    this.getcatThreeList()
  },
  methods: {
    showInput() {
      this.inputVisible = true
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },

    handleInputConfirm(nowParam) {
      // let inputValue = this.inputValue
      // if (inputValue) {
      //   this.dynamicTags.push(inputValue)
      // }
      if (this.inputValue.trim() !== '') {
        nowParam.attr_vals_arr.push(this.inputValue.trim())
      }
      this.inputVisible = false
      this.inputValue = ''
    },

    async getParamList() {
      const { data: dt } = await this.$http.get(
        `categories/${this.catThreeId}/attributes`,
        { params: { sel: this.activeName } }
      )
      // console.log(dt)
      if (dt.meta.status !== 200) {
        return this.$message.error(dt.meta.msg)
      }
      dt.data.forEach(item => {
        item.attr_vals_arr = item.attr_vals.split(' ')
      })
      if (this.activeName === 'many') {
        this.manyParamList = dt.data
      } else {
        this.onlyParamList = dt.data
      }
    },
    tabsClick() {
      if (this.catThreeId !== 0) {
        this.getParamList()
      }
    },
    catThreeChange() {
      // console.log(this.catThreeSelected)
      var len = this.catThreeSelected.length
      if (len === 3) {
        this.showButton = false
        this.catThreeId = this.catThreeSelected[2]
        this.getParamList()
      } else {
        this.showButton = true
        this.catThreeSelected = []
        this.catThreeId = 0
        this.manyParamList = []
        this.onlyParamList = []
      }
    },
    async getcatThreeList() {
      const { data: dt } = await this.$http.get('categories', {
        params: { type: 3 }
      })
      //   console.log(dt)
      if (dt.meta.status !== 200) {
        return this.$message.error(dt.meta.msg)
      }
      this.catThreeList = dt.data
    }
  },
  data() {
    return {
      inputVisible: false,
      inputValue: '',

      manyParamList: [],
      onlyParamList: [],
      catThreeId: 0,
      showButton: true,
      activeName: 'many',
      catThreeList: [],
      catThreeSelected: [],
      catThreeProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      }
    }
  }
}
</script>

<style lang="less" scoped>
.el-tag {
  margin: 10px 5px;
}
.input-new-tag {
  width: 90px;
}
</style>
