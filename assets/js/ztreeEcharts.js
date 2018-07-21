define(['jquery', 'echarts', 'workCommon', 'jqueryZtreeCore', 'jqueryZtreeExcheck'], function ($, echarts, workCommon, ztreeCore, jqueryZtreeExcheck) {
    $(function () {
        var OPIColor = []; //legend中每个小方块颜色的集合
        var opiData = {
            paramOpiData: {
                'code': [], //存放的是tree中被选中的节点的indus_code的值
                'datatypename': "_abs_r"
            },
            url: 'http://area.tjresearch.com:8082/newArea//api/opiData/getOpiData',
            dataypeAbs: "_abs_r",
            dataypeInc: "_inc_r",
            dataypeYoygrew: "_abs_yoy_r",
            chartType: 'bar',
            tooltipParamsClone: {}, //总量中toolTip显示出来的数据
            lineType: 'area',
            rightArr: [],
            dataindex: 0,
            opiRun: function (type) {
                macro_opi_data.resize();
                macro_opi_data.setOption(opi_getOptionArea(opiData.lineType), true, false);
            },
            nodes: function () {
                var nodes1 = treeObjOpi.getCheckedNodes(true); //获取当前tree树被勾选的节点集合
                var treeSelectArr = [];
                for (var i = 0; i < nodes1.length; i++) {
                    if (nodes1[i].pId > 0) { //是子节点，而不是pId为0的父节点
                        treeSelectArr.push(nodes1[i].indus_code)
                    }
                }
                return treeSelectArr;
            },
            opiNameMap: function () {
                var resObj = {};
                $.ajax({
                    type: "get",
                    url: './../assets/js/json/treeData.json',
                    async: false, //异步
                    success: function (result) {
                        for (var i = 0; i < result.length; i++) {
                            if (result[i].indus_code == undefined) {
                                continue;
                            } else {
                                resObj[result[i].indus_code] = result[i].name;
                            }
                        }
                    },
                    error: function (err) {
                        console.log(err)
                    }
                });
                return resObj;
            }(),
            //opiEchartsData,全局化data，包括总量，增量，某部分行业数据
            opiEchartsData: {
                opiAbsData: [],
                opiIncData: [],
                opiYoygrewData: [],
                opiSelectData: [],
                opiAbsDataCount: {},
                opiIncDataCount: {},
                opiYoygrewDataCount: {},
                opiTypeDataCount: [],
            },
            treeData: function () {
                var resjson;
                $.ajax({
                    type: "get",
                    url: './../assets/js/json/treeData.json',
                    async: false, //异步
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
        }
        $("#macro_OPI .treetitle").on("click", function (e) {
            $("[node='listfoot']").toggle();
        });
        $("#treeresetOpi").click(function () {
            $.fn.zTree.init($("#treeDemoOpi"), opiTreeInfo.setting, opiTreeInfo.zNodes);
            $("[node='listfoot']").hide();
            $("#macro_opi_detailbox").hide();
        })
        $("#treesubmitOpi").click(function () {
            //传递选择的信息
            var nodesOpi = treeObjOpi.getCheckedNodes(true);
            var treeSelectArrOpi = [];
            for (var i = 0; i < nodesOpi.length; i++) {
                if (nodesOpi[i].pId > 0) {
                    treeSelectArrOpi.push(nodesOpi[i].indus_code)
                }
            }
            opiData.paramOpiData.code = treeSelectArrOpi;
            opiData.opiRun();
            legendDownColor();
            $("[node='listfoot']").hide();
            $("#macro_opi_detailbox").hide();
            $(".outindexcontent").hide();
            return false;
        })
        tabOPI();

        function tabOPI() {
            //tree start
            opiTreeInfo = {
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
                            ////文字点击选择（lable选择）
                            treeObjOpi.checkNode(treeNode, !treeNode.checked, true);
                        }
                    }
                },
                zNodes: opiData.treeData,
                treeInit: function () {
                    return $.fn.zTree.init($("#treeDemoOpi"), opiTreeInfo.setting, opiTreeInfo.zNodes);
                },
            }
            treeObjOpi = opiTreeInfo.treeInit(); //树状图的初始化代码
            //填充最下边的"legendbox"legend列表
            var zNodesLenOpi = opiTreeInfo.zNodes.length;
            $("#legendboxopi").empty();
            var pIndex = 0;
            var legendColorOpi = JSON.parse(JSON.stringify(opiData.colorData));
            for (var i = 0; i < zNodesLenOpi; i++) {
                if (!opiTreeInfo.zNodes[i].pId) {
                    var legendlev1Str = '<dl id="opi' + opiTreeInfo.zNodes[i].id + '" class="legenddl"><dt>' + opiTreeInfo.zNodes[i].name + '</dt></dl>';
                    $("#legendboxopi").append(legendlev1Str);
                    legendColorOpi[pIndex].pId = opiTreeInfo.zNodes[i].id;
                    pIndex++;
                } else if (opiTreeInfo.zNodes[i].pId) {
                    var legendlev2Str = '<dd legendmapto="' + opiTreeInfo.zNodes[i].indus_code + '" class="legendon"><span></span>' + opiTreeInfo.zNodes[i].name + '</dd>';
                    $('#opi' + opiTreeInfo.zNodes[i].pId).append(legendlev2Str);
                    legendColorOpi.forEach(function (content) {
                        if (content.pId == opiTreeInfo.zNodes[i].pId) { //计算颜色从一开始到最后需要除以几个
                            content.cCount = content.cCount + 1;
                        }
                    })
                }
            }
            for (var j = 0; j < legendColorOpi.length; j++) { //背景颜色计算处理,得到5组颜色值得数组
                legendColorOpi[j].colorSplit = [(legendColorOpi[j].startColor[0] - legendColorOpi[j].endColor[0]) / legendColorOpi[j].cCount, (legendColorOpi[j].startColor[1] - legendColorOpi[j].endColor[1]) / legendColorOpi[j].cCount, (legendColorOpi[j].startColor[2] - legendColorOpi[j].endColor[2]) / legendColorOpi[j].cCount];
            }
            $("#legendboxopi dl").each(function (index) {
                var color = legendColorOpi[index];
                $(this).find("dd").each(function (index, ele) {
                    var cssColor = [Math.floor(color.startColor[0] - color.colorSplit[0] * index), Math.floor(color.startColor[1] - color.colorSplit[1] * index), Math.floor(color.startColor[2] - color.colorSplit[2] * index)];
                    $(ele).find('span').css({
                        "background": 'rgb(' + cssColor.join(',') + ')'
                    });
                    OPIColor.push('rgb(' + cssColor.join(',') + ')');
                })
            })
            //tree end
            $("#box_flex2_content").show();
            $("#macro_OPI").show();
            $("#macro_opi_background").show();
            $("#macro_opi_ratio").css('height', '780px');
            macro_opi_data = echarts.init(document.getElementById('macro_opi_data')); //初始化右侧的柱状堆积图
            window.addEventListener("resize", function () {
                var currentHeight = document.getElementById('macro_opi_data').clientHeight;
                var gridY = currentHeight * 0.1;
                macro_opi_data.setOption({
                    grid: {
                        y: gridY
                    }
                })
                macro_opi_data.resize();
            })
            macro_opi_data.clear(); //清除画布内容
            opiData.paramOpiData.code = opiData.nodes();
            //初始化时加载总量和增量两条数据。
            getOpiRawData("abs"); //总量
            getOpiRawData("inc"); //增量
            getOpiRawData("yoygrew"); //同比增量
            debugger;
            opiData.opiRun(); //初始化右侧的面积柱状图	

        }
        $("#absOpi").click(function () {
            $("#macro_opi_detailbox").hide();
            $("#macro_opi_ratio").show();
            $("#macro_opi_ratio").css("width", "25%");
            $("#macro_opi_data").css("width", "73%");
            $("#absOpi").siblings("li").removeClass("active");
            $("#absOpi").addClass("active");
            $("#setyaxisopi").hide(); //同比增量中的左右轴切换
            $(".outindexcontent").hide();
            opiData.paramOpiData.datatypename = "_abs_r";
            opiData.paramOpiData.code = opiData.nodes();
            legendDownColor();
            opiData.chartType = 'bar';
            opiData.lineType = 'default';
            macro_opi_data.clear();
            opiData.opiRun();
        })
        $("#incOpi").click(function () {
            $("#macro_opi_detailbox").hide();
            $("#macro_opi_ratio").show();
            $("#macro_opi_ratio").css("width", "25%");
            $("#macro_opi_data").css("width", "73%");
            $("#incOpi").siblings("li").removeClass("active");
            $("#incOpi").addClass("active");
            $("#setyaxisopi").hide();
            $(".outindexcontent").hide();
            opiData.paramOpiData.datatypename = "_inc_r";
            opiData.paramOpiData.code = opiData.nodes();
            legendDownColor();
            opiData.chartType = 'bar';
            opiData.lineType = 'default';
            macro_opi_data.clear();
            opiData.opiRun();

        })
        $("#yoygrewOpi").click(function () {
            $("#macro_opi_detailbox").hide();
            $("#macro_opi_ratio").hide();
            $("#macro_opi_data").css("width", "100%");
            $('#yoygrewOpi').siblings("li").removeClass("active");
            $('#yoygrewOpi').addClass("active");
            opiData.paramOpiData.datatypename = "_abs_yoy_r";
            $(".outindexcontent").hide();
            $("#setyaxisopi").show();
            //treeObjOpi展开所有节点，取消勾选所有节点，根据id选中房地产和基建
            var nodes = treeObjOpi.getNodes(); //获取全部的节点数据
            treeObjOpi.expandNode(nodes); //展开所有的节点
            treeObjOpi.checkAllNodes(false); //取消勾选全部节点
            treeObjOpi.checkNode(treeObjOpi.getNodeByParam("id", "801", null), true, true);
            treeObjOpi.checkNode(treeObjOpi.getNodeByParam("id", "901", null), true, true);
            opiData.paramOpiData.code = opiData.nodes(); //重新赋值
            legendDownColor();
            opiData.chartType = 'line';
            opiData.lineType = 'line';
            macro_opi_data.clear();
            opiData.opiRun();

        })
        $("body").on("click", "#setyaxisopi", function () { //同比增量中的切换左右轴
            var selectTrade = $("#treeDemoOpi ul .checkbox_true_full");
            var str = '';
            $("#treeDemoOpi ul .checkbox_true_full").each(function (index, e) {
                if (opiData.rightArr.length) {
                    var rightFlag = 0;
                    for (var l = 0; l < opiData.rightArr.length; l++) {
                        if (opiData.rightArr[l] == $(e).siblings("a").find('.node_name').text()) {
                            rightFlag = 1;
                        }
                    }
                    if (rightFlag) {
                        str += '<li id="' + $(e).siblings(".switch").attr("id") + '"><div>' + $(e).siblings("a").find(".node_name").text() + '</div><div><input type="radio" value="left" name="' + $(e).siblings(".switch").attr("id") + '"/><i class="iradio"><em></em></i></div><div><input type="radio" value="right" checked="checked" name="' + $(e).siblings(".switch").attr("id") + '"/><i class="iradio"><em></em></i></div></li>'
                    } else {
                        str += '<li id="' + $(e).siblings(".switch").attr("id") + '"><div>' + $(e).siblings("a").find(".node_name").text() + '</div><div><input type="radio" checked="checked" value="left" name="' + $(e).siblings(".switch").attr("id") + '"/><i class="iradio"><em></em></i></div><div><input type="radio" value="right" name="' + $(e).siblings(".switch").attr("id") + '"/><i class="iradio"><em></em></i></div></li>'
                    }

                } else {
                    str += '<li id="' + $(e).siblings(".switch").attr("id") + '"><div>' + $(e).siblings("a").find(".node_name").text() + '</div><div><input type="radio" checked="checked" value="left" name="' + $(e).siblings(".switch").attr("id") + '"/><i class="iradio"><em></em></i></div><div><input type="radio" value="right" name="' + $(e).siblings(".switch").attr("id") + '"/><i class="iradio"><em></em></i></div></li>'
                }
            })

            $(".outindexcontent").remove();
            var outStr = '<div node="outIndexContent" class="outindexcontent">\
			<div>\
			<p class="title">指标选择</p>\
			<div class="subtitle"><div>指标</div><div>左轴</div><div>右轴</div></div>\
			<ul>' + str +
                '</ul>\
			<p class="foot"><a href="#" node="submitIndexopi">确定</a></p>\
			<div></div>\
			<div></div>\
			</div></div>';
            $("#macro_opi_data").append(outStr);
            $(".outindexcontent").show();
        }) //左右轴切换结束

        $("body").on("click", '[node="submitIndexopi"]', function () {
            var rightArr = [];
            var inputs = $('.outindexcontent input:checked');
            var inputsLen = inputs.length;
            var inputInfo = [];
            for (var i = 0; i < inputsLen; i++) {
                if (inputs.eq(i).val() == "right") {
                    rightArr.push($(inputs[i]).parents('li').text());
                }
                var tabInfo = $(inputs[i]).parents('li').text() + '->' + $(inputs[i]).attr('value');
                inputInfo.push(tabInfo);
            }
            opiData.rightArr = rightArr;
            $(".outindexcontent").hide();
            opiData.opiRun();
        })

        $("#close_detail_opi").click(function () { //关闭按钮
            $("#macro_opi_detailbox").hide();
            macro_opi_ratio.dispatchAction({
                type: 'hideTip'
            })
        })

        $("#legendboxopi").on("click", ".legendon", function (e, index) {
            $(this).removeClass("legendon").addClass("legendhide");
            macro_opi_data.dispatchAction({
                type: 'highlight',
                seriesName: $(this).attr("legendmapto"),
            })
        })
        $("#legendboxopi").on("click", ".legendhide", function (e, index) {
            $(this).removeClass("legendhide").addClass("legendon");
            macro_opi_data.dispatchAction({
                type: 'downplay',
                seriesName: $(this).attr("legendmapto"),
            })
        })
        //OPI面积图option设置
        function opi_getOptionArea(serisetype, option) {
            var legend = "";
            var staffDataIndex;
            var opConfig = { //右侧面积柱状图的全局设置
                axisLineColor: '#ddd',
                labelColor: '#ddd',
                splitColor: '#a5afbe',
                zoomColor: '#d3d8df',
                fillColor: '#8b9ebb',
                iconColor: '#8b9ebb',
                iconHoverColor: '#5b99f9',
                axisLineWidth: 1,
                tbPR: 20,
                tbpB: 24,
                tbSize: 20,
                tbGap: 24,
            }

            //行业映射
            var tradeClass = genColorSeriesOpi({
                colorData:opiData.colorData,
                treeData:opiData.treeData
            }).detailColorData;

            ////当前时间节点数据
            var thisTimeAllData = [];
            ////数据总和，用作百分比基数
            var percentCount = 0;
            ////option3的title
            var detailTitle = '';
            ////detail图的颜色
            var thisDetailColor = [];
            //wangdw修改，
            var resjson1 = getOpiAbsData(); //被选中的节点数据
            //resjson延长
            var reslong = [];

            for (var i = 0; i < resjson1.length; i++) {
                if (resjson1[i].type < 28) {
                    reslong.push(resjson1[i]); //2008年的数据单独拿出来
                }
            }
            // console.log(reslong);
            for (var n = 0; n < resjson1.length; n++) {
                if (resjson1[n].type > 27) { //所有被选中的数据大于2008年
                    for (var j = 0; j < reslong.length; j++) { //循环遍历2008年的数据
                        if (resjson1[n].itemName == reslong[j].itemName) {
                            for (var k = 0; k < resjson1[n].children.length; k++) {
                                reslong[j].children.push(resjson1[n].children[k]); //itemname相同时，把
                            }
                        }
                    }
                }
            }
            resjson1 = reslong;
            //resjson延长end

            //点击右侧柱状图更新左边的柱图
            macro_opi_data.on("click", function () {
                params = opiData.tooltipParamsClone;
                staffDataIndex = params[0].dataIndex; //线中的第几个点
                if (opiData.paramOpiData.datatypename == "_abs_r") { //总量的第几个点
                    opiData.dataindex = staffDataIndex;
                } else if (opiData.paramOpiData.datatypename == "_inc_r") { //增量的第几个点
                    opiData.dataindex = staffDataIndex;
                }

                var tips = params[0].name + '</br>'; //浮动提示的标题,当前日期
                for (var i = 0; i < params.length; i++) {
                    tips += params[i].seriesName + ':' + params[i].value.toFixed(2) + '<br/>';
                    percentCount += params[i].value; //当前时间所有节点的value值得总和
                }

                ////timeline重新定位
                macro_opi_ratio.resize();
                macro_opi_ratio.setOption({
                    baseOption: {
                        timeline: {
                            currentIndex: staffDataIndex, //右侧的大图和timeLine组件联系，timeLine和柱状图联系
                        },
                        xAxis: {
                            data: [params[0].name], //时间点
                        }
                    },
                });

                ////点击右侧柱状图保存当前细分行业数据
                thisTimeAllData = params;

                ////保存细分行业color信息
                var paramsTodetail = params; ////临时
                for (var j = 0; j < tradeClass.length; j++) {
                    tradeClass[j].detailColor = []; //先为空，之后再追加
                }
                for (var i = 0; i < paramsTodetail.length; i++) {
                    for (var j = 0; j < tradeClass.length; j++) {
                        if (paramsTodetail[i].seriesName.substring(0, 5) == tradeClass[j].classCode) {
                            tradeClass[j].detailColor.push(paramsTodetail[i].color);
                        }
                    }
                }

            })

            var mThisTimeColors = []; //当前被选中的元素节点的颜色数组
            var mColorSystemOpi = genColorSeriesOpi({
                colorData:opiData.colorData,
                treeData:opiData.treeData
            }).mColorMapOpi;
            for (var k = 0; k < resjson1.length; k++) {
                var mCatoryName = resjson1[k].itemName;
                var mColor = mColorSystemOpi[mCatoryName];
                mThisTimeColors.push(mColor);
            }

            /*柱状比例图*/
            macro_opi_ratio = echarts.init(document.getElementById('macro_opi_ratio')); //柱状比例图的初始化
            window.addEventListener("resize", function () {
                macro_opi_ratio.resize();
            })
            //获取右侧柱状图全部数据
            var timeLen = resjson1[0].children.length;
            var barseriesLen = resjson1.length;
            var inbarlegend = "";

            var thiscurrentIndex = 0; //设置timeLine初始位置
            //opiData.dataindex
            if (opiData.paramOpiData.datatypename == "_abs_r") { //总量   
                thiscurrentIndex = opiData.dataindex;
            } else if (opiData.paramOpiData.datatypename == "_inc_r") {
                thiscurrentIndex = opiData.dataindex;
            }

            if (thiscurrentIndex < 0) {
                thiscurrentIndex = 0;
            } else if (thiscurrentIndex > resjson1[0].children.length) {
                thiscurrentIndex = resjson1[0].children.length - 1;
            }
            option2 = { //左侧柱状图的option配置
                baseOption: {
                    timeline: {
                        show: false,
                        axisType: 'category',
                        data: workCommon.time2Datetime(resjson1[0].children).xAxisData,
                        playInterval: 1000,
                        loop: true,
                        autoPlay: false,
                        currentIndex: thiscurrentIndex,
                        label: {
                            formatter: function (s) {
                                return (new Date(s)).getFullYear();
                            },
                        },
                        left: 10,
                        right: 0,
                        symbolSize: 3,
                        tooltip: { // 让鼠标悬浮到此项时能够显示 `tooltip`。
                            formatter: function (params) {
                                return params.name;
                            }
                        },
                    },
                    tooltip: {
                        trigger: 'item',
                        triggerOn: 'click',
                        formatter: function (params) {
                            detailTitle = params.seriesName; //detailbox的标题
                            //点击色块弹出当前行业详细分类  macro_opi_detailbox--start
                            $("#macro_opi_detailbox").show();
                            var macro_opi_detail = echarts.init(document.getElementById('macro_opi_detail'));
                            window.addEventListener("resize", function () {
                                macro_opi_detail.resize();
                            })
                            var paramsToData = params;
                            var detailResjson = [];
                            var detailDataLen = thisTimeAllData.length; //不同的节点对应的相同月份的不同的值的数组
                            var detailX = [];
                            var detailSerie = [];
                            var detailBase = params.value / 100;
                            option3 = { //macro_opi_detail的option配置
                                title: {
                                    text: detailTitle,
                                    left: 'center',
                                    top: 14,
                                    textStyle: {
                                        fontWeight: 'normal',
                                        fontSize: 16,
                                        color: '#fff'
                                    }
                                },
                                //整个图表的背景颜色
                                backgroundColor: '#1d1f2c',
                                series: function () {
                                    var detailNamePro = '';
                                    thisDetailColor = [];
                                    var detailData = [];
                                    var percentCountDetail = 0;
                                    for (var i = 0; i < tradeClass.length; i++) {
                                        if (tradeClass[i].name == paramsToData.seriesName) {
                                            detailNamePro = tradeClass[i].classCode.substring(0, 5);
                                            thisDetailColor = tradeClass[i].detailColor;
                                        }
                                    }
                                    for (var j = 0; j < detailDataLen; j++) {
                                        if (thisTimeAllData[j].seriesName.substring(0, 5) == detailNamePro) {
                                            detailResjson.push(thisTimeAllData[j]);
                                            percentCountDetail += thisTimeAllData[j].value;
                                            detailData.push({
                                                name: opiData.opiNameMap[thisTimeAllData[j].seriesName],
                                                value: thisTimeAllData[j].value,
                                                label: {
                                                    normal: {
                                                        show: true,
                                                        position: 'top',
                                                        textStyle: {
                                                            color: '#fff'
                                                        }
                                                    }
                                                },
                                                itemStyle: {
                                                    normal: {
                                                        color: thisDetailColor[detailData.length],
                                                    },
                                                },
                                            })
                                        }
                                    }
                                    ////得到的data排序							    	
                                    var detailSortData = detailData.sort(compare('value'));
                                    ////x轴顺序重排,并计算百分比
                                    detailX = [];
                                    for (var i = 0; i < detailSortData.length; i++) {
                                        if (detailSortData.length > 4) {
                                            var detailXToArr = detailSortData[i].name.substring(0, 6).split('');
                                            var detailXToArrLengt = detailXToArr.length;
                                            for (var j = 0; j < detailXToArrLengt; j++) {
                                                detailXToArr[j] = detailXToArr[j] + '\n';
                                            }
                                            detailX.push(detailXToArr.join(''));
                                        } else {
                                            detailX.push(detailSortData[i].name);
                                        }
                                        detailData[i].value = (detailData[i].value / percentCountDetail * 100 * detailBase).toFixed(1);
                                    }
                                    detailSerie = [{
                                        name: detailResjson[0].itemName,
                                        type: 'bar',
                                        showAllSymbol: true,
                                        symbol: 'circle',
                                        symbolSize: 0.6,
                                        smooth: true,
                                        data: detailSortData,
                                    }]
                                    return detailSerie;
                                }(),
                                tooltip: {
                                    show: true,
                                    trigger: 'axis',
                                    triggerOn: 'click',
                                    axisPointer: {
                                        show: true,
                                        type: 'line',
                                        lineStyle: {
                                            type: 'dashed',
                                            width: 1
                                        }
                                    },
                                    showDelay: 0, // 显示延迟，添加显示延迟可以避免频繁切换，单位ms
                                    backgroundColor: 'rgba(0,0,0,0.3)',
                                    formatter: function (params) {
                                        console.log(params);
                                        return params[0].name + '</br>' + 'value:' + parseFloat(params[0].value).toFixed(2);
                                    },
                                },
                                grid: {
                                    borderWidth: 0,
                                    borderColor: "#6898CD",
                                    backgroundColor: "rgba(0,0,0,0)",
                                    x: 84,
                                    y: 70,
                                    x2: 70,
                                    y2: 100
                                },
                                xAxis: {
                                    type: 'category',
                                    position: 'bottom',
                                    axisLabel: {
                                        show: true,
                                        margin: 12,
                                        textStyle: {
                                            color: opConfig.labelColor,
                                            fontSise: 12,
                                        },
                                        interval: 0,
                                        fontFamily: 'arial',
                                        fontWeight: 'bolder'
                                    },
                                    axisLine: {
                                        lineStyle: {
                                            color: opConfig.axisLineColor,
                                            width: opConfig.axisLineWidth,
                                            type: 'solid'
                                        }
                                    },
                                    axisTick: {
                                        onGap: false,
                                        show: false,
                                    },
                                    splitLine: {
                                        show: true,
                                        lineStyle: {
                                            color: opConfig.splitColor,
                                            width: 1,
                                            type: 'dashed'
                                        }
                                    },
                                    data: detailX, //x轴的类目
                                },
                                yAxis: {
                                    type: 'value',
                                    scale: true,
                                    splitNumber: 4,
                                    boundaryGap: [0.05, 0.05],
                                    axisLabel: {
                                        margin: 12,
                                        textStyle: {
                                            color: opConfig.labelColor,
                                            fontSise: 12,
                                        },
                                        fontFamily: 'arial',
                                        fontWeight: 'bolder',
                                        formatter: function (v) {
                                            return v + '%';
                                        }
                                    },
                                    axisLine: {
                                        lineStyle: {
                                            color: opConfig.axisLineColor,
                                            width: opConfig.axisLineWidth,
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
                                            color: opConfig.splitColor,
                                            width: 1,
                                            type: 'dashed'
                                        }
                                    }
                                },
                                legend: {
                                    left: 'center',
                                    top: 40,
                                    padding: [0, 120, 0, 120],
                                    itemGap: 20,
                                    data: legend.split(",")
                                },

                            }
                            macro_opi_detail.resize();
                            macro_opi_detail.setOption(option3);
                            return params.seriesName + '<br/>value:' + params.value;
                        },
                        showDelay: 200
                    },
                    grid: {
                        borderWidth: 0,
                        borderColor: "#6898CD",
                        backgroundColor: "rgba(0,0,0,0)",
                        top: 80,
                        bottom: 60,
                        left: 60,
                    },
                    xAxis: {
                        type: 'category', //类目轴
                        splitNumber: 5, //在类目轴中无效
                        position: 'bottom',
                        axisLine: {
                            lineStyle: {
                                color: opConfig.axisLineColor,
                                width: opConfig.axisLineWidth,
                                type: 'solid'
                            }
                        },
                        axisTick: {
                            show: false
                        },
                        splitLine: {
                            show: false,
                            onZero: false,
                            lineStyle: {
                                color: opConfig.splitColor,
                                width: 1,
                                type: 'dashed'
                            }
                        },
                        data: [workCommon.time2Datetime(resjson1[0].children).xAxisData[thiscurrentIndex]],
                    },
                    yAxis: {
                        type: 'value',
                        axisLine: {
                            lineStyle: {
                                color: opConfig.axisLineColor,
                                width: opConfig.axisLineWidth,
                                type: 'solid'
                            }
                        },
                        axisLabel: {
                            show: true,
                            formatter: function (v) {
                                return v + '%';
                            }
                        },
                        axisTick: {
                            show: false
                        },
                        splitLine: {
                            show: false
                        },
                    },
                    calculable: true,
                    series: function () { //option2的baseOption的serise配置           
                        var series = [];
                        var thisPercentCount = 0;
                        for (var j = 0; j < barseriesLen; j++) { //barseriseLen是resjson1.length,值为23
                            for (var k = 0; k < tradeClass.length; k++) {
                                if (tradeClass[k].classCode == resjson1[j].itemName.substring(0, 5)) {
                                    tradeClass[k].data += resjson1[j].children[0].value;
                                }
                                thisPercentCount += resjson1[j].children[0].value;
                            }
                        }

                        for (var i = 0; i < tradeClass.length; i++) {
                            series.push({
                                name: tradeClass[i].name,
                                type: 'bar',
                                stack: "opibar", //堆叠柱状图
                                label: {
                                    normal: {
                                        show: true,
                                        formatter: function (param) {
                                            if (parseFloat(param.value)) {
                                                return param.value + '%'
                                            } else {
                                                return '';
                                            }
                                        },
                                        textStyle: {
                                            color: '#000',
                                        }
                                    }
                                }
                            })
                        }
                        return series; //baseOption的serise设置完毕
                    }(), //自执行函数

                    legend: {
                        show: false,
                        left: 'center',
                        top: 40,
                        itemGap: 30,
                        data: inbarlegend.split(",")
                    },
                },
                options: function () { //相对应的是baseOption中的data的每一个时间点的数据
                    var options = []; //options[]
                    ////取每个时间段内第k个数
                    for (var t = 0; t < timeLen; t++) { //timeLen=resjson1[0].children.length
                        var timeSeries = [];
                        var tradeClass = genColorSeriesOpi({
                            colorData:opiData.colorData,
                            treeData:opiData.treeData
                        }).ratioData;
                        var thisPercentCount = 0;
                        for (var k = 0; k < resjson1.length; k++) {
                            timeSeries.push({
                                itemName: resjson1[k].itemName,
                                value: resjson1[k].children[t].value
                            });
                            thisPercentCount += resjson1[k].children[t].value; ////总数
                        }

                        for (var j = 0; j < barseriesLen; j++) { //barseriesLen = resjson1.length
                            for (var k = 0; k < tradeClass.length; k++) {
                                if (tradeClass[k].classCode == timeSeries[j].itemName.substring(0, 5)) {
                                    tradeClass[k].data += timeSeries[j].value;
                                }
                            }
                        }
                        var timeSeriesa = {
                            series: []
                        };
                        for (var i = 0; i < tradeClass.length; i++) {
                            timeSeriesa.series.push({
                                data: [{
                                    value: (tradeClass[i].data / Math.abs(thisPercentCount) * 100).toFixed(2),
                                    itemStyle: {
                                        normal: {
                                            color: tradeClass[i].color
                                        }
                                    }
                                }]
                            });
                        }
                        options.push(timeSeriesa);
                    }

                    ////左侧柱状图初始化时thisTimeAllData的值,不同的节点对应的相同月份的不同的值的数组
                    for (var k = 0; k < resjson1.length; k++) {
                        thisTimeAllData.push({
                            seriesName: resjson1[k].itemName,
                            value: resjson1[k].children[1].value
                        });
                        ////初始化percentCount,不同节点对应的相同月份值得和，用作百分比基数
                        percentCount += resjson1[k].children[1].value;
                    }
                    return options;
                }(),

            };
            macro_opi_ratio.resize();
            macro_opi_ratio.setOption(option2);
            /*左侧柱状图end*/

            var currentHeight = document.getElementById('macro_opi_data').clientHeight;
            var gridY = currentHeight * 0.1;
            var option = { //右侧面积图的option配置
                tooltip: { //包括总量、增量、同比增量的toolTip设置
                    show: true,
                    trigger: 'axis',
                    axisPointer: {
                        type: 'line',
                    },
                    showDelay: 0, // 显示延迟，添加显示延迟可以避免频繁切换，单位ms
                    backgroundColor: 'rgba(0,0,0,0.3)',
                    formatter: function (params, ticket, callback) {
                        opiData.tooltipParamsClone = params;
                        //同比增速单独添加tooltip
                        if (opiData.paramOpiData.datatypename == "_abs_yoy_r") {
                            var date = params[0].name;
                            var tips = "时间：" + date.substring(0, 4) + '-' + date.substring(4) + "<br/>";
                            for (var i = 0; i < params.length; i++) {
                                tips += opiData.opiNameMap[params[i].seriesName] + ":" + " " + params[i].value.toFixed(2) + "<br/>";
                            }
                            return tips;
                        }
                    },
                    position: function (pos, params, dom, rect, size) {
                        var obj = {
                            left: pos[0],
                            top: '-20%'
                        };
                        return obj;
                    }
                },
                grid: {
                    top: '10%',
                    left: '8%',
                    borderWidth: 0,
                    borderColor: "#6898CD",
                    backgroundColor: "rgba(0,0,0,0)",
                    x: 110,
                    y: gridY,
                    x2: 60,
                    y2: 80
                },
                //缩放
                dataZoom: workCommon.dataZoomConfig,
                xAxis: {
                    type: 'category',
                    scale: true,
                    data: workCommon.time2Datetime(resjson1[0].children).xAxisData,
                    axisLabel: {
                        show: true,
                        margin: 12,
                        textStyle: {
                            color: opConfig.labelColor,
                            fontSise: 12,
                        },
                        fontFamily: 'arial',
                        fontWeight: 'bolder',
                    },
                    axisLine: {
                        lineStyle: {
                            color: '#9c9ca0',
                            width: opConfig.axisLineWidth,
                            type: 'solid'
                        },
                    },
                    axisTick: {
                        show: false,
                        onGap: false
                    },
                    splitLine: {
                        show: false,
                    },
                    axisPointer: {
                        label: {
                            show: true,
                            formatter: function (v) {
                                var vStr = v.value.toString();
                                return vStr.slice(0, 4) + '-' + vStr.slice(4, 6);
                            }
                        }
                    },
                    onZero: true,
                },
                yAxis: [{
                    type: 'value',
                    scale: true,
                    splitNumber: 4, //坐标轴的分割段数
                    boundaryGap: [0.05, 0.05],
                    axisLabel: {
                        margin: 12,
                        textStyle: {
                            color: opConfig.labelColor,
                            fontSise: 12,
                        },
                        fontFamily: 'arial',
                        fontWeight: 'bolder',
                        formatter: function (v) {
                            if (opiData.lineType == "line") {
                                return Math.floor(v) + "%";
                            } else {
                                return Math.round(v);
                            }
                        }
                    },
                    axisLine: {
                        show: false,
                        lineStyle: {
                            color: opConfig.axisLineColor,
                            width: opConfig.axisLineWidth,
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
                        show: false
                    }
                }],
                color: mThisTimeColors, ////wdw系列的颜色设置
                series: function () {
                    var serie = [];
                    if (resjson1.length == 0) {
                        item = {
                            name: itemName,
                            type: opiData.chartType,
                            showAllSymbol: true,
                            symbol: 'emptyCircle',
                            symbolSize: 1,
                            smooth: true,
                            itemStyle: {
                                normal: {
                                    areaStyle: {
                                        type: 'default'
                                    }
                                }
                            },
                            data: []
                        }
                        legend = "";
                        serie.push(item);
                        return serie;
                    }
                    //设置item
                    for (var j = 0; j < resjson1.length; j++) { //循环遍历被选中的节点
                        itemName = resjson1[j].itemName;
                        var item;
                        item = {
                            name: itemName,
                            type: opiData.chartType,
                            showAllSymbol: true,
                            symbol: 'emptyCircle',
                            symbolSize: 1,
                            itemStyle: {
                                normal: {
                                    areaStyle: {
                                        type: 'default'
                                    }
                                }
                            },
                            lineStyle: {
                                normal: {
                                    width: 2
                                }
                            },
                            stack: '总量',
                            smooth: true,
                            data: workCommon.time2Datetime(resjson1[j].children).yAxisData,
                            markLine: {
                                symbol: ['none', 'none'],
                                label: {
                                    normal: {
                                        formatter: function () {
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
                                            var time = timeNow.getHours() + ':' + timeNow.getMinutes() + ':' + timeNow.getSeconds();
                                            return year + '-' + month;
                                        }
                                    }
                                },
                                lineStyle: {
                                    normal: {
                                        color: '#6b7990',
                                        width: 1,
                                        type: "solid"
                                    }
                                },
                                Z: -1,
                                data: [{
                                    xAxis: workCommon.getTime().untilMonth
                                }]
                            },
                            markArea: {
                                silent: true,
                                itemStyle: {
                                    normal: function () { //要求每次所选节点不同但是呈现一样的颜色
                                        var itemColor = {}; //要返回的对象
                                        var finColor = [255, 255, 255];
                                        var finOpciaty = 0.03;
                                        itemColor.color = 'rgba(' + finColor.join(',') + ')';
                                        itemColor.opacity = finOpciaty;
                                        return itemColor;
                                    }()
                                },
                                data: [
                                    [{
                                        xAxis: workCommon.getTime().untilMonth
                                    }, {
                                        xAxis: 'max'
                                    }]
                                ]
                            }
                        }
                        var resChildsLen = resjson1[0].children.length;
                        if (parseInt(resjson1[0].children[resChildsLen - 1].statDate) < parseInt(workCommon.getTime().untilMonth)) {
                            item.markLine = null;
                            item.markArea = null;
                        }
                        if (opiData.lineType == "line") {
                            item.itemStyle.normal = "";
                        }
                        if (opiData.paramOpiData.datatypename == "_abs_yoy_r") {
                            //同比增速，如果只有右轴有数据，也就是轴全部在右边，则yAxisIndex=0，取第一个轴，但是轴在右边
                            if (opiData.rightArr.length == resjson1.length) {
                                for (var l = 0; l < opiData.rightArr.length; l++) {
                                    if (opiData.rightArr[l] == itemName) {
                                        item.yAxisIndex = 0;
                                    }
                                }
                            } else {
                                for (var l = 0; l < opiData.rightArr.length; l++) {
                                    if (opiData.rightArr[l] == itemName) {
                                        item.yAxisIndex = 1;
                                    }
                                }
                            }
                        }
                        if (item.data.length == 0) {
                            continue;
                        } else if (itemName != "不存在该数据") {
                            legend = legend + itemName + ",";
                            serie.push(item);
                        }
                    }
                    for (var i = 0; i < serie.length - 1; i++) {
                        serie[i].markArea = null;
                        serie[i].markLine = null;
                    }
                    return serie;
                }(),
                legend: {
                    show: false,
                    left: 'center',
                    top: 40,
                    itemGap: 30,
                    data: legend.split(",")
                },
            }
            var opiRightName = new Array();
            for (var i = 0; i < opiData.rightArr.length; i++) {
                for (var key in opiData.opiNameMap) {
                    if (opiData.opiNameMap[key] == opiData.rightArr[i]) {
                        opiRightName.push(key);
                    }
                }
            }
            if (opiData.paramOpiData.datatypename == "_abs_yoy_r") {
                //同比增速，如果是左右轴都有数据，或只有左轴，则左右轴正常区分。如果只有右轴数据，则右轴设为第一个轴，显示靠右，且数据都已设置在第一个轴上，
                var yLine = false;
                if (opiData.rightArr.length == resjson1.length) {
                    yLine = true;
                    option.yAxis.unshift({
                        type: 'value',
                        scale: true,
                        splitNumber: 4,
                        boundaryGap: [0.05, 0.05],
                        position: "right",
                        axisLabel: {
                            margin: 12,
                            textStyle: {
                                color: opConfig.labelColor,
                                fontSise: 12,
                            },
                            fontFamily: 'arial',
                            fontWeight: 'bolder',
                            formatter: function (v) {
                                if (opiData.lineType == "line") {
                                    return Math.floor(v) + "%";
                                } else {
                                    return Math.round(v);
                                }
                            }
                        },
                        axisLine: {
                            show: false,
                            lineStyle: {
                                color: opConfig.axisLineColor,
                                width: opConfig.axisLineWidth,
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
                            show: yLine,
                            lineStyle: {
                                color: opConfig.splitColor,
                                width: 1,
                                type: 'solid'
                            }
                        }
                    })
                } else {
                    option.yAxis.push({
                        type: 'value',
                        scale: true,
                        splitNumber: 4,
                        boundaryGap: [0.05, 0.05],
                        axisLabel: {
                            margin: 12,
                            textStyle: {
                                color: opConfig.labelColor,
                                fontSise: 12,
                            },
                            fontFamily: 'arial',
                            fontWeight: 'bolder',
                            formatter: function (v) {
                                if (opiData.lineType == "line") {
                                    return Math.floor(v) + "%";
                                } else {
                                    return Math.round(v);
                                }
                            }
                        },
                        axisLine: {
                            show: false,
                            lineStyle: {
                                color: opConfig.axisLineColor,
                                width: opConfig.axisLineWidth,
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
                            show: yLine,
                            lineStyle: {
                                color: opConfig.splitColor,
                                width: 1,
                                type: 'solid'
                            }
                        }
                    });
                    //右轴
                    for (var i = 0; i < opiRightName.length; i++) {
                        for (var j = 0; j < option.series.length; j++) {
                            if (option.series[j].name == opiRightName[i]) {
                                option.series[j].yAxisIndex = 1
                            }
                        }
                    }
                }
            }
            var lenSum = option.xAxis.data.length;
            var startTime = option.xAxis.data.length - 17;
            option.dataZoom[0].start = startTime / lenSum * 100;
            return option;
        }


        function getOpiAbsData() {
            var resjson = [];
            var selectAllData = '';
            if (opiData.paramOpiData.code.length == 23) { //被选中的是全部数据(也就是页面初始化的时候)
                if (opiData.paramOpiData.datatypename == "_abs_r") { //总量
                    resjson = $.extend(true, [], opiData.opiEchartsData.opiAbsData); //jquery copy;
                }
                if (opiData.paramOpiData.datatypename == "_inc_r") { //增量	
                    resjson = $.extend(true, [], opiData.opiEchartsData.opiIncData);
                }
                if (opiData.paramOpiData.datatypename == "_abs_yoy_r") { //同比增速		
                    resjson = $.extend(true, [], opiData.opiEchartsData.opiYoygrewData);
                }
            } else { //非全部数据
                if (opiData.paramOpiData.datatypename == "_abs_r") {
                    selectAllData = $.extend(true, [], opiData.opiEchartsData.opiAbsData);
                }
                if (opiData.paramOpiData.datatypename == "_inc_r") {
                    selectAllData = $.extend(true, [], opiData.opiEchartsData.opiIncData);
                }
                if (opiData.paramOpiData.datatypename == "_abs_yoy_r") {
                    selectAllData = $.extend(true, [], opiData.opiEchartsData.opiYoygrewData);
                }
                for (var i = 0; i < opiData.paramOpiData.code.length; i++) {
                    for (var j = 0; j < selectAllData.length; j++) {
                        if (opiData.paramOpiData.code[i] == selectAllData[j].itemName) {
                            resjson.push(selectAllData[j]); //把选中的节点的相关数据得到
                        }
                    }
                }
            }
            legendDownColor(); //切换时lengend列表高亮全部消失
            return resjson; //返回的是ztree中被选中的节点数据
        }

        function getOpiRawData(rawOption) {
            if (rawOption == "abs") {
                var thisParamsType = "_abs_r";
                var thisType = "opiAbsData";
                var thisCountType = "opiAbsDataCount";
            } else if (rawOption == "inc") {
                var thisParamsType = "_inc_r";
                var thisType = "opiIncData";
                var thisCountType = "opiIncDataCount";
            } else if (rawOption == "yoygrew") {
                var thisParamsType = "_abs_yoy_r";
                var thisType = "opiYoygrewData";
                var thisCountType = "opiYoygrewDataCount";
            }
            $.ajax({
                type: "post",
                url: opiData.url,
                data: {
                    'datatypeName': thisParamsType,
                    // 'indusId': $("#rootIndustry").val()
                },
                async: false, //同步
                success: function (result) {
                    $(".sendwait").hide();
                    resjson = result;
                    ////把result的结果中，所有的children取出来，按{日期：{值对象}}的格式汇总,value求和，用于以后计算百分比。
                    var resultChilds = {};
                    for (var i = 0; i < result[0].children.length; i++) {
                        resultChilds[result[0].children[i].statDate] = 0;
                    }

                    for (var i = 0; i < result.length; i++) {
                        for (var j = 0; j < result[i].children.length; j++) {
                            resultChilds[result[i].children[j].statDate] += parseFloat(result[i].children[j].value);
                        }
                    }
                    if (thisType == "opiAbsData") {
                        for (var i = 0; i < resjson.length; i++) {
                            //临时方案，后台返回07年开始数据，前台只显示08年开始的数据
                            if (resjson[i].type == 28)
                                continue;
                            resjson[i].children.splice(0, 12);
                        }
                    }
                    opiData.opiEchartsData[thisType] = resjson; //给全局的opiEchartsData中的opiAbsData赋值
                    opiData.dataindex = resjson[0].children.length - 1;
                    opiData.opiEchartsData[thisCountType] = resultChilds; //给全局的opiEchartsData中的opiAbsDataCount赋值
                },
                error: function (result) {
                    data = "error";
                    $(".sendwait").hide();
                }
            });
        }

        /**
         * 生成OPI中右侧大图color对应关系
         */
        function genColorSeriesOpi(param) {
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
        /////切换的时候，highlignt全部消失
        function legendDownColor() {
            $(".legendhide").removeClass("legendhide").addClass("legendon");
        }

        function compare(property) {
            return function (a, b) {
                var value1 = a[property];
                var value2 = b[property];
                return value2 - value1;
            }
        }
    })
})