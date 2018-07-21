define(['jquery', 'echarts', 'workCommon', 'jqueryZtreeCore', 'jqueryZtreeExcheck', 'mousewheel', 'mCustomScrollBar'], function ($, echarts, workCommon, ztreeCore, jqueryZtreeExcheck, mousewheel, mCustomScrollBar) {
    $(function () {
        var paramObj = {
            url: 'http://area.tjresearch.com:8082/newArea//api/opiData/getOpiData',
            chartType: 'bar',
            dataTypeName: '_abs_r',
            treeData: function () {
                var resjson;
                $.ajax({
                    type: "get",
                    url: './../assets/js/json/treeData.json',
                    async: false,
                    success: function (result) {
                        resjson = result;
                    },
                    error: function (err) {
                        console.log(err)
                    }
                });
                return resjson;
            }(),
            colorData: [{
                    startColor: [236, 251, 239],
                    endColor: [69, 218, 95],
                    colorSplit: [],
                    pId: 400,
                    cCount: 0,
                    indus: [],
                    classCode: 'OPI_C'
                },
                {
                    startColor: [229, 243, 255],
                    endColor: [0, 138, 255],
                    colorSplit: [],
                    pId: 500,
                    cCount: 0,
                    indus: [],
                    classCode: 'OPI_R'
                }, {
                    startColor: [254, 234, 234],
                    endColor: [243, 49, 49],
                    colorSplit: [],
                    pId: 600,
                    cCount: 0,
                    indus: [],
                    classCode: 'OPI_E'
                }, {
                    startColor: [250, 238, 253],
                    endColor: [207, 93, 232],
                    colorSplit: [],
                    pId: 700,
                    cCount: 0,
                    indus: [],
                    classCode: 'OPI_M'
                },
                {
                    startColor: [255, 252, 0],
                    endColor: [255, 252, 0],
                    colorSplit: [],
                    pId: 800,
                    cCount: 0,
                    indus: [],
                    classCode: 'OPI_A'
                },
                {
                    startColor: [0, 216, 255],
                    endColor: [0, 216, 255],
                    colorSplit: [],
                    pId: 900,
                    cCount: 0,
                    indus: [],
                    classCode: 'OPI_B'
                },
                {
                    startColor: [142, 143, 150],
                    endColor: [255, 255, 255],
                    colorSplit: [],
                    pId: 1000,
                    cCount: 0,
                    indus: [],
                    classCode: 'OPI_O'
                }
            ]
        };
        $('.left-tree').mCustomScrollbar();
        getTreeDom({
            treeData: paramObj.treeData,
            dom: "#treeDemoOpi"
        });
        $(".macro .tree-title").on("click", function (e) {
            $("[node='tree-list']").toggle();
        });

        // 获取树型dom元素 
        function getTreeDom(param) {
            var treeDomobj;
            // 创建树
            var treeInfo = {
                setting: {
                    check: {
                        enable: true,
                        chkboxType: {
                            "Y": "ps",
                            "N": "ps"
                        }
                    },
                    view: {
                        showLine: false
                    },
                    data: {
                        simpleData: {
                            enable: true
                        }
                    },
                    callback: {
                        onClick: function (event, treeId, treeNode, clickFlag) {
                            treeDomobj.checkNode(treeNode, !treeNode.checked, true);
                        }
                    }
                },
                zNodes: param.treeData,
                treeInit: function () {
                    return $.fn.zTree.init($(param.dom), treeInfo.setting, treeInfo.zNodes);
                },
            };
            var treeDomobj = treeInfo.treeInit();

            $(".tree-reset-btn").click(function () {
                $.fn.zTree.init($(param.dom), treeInfo.setting, treeInfo.zNodes);
                $("[node='tree-list']").hide();
            })
            $(".tree-submit-btn").click(function () {
                //传递选择的信息
                var nodesOpi = treeDomobj.getCheckedNodes(true);
                var treeSelectArrOpi = [];
                for (var i = 0; i < nodesOpi.length; i++) {
                    if (nodesOpi[i].pId > 0) {
                        treeSelectArrOpi.push(nodesOpi[i].indus_code)
                    }
                }
                $("[node='tree-list']").hide();
            })
        }
        // 获取右侧堆积图
        chartStackRight = echarts.init(document.getElementById('chart-stack-right'));

        var chartStackRightOption = stackOption({
            url: paramObj.url,
            title: '堆积图',
            chartType: '',
            datatypeName: paramObj.dataTypeName
        });
        chartStackRight.setOption(chartStackRightOption);
        chartStackRight.on('click', function (params) {
            debugger;
        })
        // 右侧堆积图option
        function stackOption(params) {
            var resjson, xAxisData, legendData = [],
                colorSeries;
            let option = {
                tooltip: workCommon.stackToolTipConfig,
                title: {
                    text: params.title,
                    left: 'left',
                    textStyle: {
                        color: '#fff'
                    },
                    show: false
                },
                legend: {
                    show: true,
                    data: [],
                    textStyle: {
                        color: "#fff"
                    }
                },
                grid: workCommon.gridConfig,
                dataZoom: workCommon.dataZoomConfig,
                xAxis: workCommon.xAxisConfig,
                yAxis: [workCommon.yAxisConfig, workCommon.yAxisConfig],
                series: function () {
                    var serie = [];
                    resjson = workCommon.getStackOptionData({
                        url: params.url,
                        chartType: params.chartType,
                        datatypeName: params.datatypeName
                    });
                    colorSeries = getColorSeries({
                        colorData: paramObj.colorData,
                        treeData: paramObj.treeData
                    }).mColorMapOpi;
                    for (let i = 0; i < resjson.length; i++) {
                        if (resjson[i].itemName.split('_').length < 3) {
                            continue;
                        } else {
                            var item,
                                serieData = workCommon.time2Datetime(resjson[i].children).yAxisData,
                                dataName = resjson[i].itemName,
                                color = colorSeries[dataName];
                            legendData.push(dataName);
                            xAxisData = workCommon.time2Datetime(resjson[i].children).xAxisData;
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
                    }
                    return serie;
                }()
            };
            option.xAxis.type = 'category';
            option.xAxis.data = xAxisData;
            option.legend.show = false;
            option.legend.data = legendData;
            option.tooltip.formatter = function(params){
                return ;
            }
            return option;
        }
        // 色系
        function getColorSeries(param) {
            var mColorMapOpi = {},
                ratioData = [],
                detailColorData = [];
            var colorSystemOpi = JSON.parse(JSON.stringify(param.colorData));
            var opiCatagory = param.treeData;
            for (var i = 0; i < opiCatagory.length; i++) {
                if (opiCatagory[i].pId != 0) {
                    //取巧,获取colorSystem的数值
                    var indexInColorSystemOpi = Math.floor(opiCatagory[i].id / 100) - 4;
                    colorSystemOpi[indexInColorSystemOpi].cCount++;
                    colorSystemOpi[indexInColorSystemOpi].indus.push({
                        'indus_code': opiCatagory[i].indus_code,
                        'indust_name': opiCatagory[i].name
                    });
                } else {
                    for (var k = 0; k < colorSystemOpi.length; k++) {
                        if (opiCatagory[i].id == colorSystemOpi[k].pId) {
                            ratioData.push({
                                classCode: colorSystemOpi[k].classCode,
                                data: 0,
                                name: opiCatagory[i].name,
                                color: 'rgb(' + colorSystemOpi[k].endColor.join(',') + ')'
                            })
                        }
                    }
                }
            }
            for (var i = 0; i < colorSystemOpi.length; i++) {
                var catagoryCountOpi = colorSystemOpi[i].cCount;
                //该大类内有两个小分类,那么分别取成start和end就可以了
                if (catagoryCountOpi == 2) {
                    colorSystemOpi[i].indus[0].color = colorSystemOpi[i].startColor;
                    colorSystemOpi[i].indus[1].color = colorSystemOpi[i].endColor;
                    mColorMapOpi[colorSystemOpi[i].indus[0].indus_code] = 'rgb(' + colorSystemOpi[i].startColor.join(',') + ')';
                    mColorMapOpi[colorSystemOpi[i].indus[1].indus_code] = 'rgb(' + colorSystemOpi[i].endColor.join(',') + ')';
                }
                //该大类内只有一个小分类,使用start
                else if (catagoryCountOpi == 1) {
                    colorSystemOpi[i].indus[0].color = colorSystemOpi[i].startColor;
                    mColorMapOpi[colorSystemOpi[i].indus[0].indus_code] = 'rgb(' + colorSystemOpi[i].startColor.join(',') + ')';
                } else {
                    for (var j = 0; j < catagoryCountOpi; j++) {
                        var mColorOpi = [];
                        var r = colorSystemOpi[i].startColor[0] - Math.floor((colorSystemOpi[i].startColor[0] - colorSystemOpi[i].endColor[0]) / (catagoryCountOpi - 1) * j);
                        var g = colorSystemOpi[i].startColor[1] - Math.floor((colorSystemOpi[i].startColor[1] - colorSystemOpi[i].endColor[1]) / (catagoryCountOpi - 1) * j);
                        var b = colorSystemOpi[i].startColor[2] - Math.floor((colorSystemOpi[i].startColor[2] - colorSystemOpi[i].endColor[2]) / (catagoryCountOpi - 1) * j);
                        mColorOpi.push(r);
                        mColorOpi.push(g);
                        mColorOpi.push(b);
                        colorSystemOpi[i].indus[j].color = mColorOpi; //同一个pId下的每一个不同id的节点的颜色
                        mColorMapOpi[colorSystemOpi[i].indus[j].indus_code] = 'rgb(' + mColorOpi.join(',') + ')';
                    }
                }
            }
            detailColorData = JSON.parse(JSON.stringify(ratioData));
            var allIndus = Object.keys(mColorMapOpi);
            for (var i = 0; i < detailColorData.length; i++) {
                detailColorData[i].detailColor = [];
                for (var j = 0; j < allIndus.length; j++) {
                    if (detailColorData[i].classCode == allIndus[j].slice(0, 5)) {
                        detailColorData[i].detailColor.push(mColorMapOpi[allIndus[j]]);
                    }
                }
            }
            return {
                mColorMapOpi: mColorMapOpi,
                ratioData: ratioData,
                detailColorData: detailColorData
            };
        }
    })
})