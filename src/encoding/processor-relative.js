(function() {

  'use strict';

  var fs = require('fs');
  var path = require('path');
  var util = require('util');

  var common = require('../common');

  var getAttrs = common.getAttrs;
  var attrs2text = common.attrs2text;

  /**
   * 资源合并处理器
   */
  module.exports = function(e) {
    var content = e.content;
    var dirname = e.dirname;
    var input = e.filename;

    var js = []; // 所有 js 文件内容
    var css = []; // 所有 css 文件内容
    // 解析静态资源
    content = String(content).replace(
      /<script((?:\s*[\w-_.]+\s*=\s*"[^"]+")*)\s*\/?>([^]*?)<\/script>/gi,
      function(all, attrText, content) {
        var a = getAttrs('script', attrText, dirname);
        if (a.src) {
          if (/^(|undefined|text\/javascript|text\/ecmascript)$/i.test(a.type)) {
            a.src = path.relative(path.dirname(input), path.join(dirname, a.src));

            return '<script ' + attrs2text(a) + '>' + content + '</script>';
          }
        }
        return all;
      }
    ).replace( // 样式表需要保证顺序
      /<link((?:\s*[\w-_.]+\s*=\s*"[^"]+")*)\s*\/?>/ig,
      function(all, attrText) {
        var b = getAttrs('link', attrText, dirname);
        if (b.href) {
          if (/^(|undefined|text\/css)$/i.test(b.type)) {
            b.href = path.relative(path.dirname(input), path.join(dirname, b.href));
            return '<link ' + attrs2text(b) + '>';
          }
        }
        return all;
      }
    ).replace(
      /<img((?:\s*[\w-_.]+\s*=\s*"[^"]+")*)\s*\/?\/?>/ig,
      function(all, attrText, content) {
        var a = getAttrs('src', attrText, dirname);
        if (a.src) {
          a.src = path.relative(path.dirname(input), path.join(dirname, a.src));

          return '<img ' + attrs2text(a) + '>';
        }
        return all;
      }
    );

    return content;
  };

})();