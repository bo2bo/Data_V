define(['jquery', 'echarts', 'selfCommon'], function ($, echarts, selfCommon) {
    $(function () {
        drugLineChart = echarts.init(document.getElementById('drugLineChart'));
        // 线图拖拽功能
        var drugData = selfCommon.getLineOptionData({
            url: './../assets/js/json/drugLineData.json'
        });
        selfCommon.drugOption({
            dom: drugLineChart,
            title: '折线图拖拽',
            data: drugData
        });
        selfCommon.drugFun({
            data: drugData,
            dom: drugLineChart
        })

        drugLineChart.on('dataZoom', function () {
            selfCommon.updatePosition({
                data: drugData,
                dom: drugLineChart
            });
        });

        // 图表自适应
        window.addEventListener("resize", function () {
            drugLineChart.resize();
            selfCommon.updatePosition({
                data: drugData,
                dom: drugLineChart
            });
        });
    })
});