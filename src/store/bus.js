/*
 * 组件间通信的6种方式:
 *  1. props/$emit:
 *      父-->子: props(只读)
 *      子-->父: this.$emit("父类回调函数", "参数")
 *
 *  2. $parent,$children, ref
 *      $parent: 子组件通过该值访问父实例
 *      $children: 父组件通过该值访问子实例
 *      ref: 普通DOM中表示引用DOM元素, 在子组件上就表示引用子组件实例
 *
 *  3. $emit/$on
 *      父子,兄弟,隔代之间的互相通信, 事件总线bus就是基于该方式进行的通信
 *
 *  4. $attrs/$listeners
 *      父-->子-->孙: 一般用于数据的传递, 若是还伴随着中间处理, 则需要用vuex
 *      $attrs: 获取所有的父组件属性信息, 除了prop(绑定)传递的值之外
 *      $listeners: 包含父作用域中v-on时间监听器, 可以通过v-on="$listeners"将信息传递到孙组件上
 *
 *  5. provide/inject API
 *      功能: 主要解决跨域组件间的通讯问题, 主要是子组件获取上级组件的状态
 *      provide api: 祖先组件通过该值提供变量
 *        export default {
 *          provide: {
 *            var1: "na1",
 *            var2: "na2",
 *          }
 *        }
 *      inject api: 孙组件通过该值注入变量
 *        export default {
 *          inject: [var1, var2]
 *        }
 *
 *  6. vuex: 解决了bus在复杂关系组件间共享数据的一个非常混乱关系
 *      区别: 实际上就是将数据, 方法都独立到vuex中, 这点不同于bus, bus仅仅为各个组件提供了一种通信方式
 */
import mitt from "mitt";

// 使用 Event Bus
const emitter = mitt();

export default emitter;
