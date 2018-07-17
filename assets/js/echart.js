define(['jquery', 'echarts', 'echartCommon'], function ($, echarts, echartCommon) {
    $(function () {
        stackChart = echarts.init(document.getElementById('stackChart'));
        jumpLineChart = echarts.init(document.getElementById('jumpLineChart'));
        doubleLineChart = echarts.init(document.getElementById('doubleLineChart'));
        barLineChart = echarts.init(document.getElementById('barLineChart'));
        colorMapChart = echarts.init(document.getElementById('colorMapChart'));
        pointMapChart = echarts.init(document.getElementById('pointMapChart'));
        drugLineChart = echarts.init(document.getElementById('drugLineChart'));
        // 堆积图
        var stackChartOption = echartCommon.getOption({
            url: "./../assets/js/json/stackData.json",
            title: '堆积图',
            chartType: 'stack'
        });
        stackChart.setOption(stackChartOption);
        // 闪烁折线图
        var jumpLineChartOption = echartCommon.getOption({
            url: "./../assets/js/json/jumpLineData.json",
            title: '闪烁折线图',
            chartType: 'line'
        });
        echartCommon.jumpChart({
            dom: jumpLineChart,
            option: jumpLineChartOption,
            isDataZoom: true,
            time: 100
        });
        // 多线闪动
        var doubleLineChartOption = echartCommon.getOption({
            url: "./../assets/js/json/doubleLineData.json",
            title: '多线闪动',
            chartType: 'line'
        })
        echartCommon.jumpChart({
            dom: doubleLineChart,
            option: doubleLineChartOption,
            isDataZoom: true,
            time: 100
        });
        // 折线柱状图
        var barLineChartOption = echartCommon.getOption({
            url: "./../assets/js/json/lineBarData.json",
            title: '闪烁折线柱状图',
            chartType: 'line'
        });
        barLineChartOption.series[0].type = 'bar';
        barLineChartOption.series[1].type = 'bar';
        // 设置左右y轴
        barLineChartOption.series[0].yAxisIndex = 1;
        barLineChartOption.series[1].yAxisIndex = 1;
        // dataZoom改变时bar重叠
        barLineChartOption.series[0].barWidth = '36px';
        barLineChartOption.series[1].barWidth = '36px';
        barLineChartOption.series[0].barMaxWidth = '36px';
        barLineChartOption.series[1].barMaxWidth = '36px';
        // line点放到柱状图的正中间
        barLineChartOption.series[0].barCategoryGap = '60%';
        barLineChartOption.series[1].barCategoryGap = '60%';
        barLineChartOption.series[0].barGap = '-100%';
        barLineChartOption.series[1].barGap = '-100%';
        // bar渐变色
        barLineChartOption.series[0].itemStyle.normal.color = new echarts.graphic.LinearGradient(
            0, 0, 0, 1, [{
                    offset: 0,
                    color: '#0ec8ff'
                },
                {
                    offset: 1,
                    color: '#185aff'
                }
            ]
        );
        barLineChartOption.series[1].itemStyle.normal.color = new echarts.graphic.LinearGradient(
            0, 0, 0, 1, [{
                    offset: 0,
                    color: '#0ec8ff'
                },
                {
                    offset: 1,
                    color: '#185aff'
                }
            ]
        );
        barLineChartOption.xAxis.axisLine.onZero = false;
        barLineChartOption.yAxis[0].axisLabel.fontSise = 12;
        barLineChartOption.yAxis[1].axisLabel.fontSise = 12;
        barLineChartOption.yAxis[1].axisLabel.margin = 30;
        barLineChartOption.yAxis[0].axisLabel.margin = 30;
        barLineChart.on('datazoom', function (dataZoomChange) {
            if ((barLineChartOption.dataZoom[0].end - barLineChartOption.dataZoom[0].start) < 15) {
                barLineChartOption.series[0].barWidth = '36px';
                barLineChartOption.series[1].barWidth = '36px';
                barLineChartOption.series[0].barMaxWidth = '36px';
                barLineChartOption.series[1].barMaxWidth = '36px';
            } else {
                barLineChartOption.series[0].barWidth = 'auto';
                barLineChartOption.series[1].barWidth = 'auto';
                barLineChartOption.series[0].barMaxWidth = 'auto';
                barLineChartOption.series[1].barMaxWidth = 'auto';
            }
        });
        echartCommon.jumpChart({
            dom: barLineChart,
            option: barLineChartOption,
            isDataZoom: true,
            time: 100
        });

        // 色温图
        var colorMapOption = echartCommon.colorMapOption({
            title: '色温图'
        });
        echartCommon.showMap({
            mapUrl: './../assets/js/json/china.json',
            dataUrl: './../assets/js/json/colorMapData.json',
            option: colorMapOption,
            type: 'colorMap',
            dom: colorMapChart
        });

        // 地图标注
        var pointMapOption = echartCommon.spotMapOption({
            title: '点状图'
        });
        echartCommon.showMap({
            mapUrl: './../assets/js/json/china.json',
            dataUrl: './../assets/js/json/pointMapData.json',
            option: pointMapOption,
            type: 'pointMap',
            dom: pointMapChart
        });
        // 线图拖拽功能
        var drugData = echartCommon.getOptionData({
            url: './../assets/js/json/drugLineData.json'
        });
        echartCommon.drugOption({
            dom: drugLineChart,
            title: '折线图拖拽',
            data: drugData
        });
        echartCommon.drugFun({
            data: drugData,
            dom: drugLineChart
        })

        drugLineChart.on('dataZoom', function () {
            echartCommon.updatePosition({
                data: drugData,
                dom: drugLineChart
            });
        });

        // 图表自适应
        window.addEventListener("resize", function () {
            jumpLineChart.resize();
            barLineChart.resize();
            drugLineChart.resize();
            echartCommon.updatePosition({
                data: drugData,
                dom: drugLineChart
            });
            colorMapChart.resize();
            pointMapChart.resize();
        });
    })
});