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
        // 添加点
        addPointsChart = echarts.init(document.getElementById('addPointsChart'));
        var symbolSize = 20;
        var data = [{
            "id": "a",
            "name": "a",
            "data": [
                ["2016-09-30", 55],
                ["2016-10-31", 52],
                ["2016-11-30", 56],
                ["2016-12-31", 50],
                ["2017-01-31", 58],
                ["2017-02-28", 50],
                ["2017-03-31", 25],
                ["2017-04-30", 15],
                ["2017-05-31", 12],
                ["2017-06-30", 16],
                ["2017-07-31", 10],
                ["2017-08-31", 18],
                ["2017-09-30", 10],
                ["2017-10-31", 25],
                ["2017-11-30", 22],
                ["2017-12-31", 26],
                ["2018-01-31", 20],
                ["2018-02-28", 28],
                ["2018-03-31", 20],
                ["2018-04-30", 35],
                ["2018-05-31", 32],
                ["2018-06-30", 36],
                ["2018-07-31", 30],
                ["2018-08-31", 38],
                ["2018-09-30", 30]
            ],
            "offsetXs": [],
            "flag": true
        }];
        var option = {
            title: {
                text: '添加点',
                left: 'left',
                textStyle: {
                    color: '#fff'
                }
            },
            tooltip: {
                triggerOn: 'none',
                formatter: function (params) {
                    if (typeof params.data[0] === "string") {
                        return '指标: ' + params.seriesName + "<br>" + '时间: ' + params.data[0] + '<br/>数据: ' +
                            params.data[1].toFixed(2);
                    } else {
                        return '指标: ' + params.seriesName + "<br>" + '时间: ' + params.name + '<br/>数据: ' +
                            params.data[1];
                    }
                }
            },
            grid: selfCommon.gridConfig,
            xAxis: selfCommon.xAxisConfig,
            yAxis: selfCommon.yAxisConfig,
            dataZoom: selfCommon.dataZoomConfig,
            graphic: [],
            series: [{
                id: data[0].id,
                type: 'line',
                name: data[0].name,
                smooth: true,
                symbolSize: symbolSize,
                data: data[0].data
            }]
        };
        var zr = addPointsChart.getZr();
        zr.on('click', function (params) {
            var pointInPixel = [params.offsetX, params.offsetY];
            var pointInGrid = addPointsChart.convertFromPixel('grid', pointInPixel);
            if (addPointsChart.containPixel('grid', pointInPixel)) {
                data.push(pointInGrid);
                addPointsChart.setOption({
                    series: [{
                        id: 'a',
                        data: data
                    }]
                });
            }
        });

        zr.on('mousemove', function (params) {
            var pointInPixel = [params.offsetX, params.offsetY];
            zr.setCursorStyle(addPointsChart.containPixel('grid', pointInPixel) ? 'copy' : 'default');
        });
        addPointsChart.setOption(option, true);
        
        selfCommon.drugFun({
            data: data,
            dom: addPointsChart
        })

        addPointsChart.on('dataZoom', function () {
            selfCommon.updatePosition({
                data: data,
                dom: addPointsChart
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