
var expect = require('chai').expect;
var fetch = require('isomorphic-fetch');

describe('API 测试', function() {
  it('session api get', function() {
    return fetch('/api/v1/session', {
      method: 'post',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 'huzhangdong@twsz.com', '123456', true })
    })
      .then(res => res.json())
      .then(res => expect(res.status).to.equal(200))
  })

  it('session api get', async function() {
    var res = await fetch('http://localhost:3000/api/v1/session');
    // console.log(res);
  })
})
