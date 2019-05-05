<template>
  <div>
    <com-crumb nm="商品列表" xnm="添加商品"/>

    <el-card class="box-card">
      <el-alert title="消息提示的文案" type="info" center show-icon></el-alert>

      <el-steps :active="activeName-0" align-center>
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>

      <el-form :model="formGoodsAdd" :rules="addFormRules" label-width="100px">
        <el-tabs
          tab-position="left"
          v-model="activeName"
          :before-leave="beforTab"
          @tab-click="handleClick"
        >
          <el-tab-pane name="1" label="基本信息">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="formGoodsAdd.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input type="number" v-model="formGoodsAdd.goods_price"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input type="number" v-model="formGoodsAdd.goods_weight"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input type="number" v-model="formGoodsAdd.goods_number"></el-input>
            </el-form-item>
            <el-form-item label="商品分类" prop="goods_cat">
              <el-cascader
                expand-trigger="hover"
                :options="catList"
                v-model="catSelected"
                :props="catProps"
                @change="catChange()"
                change-on-select
                clearable
              ></el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane name="2" label="商品参数">
            <el-form-item :label="v.attr_name" v-for="(v,k) in manyList" :key="k">
              <el-checkbox-group v-model="v.attr_vals_arr">
                <template slot-scope="info">
                  <el-checkbox :label="vv" v-for="(vv,j) in v.attr_vals_arr" :key="j"></el-checkbox>
                </template>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane name="3" label="商品属性">
            <el-form-item
              label-width="150px"
              :label="v.attr_name"
              v-for="(v,k) in onlyList"
              :key="k"
            >
              <el-input v-model="v.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane name="4" label="商品图片">
            <el-upload
              action="http://127.0.0.1:11333/api/private/v1/upload"
              :headers="headers"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              :on-success="handleSuccess"
              list-type="picture"
            >
              <el-button size="small" type="primary">点击上传</el-button>
            </el-upload>
          </el-tab-pane>

          <el-tab-pane name="5" label="商品内容">
            <quill-editor v-model="formGoodsAdd.goods_introduce"></quill-editor>
            <el-button type="primary" @click="addGoods">添加商品</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>
  </div>
</template>

<script>
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'

import { quillEditor } from 'vue-quill-editor'
export default {
  components: {
    quillEditor
  },

  created() {
    this.getCatList()
  },
  methods: {
    async addGoods() {
      this.formGoodsAdd.goods_cat = this.catSelected.join(',')

      this.manyList.forEach((item, i) => {
        if (item.attr_vals.length > 0) {
          let obj = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals.join(',')
          }
          this.formGoodsAdd.attrs.push(obj)
        }
      })

      this.onlyList.forEach((item, i) => {
        if (item.attr_vals.length > 0) {
          let obj = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals
          }
          this.formGoodsAdd.attrs.push(obj)
        }
      })

      const { data: dt } = await this.$http.post('goods', this.formGoodsAdd)
      //   console.log(dt)
      if (dt.meta.status !== 201) {
        return this.$message.error(dt.meta.msg)
      }
      this.$router.push('/goods')
    },
    handlePreview(file) {},
    handleRemove(file) {
      // console.log(file)
      const tem_path = file.response.data.tem_path
      const index = this.formGoodsAdd.pics.findIndex((item, i) => {
        return item.pic === tem_path
      })
      this.formGoodsAdd.pics.splice(index, 1)
    },
    handleSuccess(response) {
      // console.log(response)
      const tem_path = response.data.tem_path
      this.formGoodsAdd.pics.push({
        pic: tem_path
      })
    },

    async handleClick() {
      //   请求动态参数
      if (this.activeName === '2') {
        const { data: dt } = await this.$http.get(
          `categories/${this.threeCatId}/attributes`,
          { params: { sel: 'many' } }
        )
        // console.log(dt)
        if (dt.meta.status !== 200) {
          return this.$message.error(dt.meta.msg)
        }
        dt.data.forEach(item => {
          item.attr_vals_arr = item.attr_vals.split(' ')
        })

        this.manyList = dt.data
      }

      // 请求静态参数
      if (this.activeName === '3') {
        const { data: dt } = await this.$http.get(
          `categories/${this.threeCatId}/attributes`,
          { params: { sel: 'only' } }
        )
        // console.log(dt)
        if (dt.meta.status !== 200) {
          return this.$message.error(dt.meta.msg)
        }

        this.onlyList = dt.data
      }
    },

    beforTab(activeName, oldActiveName) {
      if (oldActiveName === '1' && this.catSelected.length !== 3) {
        this.$message.error('请选取第三级商品分类')
        return false
      }
    },

    async getCatList() {
      const { data: dt } = await this.$http.get('categories', {
        params: { type: 3 }
      })
      //   console.log(dt)
      if (dt.meta.status !== 200) {
        return this.$message.error(dt.meta.msg)
      }
      this.catList = dt.data
    },
    catChange() {
      this.threeCatId = this.catSelected[2]
    }
  },
  data() {
    return {
      headers: {
        Authorization: window.sessionStorage.getItem('token')
      },
      onlyList: [],
      manyList: [],
      catList: [],
      catSelected: [],
      catProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      activeName: '1',
      formGoodsAdd: {
        goods_name: '',
        goods_price: '',
        goods_number: '',
        goods_weight: '',
        goods_introduce: '',

        goods_cat: '',
        pics: [],
        attrs: []
      },
      addFormRules: {
        goods_name: [
          { required: true, message: '请输入商品名称', trigger: 'blur' }
        ],
        goods_price: [
          { required: true, message: '请输入商品价格', trigger: 'blur' }
        ],
        goods_weight: [
          { required: true, message: '请输入商品重量', trigger: 'blur' }
        ],
        goods_number: [
          { required: true, message: '请输入商品数量', trigger: 'blur' }
        ],
        goods_cat: [
          { required: true, message: '请选取商品分类', trigger: 'blur' }
        ]
      }
    }
  }
}
</script>

<style lang="less" scoped>
.el-step {
  margin: 15px;
}
</style>
