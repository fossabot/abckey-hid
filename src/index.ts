import UsbDetect from 'usb-detection'
import NodeHid from 'node-hid'
import HID53c01209 from './hid_53c01209'
import HID534c0001 from './hid_534c0001'

declare global {
  namespace NodeJS {
    interface Global {
      __ABCKEY__: any,
      __ABCKEY_ID__: string,
      __ABCKEY_NAME__: string
    }
  }
}

const __IDS__ = [
  HID53c01209.id,
  HID534c0001.id
]
const onAttach = async (cb: (data: any) => void) => {
  UsbDetect.startMonitoring()
  UsbDetect.on("insert", () => {
    if (global.__ABCKEY_ID__) return
    let _hid = _findHID()
    if (!_hid) return
    cb(_openHID(_hid))
  })
  if (_findHID()) UsbDetect.emit('insert')
}

const onDetach = (cb: (data: any) => void) => {
  UsbDetect.on('remove', (dev: any) => {
    if (!global.__ABCKEY_ID__) return
    if (_mutexID(dev.vendorId, dev.productId) !== global.__ABCKEY_ID__) return
    cb(_closeHID())
  })
}

const _findHID = () => {
  const devices = NodeHid.devices()
  for (let dev of devices) {
    for (let abckey of __IDS__) {
      if (dev.vendorId === abckey.vid && dev.productId === abckey.pid) return dev
    }
  }
  return null
}

const _openHID = (hid: any) => {
  try {
    let hidDev = new NodeHid.HID(hid.vendorId, hid.productId)
    global.__ABCKEY__ = hidDev
    global.__ABCKEY_ID__ = _mutexID(hid.vendorId, hid.productId)
    global.__ABCKEY_NAME__ = hid.product
    return {
      id: global.__ABCKEY_ID__,
      name: global.__ABCKEY_NAME__
    }
  } catch (err) {
    console.error('#', hid, err)
    return null
  }
}

const _closeHID = () => {
  const data = {
    id: global.__ABCKEY_ID__,
    name: global.__ABCKEY_NAME__
  }
  global.__ABCKEY__.close()
  global.__ABCKEY__ = null
  global.__ABCKEY_ID__ = ''
  global.__ABCKEY_NAME__ = ''
  return data
}

const _mutexID = (vid: number, pid: number) => {
  let _vid = Buffer.alloc(2)
  let _pid = Buffer.alloc(2)
  _vid.writeInt16BE(vid, 0)
  _pid.writeInt16BE(pid, 0)
  return _vid.toString('hex') + _pid.toString('hex')
}

export default {
  onAttach,
  onDetach
}
