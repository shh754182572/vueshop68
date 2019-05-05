<template>
  <div>
    <com-crumb nm="数据统计" xnm="数据报表"/>

    <el-card class="box-card">
      <div id="main" style="width: 800px;height:400px;"></div>
    </el-card>
  </div>
</template>

<script>
import echarts from 'echarts'

export default {
  mounted() {
    this.inintEcharts()
  },
  methods: {
    async inintEcharts() {
      var myChart = echarts.init(document.getElementById('main'))
      const { data: dt } = await this.$http.get('reports/type/1')
      const option1 = dt.data
      var option2 = {
        title: {
          text: '用户来源'
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
            label: {
              backgroundColor: '#6a7985'
            }
          }
        },

        toolbox: {
          feature: {
            saveAsImage: {}
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        }
      }
      let options = { ...option1, ...option2 }
      myChart.setOption(options)
    }
  }
}
</script>

<style lang="less" scoped>
</style>
