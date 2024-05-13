const { Worker } = require('worker_threads')
const threadNumber = require('os').cpus().length
class WorkerPool {
	constructor (workerPath, workerNumber = threadNumber) {
		if (!workerPath) {
			throw new Error('the provide arguments is not fit for require')
		}
		this.workerPath = workerPath
		this.workerNumber = workerNumber
		this._queues = []
		this._workerMap = new Map()
		this._workerActiveStatusMap = new Map()

		for (let i=0; i<workerNumber; i++) {
			this._workerMap.set(i, new Worker(workerPath))
			this._workerActiveStatusMap.set(i, false)
		}
	}
	_getInactiveWorkerId () {
		let id = -1
		for (let [index, acitve] of this._workerActiveStatusMap.entries()) {
			if (!acitve) {
				id = index
				break
			}
		}
		return id
	}
	runWorker (id, _data) {
		let currentWorker = this._workerMap.get(id)
		this._workerActiveStatusMap.set(id, true)
		const doAfterTaskFinished = () => {
			this._workerActiveStatusMap.set(id, false)
			currentWorker.removeAllListeners('message')
			currentWorker.removeAllListeners('error')
			if (this._queues.length) {
				this.runWorker(id, this._queues.shift())
			}
		}
		currentWorker.on('message', result => {
			_data.callback(null, result)
			doAfterTaskFinished()
		})
		currentWorker.on('error', result => {
			_data.callback(true, result)
			doAfterTaskFinished()
		})
		currentWorker.postMessage(_data.data)
	}
	run (data) {
		return new Promise((resolve, reject) => {
			const inactiveWorkerId = this._getInactiveWorkerId()
			let _data = {
				data,
				callback: (err, result) => {
					if (err) {
						reject(result)
					} else {
						resolve(result)
					}
				}
			}
			if (inactiveWorkerId === -1) {
				this._queues.push(_data)
				console.log('all worker is active, the new task must queue')
				return
			}
			this.runWorker(inactiveWorkerId, _data)
		})
	}
	destory (){
		for (let [index, worker] of this._workerMap.entries()) {
			if (this._workerActiveStatusMap.get(index)) {
				console.warn(`the worker ${index} is still active, exit soon`)
			}
			worker.terminate()
		}
	}
}

export default WorkerPool