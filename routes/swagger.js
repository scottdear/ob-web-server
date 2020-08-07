const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const swagger = require('swagger-node-express');

router.use(express.static('dist'));
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({
	extended: true
}));

swagger.setApiInfo({
	title: "Ocean Builder API",
	Ydescription: "This system is designed to enable users to have controls on Ocean builders seapods...",
	termsOfServiceUrl: "",
	contact: "diego@oceanbuilders.com",
	license: "",
	licenseUrl: ""
});

router.get('/', function (req, res) {
	console.log(__dirname);
	res.sendFile(__dirname + '/../dist/index.html');
});

module.exports = router;