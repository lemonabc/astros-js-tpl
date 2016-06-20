'use strict';

var url = require('url');
var path = require('path');
var fs = require('fs');
var file = require('file-plus');
var nodeUtil = require('util');

var util = require('lang-utils');

module.exports = new astro.Middleware({
    modType: 'page',
    fileType: 'js'
}, function(asset, next) {
    var js_tpl = asset.prjCfg.jsTpl || this.config.tpl;
    if (!js_tpl) {
        console.error("astro-js-tpl",
            '请在项目配置中设置模板格式，如："$tpl({name},{file},{content})"，具体请参看 https://github.com/lemonabc/astros-js-tpl');
        next(asset);
        return;
    }
    if (!asset.jsLibs.length) {
        next(asset);
        return;
    }
    let jsLibs = asset.jsLibs[1],
        project = asset.project,
        tpls = '',
        jslib_assets = [];

    jsLibs.forEach(function(cpt) {
        var filePath = path.join(asset.prjCfg.jsCom, cpt);
        if (!fs.existsSync(filePath)) {
            return;
        }
        var fileList = file.getAllFilesSync(filePath, ['.' + asset.prjCfg.htmlExt]);
        fileList.forEach(function(file) {
            var content = fs.readFileSync(file, 'utf-8');

            var a = new astro.Asset({
                modType: 'jsCom',
                name: cpt,
                fileType: 'html',
            });
            a.path = file;
            jslib_assets.push(a)
        });
    });

    astro.Asset.getContents(jslib_assets, function(asts) {
        asts.forEach(function(a) {
            var content = a.data;
            if (content) {
                content = content.trim();
                content = content.replace(/\s*\n\s*/g, '');
                content = JSON.stringify(content)
                    .replace(/^['"]|['"]$/g, '')
                    .replace(/'/g, '\\\'');
                var fileName = path.basename(a.filePath, '.' + asset.prjCfg.htmlExt);
                //var com = `$res.${js}.${fileName}=${content};\n`;

                tpls = js_tpl.replace(/\{name\}/g, a.name)
                    .replace(/\{file\}/g, fileName)
                    .replace(/\{content\}/g, content) + '\n' + tpls;
            }
        });

    asset.data = tpls + asset.data;
    next(asset);

    })

});