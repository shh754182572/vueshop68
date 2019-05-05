<template>
  <div>
    <com-crumb nm="订单管理" xnm="订单列表"/>

    <el-dialog title="物流信息" :visible.sync="setWuliuDialog" width="50%">
      <!-- <span>我是垂直步骤条---根据wuliuList物流信息的数据数组v-for动态渲染el-step</span> -->
      <el-steps direction="vertical" :active="0">
        <el-step
          v-for="(item,i) in WuliuList"
          :key="i"
          :title="item.time"
          :description="item.context"
        ></el-step>
      </el-steps>
    </el-dialog>

    <el-card class="box-card">
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input
            placeholder="请输入搜索内容"
            v-model="querycdt.query"
            class="input-with-select"
            clearable
            @clear="getOrderList()"
            @keyup.enter.native="getOrderList()"
          >
            <el-button slot="append" icon="el-icon-search" @click="getOrderList()"></el-button>
          </el-input>
        </el-col>
      </el-row>

      <el-table :data="orderList" border stripe style="width: 100%">
        <el-table-column type="index" width="60"></el-table-column>
        <el-table-column prop="order_number" label="订单编号"></el-table-column>
        <el-table-column prop="order_price" label="订单单价" width="80"></el-table-column>
        <el-table-column prop="pay_status" label="是否付款" width="100">
          <template slot-scope="info">
            <el-tag v-if="info.row.pay_status=='0'" type="danger">未付款</el-tag>
            <el-tag v-else type="success">已付款</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="is_send" label="是否发货" width="100"></el-table-column>
        <el-table-column label="下单时间" width="150">
          <template slot-scope="info">
            <span>{{info.row.create_time |dateFormat}}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template slot-scope="info">
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="showEditDlalog(info.row.order_id)"
            ></el-button>
            <el-button
              type="success"
              icon="el-icon-location"
              size="mini"
              @click="showWuliuDialog(info.row.order_id)"
            ></el-button>
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
    this.getOrderList()
  },
  methods: {
    // 每页条数变化
    handleSizeChange(val) {
      this.querycdt.pagesize = val
      this.getOrderList()
    },
    // 每页页码变化
    handleCurrentChange(val) {
      this.querycdt.pagenum = val
      this.getOrderList()
    },
    async showWuliuDialog() {
      const { data: dt } = await this.$http.get('kuaidi/81337523816')
      //   console.log(dt)
      if (dt.meta.status !== 200) {
        return this.$message.error(dt.meta.msg)
      }
      this.WuliuList = dt.data

      this.setWuliuDialog = true
    },
    showEditDlalog() {},
    async getOrderList() {
      const { data: dt } = await this.$http.get('orders', {
        params: this.querycdt
      })
      //   console.log(dt)
      if (dt.meta.status !== 200) {
        return this.$message.error(dt.meta.msg)
      }
      this.tot = dt.data.total
      this.orderList = dt.data.goods
    }
  },
  data() {
    return {
      WuliuList: [],
      setWuliuDialog: false,
      tot: 0,
      orderList: [],
      querycdt: {
        query: '',
        pagenum: 1,
        pagesize: 5
        // user_id: '',

        // pay_status: '',

        // is_send: '',

        // order_fapiao_title: '',

        // order_fapiao_company: '',

        // order_fapiao_content: '',

        // consignee_addr: ''
      }
    }
  }
}
</script>

<style lang="less" scoped>
.el-step__title.is-process {
  font-weight: 700 !important;
  color: #303133;
}
.el-step.is-vertical .el-step__title {
  line-height: 24px;
  padding-bottom: 8px;
}
.el-step__title {
  font-size: 12px;
}
</style>
