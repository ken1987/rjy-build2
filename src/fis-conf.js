var config = require('../dist/config');
var port = config.ports.static;
var domain = config.qiniu.domain;

// 参考：https://github.com/postcss/autoprefixer
var autoprefixer = require('autoprefixer');
autoprefixer({
    browsers: ['not ie <= 8', '> 5% in CN', 'last 3 versions']
});

// 排除指定目录和文件
fis.set('project.ignore', [
    'fis-conf*.js',
    '**/___*.png' // 过滤三下划线开头的预览图片
]);

// 配置变量
fis.set('domain-dev', 'http://127.0.0.1:' + port); // 开发使用的domain
fis.set('domain', domain); // 线上使用的domain

// 参考：https://github.com/kangax/html-minifier
fis.config.set('settings.optimizer.rjy-html-minifier', {
    collapseWhitespace: true, // 折叠空白
    removeComments: true, // 删除注释
    removeScriptTypeAttributes: true,
    removeStyleLinkTypeAttributes: true,
    ignoreCustomComments: [/ignore/], // 保留自定义注释，必须是正则表达式
    processConditionalComments: true // 保留条件注释
});

// 参考：https://github.com/fex-team/fis-optimizer-uglify-js
fis.config.set('settings.optimizer.uglify-js', {
    mangle: {
        except: 'exports, module, require, define' // 不需要混淆的关键字
    },
    compress: {
        drop_console: true // 自动删除console
    }
});

// 参考：https://github.com/ken1987/fis-postprocessor-rjy-postcss
fis.config.set('settings.postprocessor.rjy-postcss', {
    addPlugins: function () {
        return [autoprefixer];
    }
});

// 开发阶段
fis
    .match('/client/(**)', {
        isMod: true,
        useSameNameRequire: true, // 开启同名依赖
        url: '/$1',
        release: '/static/$1', // 默认所有资源产出到static目录下
        domain: '${domain-dev}'
    })
    .match('/client/**.{css,less}', {
        postprocessor: fis.plugin('rjy-postcss')
    })
    .match('/client/**.less', {
        parser: fis.plugin('less'),
        rExt: '.css'
    })
    .match('/client/(pages/**.tpl)', {
        release: '/views/$1' // 页面模板产出到views目录下
    })
    .match('/server/(**)', {
        useMap: false,
        preprocessor: false,
        standard: false,
        postprocessor: false,
        optimizer: false,
        useHash: false,
        useDomain: false,
        isMod: false,
        release: '/app/$1'
    })
    // .match('/{node_modules/**,package.json}', {
    //     useCompile: false,
    //     release: '/app/$0'
    // })
    // 配置：https://github.com/fex-team/fis3-postpackager-loader
    .match('::package', {
        postpackager: fis.plugin('loader')
    });

// 发布阶段
fis.media('prod')
    .match('/client/(**)', {
        domain: '${domain}'
    })
    .match('/client/**.tpl', {
        optimizer: fis.plugin('rjy-html-minifier')
    })
    .match('/client/**.js', {
        useHash: true,
        optimizer: fis.plugin('uglify-js')
    })
    .match('/client/components/**.js', {
        useHash: false // 组件需要服务端复用，暂时不能加hash
    })
    // .match('components/**.js', {
    //     packTo: 'base.js'
    // })
    .match('/client/**.{css,less}', {
        useHash: true,
        optimizer: fis.plugin('clean-css')
    })
    .match('/client/components/**.{css,less}', {
        useHash: true,
        packTo: '/client/base.css'
    })
    .match('/client/**.{png,jpg,jpeg,gif,ico}', {
        useHash: true
    })
    .match('/client/**.png', {
        optimizer: fis.plugin('png-compressor', {
            type: 'pngquant' // pngcrush or pngquant default is pngcrush
        })
    });
