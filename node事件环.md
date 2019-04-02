# node事件环

## 宏任务微任务

- 微任务(micro tasks):promise , MutationObserver , process.nextTick (优先于promise)

- 宏任务(macro tasks):script , setTimeout , setInterval , setImmediate(只在IE下) , messageChannel , I/O , UI rendering

## node事件

- timers

- poll阶段

- check阶段