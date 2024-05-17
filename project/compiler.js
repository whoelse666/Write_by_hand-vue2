/* 
1. 获取并遍历DOM树
2. 文本节点：获取{{}}格式的内容并解析
3. 元素节点：访问节点特性，截获k-和@开头内容并解析
new Compile('#app', vm)
 */
class Compile {
    constructor(el, vm) {
            this.$vm = vm;
            this.$el = document.querySelector(el);
            if (this.$el) {
                //把$el里面内容搬到片段里面操作保证效率
                this.$fragment = this.node2Fragment(this.$el); //执行编译，替换动态内容
                this.compile(this.$fragment); //重新放回到$el中
                this.$el.appendChild(this.$fragment);
            }
        }
        //把el里面内容搬到fragment里面操作保证效率
    node2Fragment(el) {
        // console.log('el=',el,el.firstChild);
        // TODO 创建了一虚拟的节点对象，节点对象包含所有属性和方法
        const fragment = document.createDocumentFragment();
        let child;
        while ((child = el.firstChild)) {
            fragment.appendChild(child);
        }
        return fragment;
    }

    // TODO 递归遍历el，分别处理元素节点和插值表达式
    compile(el) {
        const childNodes = el.childNodes;
        Array.from(childNodes).forEach(node => {
            if (this.isElement(node)) {
                // console.log('编译元素');
                this.compileElement(node);
            } else if (this.isInter(node)) {
                // console.log('编译文本');
                this.compileText(node);
            }
            if (node.childNodes && node.childNodes.length > 0) {
                this.compile(node);
            }
        });
    }

    isElement(node) {
        // https://www.w3school.com.cn/jsref/prop_node_nodetype.asp
        return node.nodeType == 1; //元素
    }
    isAttr(node) {
        return node.nodeType == 2; // 属性
    }
    isInter(node) {
        return node.nodeType == 3 && /\{\{(.*)\}\}/.test(node.textContent);
    }

    compileText(node) {
        const exp = RegExp.$1;
        this.update(node, exp, 'text');
    }

    compileElement(node) {
        // 获取属性
        const nodeAttrs = node.attributes;
        Array.from(nodeAttrs).forEach(attr => {
            //   k-text="test"
            const attrName = attr.name; // k-text ||  k-html
            const exp = attr.value; // test
            if (attrName.indexOf('k-') === 0) {
                const dir = attrName.substring(2);
                this[dir] && this[dir](node, exp); //?  this.text() || this.html()
            }
            if (attrName.indexOf('@') === 0) {
                const dir = attrName.substring(1);
                console.log('dir==', dir);
                this.evenrHandler(node, exp, dir);
            }
        });
    }

    evenrHandler(node, exp, dir) {
        const fn = this.$vm.$options.methods && this.$vm.$options.methods[exp];
        if (dir && fn) {
            node.addEventListener(dir, fn.bind(this.$vm));
            // node.addEventListener(dir, fn)
        }
    }

    // k- 表达式
    text(node, exp) {
        // this.textUpdater(node, this.$vm[exp])
        this.update(node, exp, 'text');
    }

    html(node, exp) {
        // this.htmlUpdater(node, this.$vm[exp])
        this.update(node, exp, 'html');
    }
    model(node, exp) {
        // this.modelUpdater(node, this.$vm[exp]);
        this.update(node, exp, 'model');
        node.addEventListener('input', e => {
            this.$vm[exp] = e.target.value;
        });
    }

    textUpdater(node, val) {
        node.textContent = val;
    }
    htmlUpdater(node, val) {
        node.innerHTML = val;
    }
    modelUpdater(node, val) {
        node.value = val;
	 
    }

    /**
     * @@param: {
     * node: 更新的节点
     * exp: 更新的 key 值
     * dir:更新的类型
     *          }
     * @@return:  null
     */
    update(node, exp, dir) {
        const updaterFn = this[dir + 'Updater'];
        updaterFn && updaterFn(node, this.$vm[exp]);
        // 创建watcher，执行后续更新操作
        // 额外传递一个更新函数：能够更新指定dom元素
        new Watcher(this.$vm, exp, function(value) {
            console.log('console', value);
            updaterFn && updaterFn(node, value);
        });
    }
}