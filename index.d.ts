 export default class WorkerPool<T> {
	constructor(workerPath: string, workerNumber: number)
	_getInactiveWorkerId: () => number
	runWorker: (id: number, _data: {
		data: T,
		callback: () => void
	}) => Promise<any>
	run: (data: T) => void
	destory: () => void
 }