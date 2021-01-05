
$('.cotainer').ready(function () {
	addLog();
});


function addLog() {

	var settings = {
        // "url": `http://localhost:3000/v1/logs`,
        "url": `${window.location.hostname}/v1/logs`,
		"method": "GET",
		"timeout": 0,
	};

	$.ajax(settings).done(function (response) {

		$.each(response, function (idx, obj) {
            let content = `
            <tr>
                <th scope="row">${idx+1}</th>
                <td>${obj.timestamp}</td>
                <td>${obj.level}</td>
                <td>${obj.message}</td>
            </tr>`;

			$("#log").append(content);
		})


	});
}