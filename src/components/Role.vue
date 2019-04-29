<template>
  <div>
    <com-crumb nm="权限" xnm="角色"/>

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
      <el-button type="primary">添加角色</el-button>
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
            <el-button type="primary" icon="el-icon-edit" size="mini">编辑</el-button>
            <el-button type="danger" icon="el-icon-delete" size="mini">删除</el-button>
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
        .then(async() => {
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
      roleForm: {
        id: '',
        roleName: '',
        roleDesc: ''
      },
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
