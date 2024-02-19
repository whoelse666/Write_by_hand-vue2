/*
 * @Author: RONGWEI PENG
 * @Date: 2020-08-27 09:13:50
 * @LastEditors: Do not edit
 * @LastEditTime: 2020-08-28 19:10:52
 * @FilePath: /手写vue_demo/kvue/test01/compiler2.js
 */
class Compile {
	constructor(el, vm) {
		this.$el = document.querySelector(el);
		this.$vm = vm;
		if (this.$el) {
			this.$fragment = this.node2Fragment(this.$el);
			this.compile(this.$fragment); //编译
			this.$el.appendChild(this.$fragment); //重新放回到$el中
		}
	}
	node2Fragment(el) {
		const fragment = document.createDocumentFragment();
		let child;
		while ((child = el.firstChild)) {
			fragment.appendChild(child);
		}
		return fragment;
	}

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
		// 3  一个元素的文本内容 或属性
		return node.nodeType == 3 && /\{\{(.*)\}\}/.test(node.textContent);
	}

	compileText(node, val) {
		const exp = RegExp.$1;
		// node.textContent = this.$vm[exp];
		this.update(node, exp, 'text');
	}

	compileElement(node) {
		const nodeAttrs = node.attributes;
		Array.from(nodeAttrs).forEach(attr => {
			const attrName = attr.name;
			const exp = attr.value;
			if (attr.name.indexOf('k-') === 0) {
				const dir = attrName.substring(2);
				this[dir] && this[dir](node, exp);
			}
		});
	}

	text(node, exp) {
		this.update(node, exp, 'text');
	}
	html(node, exp) {
		this.update(node, exp, 'html');
	}
	model(node, exp) {
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

	// 通用更新函数，根据指令决定调用哪个更新器
	update(node, exp, dir) {
		console.log('exp===', exp);
		const updaterFn = this[dir + 'Updater'];
		updaterFn && updaterFn(node, this.$vm[exp]);
		new Watcher(this.$vm, exp, function(value) {
			updaterFn && updaterFn(node, value);
		});
	}
}
