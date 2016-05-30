这是一个Astros中间件

传统方案中，JS渲染HTML，是通过字符串拼接的形式，JS和HTML代码混合在一起，维护起来很不方便。`astros-js-tpl`提供了另一种解决方案。可以用在JS中引用HTML文件，方便维护和开发。

`astros-js-tpl`会把依赖的JS组件的HTML合并到JS组件的JS之前。

## Installation

```bash
$ npm install astro-js-tpl
```

#### 中间件配置

```
{
    name:'astros-js-tpl',
    config:{
            tpl: "$tpl('{name}.{file}','{content}')"
    }
}
```
>{name}是模板路径，{file}是文件名称，{content}是HTML内容


**note:**

以下示例中，`$tpl`是全局方法，用于设置和返回模板，以下是一个简单的实现。

```
(function(win){
    var _tpl = {};
    window.$tpl = function(key, ctx){
        if(ctx){
            _tpl[key] = ctx;
            return;
        }
        return _tpl[key];
        
    }
}(window);
```

**示例1**

HTML路径：root/assets/jslib/dialog/dialog.html

{name} = dialog<br>
{file} = dialog

引用方式

```
console.log($tpl('dialog.dialog'));
```

**示例2**

HTML路径：root/assets/jslib/tp/tips.html

{name} = tp<br>
{file} = tips

引用方式

```
console.log($tpl('tp.tips'));
```

**示例2**

HTML路径：root/assets/jslib/tp/toast.html

{name} = tp<br>
{file} = toast

引用方式

```
console.log($tpl('tp.toast'))
```