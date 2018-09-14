# Event Loop 浅析
### 打印的顺序是什么？
```javascript
setTimeout(function(){console.log(4)},0);
new Promise(function(resolve){
    console.log(1)
    for( var i=0 ; i<10000 ; i++ ){
        i==9999 && resolve()
    }
    console.log(2)
}).then(function(){
    console.log(5)
});
console.log(3);
```

觉得很简单可以看这篇文章，
[从Promise来看JavaScript中的Event Loop、Tasks和Microtasks](https://github.com/creeperyang/blog/issues/21?utm_source=tuicool&utm_medium=referral)，
或者看看下面的分析，也可以直接跳到最下面总结。

### Call Stack 执行栈

当我们调用一个方法的时候，js会生成一个与这个方法对应的执行环境（context），又叫**执行上下文**。这个执行环境中存在着这个方法的**私有作用域**，**上层作用域的指向**，**方法的参数**，**这个作用域中定义的变量**以及**这个作用域的this对象**。因为js是单线程，同一时间只能执行同一个方法，于是他们在一个地方排队，这个地方就叫Call Stack（执行栈）。

当一个脚本第一次执行的时候，js引擎会解析这段代码，并将其中的同步代码按照执行顺序加入执行栈中，然后从头开始执行。如果当前执行的是一个方法，那么js会向执行栈中添加这个方法的执行环境，然后进入这个执行环境继续执行其中的代码。当这个执行环境中的代码 执行完毕并返回结果后，js会退出这个执行环境并把这个执行环境销毁，回到上一个方法的执行环境。这个过程反复进行，直到执行栈中的代码全部执行完毕。

比如：
```javascript
function fire() {
    const result = sumSqrt(3, 4)
    console.log(result);
}
function sumSqrt(x, y) {
    const s1 = square(x)
    const s2 = square(y)
    const sum = s1 + s2;
    return Math.sqrt(sum)
}
function square(x) {
    return x * x;
}

fire()
```
函数`fire`首先被调用
![](https://github.com/MBearo/MBearo.github.io/raw/master/img/event-loop-00.png)
`fire` 调用 `sumSqrt` 函数 参数为3和4
![](https://github.com/MBearo/MBearo.github.io/raw/master/img/event-loop-01.png)
之后调用 `square` 参数为 x, x==3
![](https://github.com/MBearo/MBearo.github.io/raw/master/img/event-loop-02.png)
当 `square` 执行结束返回时，从 stack 中弹出，并将返回值赋值给 s1
s1加入到 sumSqrt 的 stack frame 中
![](https://github.com/MBearo/MBearo.github.io/raw/master/img/event-loop-03.png)
以同样的方式调用下一个 `square` 函数
![](https://github.com/MBearo/MBearo.github.io/raw/master/img/event-loop-04.png)
![](https://github.com/MBearo/MBearo.github.io/raw/master/img/event-loop-05.png)
在下一行的表达式中计算出 s1+s2 并赋值给 sum
![](https://github.com/MBearo/MBearo.github.io/raw/master/img/event-loop-06.png)
之后调用 `Math.sqrt` 参数为sum
![](https://github.com/MBearo/MBearo.github.io/raw/master/img/event-loop-07.png)
现在就剩下 `sumSqrt` 函数返回计算结果了
![](https://github.com/MBearo/MBearo.github.io/raw/master/img/event-loop-08.png)
返回值赋值给 result
![](https://github.com/MBearo/MBearo.github.io/raw/master/img/event-loop-09.png)
在 console 中打印出 result
![](https://github.com/MBearo/MBearo.github.io/raw/master/img/event-loop-10.png)
最终 `fire` 没有任何返回值 从stack中弹出 stack也清空了
![](https://github.com/MBearo/MBearo.github.io/raw/master/img/event-loop-11.png)
当函数执行完毕后本地变量会从 stack 中弹出，这只有在使用 numbers string boolean 这种基本数据类型时才会发生。而对象、数组的值是存在于 heap(堆) 中的，stack 只存放了他们对应的指针。

当函数执行结束从 stack 中弹出来时，只有对象的指针被弹出，而真正的值依然存在 heap 中，然后由垃圾回收器自动的清理回收。

### Task Queue 事件队列
以上的过程说的都是同步代码的执行。那么当一个异步代码（如发送ajax请求数据）执行后会如何呢？前文提过，js的另一大特点是非阻塞，实现这一点的关键在于下面要说的这项机制——事件队列（Task Queue）。

js引擎遇到一个异步事件后并不会一直等待其返回结果，而是会将这个事件挂起，继续执行执行栈中的其他任务。当一个异步事件返回结果后，js会将这个事件加入与当前执行栈不同的另一个队列，我们称之为事件队列。被放入事件队列不会立刻执行其回调，而是等待当前执行栈中的所有任务都执行完毕， 主线程处于闲置状态时，主线程会去查找事件队列是否有任务。如果有，那么主线程会从中取出排在第一位的事件，并把这个事件对应的回调放入执行栈中，然后执行其中的同步代码...，如此反复，这样就形成了一个无限的循环。这就是这个过程被称为Event Loop(事件循环)的原因。
![](https://github.com/MBearo/MBearo.github.io/raw/master/img/task-queue.png)

### MacroTask与MicroTask
以上的事件循环过程是一个宏观的表述，实际上因为异步任务之间并不相同，因此他们的执行优先级也有区别。不同的异步任务被分为两类：微任务（Micro Task）和宏任务（Macro Task）。

以下事件属于宏任务：
* script
* setTimeout
* setInterval
* setImmediate
* I/O

以下事件属于微任务
* process.nextTick
* Promise（原生的）
* Object.observe （已废弃）
* MutaionObserver （兼容性问题，废了）
* MessageChannel（vue中 nextTick 实现原理）

前面我们介绍过，在一个事件循环中，异步事件返回结果后会被放到一个任务队列中。然而，根据这个异步事件的类型，这个事件实际上会被对应的宏任务队列或者微任务队列中去。并且在当前执行栈为空的时候，主线程会 查看微任务队列是否有事件存在。如果不存在，那么再去宏任务队列中取出一个事件并把对应的回到加入当前执行栈；如果存在，则会依次执行队列中事件对应的回调，直到微任务队列为空，然后去宏任务队列中取出最前面的一个事件，把对应的回调加入当前执行栈...如此反复，进入循环。

我们只需记住**当当前执行栈执行完毕时会立刻先处理所有微任务队列中的事件，然后再去宏任务队列中取出一个事件。同一次事件循环中，微任务永远在宏任务之前执行**。

这样就可以简单的解释上面代码的运行结果：
```javascript
setTimeout(function(){console.log(4)},0);
new Promise(function(resolve){
    console.log(1)
    for( var i=0 ; i<10000 ; i++ ){
        i==9999 && resolve()
    }
    console.log(2)
}).then(function(){
    console.log(5)
});
console.log(3);
```
```
1
2
3
5
4
```
### vue中nextTick
在 Vue 中，DOM更新是异步的。

当观察到数据变化时，Vue 将开启一个队列，并缓冲在同一事件循环中发生的所有数据改变。如果同一个 watcher 被多次触发，只会一次推入到队列中。这种在缓冲时去除重复数据对于避免不必要的计算和 DOM 操作上非常重要。然后，在下一个的事件循环`tick`中，Vue 刷新队列并执行实际（已去重的）工作。

Vue 在内部尝试对异步队列使用原生的 Promise.then 和 MessageChannel(因为兼容性的原因，已经移除了MutationObserver)，如果执行环境不支持，会采用 setTimeout(fn, 0) 代替。

而当我们希望在数据更新之后执行某些 DOM 操作，就需要使用 nextTick 函数来添加回调：
```
// HTML
<div id="example">{{message}}</div>

// JS
var vm = new Vue({
  el: '#example',
  data: {
    message: '123'
  }
})
vm.message = 'new message' // 更改数据
vm.$el.textContent === 'new message' // false
Vue.nextTick(function () {
  vm.$el.textContent === 'new message' // true
})
```

### 总结
Event Loop如果深究，涉及到大量的相关知识。包括运行环境（浏览器，node）、内核、内核版本、各种规范等等。问题的最后都指向了不同引擎的底层实现，所以我认为只要了解到一定程度即可，有能力在深究。

* JavaScript的一大特点就是单线程，而这个线程中拥有唯一的一个Event Loop(事件循环)。
* 在新标准中的Web Work涉及到多线程，但是并不是真正的多线程，理解成Web Work是主线程的子线程即可。
* JavaScript代码的执行过程中，除了依靠Call Stack(函数调用栈)来搞定函数的执行顺序外，还依靠Task Queue(任务队列)来搞定异步部分。
* 一个线程中，Event Loop(事件循环)是唯一的,但是可以拥有多个Task Queue（事件队列）
* 相同任务源只能在一个Task Queue（事件队列），不同任务源可以放在不同队列
* 任务队列又分为MacroTask（宏任务）与MicroTask（微任务），在最新标准中，它们被分别称为Task与Jobs。也有一种叫法Task默认指代MacroTask（宏任务），MicroTask（微任务）才是MicroTask。
* MacroTask（宏任务）大概包括：
  * script(整体代码)
  * setTimeout
  * setInterval
  * setImmediate
  * I/O
  * UI rendering
* MicroTask（微任务）大概包括：
  * process.nextTick
  * Promise（原生的）
  * Object.observe （已废弃）
  * MutaionObserver （兼容性问题，废了）
  * MessageChannel（vue中 nextTick 实现原理）
* setTimeout/Promise等我们称之为任务源。而进入任务队列的是他们指定的具体执行任务。

```javascript
// setTimeout中的回调函数才是进入任务队列的任务
setTimeout(function() {
    console.log('xxxx');
})
// 非常多的同学对于setTimeout的理解存在偏差。所以大概说一下误解：
// setTimeout作为一个任务分发器，这个函数会立即执行，而它所要分发的任务，也就是它的第一个参数，才是延迟执行
```

* 来自不同任务源的任务会进入到不同的任务队列。其中setTimeout与setInterval是同源的。
* setTimeout有4ms的延迟，已经标准化了
* 事件循环的顺序，决定了JavaScript代码的执行顺序。它从script(整体代码)开始第一次循环。之后全局上下文进入函数调用栈。直到调用栈清空(只剩全局)，然后执行所有的MicroTask。当所有可执行的MicroTask执行完毕之后。循环再次从MacroTask开始，找到其中一个任务队列执行完毕，然后再执行所有的MicroTask，这样一直循环下去。
* 每一个任务的执行，无论是MacroTask还是MicroTask，都是借助Call Stack(执行栈)来完成。
