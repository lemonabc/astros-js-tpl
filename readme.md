这是一个Astros中间件

传统方案中，JS渲染HTML，是通过字符串拼接的形式，JS和HTML代码混合在一起，维护起来很不方便。Astros的中间件 [astros-js-tpl](https://www.npmjs.com/package/astros-js-tpl)，提供了另一种解决方案。可以用在JS中直接引用HTML文件，方便维护和开发。

`astros-js-tpl`会把依赖的JS组件的HTML合并到文件最前面。

**note:**

示例中，`$tpl`是全局方法，用于设置和返回模板，以下是一个简单的实现，使用该功能需要你调用组件前实现这个方法。

#### 配置

```
{
    name:'astros-js-tpl',
    config:{
        tpl: "$tpl('{name}','{content}')",
        define:['(function(win) {',
            'var _tpl = {};',
            'window.$tpl = function(key, ctx) {',
                'if (ctx) {',
                    '_tpl[key] = ctx;',
                    'return;',
                '}',
                'return _tpl[key];',
            '}',
        '}(window));',
        ].join('\n')
    }
}
```

参数|说明
----|----
tpl|  生成的JS模板的格式，{name}是模板路径，{content}是HTML内容
define| 模板设置方法的实现


**以弹窗组件dialog为例**

HTML路径：root/assets/jslib/dialog/dialog.html

```
<div class="dia-title">{{title}}</div>
```

> 此路径对应的 {name} = dialog/dialog

**引用方式**

在页面中通过$tpl直接引用

```
console.log($tpl('dialog/dialog'));
//output
//<div class="dia-title">{{title}}</div>
```

页面最终生成的JS顶部内容如下：


```
(function(win) {
    var _tpl = {};
    window.$tpl = function(key, ctx) {
        if (ctx) {
            _tpl[key] = ctx;
            return;
        }
        return _tpl[key];
    }
}(window));
$tpl('dialog/dialog', '<div class=\"dia-title\">{{title}}</div>');
```


**示例2**

HTML路径：root/assets/jslib/tp/tips.html

> {name} = tp/tips

引用方式

```
console.log($tpl('tp/tips'));
```

**示例2**

HTML路径：root/assets/jslib/tp/toast.html

> {name} = tp/toast

引用方式

```
console.log($tpl('tp/toast'))
```