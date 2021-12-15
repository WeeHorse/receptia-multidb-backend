const Vonage = require('@vonage/server-sdk');
const vonage = new Vonage({
  apiKey: "f713a6d9",
  apiSecret: "aSjPwz9cuuVwKNqS"
});

// send
vonage.verify.request({
    number: "46768540989",
    brand: "Vonage"
  }, (err, result) => {
    if (err) {
      console.error(err);
    } else {
      const verifyRequestId = result.request_id;
      console.log('request_id', verifyRequestId);
    }
  });

  // verify
  vonage.verify.check({
    request_id: REQUEST_ID,
    code: CODE
  }, (err, result) => {
    if (err) {
      console.error(err);
    } else {
      console.log(result);
    }
  });

  // cancel request
  vonage.verify.control({
    request_id: REQUEST_ID,
    cmd: 'cancel'
  }, (err, result) => {
    if (err) {
      console.error(err);
    } else {
      console.log(result);
    }
  });