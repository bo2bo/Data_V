define(['jquery', 'echarts', 'workCommon'], function ($, echarts, workCommon) {
    $(function () {
        stackChart = echarts.init(document.getElementById('stackChart'));
        jumpLineChart = echarts.init(document.getElementById('jumpLineChart'));
        doubleLineChart = echarts.init(document.getElementById('doubleLineChart'));
        barLineChart = echarts.init(document.getElementById('barLineChart'));
        colorMapChart = echarts.init(document.getElementById('colorMapChart'));
        pointMapChart = echarts.init(document.getElementById('pointMapChart'));      
        needChart = echarts.init(document.getElementById('needChart'));
        giveChart = echarts.init(document.getElementById('giveChart'));
        // 堆积图
        var stackChartOption = workCommon.getStackOption({
            url: "./../assets/js/json/stackData.json",
            title: '堆积图',
            chartType: 'struct'
        });
        stackChart.setOption(stackChartOption);
        workCommon.getPieData({
            index: stackChart.getOption().series.length-1,
            needDom: needChart,
            giveDom: giveChart,
            chart: stackChart
        });
        stackChart.on('click', function (params) {
            workCommon.getPieData({
                index: params.dataIndex,
                needDom: needChart,
                giveDom: giveChart,
                chart: stackChart
            });
        })
        // 闪烁折线图        
        workCommon.getLineOption({
            url: "./../assets/js/json/jumpLineData.json",
            title: '闪烁折线图',
            dom: jumpLineChart,
            dataZoom: true,
            markLine: true,
            time: 100,
            allLine: true
        });
        // 多线闪动
        workCommon.getLineOption({
            url: "./../assets/js/json/doubleLineData.json",
            title: '多线闪动',
            dom: doubleLineChart,
            dataZoom: true,
            markLine: true,
            time: 100,
            allLine: true
        })
        // 折线柱状图
        workCommon.getLineOption({
            url: "./../assets/js/json/lineBarData.json",
            title: '闪烁折线柱状图',
            dom: barLineChart,
            dataZoom: true,
            markLine: true,
            time: 100,
            allLine: false
        });

        // 色温图
        var colorMapOption = workCommon.colorMapOption({
            title: '色温图'
        });
        workCommon.showMap({
            mapUrl: './../assets/js/json/china.json',
            dataUrl: './../assets/js/json/colorMapData.json',
            option: colorMapOption,
            type: 'colorMap',
            dom: colorMapChart
        });

        // 地图标注
        var pointMapOption = workCommon.spotMapOption({
            title: '点状图'
        });
        workCommon.showMap({
            mapUrl: './../assets/js/json/china.json',
            dataUrl: './../assets/js/json/pointMapData.json',
            option: pointMapOption,
            type: 'pointMap',
            dom: pointMapChart
        });

        // 图表自适应
        window.addEventListener("resize", function () {
            jumpLineChart.resize();
            barLineChart.resize();
            colorMapChart.resize();
            pointMapChart.resize();
        });
    })
});