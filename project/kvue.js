class KVue {
	constructor(options) {
		this.$options = options;
		this.$data = options.data;
		// 实现响应化
		this.observer(this.$data);
		// 新建一个Watcher观察者对象，这时候Dep.target会指向这个Watcher对象
		//  new Watcher(this, 'test');
		// // 访问get函数，为了触发依赖收集
		// this.test ;  
		// new Watcher(this, 'foo.bar');
		// this.foo.bar; 
        /* compiler.js */
		  new Compile(options.el, this);
		if (options.created) {
			options.created.call(this)
		}  
	}

	observer(val) {
		// 判断是否为对象
		if (!val || typeof val !== 'object') {
			return;
		}
		// 遍历，执行数据响应式
		Object.keys(val).forEach(key => {
			this.defineReactive(val, key, val[key]);
			this.proxyData(key);
		});
	}

	defineReactive(obj, key, val) {
		this.observer(val);
		// 每次defineReactive 创建一个Dep实例
		const dep = new Dep();
		Object.defineProperty(obj, key, {
			get() {
			 console.log(key + '更新了->', val);
				// 将Dep.target（即当前的Watcher对象存入Dep的deps中）
				Dep.target && dep.addDep(Dep.target);
				return val;
			},
			set(newVal) {
				if (val === newVal) return;
				// 在set的时候触发dep的notify来通知所有的Watcher对象更新视图
				val = newVal;
				console.log(key + '更新了->', val);
				dep.notify();
			},
		});
	}

	// 代理
	proxyData(key) {
		Object.defineProperty(this, key, {
			get() {
				return this.$data[key];
			},
			set(newVal) {
				this.$data[key] = newVal;
				// console.log(key + '更新了', this.$data[key]);
			},
		});
	}
}

class Dep {
	constructor() {
		// 存储dep的数组
		this.deps = [];
	}
	addDep(dep) {
		// 添加dep
		this.deps.push(dep);
	}
	notify() {
		// 通知dep更新
		this.deps.forEach(dep => dep.update());
	}
}

// 监听器：负责更新视图
class Watcher {
	constructor(vm, key, cb) {
		this.vm = vm;
		this.key = key;
		// 传入更新函数cb 
		this.cb = cb;
		// 在new一个监听器对象时将该对象赋值给Dep.target，在get中会用到
		Dep.target = this;
		this.vm[this.key]; // 读取vm的属性触发依赖收集 
		Dep.target = null;
	}
	update() {
		console.log(`属性${this.key}更新了`);
		this.cb.call(this.vm, this.vm[this.key]);
	}
}
