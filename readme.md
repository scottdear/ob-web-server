# Ocean Builders Server

Ocean Builders App gives seapod owners full control, monitoring and customization options on any iOS and Android device.

This system is designed to enable users to have controls on **Ocean builders** seapods by providing tools to assist in controlling a sea pod creation process, which would otherwise enable the user to have remote controlling and remote/local accessing his sea pods. By the mobile app large set of functionalities, the system will meet the users’ needs while remaining easy to understand and use.

## Documentation

Looking for protocol documentation? Check out [this website](https://oceanbuilders.herokuapp.com/v1/docs)! 

## Setup

**Install the Dependencies**
```
npm i
```

**Set the following Environment Variables**
```
$env:OB_jwtPrivateKey=yourSecureKey
$env:OB_sendgrid=yourEmailSeviceKey
$env:NODE_ENV=nodeEnvironment 

$env:USER_SALT=number
$env:ADMIN_SLAT=number

$env:FIREBASE_PROJECT_ID=yourProjectId 
$env:FIREBASE_PRIVATE_KEY=yourPrivateKey
$env:FIREBASE_CLIENT_EMAIL=yourClientMail  
```

(Optional) Environment Variables
```
$env:FIREBASE_CLIENT_ID=yourClientId 
$env:FIREBASE_TYPE=yourFirebaseType 
$env:FIREBASE_PRIVATE_KEY_ID=yourPrivateKeyId
$env:FIREBASE_AUTH_URI=yourAuthURI
$env:FIREBASE_TOKEN_URI=yourTokenURI
$env:FIREBASE_AUTH_PROVIDER_X509_CERT_URL=yourAuthProvider
$env:FIREBASE_CLIENT_X509_CERT_URL=yourClientURL
```

**Start the Server**
```
node index.js
```

## License
Ocean Builders © 2018-2020
  
Licensed under the [GPLv3](https://www.gnu.org/licenses/gpl-3.0.en.html)
