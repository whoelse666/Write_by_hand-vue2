/*
 * @Author: RONGWEI PENG
 * @Date: 2020-08-20 21:33:40
 * @LastEditors: Do not edit
 * @LastEditTime: 2020-08-28 17:53:13
 * @FilePath: /手写vue_demo/kvue/test01/kvue2.js
 */
class KVue {
    constructor(options) {
        this.options = options;
        this.$data = options.data;
        this.observer(this.$data);

        // /* 新建一个Watcher观察者对象，这时候Dep.target会指向这个Watcher对象 */
        // new Watcher(this, 'test');
        // /* 访问get函数，为了触发依赖收集 */
        // this.test;
        // new Watcher(this, 'foo.bar');
        // this.foo.bar;

        new Compile(options.el, this);
    }
    observer(val) {
        if (typeof val !== 'object') {
            return;
        }
        Object.keys(val).forEach(key => {
            this.defineReactive(val, key, val[key]);
            this.proxyData(key);
        });
    }
    defineReactive(obj, key, val) {
        this.observer(val);
        const dep = new Dep();
        Object.defineProperty(obj, key, {
            get() {
                Dep.target && dep.addDep(Dep.target);
                return val;
            },
            set(newVal) {
                if (newVal === val) {
                    return;
                }
                val = newVal;
                dep.notify();
            },
        });
    }
    proxyData(key) {
        Object.defineProperty(this, key, {
            get() {
                return this.$data[key];
            },
            set(newVal) {
                if (newVal === this.$data[key]) {
                    return;
                }
                this.$data[key] = newVal;

            },
        });
    }
}

class Dep {
    constructor(params) {
        this.deps = [];
    }

    addDep(dep) {
        // console.log('dep=', dep);
        this.deps.push(dep);
    }
    notify() {
        this.deps.forEach(dep => dep.update());
    }
}

// 监听器：负责更新视图
class Watcher {
    constructor(vm, key) {
        this.vm = vm;
        this.key = key;
        Dep.target = this; //  this 是当前 watcher 实例
    }

    update() {
        console.log(`属性${this.key}更新了`);
    }
}