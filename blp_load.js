let category;
let categoryName;
let blp;
let blpName;
let expand = false;

$(function() {
    get_blp_category_list();
});

function get_blp_data() {
    if (blp == undefined) {
        $('#blp_card_body').text('加载失败');
    }
    else {
        var xmlhttp = new XMLHttpRequest();
        var type_id_list = [];
        xmlhttp.onreadystatechange=function() {
            if (xmlhttp.readyState==4 && xmlhttp.status==200){
                var g = JSON.parse(xmlhttp.responseText);
                var materials = false;
                var dtkeys = Object.keys(g['message']['data']['activities']);
                if (dtkeys.includes('manufacturing')) {
                    materials = g['message']['data']['activities']['manufacturing']['materials']
                } else if (dtkeys.includes('reaction')) {
                    materials = g['message']['data']['activities']['reaction']['materials']
                } else {
                    $('#blp_card_body').text('无材料数据');
                }
                if (materials != false) {
                    var list_group = $('<ul class="list-group" id="mainListGroup"></ul>');
                    for (var j=0; j<materials.length; j++) {
                        var list_item = $('<li class="list-group-item" id="listItem" type_id="'+ materials[j]['typeID'] +'"></li>');
                        list_item.append($('<img height="32" width="32" src="https://image.evepc.163.com/Type/'+materials[j]['typeID']+'_32.png" style="margin-right: 10px;">'));
                        list_item.append($('<a align="center"></a>').text(materials[j]['typeID']));
                        list_item.append($('<span class="badge bg-secondary" style="float: right; align-self: center; height: calc(100% - 4px); margin: 6px;"></span>').text(materials[j]['quantity']));
                        list_group.append(list_item);
                        type_id_list = type_id_list.concat(materials[j]['typeID']);
                    }
                    $('#blp_card_body').text('');
                    $('#blp_card_body').append($('<div style="overflow-y: auto;overflow-x: hidden;height: 100%;"></div>').append(list_group));
                }
                var nhttp = new XMLHttpRequest();
                var id_mp = {}
                nhttp.onreadystatechange=function() {
                    if (nhttp.readyState==4 && nhttp.status==200){
                        var names = JSON.parse(nhttp.responseText);
                        for (var ff=0; ff<names.length; ff++) {
                            if (names[ff]['category'] == 'inventory_type') {
                                id_mp[names[ff]['id']] = names[ff]['name'];
                            }
                        }
                        $("ul#mainListGroup li#listItem").each(function(){
                            tpi = $(this).attr("type_id");
                            if (Object.keys(id_mp).includes(tpi)) {
                                $(this).children("a").text(id_mp[tpi]);
                            } else {
                                $(this).children("a").text(tpi);
                            }
                        })
                    }
                };
                nhttp.open('POST', 'https://esi.evepc.163.com/latest/universe/names/?datasource=serenity');
                nhttp.send('['+type_id_list.toString()+']');
                // alert(type_id_list)
            } else {
                $('#blp_card_body').text('加载失败');
            }
        }
        xmlhttp.open("GET", "http://101.34.37.178/blp/data/" + blp + "/normal/");
        xmlhttp.send();
    }
}

function get_blp_category_list() {
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange=function() {
        if (xmlhttp.readyState==4 && xmlhttp.status==200){
            var g = JSON.parse(xmlhttp.responseText);
            var list = $('ul#category_list');
            var t;
            for (var i=0; i<g['message']['data'].length; i++) {
                var a = $('<a class="dropdown-item" href="#" onclick="update_blp_category_select(this)"></a>').text(g['message']['data'][i]['categoryName'])
                a.attr('categoryID', g['message']['data'][i]['categoryID']);
                var t = $('<li></li>').append(a);
                list.append(t);
            }
        }
    }
	xmlhttp.open("GET", "http://101.34.37.178/blp/category/list/");
	xmlhttp.send();
}

function update_blp_category_select(th) {
    var ntt = $(th).attr('categoryID')
    if (ntt != undefined){
        category = +ntt;
    } else {
        return;
    }
    categoryName = $(th).text();
    $('#category_list_btn').text($(th).text());
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange=function() {
        if (xmlhttp.readyState==4 && xmlhttp.status==200){
            var g = JSON.parse(xmlhttp.responseText);
            var list = $('ul#blp_list').text('');
            var t;
            for (var i=0; i<g['message']['data'].length; i++) {
                var a = $('<a class="dropdown-item" href="#" onclick="update_blp_select(this)"></a>').text(g['message']['data'][i]['type_name'])
                a.attr('blueprintID', g['message']['data'][i]['type_id']);
                var t = $('<li></li>').append(a);
                list.append(t);
            }
        }
    }
	xmlhttp.open("GET", "http://101.34.37.178/blp/category/" + category + "/");
	xmlhttp.send();
}

function update_blp_select(th) {
    var ntt = $(th).attr('blueprintID')
    if (ntt != undefined) {
        blp = +ntt;
    } else {
        return;
    }
    $("#blp_list_btn").text($(th).text());
    blpName = $(th).text();
    $('img').remove('.blp_selection_img');
    $('#blp_selection a').text(categoryName + '-' + blpName);
    $('#blp_selection').prepend('<img height="32" width="32" class="blp_selection_img" src="'+'https://image.evepc.163.com/Type/'+blp+'_32.png" style="margin-right:10px;">');
}

function exp_change(b) {
    if (b) {
        alert('Not Completed Yet.')
    } else {
        expand = b;
        $("#blp_expand_btn").text('是否展开：否');
    }
}
