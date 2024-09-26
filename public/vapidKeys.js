const webpush = require('web-push');

// Generate VAPID keys
const vapidKeys = webpush.generateVAPIDKeys();

console.log('Public Key:', vapidKeys.publicKey);
console.log('Private Key:', vapidKeys.privateKey);

// KLIJENT
let clientPublic = 'BM1CECHKTpWifseEi6jVA82QAG_Ng23_6RPhLbTrPmjqps2TxncMQJAvfEBIhQY_nyQA_x8HPL6Cjh8wA5dWp2c';

let serverPublic = 'BLxRStiPVJdiSAnmunz_W8epHVHNUHUPO4lQj_k54-UXhs-f7B5njM9RBD30paTOzvDHfhDxyQPf0uIiTuIXJUo';
let serverPrivate = 'Z4NlFZ6fe1nbHzdtuCiHefsOhBHVf6z0fgDCt1iEoko';