
```html
<a class="worker" href="javascript:alert('not prevented')">preventDefault works!</a>
<br/>
<a class="non-worker" href="javascript:alert('not prevented')">preventDefault doesn't work...</a>

```

```javascript
function createWorker(fn) {
  const blob = new Blob([`(${fn.toString()})()`], {
    type: 'application/javascript'
  })
  const url = URL.createObjectURL(blob)
  return new Worker(url)
}

const WAITING = 0
const RESUME = 1
const PREVENT = 2
const END = 3

var sharedBuffer = new SharedArrayBuffer(Int32Array.BYTES_PER_ELEMENT)
var sharedArray = new Int32Array(sharedBuffer)
var worker = createWorker(handleClickInWorker)
document.querySelector('.worker').addEventListener('click', transferHandleToWorker)
document.querySelector('.non-worker').addEventListener('click', e => {
  setTimeout(() => e.preventDefault(), 100)
})

function handleClickInWorker() {
  const WAITING = 0
  const RESUME = 1
  const PREVENT = 2
  const END = 3
  self.addEventListener('message', (event) => {
    const {
      sharedBuffer
    } = event.data
    console.log(sharedBuffer)
    const sharedArray = new Int32Array(sharedBuffer)
    spin(sharedArray)
  })

  function spin(sharedArray) {
    while (true) {
      console.log('waiting...')
      console.log(Atomics.wait(sharedArray, 0, WAITING))
      console.log('start handle!')
      Atomics.store(sharedArray, 0, PREVENT)
      console.log('sent prevent, waiting!')
      Atomics.wait(sharedArray, 0, PREVENT)
      console.log('event prevented')
      Atomics.store(sharedArray, 0, END)
      console.log('sending end...')
    }
    console.log('end spin')
  }
}

worker.postMessage({
  sharedBuffer
})


function transferHandleToWorker(e) {
  Atomics.store(sharedArray, 0, RESUME)
  Atomics.notify(sharedArray, 0)
  let status = Atomics.load(sharedArray, 0)
  while (status !== END) {
    console.log(status)
    if (status === PREVENT) {
      e.preventDefault()
      Atomics.store(sharedArray, 0, RESUME)
      Atomics.notify(sharedArray, 0)
    }
    status = Atomics.load(sharedArray, 0)
  }
  Atomics.store(sharedArray, 0, WAITING)
}
```