import test from 'ava'
import abckeyHID from '../dist/index'

test.cb('onAttach', t => {
  abckeyHID.onAttach(data => {
    console.log(data)
    t.pass()
    t.end()
  })
})

test.cb('onDetach', t => {
  abckeyHID.onDetach(data => {
    console.log(data)
    t.pass()
    t.end()
  })
})
