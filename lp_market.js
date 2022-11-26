let faction;
let factionName;
let corp;
let corpName;
let server = 'serenity';

$(function () {
    get_lp_factions_list();
});

function get_lp_factions_list() {
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            var g = JSON.parse(xmlhttp.responseText);
            var list = $("ul#faction_list");
            var faction_list = Object.keys(g["message"]["data"]);
            var t;
            for (var i = 0; i < faction_list.length; i++) {
                var a = $(
                    '<a class="dropdown-item" href="#" onclick="update_lp_corp_select(this)"></a>'
                ).text(g["message"]["data"][faction_list[i]]);
                a.attr("factionID", faction_list[i]);
                var t = $("<li></li>").append(a);
                list.append(t);
            }
        }
    };
    xmlhttp.open("GET", "http://101.34.37.178/loyalty/faction/list/");
    xmlhttp.send();
}

function exp_change(b) {
    if (b == 'serenity') {
        $("#lp_server_btn").text("服务器：国服");
    } else {
        $("#lp_server_btn").text("服务器：欧服");
    };
    server = b;
}

function update_lp_corp_select(th) {
    var ntt = $(th).attr("factionID");
    if (ntt != undefined) {
        faction = +ntt;
    } else {
        return;
    }
    factionName = $(th).text();
    $("#faction_list_btn").text($(th).text());
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            var g = JSON.parse(xmlhttp.responseText);
            var list = $("ul#corp_list").text("");
            var t;
            for (var i = 0; i < g["message"]["data"].length; i++) {
                var a = $(
                    '<a class="dropdown-item" href="#" onclick="update_corp_select(this)"></a>'
                ).text(g["message"]["data"][i]["corp_name"]);
                a.attr("corpId", g["message"]["data"][i]["corp_id"]);
                var t = $("<li></li>").append(a);
                list.append(t);
            }
        }
    };
    xmlhttp.open("GET", "http://101.34.37.178/loyalty/faction/" + faction + "/");
    xmlhttp.send();
}

function update_corp_select(th) {
    var ntt = $(th).attr("corpId");
    if (ntt != undefined) {
        corp = +ntt;
    } else {
        return;
    }
    $("#corp_list_btn").text($(th).text());
    corpName = $(th).text();
    $("img").remove(".lp_selection_img");
    $("#lp_selection a").text(factionName + "-" + corpName);
    $("#lp_selection").prepend(
        '<img height="32" width="32" class="lp_selection_img" src="' +
        "https://image.evepc.163.com/Corporation/" +
        corp +
        '_32.png" style="margin-right:10px;">'
    );
}

function get_corp_data() {
    if (!(corpName == undefined && factionName == undefined)) {
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = function () {
            if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
                var g = JSON.parse(xmlhttp.responseText)['message']['data'];
                var nxmlhttp = new XMLHttpRequest();
                var tc = new Array();
                for (var ti = 0; ti < g.length; ti++) {
                    if (!tc.includes(g[ti]['type_id'])) {
                        tc.push(g[ti]['type_id'])
                    }
                }
                nxmlhttp.onreadystatechange = function () {
                    if (nxmlhttp.readyState == 4 && nxmlhttp.status == 200) {
                        // inner http response
                        var name_data = JSON.parse('{}')
                        var nxmlresp = JSON.parse(nxmlhttp.responseText)
                        for (var ni = 0; ni < nxmlresp.length; ni++) {
                            if (nxmlresp[ni]['category'] == 'inventory_type') {
                                name_data[nxmlresp[ni]['id']] = nxmlresp[ni]['name'];
                            }
                        }
                        // outer http response
                        var tb = $('tbody#lp_table_body');
                        tb.text('');
                        var line;
                        for (var i = 0; i < g.length; i++) {
                            line = $('<tr onclick="chart_drawer(' + g[i]['offer_id'] + ',' + g[i]['type_id'] + ',\'' + name_data[g[i]['type_id']] + '\')"></tr>');
                            line.attr('offerId', g[i]['offer_id'])
                                .append(
                                    $('<td align="center"></td>').text(g[i]['offer_id']),
                                    $('<td colspan="3" align="left"></td>').append($('<img height="32" width="32" src="https://image.evepc.163.com/Type/' + g[i]['type_id'] + '_32.png">'),
                                        $('<a align="center"></a>').text(name_data[g[i]['type_id']])),
                                    $('<td align="center"></td>').text(g[i]['quantity']),
                                    $('<td align="right"></td>').text(g[i]['lp_cost']),
                                    $('<td align="right"></td>').text(g[i]['isk_cost']),
                                    $('<td align="right"></td>').text(g[i]['required_items']['sell']['min'].toFixed(2)),
                                    $('<td align="right"></td>').text(g[i]['required_items']['buy']['max'].toFixed(2)),
                                    $('<td align="right"></td>').text(g[i]['products']['sell']['min'].toFixed(2)),
                                    $('<td align="right"></td>').text(g[i]['products']['buy']['max'].toFixed(2)),
                                    $('<td align="right"></td>').text(g[i]['profit']['per_point']['max'].toFixed(2)),
                                    $('<td align="right"></td>').text(g[i]['profit']['per_point']['min'].toFixed(2)),
                                )
                            tb.append(line);
                        }
                    }
                }
                nxmlhttp.open('POST', 'https://esi.evepc.163.com/latest/universe/names/?datasource=serenity');
                nxmlhttp.send('[' + tc.toString() + ']');
            }
        };
        xmlhttp.open("GET", "http://101.34.37.178/loyalty/market/corp/" + corp + "/sorted/?from=min&server=" + server);
        xmlhttp.send();
    }
}

function chart_drawer(offer_id, prod_id, prod_name) {
    $("body").append($('<div class="charts row" id="mainChart" style="padding: 0px;"></div>')
        .append($('<div class="card bg-light text-dark" style="height: 100%; padding: 0px;"></div>')
            .append($('<div class="card-header" style="height: 50px;"</div>')
                .append($('<img height="32" width="32" src="https://image.evepc.163.com/Type/' + prod_id + '_32.png">'),
                    $('<a align="center"></a>').text(offer_id.toString() + '-' + prod_name),
                    $('<span class="badge bg-secondary" style="float: right; align-self: center; margin: 6px; cursor: pointer;" onclick="chart_close()"></span>').text('CLOSE')),
                $('<div class="card-body" style="height: calc(100% - 50px); padding: 10px;"></div>').append('<div id="mChart" style="height: calc(100% - 20px); width: calc(100% - 20px);"></div>'))));
    var chart = echarts.init(document.getElementById('mChart'));
    var opt = {
        title: { text: 'Offer - ' + prod_name + '(' + prod_id.toString() + ')' },
        tooltip: {},
        legend: { data: ['最大收益', '常规收益'] }
    }
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            var g = JSON.parse(xmlhttp.responseText)['message']['data'];
            var date_list = new Array();
            var price_list = { 'max': [], 'min': [] };
            for (var i = 0; i < g.length; i++) {
                date_list.push(g[i]['date']);
                price_list['max'].push(g[i]['profit']['point']['max']);
                price_list['min'].push(g[i]['profit']['point']['min'])
            };
            opt['xAxis'] = { data: date_list };
            opt['yAxis'] = { type: 'value' };
            opt['series'] = [{
                    name: '最大收益',
                    type: 'line',
                    data: price_list['max']
                },
                {
                    name: '常规收益',
                    type: 'line',
                    data: price_list['min']
                }
            ];
            chart.setOption(opt)
        }
    };
    xmlhttp.open("GET", 'http://101.34.37.178/loyalty/market/offer/'+ offer_id +'/history/?from=min&server=' + server);
    xmlhttp.send()
}

function chart_close() {
    $('div.charts#mainChart').remove();
}
