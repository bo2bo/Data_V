define(['jquery', 'echarts'], function ($, echarts) {
    var jumpIntervalMap = new Object();
    var echartCommon = {
        lineColoObj: {
            'VA': '#3acffe',
            'GDP': '#a2784c',
            'GFP': '#ff421d',
            'OPI': '#dadada',
            'IC': '#a5ff4d',
            'FGI': '#18ccb9',
            'DF': '#2b8189',
            'PPI': '#b64dff',
            'CPI': '#888888',
            'EXP': '#ff9600',
            'IMP': '#e4977f',
            'PROF': '#f372a0',
            'RCU': '#77fff1',
            'AS': '#fffc00',
            'AD': '#2ffe91',
            'ICbak': '#18ccb9',
            'Deflator': '#2b8189',
            'CU': '#77fff1'
        },
        structColorObj: {
            'IC': '#a5ff4d',
            'OPI': '#dadada',
            'EXP': '#ff9600',
            'GFP': '#ff421d',
            'IMP': '#e4977f',
            'OUTPUT': '#fffc00'
        },
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
        timelineConfig: {
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
        mapToolTipConfig: {
            trigger: 'item',
            formatter: function (result) {
                if (typeof (result.value) == 'object') {
                    return result.name + '<br/>数据：' + result.value[2].toFixed(2);
                } else if (!isNaN(result.value)) {
                    return result.name + '<br />数据:' + result.value.toFixed(2);
                } else {
                    return result.name;
                }
            },
        },
        lineToolTipConfig: {
            trigger: 'item',
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
            showDelay: 0, // 显示延迟，添加显示延迟可以避免频繁切换，单位ms
            backgroundColor: 'rgba(0,0,0,0.3)',
            formatter: function (params) {
                var tips = '';
                var date;
                if (Array.isArray(params)) {
                    date = new Date(params[0].data[0]);
                    var tipsTime = '时间：' + date.getFullYear() + '-' +
                        (date.getMonth() + 1) + '-' +
                        date.getDate() + "<br/>";
                    for (var i = 0; i < params.length; i++) {
                        var name = params[i].seriesName;
                        if (params[i].seriesName.slice(params[i].seriesName.length - 2, params[i].seriesName.length) == '预测' && params[i].dataIndex == 0) {
                            name = name.slice(0, name.length - 2) + '历史';
                        }
                        if (i == 0) {
                            tipsTime = tipsTime + name + '：' + parseFloat(params[i].value[1]).toFixed(2) + '<br>';
                        } else {
                            if (params[i + 1].seriesName == params[i].seriesName) {
                                continue;
                            } else {
                                tipsTime = tipsTime + name + '：' + parseFloat(params[i].value[1]).toFixed(2) + '<br>';
                            }
                        }
                    }
                    return tipsTime;
                } else {
                    date = new Date(params.data[0]);
                    var tipsTime = '时间：' + date.getFullYear() + '-' +
                        (date.getMonth() + 1) + '-' +
                        date.getDate() + "<br/>";
                    var name = params.seriesName;
                    if (params.seriesName.slice(params.seriesName.length - 2, params.seriesName.length) == '预测' && params.dataIndex == 0) {
                        name = name.slice(0, name.length - 2) + '历史';
                    }
                    tips += tipsTime + (name || 'value') + '：' + parseFloat(params.data[1]).toFixed(2);
                }
                return tips;
            }
        },
        stackToolTipConfig: {
            show: true,
            trigger: 'axis',
            axisPointer: {
                show: true,
                type: 'cross',
                lineStyle: {
                    type: 'dashed',
                    width: 1
                }
            },
            showDelay: 0, // 显示延迟，添加显示延迟可以避免频繁切换，单位ms
            backgroundColor: 'rgba(0,0,0,0.6)',
            formatter: function (params, ticket, callback) {
                var tips = params[0].name + '</br>';
                var paramslen = params.length;
                for (var i = 0; i < paramslen; i++) {
                    tips += params[i].seriesName + ':' + Math.abs(params[i].value.toFixed(2)) + '<br/>'
                }
                return tips;
            }
        },
        markAreaConfig:{
            silent: true,
            itemStyle: {
                normal: {
                    color: 'rgba(255,255,255,0.6)',
                    opacity: 0.1
                }
            },
            data: [
                [{
                    xAxis: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0),
                }, {
                    xAxis: 'max'
                }]
            ]
        },
        markLineConfig:{
            symbol: ['none', 'none'],
            silent: true,
            label: {
                normal: {
                    show: true,
                    formatter: function(){
                        return echartCommon.getTime().untilDay + ' ' + echartCommon.getTime().untilSecond
                    }
                }
            },
            lineStyle: {
                normal: {
                    type: 'dotted',
                    color: "#eeeeef",
                    width: 2
                }
            },
            data: [{
                xAxis: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)
            }]
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
            var copyArray = new Array(),
                xAxisArray = new Array(),
                yAxisArray = new Array();
            for (var i = 0; i < array.length; i++) {
                copyArray[i] = [new Date(array[i].date), array[i].value];
                xAxisArray[i] = array[i].date;
                yAxisArray[i] = array[i].value;
            }
            return {
                serieData: copyArray,
                xAxisData: xAxisArray,
                yAxisData: yAxisArray
            };
        },
        // 获取MarkLine的time值
        getTime: function () {
            var timeNow = new Date();
            var year = timeNow.getFullYear();
            var month = timeNow.getMonth() + 1;
            if (month < 10) {
                month = '0' + month;
            }
            var date = timeNow.getDate();
            if (date < 10) {
                date = '0' + date;
            }
            var hours = timeNow.getHours();
            if (hours < 10) {
                hours = '0' + hours;
            }
            var minutes = timeNow.getMinutes();
            if (minutes < 10) {
                minutes = '0' + minutes;
            }
            var second = timeNow.getSeconds();
            if (second < 10) {
                second = '0' + second;
            }
            var untilDay = year + '-' + month + '-' + date;
            var untilSecond = hours + ':' + minutes + ':' + second;
            return {
                year: year,
                month: month,
                untilDay: untilDay,
                untilSecond: untilSecond
            }
        },
        // 闪图option
        getLineOption: function (params) {
            var resjson;
            let option = {
                tooltip: echartCommon.lineToolTipConfig,
                title: {
                    text: params.title,
                    left: 'left',
                    textStyle: {
                        color: '#fff'
                    }
                },
                grid: echartCommon.gridConfig,
                dataZoom: echartCommon.dataZoomConfig,
                xAxis: echartCommon.xAxisConfig,
                yAxis: [echartCommon.yAxisConfig, echartCommon.yAxisConfig],
                series: function () {
                    var serie = [];
                    resjson = echartCommon.getLineOptionData({
                        url: params.url
                    });
                    for (let i = 0; i < resjson.length; i++) {
                        var item, serieData = echartCommon.time2Datetime(resjson[i].children).serieData,
                            regstr = /[\u4e00-\u9fa5、]+/,
                            dataName = resjson[i].itemName.split(regstr).join(""),
                            color = echartCommon.lineColoObj[dataName];
                        if (color == undefined) {
                            color = '#ffff00';
                        }
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
                                    color: color,
                                    lineStyle: {
                                        width: 2,
                                        type: 'solid',
                                        color: color
                                    }
                                }
                            },
                            markLine: {},
                            markArea: {}
                        };
                        serie.push(item);
                    }
                    return serie;
                }()
            };
            option.xAxis.type = 'time';
            return option;
        },
        //请求带闪烁的option数据
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
        //预测折线图闪烁
        jumpChart: function (param) {
            let option = param.option,
                id = param.dom.id,
                opacity = 1,
                flagOpcity = 2,
                chartStart, chartStartV,
                chartEnd = 100;
            param.dom.clear();
            // 获取闪烁数据的series
            let jumpSeriesIndex = [],
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
                if (param.markLine) {
                    for (var i = 0; i < jumpSeriesIndex.length; i++) {
                        if (option.series[jumpSeriesIndex[i]].data.length == 1) {
                            continue;
                        } else {
                            option.series[jumpSeriesIndex[i]].markLine = echartCommon.markLineConfig;
                            option.series[jumpSeriesIndex[i]].markArea = echartCommon.markAreaConfig;
                            break;
                        }
                    }
                }
                if (param.dataZoom) {
                    echartCommon.dataZoomConfig[0].start = chartStart;
                    echartCommon.dataZoomConfig[0].end = chartEnd;
                    echartCommon.dataZoomConfig[0].startValue = chartStartV;
                    option.dataZoom = echartCommon.dataZoomConfig;
                }
                param.dom.setOption(option);
            }, param.time);
            jumpIntervalMap[id] = thisJumpInterval;
        },
        // 获取堆积图Option
        getStackOption: function (params) {
            var resjson, xAxisData;
            let option = {
                tooltip: echartCommon.lineToolTipConfig,
                title: {
                    text: params.title,
                    left: 'left',
                    textStyle: {
                        color: '#fff'
                    }
                },
                grid: echartCommon.gridConfig,
                dataZoom: echartCommon.dataZoomConfig,
                xAxis: echartCommon.xAxisConfig,
                yAxis: [echartCommon.yAxisConfig, echartCommon.yAxisConfig],
                series: function () {
                    var serie = [];
                    resjson = echartCommon.getStackOptionData({
                        url: params.url,
                        chartType: params.chartType
                    });
                    for (let i = 0; i < resjson.length; i++) {
                        var item, serieData = echartCommon.time2Datetime(resjson[i].children).yAxisData
                        dataName = resjson[i].itemName,
                            color = echartCommon.structColorObj[dataName];
                        xAxisData = echartCommon.time2Datetime(resjson[i].children).xAxisData;
                        if (color == undefined) {
                            color = '#ffff00';
                        }
                        item = {
                            name: resjson[i].itemName,
                            type: 'bar',
                            showAllSymbol: false,
                            symbol: 'circle',
                            symbolSize: 4,
                            data: serieData,
                            yAxisIndex: 0,
                            smooth: true,
                            itemStyle: {
                                normal: {
                                    color: color,
                                    lineStyle: {
                                        width: 2,
                                        type: 'solid',
                                        color: color
                                    }
                                }
                            },
                            stack: '总量',
                            markLine: {},
                            markArea: {}
                        };
                        serie.push(item);
                    }
                    return serie;
                }()
            };
            option.xAxis.type = 'category';
            option.xAxis.data = xAxisData;
            option.tooltip = echartCommon.stackToolTipConfig;
            option.yAxis[0].axisLabel.formatter = function (v) {
                if (v > 0)
                    return Math.round(v)
                else
                    return -Math.round(v)
            };
            return option;
        },
        // 获取堆积图option数据
        getStackOptionData: function (param) {
            var resjson;
            $.ajax({
                type: "get",
                url: param.url,
                async: false, //异步
                success: function (result) {
                    resjson = result;
                    if (param.chartType == 'struct') {
                        for (var i = 0; i < resjson.length; i++) {
                            if (resjson[i]['itemName'] == 'IMP' || resjson[i]['itemName'] == 'OUTPUT') {
                                for (var j = 0; j < resjson[i]['children'].length; j++) {
                                    resjson[i]['children'][j]['value'] = -resjson[i]['children'][j]['value'];
                                }
                            }
                        }
                    };
                },
                error: function (err) {
                    console.log(err)
                }
            });
            return resjson;
        },
        // 饼图option
        getPieOption:function(param){
            var pieOption = {
                tooltip: {
                    trigger: 'item',
                    formatter: function (params) {
                        return params.data.name + '<br/>数值:' + parseFloat(params.data.value).toFixed(2) + '(' + params.percent + '%)';
                    },
                },
                color: param.color,
                series: [{
                    type: 'pie',
                    radius: '55%',
                    center: ['50%', '55%'],
                    label: {
                        normal: {
                            color: '#fff',
                            formatter: "{b}\n{d}%",
                            textStyle: {
                                fontWeight: 'normal',
                                fontSize: 12
                            },
                            position: 'outside'
                        }
                    },
                    data: param.data,
                    itemStyle: {
                        emphasis: {
                            shadowBlur: 10,
                            shadowOffsetX: 0,
                            shadowColor: 'rgba(0, 0, 0, 0.5)'
                        }
                    }
                }]
            };
            param.dom.setOption(pieOption, true);
        },
        // 结构饼图optionData
        getPieData:function(param){
            var needPieDatas = [], needPieColors = [],givePieDatas = [], givePieColors = [],
                series = param.chart.getOption().series;
            for (var i = 0; i < series.length; i++) {
                if(series[i].name == 'OUTPUT' || series[i].name == 'IMP' || (series[i].name == 'IC' && series[i].data[param.index] < 0) ){
                    var valueData = {
                        value: series[i].data[param.index],
                        name: series[i].name
                    },
                    colorData = series[i].itemStyle.color;                
                    needPieDatas.push(valueData);
                    needPieColors.push(colorData);
                }else {
                    var valueData = {
                        value: series[i].data[param.index],
                        name: series[i].name
                    },
                    colorData = series[i].itemStyle.color;                
                    givePieDatas.push(valueData);
                    givePieColors.push(colorData);
                }
            }
            echartCommon.getPieOption({
                data: needPieDatas,
                color: needPieColors,
                dom: param.needDom
            });
            echartCommon.getPieOption({
                data: givePieDatas,
                color: givePieColors,
                dom: param.giveDom
            });
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
                    timeline: echartCommon.timelineConfig,
                    tooltip: echartCommon.mapToolTipConfig,
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
                        left: 'left',
                        textStyle: {
                            color: '#fff'
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
        /**
         * 功能：色温图的setOption
         */
        setColorMapOption: function (param) {
            if (param.data.datas.length) {
                var timeData = [],
                    data = param.data.datas[param.data.index].data;
                for (var i = 0; i < param.data.datas.length; i++) {
                    timeData.push(param.data.datas[i].date);
                    param.option.options.push({
                        series: {
                            data: param.data.datas[i].data
                        }
                    })
                }
                param.option.baseOption.timeline.currentIndex = param.data.index;
                for (var i = param.data.index + 1; i < timeData.length; i++) {
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
        },

        // 点状地图配置
        spotMapOption: function (param) {
            var option = {
                baseOption: {
                    tooltip: echartCommon.mapToolTipConfig,
                    title: {
                        text: param.title,
                        left: 'left',
                        textStyle: {
                            color: '#fff'
                        }
                    },
                    timeline: echartCommon.timelineConfig,
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
        /**
         * 功能：点状地图的setOption
         */
        setSpotMapOption: function (param) {
            if (param.data.datas.length) {
                var timeData = [];
                for (var i = 0; i < param.data.datas.length; i++) {
                    timeData.push(param.data.datas[i].date);
                    param.option.options.push({
                        series: {
                            data: param.data.datas[i].data
                        }
                    })
                }
                param.option.baseOption.timeline.data = timeData;
                param.option.baseOption.timeline.currentIndex = timeData.length - 1;
            }
            param.dom.setOption(param.option, true);
        },
        // 获取地图数据
        getMapData: function (param) {
            $.ajax({
                url: param.url,
                type: 'get',
                async: true, //异步
                success: function (result) {
                    if (param.type == 'colorMap') {
                        echartCommon.setColorMapOption({
                            dom: param.dom,
                            data: result,
                            option: param.option
                        })
                    } else {
                        echartCommon.setSpotMapOption({
                            dom: param.dom,
                            data: result,
                            option: param.option
                        })
                    }
                },
                error: function (err) {
                    console.log(err);
                }
            })
        },

        // 显示地图
        showMap: function (param) {
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
                grid: echartCommon.gridConfig,
                xAxis: echartCommon.xAxisConfig,
                yAxis: echartCommon.yAxisConfig,
                dataZoom: echartCommon.dataZoomConfig,
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
    return echartCommon;
})