var group = require('./router/group.js');
var groups = require('./router/groups.js');
var router = require('koa-router')({
    prefix: '/r'
});

// 路由嵌套
router.use('/groups', groups);
router.use('/group', group);

module.exports = router.routes();
