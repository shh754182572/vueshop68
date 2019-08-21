<template>
  <div>
    <com-crumb nm="商品管理" xnm="商品分类" />

    <el-dialog
      @close="$refs.editFormRef.resetFields()"
      title="修改分类"
      :visible.sync="editCatDialog"
      width="50%"
    >
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="80px">
        <el-form-item label="分类名称" prop="cat_name" >
          <el-input v-model="editForm.cat_name"></el-input>
        </el-form-item>
      </el-form>

      <span slot="footer" class="dialog-footer">
        <el-button @click="editCatDialog= false">取 消</el-button>
        <el-button type="primary" @click="editCat()">确 定</el-button>
      </span>
    </el-dialog>

    <el-dialog @close="reseForm()" title="添加分类" :visible.sync="addCatDialog" width="50%">
      <el-form :model="addCat" :rules="addCatRules" ref="addCatRef" label-width="120px">
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="addCat.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="分类上级">
          <el-cascader
            expand-trigger="hover"
            :options="catTwoList"
            v-model="catTwoSelected"
            :props="catTwoProps"
            @change="catTwoChange()"
            change-on-select
            clearable
          ></el-cascader>
        </el-form-item>
      </el-form>

      <span slot="footer" class="dialog-footer">
        <el-button @click="addCatDialog= false">取 消</el-button>
        <el-button type="primary" @click="tianjia()">确 定</el-button>
      </span>
    </el-dialog>

    <el-card class="box-card">
      <el-button type="primary" @click="showaddCatDialog()">添加分类</el-button>
      <el-table :data="catList" border stripe style="width: 100%" row-key="cat_id">
        <el-table-column label="序号" type="index" width="200px">
          <!-- <template slot-scope="info">
            <el-col v-if="info.row.cat_level===0">★</el-col>
          </template>-->
        </el-table-column>
        <el-table-column prop="cat_name" label="分类名称" width="200"></el-table-column>
        <el-table-column prop="cat_pid" label="是否有效" width="200">
          <i class="el-icon-success" style="color:rgb(68,178,170)"></i>
        </el-table-column>
        <el-table-column prop="cat_level" label="等级" width="200">
          <template slot-scope="info">
            <el-tag v-if="info.row.cat_level=='0'">一级</el-tag>
            <el-tag v-else-if="info.row.cat_level=='1'" type="success">二级</el-tag>
            <el-tag v-else type="warning">三级</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="info">
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="showEditCat(info.row.cat_id)"
            >编辑</el-button>
            <el-button type="danger" icon="el-icon-delete" size="mini" @click="delCat(info.row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="querycdt.pagenum"
        :page-size="querycdt.pagesize"
        layout="total, prev, pager, next, jumper"
        :total="tot"
      ></el-pagination>
    </el-card>
  </div>
</template>

<script>
export default {
  created() {
    this.getCatList()
  },
  methods: {
    // 每页条数变化
    handleSizeChange(val) {
      this.querycdt.pagesize = val
      this.getCatList()
    },
    // 每页页码变化
    handleCurrentChange(val) {
      this.querycdt.pagenum = val
      this.getCatList()
    },

    reseForm() {
      this.$refs.addCatRef.resetFields()
      this.catTwoSelected = []
      this.addCat.cat_pid = 0
      this.addCat.cat_level = 0
    },
    //展示修改分类
    async showEditCat(id) {
      const { data: dt } = await this.$http.get('categories/' + id)
      console.log(dt)
      if (dt.meta.status !== 200) {
        return this.$message.error(dt.meta.msg)
      }
      this.editForm = dt.data
      this.editCatDialog = true
    },
    // 修改用户信息
    editCat() {
      this.$refs.editFormRef.validate(async valid => {
        const { data: dt } = await this.$http.put(
          'categories/' + this.editForm.cat_id +this.editForm.cat_name,
          this.editForm
        )
        // console.log(dt)
        if (dt.meta.status !== 200) {
          return this.$message.error(dt.meta.msg)
        }
        this.$message.success(dt.meta.msg)
        this.editCatDialog = false
        this.getCatList()
      })
    },
    // 删除用户
    delCat(id) {
      this.$confirm('确定要删除该用户么？', '删除用户', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(async() => {
          const { data: dt } = await this.$http.delete('categories/' + id)
          if (dt.meta.status !== 200) {
            return this.$message.error(dt.meta.mag)
          }
          this.$message.success(dt.meta.msg)
          if (this.catList.length === 1 && this.querycdt.pagenum > 1) {
            this.querycdt.pagenum--
          }
          this.getCatList()
        })
        .catch(() => {})
    },

    tianjia() {
      this.$refs.addCatRef.validate(async valid => {
        if (valid === true) {
          const { data: dt } = await this.$http.post('categories', this.addCat)
          if (dt.meta.status !== 201) {
            return this.$message.error(dt.meta.msg)
          }
          this.$message.success(dt.meta.msg)
          this.addCatDialog = false
          this.getCatList()
        }
      })
    },
    catTwoChange() {
      //   console.log(this.catTwoSelected)
      var len = this.catTwoSelected.length
      if (len === 0) {
        this.addCat.cat_pid = 0
        this.addCat.cat_level = 0
      } else {
        this.addCat.cat_pid = this.catTwoSelected[len - 1]
        this.addCat.cat_level = len
      }
      // console.log(this.addCat)
    },

    async showaddCatDialog() {
      const { data: dt } = await this.$http.get('categories', {
        params: { type: 2 }
      })
      //   console.log(dt)
      if (dt.meta.status !== 200) {
        return this.$message.error(dt.meta.msg)
      }
      this.catTwoList = dt.data
      // console.log(this.catTwoList)

      this.addCatDialog = true
    },

    // 获取分类数据
    async getCatList() {
      const { data: dt } = await this.$http.get('categories', {
        params: this.querycdt
      })
      // console.log(dt)
      if (dt.meta.status !== 200) {
        return this.$message.error(dt.meta.msg)
      }
      this.catList = dt.data.result
      this.tot = dt.data.total
      // this.length = dt.data.result.length
      // console.log(this.length)
    }
  },
  data() {
    return {
      editForm:[],
      editCatDialog: false,
      editFormRules: {
        cat_name: [{ required: true, message: '分类名称必填', trigger: 'blur' }]
      },
      catTwoSelected: [],
      catTwoProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      catTwoList: [],
      addCatDialog: false,
      addCatRules: {
        cat_name: [{ required: true, message: '分类名称必填', trigger: 'blur' }]
      },
      addCat: {
        cat_name: '',
        cat_pid: 0,
        cat_level: 0
      },

      length: 0,
      tot: 0,
      catList: [],
      querycdt: {
        type: 3,
        pagenum: 1,
        pagesize: 5
      }
    }
  }
}
</script>

<style lang="less" scoped>
</style>
