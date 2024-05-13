const path = require('path')
const WorkerPool = require(path.resolve(__dirname, '../index'))

let inst = new WorkerPool(path.resolve(__dirname, './worker.js'), 3)
// 线程池数最好和CPU核心数保持一致，这里设置为3。并模拟连续触发100次工作线程的调用
for (i=0; i<100; i++) {
	inst.run({
		name: 'derick'
	}).then(data => {
		console.log(`接收到子线程发来的数据${data}`)
	}).catch()
}