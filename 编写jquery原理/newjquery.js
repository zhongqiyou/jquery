(function(window, undefined) {
    var newJquery = function(selector) {
        return new newJquery.prototype.init(selector);
    }
    newJquery.prototype = {
        constructor: newJquery,
        init: function(selector) {
            //$("")原理：
            // 1.传入： "" , null , undefined , NaN , 0 , false , 返回空的jquery对象

            selector = newJquery.strTrim(selector);

            if (!selector) {
                return this
                    // 2.传入字符串：
                    //   1.可能是纯字符串
                    //   2.可能是html代码片段
            } else if (typeof selector === "string") {
                if (selector.charAt(0) == "<" && selector.length >= 3) {
                    var temp = document.createElement("div");
                    temp.innerHTML = selector;
                    // for (let i = 0; i < temp.children.length; i++) {
                    //     this[i] = temp.children[i];
                    // }
                    // this.length = temp.children.length
                    [].push.apply(this, temp.children);
                    return this
                } else {
                    // 选择器
                    var temp = document.querySelectorAll(selector);
                    [].push.apply(this, temp);
                }
            } else if (typeof selector === "object" && "length" in selector && selector !== window) {
                //    3.传入数组
                //  真数组
                //  伪数组
                // if ({}.toString.apply(selector) == "[object Array]") {
                //      [].push.apply(this, selector)
                //      return this;
                // } else {
                //     // 兼容写法 ， 把伪数组转换真数组 ， 在转成伪数组
                //     var arr = [].slice.apply(selector)
                //     arr.push.apply(this, arr)
                //     return this;
                // }
                // 优化
                var arr = [].slice.apply(selector)
                arr.push.apply(this, arr)
                return this;
                // 判断传入函数
            } else if (typeof selector == "function") {
                newJquery.ready(selector);
            } else {
                //  4.传入除以上其他类型
                this[0] = selector;
                this.length = 1;
                return this;
            }
        },
        // 获取版本号
        jquery: "1.0.0",
        // 实例默认的选择器取值 
        selector: "",
        // 实例默认的长度
        length: 0,
        // 给实例添加新元素
        // [].push调用数组中push方法
        // []将来用newJquery替代
        // 相当于[].push.apply(newJquery)
        push: [].push,
        // 对实例中的元素进行排序 
        sort: [].sort,
        // 按照指定下标的数量删除元素 ， 也可以替换删除元素
        splice: [].splice,
        // 把实例转换为数组返回
        toArray: function() {
            return [].slice.apply(this)
        },
        //获取指定下标的元素 ， 获取的是原生DOM
        get: function(num) {
            if (arguments.length === 0) {
                return this.toArray();
            } else if (num >= 0) {
                return this[num]
            } else {
                return this[this.length + num]
            }

        },
        // eq 获取指定下标的元素 ， 获取的是jquery类型的实例对象
        eq: function(num) {
            if (arguments.length === 0) {
                return new newJquery();
            } else if (num >= 0) {
                return new newJquery(this.get(num));
            } else {
                return new newJquery(this.get(this.length + num));
            }


        },
        // first 获取实例中的第一个元素 ， 获取的是jquery类型的实例对象
        first: function() {
            return this.eq(0);
        },
        // last 获取实例中的最后一个元素 ， 获取的是jquery类型的实例对象
        last: function() {
            return this.eq(this.length - 1);
        },
        // each 遍历实例 ， 把遍历到的数据传给回调使用
        each: function(callBack) {
            newJquery.each(this, callBack);
        }
    }

    // 优化管理写法
    newJquery.extend = newJquery.prototype.extend = function(obj) {
        for (var key in obj) {
            this[key] = obj[key]
        }
    }

    newJquery.extend({
            //    去除字符串两端空格
            strTrim: function(str) {
                if (!(typeof str === "string")) {
                    return str
                }

                // 写if是因为有些浏览器没有trim方法，所有此操作是为了浏览器兼容  
                if (str.trim) {
                    str = str.trim();
                } else {
                    str = str.replace(/^\s+|\s+$/g, "");
                }
                return str
            },
            // 等待DOM执行完毕 ， 执行回调函数
            ready: function(callBack) {
                // 兼容写法
                if (document.addEventListener) {
                    document.addEventListener("DOMContentLoaded", function() { callBack(); })
                } else {
                    if (document.readyState == "complete") {
                        document.attachEvent("onreadystatechange", function() {
                            callBack()
                        })
                    }
                }
            },
            //遍历实例 ， 把遍历到的数据传给回调使用
            each: function(obj, callBack) {
                if (typeof obj === "object" && "length" in obj && obj !== window) {
                    for (let i = 0; i < obj.length; i++) {
                        let result = callBack.call(obj[i], i, obj[i]);
                        if (result == "true") { continue; } else if (result == "false") { break; }
                    }
                } else if (typeof obj == "object") {
                    for (let key in obj) {
                        let result = callBack.call(obj[key], key, obj[key])
                        if (result == "true") { continue; } else if (result == "false") { break; }
                    }
                }
            },
            //遍历实例 ， 把遍历到的数据传给回调使用 ， 然后把回调的返回值收集起来组成一个新的返回
            map: function(obj, callBack) {
                let result = [];
                if (typeof obj === "object" && "length" in obj && obj !== window) {
                    for (let i = 0; i < obj.length; i++) {
                        let temp = callBack(obj[i], i);
                        temp ? result.push(temp) : false
                    }

                } else if (typeof obj == "object") {
                    for (let key in obj) {
                        let temp = callBack(obj[key], key)
                        temp ? result.push(temp) : false
                    }

                }
                return result;
            },
            // 获取元素css苏醒值 + 兼容处理
            getStyle: function(dom, styleName) {
                if (window.getComputedStyle) {
                    return window.getComputedStyle(dom)[styleName];
                } else {
                    return dom.currentStyle[styleName];
                }
            },
        })
        // DOM操作
    newJquery.prototype.extend({
            //清空指定元素中的所有元素
            empty: function() {
                this.each(function(key, value) {
                        value.innerHTML = ""
                    })
                    //    返回this ， 是为了方便链式编程
                return this;
            },
            // 删除所有元素中的元素或指定元素
            remove: function(selector) {
                if (arguments.length === 0) {
                    // 因为js中 ， 不能自己删除自己 ， 所以先要找到自身父元素 ， 再通过父元素将其删除
                    // 寻找自身父元素：parentNode；
                    // 通过自身父元素删除子元素：removeChild
                    this.each(function(key, value) {
                        let parent = value.parentNode;
                        parent.removeChild(value);
                    })
                } else {
                    $this = this;
                    //删除同标签指定元素
                    console.log($(selector))
                    this.each(function(key, value) {
                        $(selector).each(function(k, v) {
                            if (value == v) {
                                let parent = value.parentNode;
                                parent.removeChild(v);
                            }

                        })

                    })



                }
            },
            // 设置所有元素的内容 ， 获取第一个元素的内容
            html: function(content) {
                if (arguments.length === 0) {
                    return this[0].innerHTML;
                } else {
                    return this.each(function(index, value) {
                        value.innerHTML = content;
                    });
                }
            },
            // 设置所有元素的文本内容 , 获取第一个元素的文本内容
            text: function(content) {
                if (arguments.length === 0) {
                    let str = "";
                    this.each(function(index, value) {
                        str += value.innerText;
                    })
                    return str
                } else {
                    this.each(function(index, value) {
                        value.innerText = content;
                    })
                }
            },
            // 向所有指定元素内部尾部添加指定所有子元素
            // appendChild(子元素)：向指定元素内部最后添加指定子元素 (移动元素)
            // cloneNode(boolean):克隆指定元素, 参数true：复制元素带有内容，false时：净复制元素
            appendTo: function(selector) {
                let target = $(selector);
                let $this = this;
                let result = [];
                target.each(function(key, value) {
                    $this.each(function(k, v) {
                        if (key === 0) {
                            value.appendChild(v)
                            result.push(v)
                        } else {
                            let temp = v.cloneNode(true);
                            value.appendChild(temp)
                            result.push(v)
                        }
                    });
                })

                return $(result);
            },
            // 向所有指定元素内部头部添加指定所有子元素
            // innsertBefore(子元素 ， 指定位置：firstChild)：向指定元素内部最前添加指定子元素 (移动元素) 
            // cloneNode(boolean):克隆指定元素, 参数true：复制元素带有内容，false时：净复制元素
            prependTo: function(selector) {
                let target = $(selector);
                let $this = this;
                let result = [];
                console.log(this, target);
                target.each(function(key, value) {
                    $this.each(function(k, v) {
                        if (key === 0) {
                            value.insertBefore(v, value.firstChild);
                            result.push(v)
                        } else {
                            let temp = v.cloneNode(true);
                            value.insertBefore(temp, value.firstChild);
                            result.push(v)
                        }
                    });
                })

                return $(result);
            },
            // 向所有指定元素内部尾部添加指定内容
            append: function(selector) {
                if (typeof selector === "string") {
                    this.each(function(key, value) {
                        value.innerHTML += selector;
                    })
                } else {
                    $(selector).appendTo(this);
                }
                return this
            },
            // 向所有指定元素内部头部添加指定内容
            perpend: function(selector) {
                if (typeof selector === "string") {
                    this.each(function(key, value) {
                        value.innerHTML = selector + value.innerHTML;
                    })
                } else {
                    $(selector).prependTo(this);
                }
                return this
            },
            // 向所有指定元素前面添加元素
            insertBefore: function(selector) {
                let target = $(selector);
                let $this = this;
                let result = [];
                console.log(this, target);
                target.each(function(key, value) {
                    let parent = value.parentNode;
                    $this.each(function(k, v) {
                        if (key === 0) {
                            parent.insertBefore(v, value);
                            result.push(v)
                        } else {
                            let temp = v.cloneNode(true);
                            parent.insertBefore(temp, value);
                            result.push(temp)
                        }
                    });
                })

                return $(result);
            },
            // 向指定所有元素替换指定元素
            replaceAll(selector) {
                let target = $(selector);
                let $this = this;
                let result = [];
                target.each(function(key, value) {
                    let parent = value.parentNode;
                    $this.each(function(k, v) {
                        if (key === 0) {
                            newJquery(v).insertBefore(value);
                            newJquery(value).remove()
                            result.push(v)
                        } else {
                            let temp = v.cloneNode(true);
                            newJquery(temp).insertBefore(value);
                            newJquery(value).remove()
                            result.push(temp)
                        }
                    });
                })

                return $(result);
            }

        })
        // 属性操作
    newJquery.prototype.extend({
        // 设置或获取元素属性节点值
        attr: function(key, value) {
            if (typeof key == "string") {
                if (arguments.length === 1) {
                    return this[0].getAttribute(key);
                } else {
                    this.each(function(k, v) {
                        v.setAttribute(key, value);
                    })
                }
            } else if (typeof key == "object") {
                let $this = this;
                $.each(key, function(okey, ovalue) {
                    $this.each(function(k, v) {
                        v.setAttribute(okey, ovalue);
                    })
                })
            }
            return this;
        },
        // 设置或获取元素属性值
        prop: function(key, value) {
            if (typeof key == "string") {
                if (arguments.length === 1) {
                    return this[0][key];
                } else {
                    this.each(function(k, v) {
                        v[key] = value;
                    })
                }
            } else if (typeof key == "object") {
                let $this = this;
                $.each(key, function(okey, ovalue) {
                    $this.each(function(k, v) {
                        v[okey] = ovalue;
                    })
                })
            }
            return this;
        },
        // 设置或获取元素中的css值
        css: function(key, value) {
            if (typeof key == "string") {
                if (arguments.length === 1) {
                    return newJquery.getStyle(this[0], key);
                } else {
                    this.each(function(k, v) {
                        v.style[key] = value;
                    })
                }
            } else if (typeof key == "object") {
                let $this = this;
                $.each(key, function(okey, ovalue) {
                    $this.each(function(k, v) {
                        // v[okey] = ovalue;
                        v.style[okey] = ovalue;

                    })
                })
            }
            return this;
        },
        // 设置或获取表单中的value值
        val: function(content) {
            if (arguments.length === 0) {
                return this[0].value;
            } else {
                this.each(function(key, value) {
                    value["value"] = content;
                })
                return this;
            }
        },
        // 判断元素是否包含指定类
        hasClass: function(content) {
            let bool = false
            if (arguments.length === 0) {
                return bool
            } else {
                this.each(function(key, value) {
                    let ele = " " + value.className + " ";
                    let className = " " + content + " ";
                    if (ele.indexOf(className) != -1) {
                        bool = true
                        return false
                    }
                })
                return bool;
            }
        },
        // 给指定元素添加一个类或多个类
        addClass: function(str) {
            if (arguments.length === 0) return this;

            var classNames = str.split(" ");
            this.each(function(key, ele) {
                $.each(classNames, function(k, v) {
                    if (!$(ele).hasClass(v)) {
                        ele.className = ele.className + " " + v;
                    }
                })
            })
            return this;
        },
        // 删除元素一个类或多个类
        removeClass: function(str) {
            if (arguments.length === 0) {
                this.each(function(key, ele) {
                    ele.className = "";
                })
            } else {
                var classNames = str.split(" ");
                this.each(function(key, ele) {
                    $.each(classNames, function(k, v) {
                        if ($(ele).hasClass(v)) {
                            ele.className = $.strTrim((" " + ele.className + " ").replace(" " + v + " ", " "));
                        }
                    })
                })
                return this;
            }
        },
        // 删除类增加类（addClass与removeClass）开关模式操作
        toggleClass: function(str) {
            if (arguments.length === 0) {
                this.removeClass();
            } else {
                var classNames = str.split(" ");
                this.each(function(key, ele) {
                    $.each(classNames, function(k, v) {
                        if ($(ele).hasClass(v)) {
                            $(ele).removeClass(v);
                        } else {
                            $(ele).addClass(v);
                        }
                    })
                })
                return this;
            }
        }
    });
    // 事件操作
    newJquery.prototype.extend({
        // 给所有指定元素注册事件
        on: function(funName, callBack) {
            // 因为ie9以下版本不支持addEventListener方法
            // 解决方案：attachEvent，与addEventListener不同处在于第一位参数 ， attachEvent添加方法名时需要加“on”
            // 注意：attachEvent在ie9以下版本执行 ， 回调函数 ，不会按顺序执行
            this.each(function(k, ele) {
                if (!ele.fun) {
                    ele.fun = {}
                };
                if (!ele.fun[funName]) {
                    ele.fun[funName] = [];
                    ele.fun[funName].push(callBack);
                    if (ele.addEventListener) {
                        ele.addEventListener(funName, function() {
                            $.each(ele.fun[funName], function(key, value) {
                                value();
                            })
                        })
                    } else {
                        ele.attachEvent("on" + funName, function() {
                            $.each(ele.fun[funName], function(key, value) {
                                value();
                            })
                        });
                    }
                } else {
                    ele.fun[funName].push(callBack);
                }

            })
        },
        // 给所有元素移除事件
        off: function(funName, callBack) {
            if (arguments.length === 0) {
                this.each(function(key, ele) {
                    ele.fun = {}
                })
            } else if (arguments.length === 1) {
                this.each(function(key, ele) {
                    ele.fun[funName] = [];
                })
            } else if (arguments.length === 2) {
                this.each(function(key, ele) {
                    $.each(ele.fun[funName], function(index, value) {
                        if (value == callBack) {
                            ele.fun[funName].splice(index, 1);
                        }

                    })
                })
            }
        },
        // 复制元素（元素本身+自身注册事件）
        clone: function(boolFun) {
            let result = [];
            if (boolFun) {
                this.each(function(key, ele) {
                    var newEle = ele.cloneNode(true);
                    $.each(ele.fun, function(k, v) {
                        $.each(v, function(samilK, samilV) {
                            $(newEle).on(k, samilV)
                        })
                    })
                    result.push(newEle);
                })
            } else {
                this.each(function(key, ele) {
                    var newEle = ele.cloneNode(true);
                    result.push(newEle);
                })
            }
            return result;
        }
    });

    newJquery.prototype.init.prototype = newJquery.prototype;
    window.newJquery = window.$ = newJquery;

})(window)