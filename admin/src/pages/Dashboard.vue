<template>
  <div>
    <el-row :gutter="20" style="margin-bottom: 20px">
      <el-col :span="6" v-for="item in statsCards" :key="item.label">
        <el-card shadow="hover"><el-statistic :title="item.label" :value="item.value" /></el-card>
      </el-col>
    </el-row>
    <el-card><div ref="chartRef" style="height: 400px"></div></el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import * as echarts from 'echarts'
import { getOverview, getTrend } from '../api/stats'

const chartRef = ref<HTMLElement>()
let chartInstance: echarts.ECharts | null = null
const statsCards = ref([
  { label: '总访问量', value: 0 },
  { label: '今日访问', value: 0 },
  { label: '文章总数', value: 0 },
  { label: '评论总数', value: 0 },
])

function handleResize() { chartInstance?.resize() }

onMounted(async () => {
  try {
    const res: any = await getOverview()
    const d = res.data
    statsCards.value = [
      { label: '总访问量', value: d.total_visits },
      { label: '今日访问', value: d.today_visits },
      { label: '文章总数', value: d.total_articles },
      { label: '评论总数', value: d.total_comments },
    ]
  } catch {}

  try {
    const res: any = await getTrend(30)
    chartInstance = echarts.init(chartRef.value!)
    chartInstance.setOption({
      title: { text: '近30天访问趋势', textStyle: { color: '#333' } },
      tooltip: { trigger: 'axis' },
      xAxis: { type: 'category', data: res.data.trend.map((i: any) => i.date) },
      yAxis: { type: 'value' },
      series: [{ data: res.data.trend.map((i: any) => i.visits), type: 'line', smooth: true, areaStyle: { opacity: 0.3 }, itemStyle: { color: '#6366f1' } }],
    })
    window.addEventListener('resize', handleResize)
  } catch {}
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  chartInstance?.dispose()
  chartInstance = null
})
</script>
