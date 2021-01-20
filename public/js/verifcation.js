
$('.card').ready(function () {
    var settings = {
        // "url": `http://localhost:3000/v1/logs/get`,
        'url': `/v1`,
        'method': 'POST',
        'timeout': 0,
    };

    $.ajax(settings).done(function (response) {
        const obj = response;
        let content =
            `<tr>
                <th scope="row">${idx + 1}</th>
                <td>${obj.timestamp}</td>
                <td>${obj.level}</td>
                <td>${obj.message}</td>
            </tr>`;

        $(".card-body").append(content);
    });
});
