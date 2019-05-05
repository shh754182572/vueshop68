<template>
  <div>
    <com-crumb nm="商品管理" xnm="商品列表"/>

    <el-card class="box-card">
      <!-- <el-dialog
        @close="$refs.editFormRef.resetFields()"
        title="修改用户"
        :visible.sync="editGoodDialog"
        width="30%"
      >
        <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="80px">
          <el-form-item label="用户名" prop="goodname">
            <el-input v-model="editForm.goodname" disabled></el-input>
          </el-form-item>
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="editForm.email"></el-input>
          </el-form-item>
          <el-form-item label="手机号码" prop="mobile">
            <el-input v-model="editForm.mobile"></el-input>
          </el-form-item>
        </el-form>

        <span slot="footer" class="dialog-footer">
          <el-button @click="editGoodDialog= false">取 消</el-button>
          <el-button type="primary" @click="editgood()">确 定</el-button>
        </span>
      </el-dialog>-->
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input
            placeholder="请输入搜索内容"
            v-model="querycdt.query"
            class="input-with-select"
            clearable
            @clear="getGoodList()"
            @keyup.enter.native="getGoodList()"
          >
            <el-button slot="append" icon="el-icon-search" @click="getGoodList()"></el-button>
          </el-input>
        </el-col>
        <el-col :span="8">
          <el-button type="primary" @click="goAddPage()">添加商品</el-button>
        </el-col>
      </el-row>

      <el-table :data="goodList" border stripe style="width: 100%">
        <el-table-column type="index" label="序号" width="60"></el-table-column>
        <el-table-column prop="goods_name" label="商品名称"></el-table-column>
        <el-table-column prop="goods_price" label="商品价格" width="80"></el-table-column>
        <el-table-column prop="goods_weight" label="商品重量" width="100"></el-table-column>
        <el-table-column label="创建时间" width="150">
          <template slot-scope="info">
            <span>{{info.row.add_time |dateFormat}}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template slot-scope="info">
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="showEditDlalog(info.row.goods_id)"
            ></el-button>
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="delGood(info.row.goods_id)"
            ></el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="querycdt.pagenum"
        :page-sizes="[ 5, 10, 15,20]"
        :page-size="querycdt.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="tot"
      ></el-pagination>
    </el-card>
  </div>
</template>

<script>
export default {
  created() {
    this.getGoodList()
  },

  methods: {
    //   跳转到添加商品页面
    goAddPage() {
      // console.log(this)
      this.$router.push('goodsadd')
    },
    // 修改用户信息
    // editgood() {
    //   this.$refs.editFormRef.validate(async valid => {
    //     const { data: dt } = await this.$http.put(
    //       'goods/' + this.editForm.id,
    //       this.editForm
    //     )
    //     // console.log(dt)
    //     if (dt.meta.status !== 200) {
    //       return this.$message.error(dt.meta.msg)
    //     }
    //     this.$message.success(dt.meta.msg)
    //     this.editGoodDialog = false
    //     this.getGoodList()
    //   })
    // },
    // 展示修改商品表单
    // async showEditDlalog(goods_id) {
    //   const { data: dt } = await this.$http.put('goods/' +goods_id)
    //   //   console.log(dt)
    //   if (dt.meta.status !== 200) {
    //     return this.$message.error(dt.meta.msg)
    //   }
    //   this.editForm = dt.data
    //   this.editGoodDialog = true
    // },
    // 删除用户
    delGood(goodsId) {
      this.$confirm('确定要删除该用户么？', '删除用户', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(async() => {
          const { data: dt } = await this.$http.delete('goods/' + goodsId)
          //   console.log(dt)
          if (dt.meta.status !== 200) {
            return this.$message.error(dt.meta.mag)
          }
          this.$message.success(dt.meta.msg)
          if (this.goodList.length === 1 && this.querycdt.pagenum > 1) {
            this.querycdt.pagenum--
          }
          this.getGoodList()
        })
        .catch(() => {})
    },

    // 每页条数变化
    handleSizeChange(val) {
      this.querycdt.pagesize = val
      this.getGoodList()
    },
    // 每页页码变化
    handleCurrentChange(val) {
      this.querycdt.pagenum = val
      this.getGoodList()
    },
    // 获取商品数据
    async getGoodList() {
      const { data: dt } = await this.$http.get('goods', {
        params: this.querycdt
      })
      console.log(dt)
      if (dt.meta.status !== 200) {
        return this.$message.error(dt.meta.msg)
      }
      this.tot = dt.data.total
      this.goodList = dt.data.goods
    }
  },

  data() {
    return {
      addGoodDialog: false,

      id: 0,
      tot: 0,
      goodList: [],
      querycdt: {
        query: '',
        pagenum: 1,
        pagesize: 5
      }
    }
  }
}
</script>

<style lang="less" scoped>
</style>
