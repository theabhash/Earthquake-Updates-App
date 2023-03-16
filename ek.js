/**
 * Created by Alturist 
 */

var markers;
var markerList;
var earthquake;
var map;
var element;
var counter_dmgapi=true;
var curreet_ek;
var curreet_ek_geo;
all();


function all() {
    var parameter = $('#textbox_id')[0].value + "&minmagnitude=" + $('#select_id')[0].value;

    $.getJSON("http://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=" + parameter + "&minlatitude=24&minlongitude=78&maxlatitude=31&maxlongitude=91&orderby=time", function (data) {
       // console.log(data);
        earthquake = data.features;
        console.log(earthquake);

        populate_list();
        draw_map();

        jQuery( "#mapPage" ).on( "pageshow", function( event ) {
            setTimeout(function () {
                map.invalidateSize({animate: false});
            }, 3); } );


    $.ajax({
        url: "https://www.kimonolabs.com/api/ckx6fpq8?apikey=FtDE8WstE5D9xZj50O0B1wn4txcWidrO",
        crossDomain: true,
        dataType: "jsonp",
        success: function (response) {

            var data = response.results.collection1;
            add_dmg_marker(data);
            if(counter_dmgapi) {
                counter_dmgapi=false;
            populate_dmglist(data);
            };
        },
        error: function (xhr, status) {
            $(".optional").remove();
        }
    });

    });

};

function draw_map(){

    var southWest = L.latLng(23, 77),
        northEast = L.latLng(32, 92),
        mybounds = L.latLngBounds(southWest, northEast);

    map = L.map('map',{
        maxBounds: mybounds,
        maxZoom: 18,
        minZoom: 6,
    }).setView([27.6, 85.7], 8);

    // add an OpenStreetMap tile layer
    L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

 //   element.height(element.height() - 42);
    draw_marker();

};

function geodesic(x1,y1,x2,y2){
    y1=y1*Math.PI/180;
    y2=y2*Math.PI/180;
    var dx =(x2-x1)*Math.PI/180;
    var dy = (y2-y1);
    var R = 6371.009;
    var a=Math.pow(Math.sin(dy/2),2)+Math.cos(y1)*Math.cos(y2)*Math.sin(dx/2)*Math.sin(dx/2);
    var c= 2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a));
    var d =R*c;
    var dxm= (x2+x1)/2;
    // var dxmRadian = dxm*Math.PI/180;
//    var d = R*Math.sqrt(dx*dx + Math.pow(dy*Math.cos(dxmRadian),2));
    return d;

};

function draw_marker(){

    markers = new L.MarkerClusterGroup();
    markerList = [];
    for (var i = 0; i < earthquake.length; i++) {
        //  var a = stations[i];
        var marker = L.marker(L.latLng(earthquake[i].geometry.coordinates[1], earthquake[i].geometry.coordinates[0]));
        marker.fillColor="red";
        var time=new Date(earthquake[i].properties.time);
        marker.bindPopup('<a href="#detailsPage" class="popupdetail" data-transition="pop" data-id='+i+'>'+earthquake[i].properties.title+'</a>');
        markerList.push(marker);
    }
    map.removeLayer(markerList);
    map.removeLayer(markers);

    markers.addLayers(markerList);
    map.addLayer(markers);
};

function populate_list(){
//    $('li.ui-li-has-count').remove();
    $('#ekList').empty();

    var iteration;

    var number=  $('#text-basic')[0].value;

    if (earthquake.length>number) {
        iteration =number;
    } else {
        iteration=earthquake.length;
    }


    for (i = 0; i < iteration; i++) {
        $('#ekList').append('<li><a href="#detailsPage" data-transition="slide" data-id='+i+ '">' +

            '<h5>' + earthquake[i].properties.place + '</h5>' +
            '<p>' + new Date(earthquake[i].properties.time) + '</p>' +

            '<span class="ui-li-count">' + "M " + earthquake[i].properties.mag + '</span>' +


            '</a></li>').listview('refresh');

        //   console.log(station.weather[0].description);

    };
    $( "ul li:first").find("p").css( "color", "red" );
};

$(document).on('pagebeforeshow', '#detailsPage', function(){
    var latitude=parseFloat(curreet_ek_geo[1]);
    var longitude=parseFloat(curreet_ek_geo[0]);
    var dis_ktm=  Math.round(geodesic(longitude,latitude,85.340914,27.686578));
    $('#ektitle').html(curreet_ek.title);
    $('#ekcdi').html(curreet_ek.cdi);
    $('#ekdate').html(new Date(curreet_ek.time));
    $('#ekmag').html(curreet_ek.mag+curreet_ek.magType);
    $('#eklatitude').html(latitude);
    $('#eklongitude').html(longitude);
    $('#eksig').html(curreet_ek.sig);
    $('#ekdis').html(dis_ktm+ ' KM from Kathmandu (Department of Survey)');



});

$(document).on('vclick', '#ekList li a', function(){
    var id = parseInt($(this).attr('data-id'));

    curreet_ek=earthquake[id].properties;
    curreet_ek_geo=earthquake[id].geometry.coordinates;
});

$(document).on('vclick', '.popupdetail', function(){
    var id = parseInt($(this).attr('data-id'));

    curreet_ek=earthquake[id].properties;
    curreet_ek_geo=earthquake[id].geometry.coordinates;
});
$(document).bind('vclick', '#maplink', function(){
    var center=[]
    center.push(curreet_ek_geo[1]);
    center.push(curreet_ek_geo[0]);
    map.setView(center,16);
});

$( "#submit" ).bind( "click", function(event, ui) {
    $( "#mypanel" ).panel( "close" );
 //   element.height(element.height() + 42);
    map.remove();
       all();


});

function add_dmg_marker(data){
    //Define icon

    var ekIcon = L.icon({
        iconUrl: 'ek.png',
        iconSize: [25, 25]
    });


    markerList2 = [];
    for (var i = 0; i < data.length; i++) {
        console.log(data[i]);
        var marker = L.marker(L.latLng(data[i].latitude, data[i].longitude), {title: 'as', icon: ekIcon});
        marker.riseOnHover = true;
        marker.title = 'as';
        marker.bindPopup(data[i].magnitude+" ML magnitude Epicenter "+data[i].epicenter.text+"<br>"+data[i].date+" "+data[i].time+" local time");
        markerList2.push(marker);
        var ek_DMG = L.layerGroup(markerList2);
        //  ek_DMG.addTo(map);

    }
    var name='EQ after '+$('#textbox_id')[0].value+" & Mag"+ $('#select_id')[0].value+"+ (USGS)";
    var overlayMaps = {
        "Recent 10 EQ ML4+ (DMG)": ek_DMG
    };
    overlayMaps[name] = markers;

    $("#usgseq").html(name);
    L.control.layers('', overlayMaps).addTo(map);

};

function populate_dmglist(data){

    $('#dmglist-table tbody').empty();
    for (i = 0; i < data.length; i++) {
        $('#dmglist tbody').append('<tr><td>'+data[i].epicenter.text+'</td>' +
            '<td>'+data[i].date+'</td><td>'+data[i].time+'</td>'+'<td>'+data[i].magnitude+
            '</tr>')

                 };
    $( '#dmglist-table:visible' ).table( "refresh" );

};
