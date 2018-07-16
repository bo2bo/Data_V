define(['jquery', 'echarts'], function ($, echarts) {
    var jumpIntervalMap = new Object();
    var echartCommon = {
        constConfig: {
            axisLineColor: '#ddd',
            labelColor: '#b4b4b4',
            splitColor: '#a5afbe',
            zoomColor: '#d3d8df',
            fillColor: '#8b9ebb',
            iconColor: '#8b9ebb',
            iconHoverColor: '#5b99f9',
            axisLineWidth: 1,
            lineColor: '#ffff00'
        },
        // 获取最大值最小值
        getMaxAndMin: function (data) {
            var valueData = [];
            for (var i = 0; i < data.length; i++) {
                valueData.push(data[i].value)
            }
            var max = valueData[0],
                min = valueData[0];
            for (var i = 1; i < valueData.length; i++) {
                if (max < valueData[i]) {
                    max = valueData[i];
                }
                if (min > valueData[i]) {
                    min = valueData[i];
                }
            }
            return {
                max: max,
                min: min
            }
        },
        // yyyy-mm-dd转Date类型
        time2Datetime: function (array) {
            var copyArray = new Array();
            for (var i = 0; i < array.length; i++) {
                if (array[i].flag == 1) {
                    copyArray[i] = [new Date(array[i].date), array[i].value, true];
                } else {
                    copyArray[i] = [new Date(array[i].date), array[i].value];
                }
            }
            return copyArray;
        },
        //定制option
        getJumpOption: function (params) {
            var resjson;
            var option = {
                tooltip: {
                    trigger: 'axis',
                    axisPointer: {
                        show: true,
                        type: 'line',
                        label: {
                            show: true,
                            formatter: function (v) {
                                var date = new Date(v.value);
                                return date.getFullYear() + '-' + (parseInt(date.getMonth()) + 1) + '-' + date.getDate();
                            }
                        },
                        lineStyle: {
                            type: 'solid',
                            width: 1
                        }
                    },
                    showDelay: 0,
                    formatter: function (params) {
                        var tips = '';
                        var date;
                        if (Array.isArray(params)) {
                            date = new Date(params[0].data[0]);
                            var tipsTime = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate() + "<br/>";
                            if (params.length === 1 || params[0].seriesName.substr(0, params[0].seriesName.length - 2) == params[1].seriesName.substr(0, params[1].seriesName.length - 2)) {
                                var value = isNaN(params[0].value[1]) ? '无' : parseFloat(params[0].value[1]).toFixed(2);
                                return tipsTime + params[0].seriesName + ':' + value;
                            } else if (params.length === 2 && (params[0].seriesName.substr(0, params[0].seriesName.length - 2) != params[1].seriesName.substr(0, params[1].seriesName.length - 2))) {
                                return tipsTime + params[0].seriesName + ':' + parseFloat(params[0].value[1]).toFixed(2) + '<br>' + params[1].seriesName + ':' + parseFloat(params[1].value[1]).toFixed(2);
                            }
                        } else {
                            date = new Date(params.data[0]);
                            var tipsTime = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate() + "<br/>";
                            tips += tipsTime + (params.seriesName || 'value') + ':' + parseFloat(params.data[1]).toFixed(2);
                        }
                        return tips;
                    }
                },
                title: {
                    left: 'center',
                    text: params.title,
                    textStyle: {
                        color: '#fff'
                    }
                },
                grid: {
                    containLabel: true,
                    top: '7%',
                    left: 'left',
                    width: '96%',
                    height: '88%'
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
                xAxis: {
                    type: 'time',
                    position: 'bottom',
                    axisLabel: {
                        margin: 10,
                        textStyle: {
                            color: echartCommon.constConfig.labelColor,
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
                yAxis: [{
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
                }, {
                    type: 'value',
                    scale: true, //脱离0值比例
                    splitNumber: 4,
                    axisLabel: {
                        margin: 12,
                        color: echartCommon.constConfig.labelColor,
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
                        show: false,
                        lineStyle: {
                            color: '#62636d'
                        }
                    },
                    axisPointer: {
                        show: false,
                    }
                }],
                series: function () {
                    var serie = [];
                    resjson = echartCommon.getOptionData({
                        url: params.url
                    });
                    for (let i = 0; i < resjson.length; i++) {
                        var item, serieData = echartCommon.time2Datetime(resjson[i].children);
                        item = {
                            name: resjson[i].itemName,
                            type: 'line',
                            showAllSymbol: false,
                            symbol: 'circle',
                            symbolSize: 4,
                            data: serieData,
                            yAxisIndex: 0,
                            smooth: true,
                            itemStyle: {
                                normal: {
                                    color: echartCommon.constConfig.lineColor,
                                    lineStyle: {
                                        width: 2,
                                        type: 'solid'
                                    }
                                }
                            }
                        };
                        serie.push(item);
                    }
                    return serie;
                }()
            };
            return option;
        },

        //请求带闪烁的option数据
        getOptionData: function (param) {
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

        //预测折线图闪烁
        jumpChart: function (param) {
            var option = param.option,
                id = param.dom.id,
                opacity = 1,
                flagOpcity = 2,
                chartStart, chartStartV,
                chartEnd = 100;
            param.dom.clear();
            // 获取闪烁数据的series
            var jumpSeriesIndex = [],
                historyIndex;
            for (var i = 0; i < option.series.length; i++) {
                if (option.series[i].name.substr(option.series[i].name.length - 2, 2) == '预测') {
                    jumpSeriesIndex.push(i);
                } else {
                    historyIndex = i;
                }
            }
            // 设置dataZoom
            param.dom.on('datazoom', function (params) {
                chartStart = params.start;
                chartEnd = params.end;
            });
            // 设置dataZoom初始值
            if (option.series[historyIndex + 1] != undefined) {
                var jumpDataLen = option.series[historyIndex + 1].data.length;
                var historyTime = option.series[historyIndex].data[option.series[historyIndex].data.length - 13 + jumpDataLen][0];
            } else {
                var jumpDataLen = option.series[historyIndex - 1].data.length;
                var historyTime = option.series[historyIndex].data[option.series[historyIndex].data.length - 13 + jumpDataLen][0];
            }
            var month = new Date(historyTime).getMonth() + 1;
            if (month < 10) {
                month = '0' + month;
            }
            chartStartV = new Date(historyTime).getFullYear() + '-' + month + '-' + new Date(historyTime).getDate();
            // 添加时间戳
            var thisJumpInterval = jumpIntervalMap[param.dom.id];
            if (thisJumpInterval) {
                clearInterval(thisJumpInterval);
            }
            thisJumpInterval = setInterval(function () {
                if (opacity == 1) {
                    flagOpcity = 2;
                }
                if (opacity == 9) {
                    flagOpcity = -2;
                }
                opacity += flagOpcity;
                opacity = opacity % 10;
                for (var j = 0; j < jumpSeriesIndex.length; j++) {
                    var index = jumpSeriesIndex[j];
                    option.series[index].lineStyle = {
                        normal: {
                            opacity: opacity / 10,
                        }
                    };
                }
                if (param.isDataZoom) {
                    option.dataZoom = [{
                            show: false,
                            type: 'inside',
                            start: chartStart,
                            end: chartEnd,
                            startValue: chartStartV,
                            zoomOnMouseWheel: false,
                        },
                        {
                            height: 3,
                            backgroundColor: '#B4B4B3',
                            borderColor: 'transparent',
                            fillerColor: '#00D8FF',
                            showDetail: false,
                            handleSize: 8,
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
                    ];
                }
                param.dom.setOption(option);
            }, param.time);
            jumpIntervalMap[id] = thisJumpInterval;
        },

        //色温图配置
        colorMapOption: function (param) {
            var option = {
                baseOption: {
                    visualMap: {
                        type: 'continuous',
                        bottom: '10%',
                        itemWidth: 20,
                        itemHeight: 140,
                        show: true,
                        calculable: true
                    },
                    timeline: {
                        axisType: 'category',
                        data: [],
                        currentIndex: 0,
                        autoPlay: false,
                        playInterval: 2000,
                        controlPosition: 'right',
                        left: '8%',
                        width: '85%',
                        symbolSize: 8,
                        label: {
                            normal: {
                                color: '#ffffff',
                                fontSize: 14
                            }
                        },
                        checkpointStyle: {
                            symbolSize: 2,
                            color: "#00ffff",
                            borderColor: '#00ffff'
                        },
                        controlStyle: {
                            show: false,
                            normal: {
                                color: '#ddd'
                            }
                        },
                        tooltip: {
                            textStyle: {
                                color: '#00ffff',
                                fontSize: 14
                            },
                            backgroundColor: 'rgba(50,50,50,0.3)',
                            position: 'top',
                            formatter: function (result) {
                                return result.name;
                            },
                        },
                    },
                    tooltip: {
                        trigger: 'item',
                        formatter: function loadData(result) {
                            if (isNaN(result.value)) {
                                return result.name;
                            } else {
                                return paramObj.mapTime + '<br />' + result.name + '<br />数据:' + result.value.toFixed(2);
                            }

                        }
                    },
                    dataRange: {
                        splitNumber: 0,
                        text: ['高', '低'],
                        textStyle: {
                            color: '#fff'
                        },
                        realtime: false,
                        calculable: true,
                        selectedMode: false,
                        realtime: false,
                        show: true,
                        itemWidth: 20,
                        itemHeight: 100,
                        color: ['#ff1d1d', '#ffffff', '#009cff'],
                        bottom: '10%',
                        left: '4%'
                    },
                    title: {
                        text: param.title,
                        left: 'center',
                        y: '5%',
                        textStyle: {
                            color: '#fff',
                            fontSize: 16,
                            fontWeight: 'lighter'
                        }
                    },
                    //地图
                    series: {
                        id: 'map',
                        type: 'map',
                        map: 'china', //要和echarts.registerMap（）中第一个参数一致
                        top: '15%',
                        width: 'auto',
                        height: 'auto',
                        itemStyle: {
                            normal: {
                                borderColor: 'rgba(255, 255, 255, 0.2)',
                                areaColor: '#868686',
                            },
                            emphasis: {
                                label: {
                                    show: true
                                }
                            }
                        },
                        label: {
                            normal: {
                                show: true,
                                color: '#3c3c3c'
                            },
                            emphasis: {
                                show: true
                            }
                        },
                        data: []
                    }
                },
                options: []
            };
            return option;
        },

        // 点状地图配置
        spotMapOption(param) {
            var option = {
                baseOption: {
                    tooltip: {
                        trigger: 'item',
                        formatter: function (result) {
                            if (typeof (result.value) == 'object') {
                                return paramObj.mapTime + '<br />' + result.name + '<br/>数据：' + result.value[2].toFixed(2);
                            } else {
                                return result.name;
                            }
                        },
                    },
                    title: {
                        text: param.title,
                        left: 'center',
                        y: '5%',
                        textStyle: {
                            color: '#fff',
                            fontSize: 16,
                            fontWeight: 'lighter'
                        }
                    },
                    timeline: {
                        axisType: 'category',
                        currentIndex: 0,
                        autoPlay: false,
                        playInterval: 2000,
                        controlPosition: 'right',
                        left: '8%',
                        width: '85%',
                        symbolSize: 8,
                        label: {
                            normal: {
                                color: '#ffffff',
                                fontSize: 14
                            }
                        },
                        checkpointStyle: {
                            symbolSize: 2,
                            color: "#00ffff",
                            borderColor: '#00ffff'
                        },
                        controlStyle: {
                            show: false,
                            normal: {
                                color: '#ddd'
                            }
                        },
                        tooltip: {
                            textStyle: {
                                color: '#00ffff',
                                fontSize: 14
                            },
                            backgroundColor: 'rgba(50,50,50,0.3)',
                            position: 'top',
                            formatter: function (result) { //回调函数，参数params具体格式参加官方API
                                return result.name;
                            }
                        }
                    },
                    geo: {
                        id: 'map',
                        type: 'map',
                        map: 'china', //要和echarts.registerMap（）中第一个参数一致
                        width: 'auto',
                        height: 'auto',
                        top: '15%',
                        itemStyle: {
                            normal: {
                                borderColor: 'rgba(255, 255, 255, 0.2)',
                                areaColor: '#868686'
                            },
                            emphasis: {
                                label: {
                                    show: true
                                }
                            }
                        },
                        label: {
                            normal: {
                                show: true,
                                color: '#3c3c3c'
                            },
                            emphasis: {
                                show: true
                            }
                        },
                        markLine: {
                            silent: true
                        },
                    },
                    series: [{
                        name: 'pm2.5',
                        type: 'scatter',
                        coordinateSystem: 'geo',
                        data: [],
                        symbolSize: 10,
                        label: {
                            normal: {
                                show: false
                            },
                            emphasis: {
                                show: false
                            }
                        },
                        itemStyle: {
                            normal: {
                                color: '#00ffff'
                            }
                        }
                    }]
                },
                options: []
            }
            return option;
        },

        // 获取地图数据
        getMapData(param) {
            $.ajax({
                url: param.url,
                type: 'get',
                success: function (result) {
                    if (param.type == 'colorMap') {
                        if (result.datas.length) {
                            var timeData = [],
                                data = result.datas[result.index].data;
                            for (var i = 0; i < result.datas.length; i++) {
                                timeData.push(result.datas[i].date);
                                param.option.options.push({
                                    series: {
                                        data: result.datas[i].data
                                    }
                                })
                            }
                            param.option.baseOption.timeline.currentIndex = result.index;
                            for (var i = result.index + 1; i < timeData.length; i++) {
                                var obj = {
                                    value: timeData[i],
                                    symbol: 'circle',
                                    symbolSize: 8
                                };
                                timeData[i] = obj;
                            };
                            param.option.baseOption.timeline.data = timeData;
                            param.option.baseOption.dataRange.max = echartCommon.getMaxAndMin(data).max;
                            param.option.baseOption.dataRange.min = echartCommon.getMaxAndMin(data).min;
                        }
                        param.dom.setOption(param.option, true);
                    } else {
                        if (result.datas.length) {
                            var timeData = [];
                            for (var i = 0; i < result.datas.length; i++) {
                                timeData.push(result.datas[i].date);
                                param.option.options.push({
                                    series: {
                                        data: result.datas[i].data
                                    }
                                })
                            }
                            param.option.baseOption.timeline.data = timeData;
                            param.option.baseOption.timeline.currentIndex = timeData.length - 1;
                        }
                        param.dom.setOption(param.option, true);
                    }
                },
                error: function (err) {
                    console.log(err);
                }
            })
        },

        // 显示地图
        showMap(param) {
            $.get(param.mapUrl, function (mapJson) {
                echarts.registerMap('china', mapJson);
                echartCommon.getMapData({
                    url: param.dataUrl,
                    option: param.option,
                    type: param.type,
                    dom: param.dom
                });
            })
        },

        drugOption(param) {
            var option = {
                title: {
                    text: param.title,
                    left: 'center',
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
        drugFun(param) {
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
                            ondrag: echarts.util.curry(echartCommon.onPointDragging, param.data[i], dataIndex, param.dom),
                            onmousemove: echarts.util.curry(echartCommon.showTooltip, i, dataIndex, param.dom),
                            onmouseout: echarts.util.curry(echartCommon.hideTooltip, dataIndex, param.dom),
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
                        //         ondrag: echarts.util.curry(echartCommon.onPointDragging, param.data[i], dataIndex, param.dom),
                        //         onmousemove: echarts.util.curry(echartCommon.showTooltip, i, dataIndex, param.dom),
                        //         onmouseout: echarts.util.curry(echartCommon.hideTooltip, dataIndex, param.dom),
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
        showTooltip(index, dataIndex, dom) {
            dom.dispatchAction({
                type: 'showTip',
                seriesIndex: index,
                dataIndex: dataIndex
            });
        },
        hideTooltip(dataIndex, dom) {
            dom.dispatchAction({
                type: 'hideTip'
            });
        },
        // point拖拽过程的函数
        onPointDragging(line, dataIndex, dom) {
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
        updatePosition(param) {
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
    return echartCommon;
})