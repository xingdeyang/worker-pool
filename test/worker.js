const { parentPort } = require('worker_threads')

parentPort.on('message', async data => {
	console.log(`接收到主线程发来的数据${data}`)
	// 模拟工作线程的CPU处理任务
	await new Promise((resolve, reject) => {
		setTimeout(resolve, 200)
	})
	parentPort.postMessage({
		msg: 'good boy'
	})
})