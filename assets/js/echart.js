define(['jquery', 'echarts', 'echartCommon'], function($, echarts, echartCommon) {
    $(function() {
        jumpLineChart = echarts.init(document.getElementById('jumpLineChart'));
        barLineChart = echarts.init(document.getElementById('barLineChart'));
        // drugLineChart = echarts.init(document.getElementById('drugLineChart'));
        colorMapChart = echarts.init(document.getElementById('colorMapChart'));
        pointMapChart = echarts.init(document.getElementById('pointMapChart'));
        // 折线柱状图
        var jumpLineChartOption = echartCommon.getJumpOption({
            url: "./../assets/js/json/jumpLineData.json",
            title: '闪烁折线图'
        });
        echartCommon.jumpChart({
            dom: jumpLineChart,
            option: jumpLineChartOption,
            isDataZoom: true,
            time: 100
        });
        // 折线柱状图
        var barLineChartOption = echartCommon.getJumpOption({
            url: "./../assets/js/json/lineBarData.json",
            title: '闪烁折线柱状图'
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
        barLineChart.on('datazoom', function(dataZoomChange) {
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
        var myChart = echarts.init(document.getElementById("drugLineChart"));
        var app = {};
        option = null;
        var symbolSize = 20;
        var lines = echartCommon.getOptionData({
            url: './../assets/js/json/drugLineData.json'
        });
        const LENGTH = lines[0].data.length - 13;
        // 获取series数据
        var seriesData = [];
        for (var z = 0; z < lines.length; z++) {
            var seriesObj = {
                id: lines[z].id,
                name: lines[z].name,
                type: 'line',
                smooth: true,
                symbolSize: symbolSize,
                data: lines[z].data,
            };
            seriesData.push(seriesObj);
        }
        option = {
            title: {
                text: '折线图拖拽',
                left: 'center',
                textStyle: {
                    color: '#fff'
                }
            },
            tooltip: {
                triggerOn: 'none',
                formatter: function(params) {
                    if (typeof params.data[0] === "string") {
                        return '指标: ' + params.seriesName + "<br>" + '时间: ' + params.data[0] + '<br/>数据: ' +
                            params.data[1].toFixed(2);
                    } else {
                        return '指标: ' + params.seriesName + "<br>" + '时间: ' + params.name + '<br/>数据: ' +
                            params.data[1];
                    }
                }
            },
            grid: {
                left: '3%',
                right: '4%',
                bottom: '3%',
                containLabel: true
            },
            xAxis: {
                type: 'time',
                position: 'bottom',
                axisLine: {
                    lineStyle: {
                        color: '#9c9ca0',
                        width: echartCommon.constConfig.axisLineWidth,
                        type: 'solid'
                    }
                },
                axisLabel: {
                    margin: 10,
                    textStyle: {
                        color: echartCommon.constConfig.labelColor,
                        fontSise: 10,
                    },
                    formatter: function(params) {
                        var year = (new Date(params)).getFullYear();
                        var month = (new Date(params)).getMonth() + 1;
                        if (month < 10) {
                            month = '0' + month;
                        }
                        var date = (new Date(params)).getDate();
                        if (date < 10) {
                            date = '0' + date;
                        }
                        return year + '-' + month + '-' + date;
                    },
                    axisLine: {
                        lineStyle: {
                            color: '#9c9ca0',
                            width: echartCommon.constConfig.axisLineWidth,
                            type: 'solid'
                        }
                    },
                    axisTick: {
                        show: false,
                        alignWithLabel: true,
                        inside: true
                    },
                    splitLine: {
                        show: false,
                    },
                    splitArea: {
                        show: false,
                    }
                },
            },
            yAxis: {
                type: 'value',
                nameGap: 10,
                scale: true, //脱离0值比例
                splitNumber: 4,
                boundaryGap: false,
                axisLabel: {
                    margin: 12,
                    color: echartCommon.constConfig.labelColor,
                    fontFamily: 'arial',
                    fontWeight: 'bolder',
                    fontSise: 10,
                    formatter: function(v) {
                        if (1) {
                            return v.toFixed(1);
                        } else {
                            return '';
                        }
                    }
                },
                axisLine: {
                    show: false,
                    lineStyle: {
                        color: echartCommon.constConfig.axisLineColor, //y轴
                        width: echartCommon.constConfig.axisLineWidth,
                        type: 'solid'
                    }
                },
                axisTick: {
                    onGap: false,
                    show: false,
                },
                splitArea: {
                    show: false
                },
                splitLine: {
                    show: true,
                    lineStyle: {
                        color: '#62636d'
                    }
                },
                axisPointer: {
                    show: false,
                }
            },
            dataZoom: [{
                    show: false,
                    type: 'inside',
                },
                {
                    height: 3,
                    backgroundColor: '#B4B4B3',
                    borderColor: 'transparent',
                    fillerColor: '#00D8FF',
                    showDetail: false,
                    handleSize: 12,
                    handleIcon: 'M10.7,11.9v-1.3H9.3v1.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4v1.3h1.3v-1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z',
                    handleStyle: {
                        color: '#00D8FF',
                        shadowBlur: 8,
                        shadowColor: '#4795B4',
                        shadowOffsetX: 2,
                        shadowOffsetY: 2
                    },
                    bottom: '1.5%'
                }
            ],
            graphic: [],
            series: seriesData
        };

        function addDrag(line) {
            if (!app.inNode) {
                var graphicObj = [];
                setTimeout(function() {
                    for (var i = 0; i < line.length; i++) {
                        var dataObj = {};
                        graphic: echarts.util.map(line[i].data, function(item, dataIndex) {
                            if (dataIndex > LENGTH) {
                                var dataObj = {
                                    type: 'circle',
                                    position: myChart.convertToPixel('grid', item),
                                    shape: {
                                        cx: 0,
                                        cy: 0,
                                        r: symbolSize / 2
                                    },
                                    invisible: true,
                                    draggable: true,
                                    ondrag: echarts.util.curry(onPointDragging, line[i], dataIndex),
                                    onmousemove: echarts.util.curry(showTooltip, i, dataIndex),
                                    onmouseout: echarts.util.curry(hideTooltip, dataIndex),
                                    z: 100
                                };
                            } else {
                                var dataObj = {
                                    type: 'circle',
                                    position: myChart.convertToPixel('grid', item),
                                    shape: {
                                        cx: 0,
                                        cy: 0,
                                        r: symbolSize / 2
                                    },
                                    invisible: true,
                                    draggable: false,
                                    ondrag: echarts.util.curry(onPointDragging, line[i], dataIndex),
                                    onmousemove: echarts.util.curry(showTooltip, i, dataIndex),
                                    onmouseout: echarts.util.curry(hideTooltip, dataIndex),
                                    z: 100
                                };
                            }
                            graphicObj.push(dataObj);
                        })
                    }
                }, 0);
                setTimeout(function() {
                    myChart.setOption({
                        graphic: graphicObj
                    });
                }, 0);
            }
        };

        addDrag(lines);

        myChart.on('dataZoom', function() {
            updatePosition(lines);
        });

        function updatePosition(line) {
            var graphicObj = [];
            for (var j = 0; j < line.length; j++) {
                graphic: echarts.util.map(line[j].data, function(item, dataIndex) {
                    var dataObj = {
                        position: myChart.convertToPixel('grid', item)
                    };
                    graphicObj.push(dataObj);
                })
            }
            myChart.setOption({
                graphic: graphicObj
            });
        };

        function showTooltip(index, dataIndex) {
            myChart.dispatchAction({
                type: 'showTip',
                seriesIndex: index,
                dataIndex: dataIndex
            });
        };

        function hideTooltip(dataIndex) {
            myChart.dispatchAction({
                type: 'hideTip'
            });
        };

        function onPointDragging(line, dataIndex, dx, dy) {
            var dateData = line.data[dataIndex][0];
            this.position[0] = myChart.convertToPixel('grid', line.data[dataIndex])[0];
            line.data[dataIndex] = myChart.convertFromPixel('grid', this.position);
            line.data[dataIndex][0] = dateData;
            myChart.setOption({
                series: [{
                    id: line.id,
                    data: line.data
                }]
            });
        };

        if (option && typeof option === "object") {
            myChart.setOption(option, true);
        };
        // 图表自适应
        window.addEventListener("resize", function() {
            jumpLineChart.resize();
            barLineChart.resize();
            // drugLineChart.resize();
            myChart.resize();
            updatePosition(lines);
            colorMapChart.resize();
            pointMapChart.resize();
        });
    })
});