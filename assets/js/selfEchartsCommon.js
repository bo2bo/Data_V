define(['jquery', 'echarts'], function ($, echarts) {
    var selfCommon = {
        dataZoomConfig: [{
                show: false,
                type: 'inside',
                start: 0,
                end: 100,
                startValue: null,
                zoomOnMouseWheel: false,
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
        xAxisConfig: {
            type: 'time',
            position: 'bottom',
            axisLabel: {
                margin: 10,
                textStyle: {
                    color: '#b4b4b4',
                    fontSise: 10,
                },
                formatter: function (params) {
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
            },
            axisLine: {
                lineStyle: {
                    color: '#9c9ca0',
                    width: 1,
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
        yAxisConfig: {
            type: 'value',
            nameGap: 10,
            scale: true, //脱离0值比例
            splitNumber: 4,
            boundaryGap: false,
            axisLabel: {
                margin: 12,
                color: '#b4b4b4',
                fontFamily: 'arial',
                fontWeight: 'bolder',
                fontSise: 10,
                formatter: function (v) {
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
                    color: '#ddd', //y轴
                    width: 1,
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
        gridConfig: {
            containLabel: true,
            top: '7%',
            left: 'left',
            width: '96%',
            height: '88%'
        },
        //请求option数据
        getLineOptionData: function (param) {
            var resjson;
            $.ajax({
                type: "get",
                url: param.url,
                async: false, //同步
                success: function (result) {
                    resjson = result;
                },
                error: function (err) {
                    console.log(err)
                }
            });
            return resjson;
        },
        // 折线图拖拽
        drugOption: function (param) {
            var option = {
                title: {
                    text: param.title,
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
                series: function () {
                    var seriesData = [];
                    for (var z = 0; z < param.data.length; z++) {
                        var seriesObj = {
                            id: param.data[z].id,
                            name: param.data[z].name,
                            type: 'line',
                            smooth: true,
                            symbolSize: 20,
                            data: param.data[z].data,
                        };
                        seriesData.push(seriesObj);
                    }
                    return seriesData;
                }()
            };
            param.dom.setOption(option, true);
        },
        // 拖拽函数
        drugFun: function (param) {
            var graphicObj = [];
            setTimeout(function () {
                for (var i = 0; i < param.data.length; i++) {
                    var dataObj = {};
                    graphic: echarts.util.map(param.data[i].data, function (item, dataIndex) {
                        // if (dataIndex > LENGTH) {
                        dataObj = {
                            type: 'circle',
                            position: param.dom.convertToPixel('grid', item),
                            shape: {
                                cx: 0,
                                cy: 0,
                                r: 10
                            },
                            invisible: false,
                            draggable: true,
                            ondrag: echarts.util.curry(selfCommon.onPointDragging, param.data[i], dataIndex, param.dom),
                            onmousemove: echarts.util.curry(selfCommon.showTooltip, i, dataIndex, param.dom),
                            onmouseout: echarts.util.curry(selfCommon.hideTooltip, dataIndex, param.dom),
                            z: 100
                        };
                        // } else {
                        //     dataObj = {
                        //         type: 'circle',
                        //         position: myChart.convertToPixel('grid', item),
                        //         shape: {
                        //             cx: 0,
                        //             cy: 0,
                        //             r: 10
                        //         },
                        //         invisible: false,
                        //         draggable: true,
                        //         ondrag: echarts.util.curry(selfCommon.onPointDragging, param.data[i], dataIndex, param.dom),
                        //         onmousemove: echarts.util.curry(selfCommon.showTooltip, i, dataIndex, param.dom),
                        //         onmouseout: echarts.util.curry(selfCommon.hideTooltip, dataIndex, param.dom),
                        //         z: 100
                        //     };
                        // }
                        graphicObj.push(dataObj);
                    })
                }
            }, 0);
            setTimeout(function () {
                param.dom.setOption({
                    graphic: graphicObj
                });
            }, 100);
        },
        // tooltip函数
        showTooltip: function (index, dataIndex, dom) {
            dom.dispatchAction({
                type: 'showTip',
                seriesIndex: index,
                dataIndex: dataIndex
            });
        },
        hideTooltip: function (dataIndex, dom) {
            dom.dispatchAction({
                type: 'hideTip'
            });
        },
        // point拖拽过程的函数
        onPointDragging: function (line, dataIndex, dom) {
            var dateData = line.data[dataIndex][0];
            this.position[0] = dom.convertToPixel('grid', line.data[dataIndex])[0];
            line.data[dataIndex] = dom.convertFromPixel('grid', this.position);
            line.data[dataIndex][0] = dateData;
            dom.setOption({
                series: [{
                    id: line.id,
                    data: line.data
                }]
            });
        },
        updatePosition: function (param) {
            var graphicObj = [];
            for (var j = 0; j < param.data.length; j++) {
                graphic: echarts.util.map(param.data[j].data, function (item, dataIndex) {
                    var dataObj = {
                        position: param.dom.convertToPixel('grid', item)
                    };
                    graphicObj.push(dataObj);
                })
            }
            param.dom.setOption({
                graphic: graphicObj
            });
        }
    }
    return selfCommon;
})