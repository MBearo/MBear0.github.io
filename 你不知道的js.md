# 你不知道的js总结

## 变量提升 上p38

var a=2 可以理解成两个声明

1. var a 在编译阶段进行
2. a=2 赋值声明会被留在原地等待执行

## 函数提升 上p39 40

1. 变量会提升
2. 函数声明会提升，但是函数表达式不会提升
3. 函数声明会首先被提升，然后才是变量

## 箭头函数

> 所有的箭头函数都没有自己的this，都指向外层

这句话就是箭头函数的精髓

> “箭头函数”的this，总是指向定义时所在的对象，而不是运行时所在的对象。

这一句说的太模糊了，最好改成，总是指向所在函数运行时的this

```javascript
function foo(){
  // 返回一个箭头函数
  return a=>{
    // this继承自foo()
    console.log(this.a)
  }
}
var obj1={
  a:2
}
var obj2={
  a:3
}
var bar=foo.call(obj1)
bar.call(obj2) //2
```

由于foo()的this绑定到obj1,箭头函数中的this继承自foo()，bar又被箭头函数复制，bar的this也会绑定到obj1

## 检查某个属性是否存在

1. for in 会检查该对象和该对象的原型链
2. hasOwnProperty 只会检查该对象