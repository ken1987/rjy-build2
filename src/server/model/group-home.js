var request = require('../utils/request-promise');

/**
 * 格式化数据
 */
var format = function (data) {
    // 地图链接
    data.mapUrl = '/map.html' +
        '?lon=' + (data.lon || '') +
        '&lat=' + (data.lat || '') +
        '&address=' + (data.address || data.addressDetail || '') +
        '&name=' + (data.groupName || '');
    return data;
};

module.exports = function (groupId) {
    return request({
        url: '/api/student/v3/group/home',
        qs: {
            'groupId': groupId
        }
    }, format);
};
