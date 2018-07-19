// requireJs的配置文件
require.config({
    // baseUrl: './../assets/js',
    paths: {
        jquery: 'dist/jquery.min',
        echarts: 'dist/echarts.min',
        Chart: 'dist/Chart.min',
        jqueryZtreeCore: 'dist/jquery.ztree.core.min',
        jqueryZtreeExcheck: 'dist/jquery.ztree.excheck.min',
        echartCommon: 'echartCommon',
        selfCommon: 'selfEchartsCommon',
        workCommon: 'workEchartsCommon'
    },
    shim: {
        jqueryZtreeExcheck: {
            deps: ['jqueryZtreeCore']
        },
        jqueryZtreeCore: {
            deps: ['jquery']
        }
    }
})