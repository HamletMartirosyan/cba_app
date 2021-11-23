// AJAX HANDLER ========================================================================================================

function ajaxRequest(method, url, data) {
    let result = NaN;
    $.ajax({
        url: url,
        method: method,
        dataType: 'json',
        data: data,
        contentType: 'application/json; charset=utf-8',
        async: false,
        success: function (response) {
            $("#loading").hide();
            result = response;
        },
        errors: function (e) {
            alert(e);
        }
    });

    return result;
}

// AJAX HANDLER ========================================================================================================


// GET DATA FROM SOAP ==================================================================================================

function getDataFromSoap() {
    let date = $("#date").val();
    if (date === '') {
        date = new Date().toISOString().slice(0, 10)
    }

    let url = '/by_date';
    let method = 'GET';
    let data = {
        'date': date,
    };

    let response = ajaxRequest(method, url, data);
    drawTable(response);
}

function Exchange() {
    let date = $("#date").val();
    let count = $("#count").val();
    let iso_codes = $("#iso_codes").val();

    let url = '/convert';
    let method = 'POST';
    let data = {
        'date': date,
        'count': count,
        'iso_codes': iso_codes,
    };

    let response = ajaxRequest(method, url, data);
    console.log(response);
}

// function Exchange() {
//     let body = {
//         'date': $("#date").val(),
//         'count': $("#count").val(),
//         'iso_codes': $("#iso_codes").val(),
//     };
//     let url = '/exchange';
//     let method = 'POST';
//     let response = ajaxRequest(method, url, body);
//     let exc = $('#exchange')
//     if (response) {
//         exc.innerHTML = response['converted_value'];
//         exc.show();
//     } else {
//         exc.hide();
//     }


function drawTable(data) {
    let table_data =
        '<table class="table thead-dark">' +
        '<tr class="thead-dark">' +
        '<th>ISO</th>' +
        '<th>Amount</th>' +
        '<th>Rate</th>' +
        '<th>Difference</th>' +
        '</tr>';
    for (let rate in data) {
        table_data += '<tr>';
        for (let item in data[rate]) {
            table_data += '<td>' + data[rate][item] + '</td>'
        }
        table_data += '</tr>';
    }
    table_data += '</table>';

    let attr = document.createAttribute('class');
    attr.value = 'row';
    document.getElementById('table_data').setAttributeNode(attr);
    document.getElementById('table_data').innerHTML = table_data;
}

// GET DATA FROM SOAP ==================================================================================================


// DRAW GOOGLE-CHART DIAGRAM ===========================================================================================

function drawGoogleChart() {
    let loading = $("#loading");
    let start = $('#start_date').val();
    let end = $('#end_date').val();
    let iso = $('#iso').val();
    loading.show();

    if ((start !== '') && (end !== '')) {
        let s = new Date(start).getTime();
        let e = new Date(end).getTime();
        let diff = e - s;
        let draw = $("#draw");

        if (diff > 24 * 60 * 60) {
            $('#start_date').css({
                'color': 'black',
                'font-weight': '',
                'border': 'solid 1px black'
            });
            draw.attr("disabled", 'true').css("background", '#666');

            let method = 'GET';
            let url = '/draw_graphic_ajax';
            let data = {
                'start_date': start,
                'end_date': end,
                'iso': iso,
            };

            let response = ajaxRequest(method, url, data);
            $('.load').css('height', 0);
            $("#loading").hide();

            chartDrowerHandler(response);
            draw.attr("disabled", false).css("background", '#449758');
        } else {
            $('#start_date').css({
                'color': '#ff0000',
                'font-weight': 'bold',
                'border': 'solid 2px red'
            });
        }
    }
}

function chartDrowerHandler(response) {
    google.charts.load('current', {packages: ['corechart', 'bar']});
    google.charts.setOnLoadCallback(
        function () {
            let data = Array(['Date', 'Rate', {role: 'style'}]);
            let style = 'fill-color : #005BED; stroke-color: #2100f8';

            for (let key in response) {
                let rate = parseFloat(response[key]);
                data.push([key, rate, style]);
            }
            let chartData = google.visualization.arrayToDataTable(data);


            let options = {
                title: 'Rates of days',
                focusTarget: 'category',
                hAxis: {
                    title: '',
                    textStyle: {
                        fontSize: 11,
                        color: '#aa033d',
                        bold: true,
                    },
                },
                vAxis: {
                    title: 'Rates',
                    textStyle: {
                        fontSize: 20,
                        color: '#016d25',
                        bold: true,
                    },
                    titleTextStyle: {
                        fontSize: 22,
                        color: '#1c015a',
                        bold: true,
                    }
                }
            };

            let attr = document.createAttribute('style');
            attr.value = "display: block; width: 100%; height: 600px";
            document.getElementById('curve_chart').setAttributeNode(attr);

            let chart_id = document.getElementById('curve_chart');
            let chart = new google.visualization.ColumnChart(chart_id);
            chart.draw(chartData, options);
        });
}

// DRAW GOOGLE-CHART DIAGRAM ===========================================================================================


// button setting ======================================================================================================
// dates validator =====================================================================================================

$(document).ready(function () {
    $('#draw').mouseover(function () {
        let start = $('#start_date').val();
        let end = $('#end_date').val();

        if (start !== '' && end !== '') {
            $('#draw').css({'cursor': 'pointer'}).enable();
        } else {
            $('#draw').css('cursor', 'not-allowed').disable();
        }
    });
});

// Readonly 'DRAW' button ==============================================================================================
