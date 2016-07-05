var path = require('path');
var fs = require('co-fs');
var vueRender = require('../../utils/vueRender');
var componentsHeader = require('../../../static/components/header/header');
var componentsHeaderBack = require('../../../static/components/header-back/header-back');
var modelGroupHome = require('../../model/group-home');
var baseUrl = './dist/views/pages/group/index/'; // 模板文件基础路径

module.exports = function* (next) {
    // 获取数据
    try {
        var data = yield modelGroupHome(this.params.groupId);
    } catch (e) {
        this.status = 404;
        return;
    }

    // 生成body部分
    try {
        var templateBody = yield fs.readFile(
            path.resolve(baseUrl + 'body.tpl'),
            'utf8'
        );
    } catch (e) {
        this.throw(e);
        return;
    }

    var body = yield vueRender({
        template: templateBody,
        computed: {
            tpl: function () {
                var template = this.template;
                if (template) {
                    return 'style' + template.theme + ' layout' + template.style;
                }
                return '';
            }
        },
        components: {
            'ui-header': componentsHeader,
            'ui-header-back': componentsHeaderBack
        },
        data: data
    });

    // 生成html全部
    try {
        var templateHTML = yield fs.readFile(
            path.resolve(baseUrl + 'index.tpl'),
            'utf8'
        );
    } catch (e) {
        this.throw(e);
        return;
    }

    this.body = yield vueRender({
        template: templateHTML,
        data: {
            title: data.groupName,
            keywords: data.tag,
            description: data.introduction,
            body: body
        }
    });
};
