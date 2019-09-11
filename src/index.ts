import UsbDetect from 'usb-detection'
import NodeHid from 'node-hid'
import HID53c01209 from './hid_53c01209'
import HID534c0001 from './hid_534c0001'

declare global {
  namespace NodeJS {
    interface Global {
      __ABCKEY__: any
    }
  }
}

const __IDS__ = [
  HID53c01209.id,
  HID534c0001.id
]

let __MUTEX_ID__: string

const onAttach = async (cb: (data: any) => void) => {
  let _dev = await _findDev()
  UsbDetect.startMonitoring()
  UsbDetect.on("insert", async () => {
    if (__MUTEX_ID__) return
    _dev = await _findDev()
    if (!_dev) return
    global.__ABCKEY__ = _dev
    __MUTEX_ID__ = mutexID(_dev.vid, _dev.pid)
    const _info = _dev.getDeviceInfo()
    const _data = {
      id: __MUTEX_ID__,
      name: _info.product
    }
    cb(_data)
  })
  if (_dev) {
    _dev.close()
    UsbDetect.emit('insert')
  }
}

const onDetach = (cb: (data: any) => void) => {
  UsbDetect.on('remove', (dev: any) => {
    if (!__MUTEX_ID__) return
    const tmpID = mutexID(dev.vendorId, dev.productId)
    if (tmpID !== __MUTEX_ID__) return
    global.__ABCKEY__.close()
    __MUTEX_ID__ = ''
    cb({ id: tmpID })
  })
}

const mutexID = (vid: number, pid: number) => {
  let _vid = Buffer.alloc(2)
  let _pid = Buffer.alloc(2)
  _vid.writeInt16BE(vid, 0)
  _pid.writeInt16BE(pid, 0)
  const id = _vid.toString('hex') + _pid.toString('hex')
  return id
}

const _findDev = async () => {
  await new Promise(resolve => setTimeout(resolve, 222))
  let dev = null
  for (let item of __IDS__) {
    try {
      dev = new NodeHid.HID(item.vid, item.pid)
      dev.vid = item.vid
      dev.pid = item.pid
      break
    } catch (err) {
      console.error('#', item.vid, item.pid, err)
    }
  }
  return dev
}

export default {
  onAttach,
  onDetach
}
