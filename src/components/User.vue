<template>
  <div>
    <com-crumb nm="用户"/>

    <el-dialog
      @close="$refs.setRoleRef.resetFields()"
      title="角色分配"
      :visible.sync="setRoleDialog"
      width="50%"
    >
      <el-form :model="setRole" :rules="setRoleRules" ref="setRoleRef" label-width="120px">
        <el-form-item label="当前户名" prop="username">{{setRole.username}}</el-form-item>
        <el-form-item label="目前角色" prop="role_name">{{setRole.role_name}}</el-form-item>
        <el-form-item label="分配新角色" prop="rid">
          <el-select v-model="setRole.rid" placeholder="请选择">
            <el-option
              v-for="item in roleList"
              :key="item.id"
              :label="item.roleName"
              :value="item.id"
            ></el-option>
          </el-select>
        </el-form-item>
      </el-form>

      <span slot="footer" class="dialog-footer">
        <el-button @click="setRoleDialog= false">取 消</el-button>
        <el-button type="primary" @click="fenRole()">确 定</el-button>
      </span>
    </el-dialog>

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
            <el-input v-model="editForm.username" disabled></el-input>
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
          <el-switch
            v-model="info.row.mg_state"
            slot-scope="info"
            @change="stateChange(info.row,info.row.mg_state)"
          ></el-switch>
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
              <el-button
                type="warning"
                icon="el-icon-setting"
                size="mini"
                @click="showSetRoleDialog(info.row)"
              ></el-button>
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
    // 设置用户状态
    async stateChange(user, state) {
      const { data: dt } = await this.$http.put(
        `users/${user.id}/state/${state}`
      )
      // console.log(dt)
      if (dt.meta.status !== 200) {
        return this.$message.error(dt.meta.msg)
      }
      this.$message.success(dt.meta.msg)
    },

    // 给用户分配新角色
    fenRole() {
      this.$refs.setRoleRef.validate(async valid => {
        if (valid) {
          const { data: dt } = await this.$http.put(
            `users/${this.setRole.id}/role`,
            {
              rid: this.setRole.rid
            }
          )
          // console.log(dt)
          if (dt.meta.status !== 200) {
            return this.$message.error(dt.meta.msg)
          }
          this.$message.success(dt.meta.msg)
          this.setRoleDialog = false
          this.getUserList()
        }
      })
    },
    // 展示分配角色表单
    async showSetRoleDialog(userList) {
      const { data: dt } = await this.$http.get('roles')
      // console.log(dt)
      if (dt.meta.status !== 200) {
        return this.$message.error(dt.meta.msg)
      }
      this.roleList = dt.data
      // console.log(this.roleList)

      this.setRole = userList
      // console.log(this.setRole)
      this.setRoleDialog = true
    },

    // 修改用户信息
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
    // 展示修改用户表单
    async showEditDlalog(id) {
      const { data: dt } = await this.$http.get('users/' + id)
      // console.log(dt)
      if (dt.meta.status !== 200) {
        return this.$message.error(dt.meta.msg)
      }
      this.editForm = dt.data
      this.editUserDialog = true
    },
    // 删除用户
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

    // 添加用户
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

    // 每页条数变化
    handleSizeChange(val) {
      this.querycdt.pagesize = val
      this.getUserList()
    },
    // 每页页码变化
    handleCurrentChange(val) {
      this.querycdt.pagenum = val
      this.getUserList()
    },
    // 获取用户数据
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
    // 手机自定义验证
    var checkMobile = (rule, value, callback) => {
      if (!/^1[135789]\d{9}$/.test(value)) {
        return callback(new Error('手机号码格式不正确'))
      }
      callback()
    }

    return {
      // 角色分配自然验证
      setRoleRules: {
        rid: [
          { required: true, message: '必须选取一个角色', trigger: 'change' }
        ]
      },
      roleList: [],
      setRoleDialog: false,
      setRole: {
        username: '',
        role_name: '',
        rid: ''
      },

      editUserDialog: false,
      // 修改用户自然验证
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
      // 添加用户自然验证
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
