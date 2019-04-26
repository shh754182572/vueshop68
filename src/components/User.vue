<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>

    <el-dialog
      @close="$refs.addFormRef.resetFields()"
      title="添加用户"
      :visible.sync="addUserDialog"
      width="30%"
    >
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="80px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addForm.password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机号码" prop="mobile">
          <el-input v-model="addForm.mobile"></el-input>
        </el-form-item>
      </el-form>

      <span slot="footer" class="dialog-footer">
        <el-button @click="addUserDialog= false">取 消</el-button>
        <el-button type="primary" @click="addUser()">确 定</el-button>
      </span>
    </el-dialog>

    <el-card class="box-card">
      <el-dialog
        @close="$refs.editFormRef.resetFields()"
        title="修改用户"
        :visible.sync="editUserDialog"
        width="30%"
      >
        <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="80px">
          <el-form-item label="用户名" prop="username">
            <el-input v-model="editForm.username"></el-input>
          </el-form-item>
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="editForm.email"></el-input>
          </el-form-item>
          <el-form-item label="手机号码" prop="mobile">
            <el-input v-model="editForm.mobile"></el-input>
          </el-form-item>
        </el-form>

        <span slot="footer" class="dialog-footer">
          <el-button @click="editUserDialog= false">取 消</el-button>
          <el-button type="primary" @click="editUser()">确 定</el-button>
        </span>
      </el-dialog>

      <el-row :gutter="20">
        <el-col :span="8">
          <el-input
            placeholder="请输入搜索内容"
            v-model="querycdt.query"
            class="input-with-select"
            clearable
            @clear="getUserList()"
            @keyup.enter.native="getUserList()"
          >
            <el-button slot="append" icon="el-icon-search" @click="getUserList()"></el-button>
          </el-input>
        </el-col>
        <el-col :span="8">
          <el-button type="primary" @click="addUserDialog = true">添加用户</el-button>
        </el-col>
      </el-row>

      <el-table :data="userList" border stripe style="width: 100%">
        <el-table-column type="index" label="序号" width="60"></el-table-column>
        <el-table-column prop="username" label="用户名"></el-table-column>
        <el-table-column prop="mobile" label="手机号码" width="150"></el-table-column>
        <el-table-column prop="role_name" label="角色" width="150"></el-table-column>
        <el-table-column prop="email" label="邮箱" width="150"></el-table-column>

        <el-table-column prop="mg_state" label="状态" width="60">
          <el-switch v-model="info.row.mg_state" slot-scope="info"></el-switch>
        </el-table-column>

        <el-table-column label="操作" width="270">
          <template slot-scope="info">
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="showEditDlalog(info.row.id)"
            ></el-button>
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="delUser(info.row.id)"
            ></el-button>
            <el-tooltip
              class="item"
              effect="dark"
              content="分配角色"
              placement="top"
              :enterable="false"
            >
              <el-button type="warning" icon="el-icon-setting" size="mini"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="querycdt.pagenum"
        :page-sizes="[3, 5, 10, 15]"
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
    this.getUserList()
  },

  methods: {
    editUser() {
      this.$refs.editFormRef.validate(async valid => {
        const { data: dt } = await this.$http.put(
          'users/' + this.editForm.id,
          this.editForm
        )
        // console.log(dt)
        if (dt.meta.status !== 200) {
          return this.$message.error(dt.meta.msg)
        }
        this.$message.success(dt.meta.msg)
        this.editUserDialog = false
        this.getUserList()
      })
    },
    async showEditDlalog(id) {
      const { data: dt } = await this.$http.get('users/' + id)
      // console.log(dt)
      if (dt.meta.status !== 200) {
        return this.$message.error(dt.meta.msg)
      }
      this.editForm = dt.data
      this.editUserDialog = true
    },
    delUser(id) {
      this.$confirm('确定要删除该用户么？', '删除用户', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(async() => {
          const { data: dt } = await this.$http.delete('users/' + id)
          if (dt.meta.status !== 200) {
            return this.$message.error(dt.meta.mag)
          }
          this.$message.success(dt.meta.msg)
          if (this.userList.length === 1 && this.querycdt.pagenum > 1) {
            this.querycdt.pagenum--
          }
          this.getUserList()
        })
        .catch(() => {})
    },

    addUser() {
      this.$refs.addFormRef.validate(async valid => {
        if (valid) {
          const { data: dt } = await this.$http.post('users', this.addForm)
          // console.log(res)
          if (dt.meta.status !== 201) {
            return this.$message.error(dt.meta.msg)
          }
          this.addUserDialog = false
          this.$message.success(dt.meta.msg)
          this.getUserList()
        }
      })
    },

    handleSizeChange(val) {
      this.querycdt.pagesize = val
      this.getUserList()
    },
    handleCurrentChange(val) {
      this.querycdt.pagenum = val
      this.getUserList()
    },
    async getUserList() {
      const { data: dt } = await this.$http.get('users', {
        params: this.querycdt
      })
      // console.log(dt)
      if (dt.meta.status !== 200) {
        return this.$message.error(dt.meta.msg)
      }
      this.tot = dt.data.total
      this.userList = dt.data.users
    }
  },

  data() {
    var checkMobile = (rule, value, callback) => {
      if (!/^1[135789]\d{9}$/.test(value)) {
        return callback(new Error('手机号码格式不正确'))
      }
      callback()
    }

    return {
      editUserDialog: false,
      editFormRules: {
        mobile: [
          { required: true, message: '手机号码不能为空', trigger: 'blur' },
          {
            validator: checkMobile,
            trigger: 'blur'
          }
        ]
      },
      editForm: {
        username: '',
        email: '',
        mobile: ''
      },
      addForm: {
        username: '',
        password: '',
        email: '',
        mobile: ''
      },
      addFormRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' }
        ],
        password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
        mobile: [
          { required: true, message: '手机号码不能为空', trigger: 'blur' },
          {
            validator: checkMobile,
            trigger: 'blur'
          }
        ]
      },

      addUserDialog: false,

      tot: 0,
      userList: [],
      querycdt: {
        query: '',
        pagenum: 1,
        pagesize: 3
      }
    }
  }
}
</script>

<style lang="less" scoped>
</style>
