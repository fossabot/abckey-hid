import test from 'ava'
import abckeyHID from '../dist/index'

test.cb('onAttach', t => {
  abckeyHID.onAttach((data: any) => {
    console.log(data)
    t.pass()
    t.end()
  })
})

test.cb('onDetach', t => {
  abckeyHID.onDetach((data: any) => {
    console.log(data)
    t.pass()
    t.end()
  })
})
