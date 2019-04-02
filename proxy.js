let arr=[1,2,3]
let proxy =new Proxy(arr,{
  set(target,key,value){
    target[key]=value
  },
  get(target,key){
    return target[key]
  }
})

proxy[0]=100
console.log(proxy)