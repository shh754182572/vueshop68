<template>
  <div>
    <com-crumb nm="权限管理" xnm="角色列表" />

    <el-dialog
      @close="$refs.addFormRef.resetFields()"
      title="添加用户"
      :visible.sync="addRoleDialog"
      width="50%"
    >
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="80px">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="addForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="addForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>

      <span slot="footer" class="dialog-footer">
        <el-button @click="addRoleDialog= false">取 消</el-button>
        <el-button type="primary" @click="addRole()">确 定</el-button>
      </span>
    </el-dialog>

    <el-dialog
      @close="$refs.editFormRef.resetFields()"
      title="修改角色"
      :visible.sync="editRoleDialog"
      width="50%"
    >
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="80px">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="editForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="editForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>

      <span slot="footer" class="dialog-footer">
        <el-button @click="editRoleDialog = false">取 消</el-button>
        <el-button type="primary" @click="editRole()">确 定</el-button>
      </span>
    </el-dialog>

    <el-dialog title="分配权限" :visible.sync="roleDialog" width="50%">
      <el-form ref="form" :model="roleForm" label-width="120px">
        <el-form-item label="当前角色:">{{roleForm.roleName}}</el-form-item>
        <el-form-item label="分配的权限:">
          <el-tree
            ref="treeRef"
            :default-checked-keys="defaultChecked"
            :default-expand-all="true"
            show-checkbox
            node-key="id"
            :data="rightsInfo"
            :props="treeProps"
          ></el-tree>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="roleDialog = false">取 消</el-button>
        <el-button type="primary" @click="fenRights()">确 定</el-button>
      </span>
    </el-dialog>

    <el-card class="box-card">
      <el-button type="primary"  @click="addRoleDialog = true">添加角色</el-button>
      <el-table :data="rolesList" border stripe style="width: 100%">
        <el-table-column type="expand" width="60">
          <template slot-scope="info">
            <el-row
              v-for="(v,k) in info.row.son"
              :key="v.id"
              :style="{'border-bottom':'1px solid #eee','border-top':k===0?'1px solid #eee':''}"
            >
              <el-col :span="5">
                <el-tag closable @close="delRight(info.row,v.id)">{{v.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <el-col :span="19">
                <el-row
                  v-for="(vv,kk) in v.children"
                  :key="vv.id"
                  :style="{'border-top':kk===0?'':'1px solid #eee'}"
                >
                  <el-col :span="6">
                    <el-tag
                      closable
                      type="success"
                      @close="delRight(info.row,vv.id)"
                    >{{vv.authName}}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <el-tag
                      @close="delRight(info.row,vvv.id)"
                      closable
                      v-for="vvv in vv.children"
                      :key="vvv.id"
                      type="warning"
                    >{{vvv.authName}}</el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <el-table-column type="index" label="序号" width="80"></el-table-column>
        <el-table-column prop="roleName" label="角色名称"></el-table-column>
        <el-table-column prop="roleDesc" label="角色描述" width="340"></el-table-column>

        <el-table-column label="操作" width="340">
          <template slot-scope="info">
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="showEditDlalog(info.row.id)"
            >编辑</el-button>

            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="delRole(info.row.id)"
            >删除</el-button>
            <el-button
              type="warning"
              icon="el-icon-setting"
              size="mini"
              @click="showRoleDialog(info.row)"
            >分配角色</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script>
export default {
  created() {
    this.getRolesList()
  },
  methods: {
    // 重新分配角色
    async fenRights() {
      var ids1 = this.$refs.treeRef.getCheckedKeys()
      var ids2 = this.$refs.treeRef.getHalfCheckedKeys()
      var ids12 = ids1.concat(ids2).join(',')
      // console.log(ids12)

      const { data: dt } = await this.$http.post(
        `roles/${this.roleForm.id}/rights`,
        { rids: ids12 }
      )
      // console.log(dt)
      if (dt.meta.status !== 200) {
        return this.$message.error(dt.meta.msg)
      }
      this.roleDialog = false
      this.$message.success(dt.meta.msg)
      this.getRolesList()
    },

    // 添加角色
    addRole() {
      this.$refs.addFormRef.validate(async valid => {
        if (valid) {
          const { data: dt } = await this.$http.post('roles/', this.addForm)
          // console.log(res)
          if (dt.meta.status !== 201) {
            return this.$message.error(dt.meta.msg)
          }
          this.addRoleDialog = false
          this.$message.success(dt.meta.msg)
          this.getRolesList()
        }
      })
    },
    // 修改角色信息
    editRole() {
      this.$refs.editFormRef.validate(async valid => {
        const { data: dt } = await this.$http.put(
          'roles/' + this.editForm.roleId,
          this.editForm
        )
        console.log(dt)
        if (dt.meta.status !== 200) {
          return this.$message.error(dt.meta.msg)
        }
        this.$message.success(dt.meta.msg)
        this.editRoleDialog = false
        this.getRolesList()
      })
    },
    //展示修改角色表单
    async showEditDlalog(id) {
      const { data: dt } = await this.$http.get('roles/' + id)
      console.log(dt)
      if (dt.meta.status !== 200) {
        return this.$message.error(dt.meta.msg)
      }
      this.editForm = dt.data
      this.editRoleDialog = true
    },
    // 删除角色
    delRole(id) {
      this.$confirm('确定要删除该角色么？', '删除角色', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(async () => {
          const { data: dt } = await this.$http.delete('roles/' + id)
          if (dt.meta.status !== 200) {
            return this.$message.error(dt.meta.mag)
          }
          this.$message.success(dt.meta.msg)

          this.getRolesList()
        })
        .catch(() => {})
    },
    // 展示分配角色对话框
    async showRoleDialog(role) {
      const { data: dt } = await this.$http.get('rights/tree')
      //   console.log(dt)
      if (dt.meta.status !== 200) {
        return this.$message.error(dt.meta.msg)
      }
      this.rightsInfo = dt.data

      var idKeys = []
      this.getHaveRights(role, idKeys)
      //   console.log(idKeys)
      this.defaultChecked = idKeys

      this.roleForm = role
      this.roleDialog = true
    },
    // 递归遍历 获取第3级别权限
    getHaveRights(role, keys) {
      if (role.son) {
        role.children = role.son
      }
      if (!role.children) {
        return keys.push(role.id)
      }
      role.children.forEach(item => {
        return this.getHaveRights(item, keys)
      })
    },
    // 删除角色
    delRight(role, rightId) {
      this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(async () => {
          const { data: dt } = await this.$http.delete(
            `roles/${role.id}/rights/${rightId}`
          )
          // console.log(dt)
          if (dt.meta.status !== 200) {
            return this.$message.error(dt.meta.msg)
          }
          this.$message.success(dt.meta.msg)
          role.son = dt.data
        })
        .catch(() => {})
    },
    // 获取角色列表
    async getRolesList() {
      const { data: dt } = await this.$http.get('roles')
      //   console.log(dt)
      if (dt.meta.status !== 200) {
        return this.$message.error(dt.meta.msg)
      }
      dt.data.forEach(item => {
        item.son = item.children
        delete item.children
      })
      this.rolesList = dt.data
    }
  },
  data() {
    return {
      defaultChecked: [],
      treeProps: {
        label: 'authName',
        children: 'children'
      },
      rightsInfo: [],
      // 添加角色自然验证
      addFormRules: {
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' }
        ]
      },
      // 修改用户自然验证
      editFormRules: {
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' }
        ]
      },
      addForm: {
        roleName: '',
        roleDesc: ''
      },
      editForm: {
        id: '',
        roleName: '',
        roleDesc: ''
      },
      roleForm: {
        roleId: '',
        roleName: '',
        roleDesc: ''
      },
      addRoleDialog: false,
      editRoleDialog : false,
      roleDialog: false,
      rolesList: []
    }
  }
}
</script>

<style lang="less" scoped>
.el-row {
  display: flex;
  align-items: center;
}
.el-tag {
  margin: 10px 5px;
}
</style>
