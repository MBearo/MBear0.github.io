## Proxy

1. proxy中可以用 Reflect.set(target,key,value)，可以返回true 或者 false
2. 如果push，set里会调用两次，加了一位，并且length也变了，所以改了两次

## 常见数组方法
1. forEach
2. reduce 收敛(多个数据变成了一个)
    ```javascript
    [1,3,4,5,5].reduce((a,b)=>{
      return a+b
    })
    [{price:100,count:2},{price:100,count:2}].reduce((a,b)=>{
      return a+b.price*b.count
    },0) //这个参数在第一个
    let keys=['name','age']
    let values=['xiaoming',18]
    keys.reduce((a,b,index)=>{
      (a[b]=values[index],a)
    },{}) //(1,2,3,4) 返回 4 逗号运算符

    //redux的compose方法
    function sum(a,b){
      return a+b
    }
    function toUpper(str){
      return str.toUpperCase()
    }
    function add(str){
      retrun "sss"+str+"sss"
    }
    function compose(...fns){
      return function(...args){
        let lastFn=fns.pop()
        return fns.reduceRight((a,b)=>{
          return b(a)
        },lastFn(...args))
      }
    }
    ```
3. map 映射
4. filter
5. some
6. every