'use strict';

var corbel = require('corbel-js'),
    config = require('../config/config'),
    _ = require('lodash'),
    ComposerError = require('./composerError'),
    logger = require('../utils/logger');

var PHRASES_COLLECTION = 'composr:Phrase';

var corbelConfig = _.cloneDeep(config['corbel.driver.options']);
corbelConfig = _.extend(corbelConfig, _.cloneDeep(config['corbel.composer.credentials']));

var corbelDriver = corbel.getDriver(corbelConfig);

var onConnectPromise = corbelDriver.iam.token().create().then(function() {
    logger.debug('corbel:connection:success');
	return corbelDriver;
}).catch(function(error) {
    logger.error('error:composer:corbel:token', error);
    throw new ComposerError('error:composer:corbel:token', '', 401);
});

var extractDomain = function(accessToken) {
    var atob = require('atob');
    var decoded = accessToken.replace('Bearer ', '').split('.');
    try {
        return JSON.parse(atob(decoded[0])).domainId;
    } catch (e) {
        throw new ComposerError('error:composer:corbel:token_format', '', 401);
    }
};

var getTokenDriver = function(accessToken) {

    if (!accessToken) {
        throw new ComposerError('error:connection:undefiend:accessToken');
    }

    var iamToken = {
        'accessToken': accessToken.replace('Bearer ', '')
    };

    var corbelConfig = _.cloneDeep(config['corbel.driver.options']);
    corbelConfig.iamToken = iamToken;

    return corbel.getDriver(corbelConfig);
};

module.exports.driver = onConnectPromise;
module.exports.PHRASES_COLLECTION = PHRASES_COLLECTION;
module.exports.extractDomain = extractDomain;
module.exports.getTokenDriver = getTokenDriver;
