define(['jquery', 'Chart'], function ($, Chart) {
    $(function () {
        var paramObj = {
            barColoObj: {
                'EXP': '#ff9600',
                'GFP': '#ff421d',
                'OPI': '#dadada',
                'IC': '#a5ff4d',
                'IMP': '#e4977f',
                'OUTPUT': '#fffc00'
            },
            barData: {
                labels: [],
                datasets: []
            },
            barIndex: '',
            currentTime: ''
        };
        initPage();
        // 获取bar数据
        function getStackBarData() {
            $.ajax({
                url: "./../assets/js/json/chartBarData.json",
                type: "get",
                datatype: 'json',
                data: null,
                async: false, //同步
                success: function (result) {
                    var data = result.data;
                    var barSerielabels = [];
                    if (data.length != 0) {
                        for (var i = 0; i < data.length; i++) {
                            var barSerie = {
                                label: '',
                                backgroundColor: '',
                                data: []
                            };
                            barSerie.label = data[i].itemname;
                            barSerie.backgroundColor = paramObj.barColoObj[data[i].itemname];
                            barSerielabels = [], barSerie.data = [];
                            if (i == 0) {
                                if (data[i].itemname == 'OUTPUT' || data[i].itemname == 'IMP') {
                                    for (var j = 0; j < data[i].children.length; j++) {
                                        barSerielabels.push(data[i].children[j].date);
                                        barSerie.data.push(-parseFloat(data[i].children[j].value.toFixed(2)));
                                    }
                                } else {
                                    for (var j = 0; j < data[i].children.length; j++) {
                                        barSerielabels.push(data[i].children[j].date);
                                        barSerie.data.push(parseFloat(data[i].children[j].value.toFixed(2)));
                                    }
                                }
                                paramObj.barData.labels = barSerielabels;
                            } else {
                                if (data[i].itemname == 'OUTPUT' || data[i].itemname == 'IMP') {
                                    for (var k = 0; k < data[i].children.length; k++) {
                                        barSerie.data.push(parseFloat(data[i].children[k].value.toFixed(2)));
                                    }
                                } else {
                                    for (var k = 0; k < data[i].children.length; k++) {
                                        barSerie.data.push(parseFloat(data[i].children[k].value.toFixed(2)));
                                    }
                                }
                            }
                            paramObj.barData.datasets.push(barSerie);
                        }
                    }
                },
                error: function (e) {
                    console.log(e);
                }
            })
        }
        // 创建bar Chart
        function stackBarChart() {
            getStackBarData();
            var barConfig = {
                type: 'bar',
                data: paramObj.barData,
                options: {
                    title: {
                        display: true,
                        text: '供需结构'
                    },
                    tooltips: {
                        mode: 'index',
                        intersect: false,
                        // 相当于echarts里面的formatter函数
                        callbacks: {
                            label: function (tooltipItem, data) {
                                var label = data.datasets[tooltipItem.datasetIndex].label || '';
                                if (label) {
                                    label += ': ';
                                }
                                label += Math.abs(Math.round(tooltipItem.yLabel * 100) / 100);
                                return label;
                            }
                        }
                    },
                    responsive: true,
                    scales: {
                        xAxes: [{
                            stacked: true,
                        }],
                        yAxes: [{
                            stacked: true,
                            // 相当于echarts里面的formatter函数
                            ticks: {
                                callback: function (value, index, values) {
                                    return Math.abs(value);
                                }
                            }
                        }]
                    },
                    onClick: function (event, array) {
                        if (array.length != 0) {
                            paramObj.barIndex = array[0]._index;
                            getPieData();
                        }
                    }
                }
            };
            var ctxBar = document.getElementById('stackBarChart').getContext('2d');
            var myBar = new Chart(ctxBar, barConfig);
        }
        // 创建line Chart
        function lineChart() {
            var lineConfig = {
                type: 'line',
                data: {
                    labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
                    datasets: [{
                        label: 'My First dataset',
                        backgroundColor: 'red',
                        borderColor: 'red',
                        data: [5, 2, 6, 8, 0, 4, 1],
                        fill: false,
                    }, {
                        label: 'My Second dataset',
                        fill: false,
                        backgroundColor: 'blue',
                        borderColor: 'blue',
                        data: [4, 7, 0, 4, 7, 3, 5],
                    }]
                },
                options: {
                    responsive: true,
                    title: {
                        display: true,
                        text: 'Chart.js Line Chart'
                    },
                    tooltips: {
                        mode: 'index',
                        intersect: false,
                    },
                    scales: {
                        xAxes: [{
                            display: true,
                            scaleLabel: {
                                display: true,
                                labelString: 'Month'
                            }
                        }],
                        yAxes: [{
                            display: true,
                            scaleLabel: {
                                display: true,
                                labelString: 'Value'
                            }
                        }]
                    }
                }
            };
            var ctxLine = document.getElementById('lineChart').getContext('2d');
            var myLine = new Chart(ctxLine, lineConfig);
        }
        // 创建bar Chart
        function barChart() {
            var barConfig = {
                type: 'bar',
                data: {
                    labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
                    datasets: [{
                        label: 'My First dataset',
                        backgroundColor: 'red',
                        borderColor: 'red',
                        data: [5, 2, 6, 8, 12, 4, 1],
                        fill: false,
                    }, {
                        label: 'My Second dataset',
                        fill: false,
                        backgroundColor: 'blue',
                        borderColor: 'blue',
                        data: [4, 7, 0, 4, 7, 3, 5],
                    }]
                },
                options: {
                    responsive: true,
                    title: {
                        display: true,
                        text: 'Chart.js Bar Chart'
                    },
                    tooltips: {
                        mode: 'index',
                        intersect: false,
                    },
                    scales: {
                        xAxes: [{
                            display: true,
                            scaleLabel: {
                                display: true,
                                labelString: 'Month'
                            }
                        }],
                        yAxes: [{
                            display: true,
                            scaleLabel: {
                                display: true,
                                labelString: 'Value'
                            }
                        }]
                    }
                }
            };
            var ctxBar = document.getElementById('barChart').getContext('2d');
            var myBar = new Chart(ctxBar, barConfig);
        }
        // 获取饼图数据
        function getPieData() {
            var supplyParam = {
                    backgroundColor: [],
                    data: [],
                    labels: [],
                    dom: ''
                },
                demandParam = {
                    backgroundColor: [],
                    data: [],
                    labels: [],
                    dom: ''
                };
            paramObj.currentTime = paramObj.barData.labels[paramObj.barIndex];
            for (var i = 0; i < paramObj.barData.datasets.length; i++) {
                if (paramObj.barData.datasets[i].label == 'OUTPUT' || paramObj.barData.datasets[i].label == 'IMP' || (paramObj.barData.datasets[i].label == 'IC' && paramObj.barData.datasets[i].data[paramObj.barIndex] < 0)) {
                    demandParam.backgroundColor.push(paramObj.barData.datasets[i].backgroundColor);
                    demandParam.labels.push(paramObj.barData.datasets[i].label);
                    demandParam.data.push(paramObj.barData.datasets[i].data[paramObj.barIndex]);
                } else {
                    supplyParam.backgroundColor.push(paramObj.barData.datasets[i].backgroundColor);
                    supplyParam.labels.push(paramObj.barData.datasets[i].label);
                    supplyParam.data.push(paramObj.barData.datasets[i].data[paramObj.barIndex]);
                }
            }
            supplyParam.dom = 'supplyPieChart';
            pieChart(supplyParam);
            demandParam.dom = 'demandPieChart';
            pieChart(demandParam);
            $("#currentTime")[0].innerText = paramObj.currentTime;
        }

        // 创建pie Chart
        function pieChart(param) {
            var pieConfig = {
                type: 'pie',
                data: {
                    datasets: [{
                        data: param.data,
                        backgroundColor: param.backgroundColor,
                    }],
                    labels: param.labels
                },
                options: {
                    title: {
                        display: false
                    },
                    responsive: true,
                    legend: {
                        display: false
                    },
                    tooltips: {
                        enabled: true,
                        callbacks: {
                            footer: function (tooltipItems, data) {
                                var sum = 0;
                                data.datasets[0].data.forEach(function (data) {
                                    sum += Math.abs(data);
                                });
                                var currentData = Math.abs(data.datasets[tooltipItems[0].datasetIndex].data[tooltipItems[0].index]);
                                return '占比' + (currentData / sum * 100).toFixed(2) + "%";
                            },
                        },
                        footerFontStyle: 'normal'
                    },
                    // // 块和块之间是否有间距
                    // segmentShowStroke: true,
                    // // 块和块之间间距的颜色
                    // segmentStrokeColor: "#fff",
                    // // 块和块之间间距的宽度
                    // segmentStrokeWidth: 2,
                    // animation: true,
                    // animationSteps: 100,
                    // animationEasing: "easeOutBounce",
                    // // 是否有从0度到360度的动画
                    // animateRotate: true,
                    // // 是否有从中心到边缘的动画
                    // animateScale: false,
                    // onAnimationComplete: null
                }
            };
            var ctxPie = document.getElementById(param.dom).getContext('2d');
            var myPie = new Chart(ctxPie, pieConfig);
            myPie.update();
        }

        // 初始化页面
        function initPage() {
            stackBarChart();
            lineChart();
            paramObj.barIndex = paramObj.barData.labels.length - 1;
            getPieData();
            barChart();
        }
    })
})