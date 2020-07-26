document.addEventListener('DOMContentLoaded', function(){

    let map;
    var currentTypeId;
    var markers = [];

    var route_url = "http://openapi.gbis.go.kr/ws/rest/busrouteservice";
    var bus_station = "http://ws.bus.go.kr/api/rest/arrive/getArrInfoByRouteAll";
    var route_key = "aZyc1Eibkz0Spmkj4oqrF%2Bd8k1FK0maWmCZn4bor%2FDTRyfHz3cPaQ1wfh8DBWx8GwBuC4d19onos3Gw6WozScA%3D%3D";
    var list_for_route_id = [];

    document.querySelector("#map_visible").addEventListener('click', function(){
        $("#map").css('height', 700);
        var container = document.querySelector("#map");
        var options = {
            center : new kakao.maps.LatLng(33.450701, 126.570667),
            level : 3
        };
        map = new kakao.maps.Map(container, options);
    })

    document.querySelector("#map_change").addEventListener('click', function(){
        if(map == undefined) return;
        var mapType = document.querySelector("#map_change_options").value;
        let changeMapType;
        if(mapType === 'traffic'){
            changeMaptype = kakao.maps.MapTypeId.TRAFFIC;  
        } else if(mapType === 'roadview'){
            changeMaptype = kakao.maps.MapTypeId.ROADVIEW;
        } else if(mapType === 'terrain'){
            changeMaptype = kakao.maps.MapTypeId.TERRAIN;
        } else if (mapType === 'use_district') {
            changeMaptype = kakao.maps.MapTypeId.USE_DISTRICT;           
        }
        if(currentTypeId){
            map.removeOverlayMapTypeId(currentTypeId);
        }
        map.addOverlayMapTypeId(changeMaptype);
        currentTypeId = changeMapType;
    })

    let infowindow;
    /*
    document.querySelector("#map_search_btn").addEventListener('click', function(){
        var search_word = document.querySelector("#map_search").value;
        var ps = new kakao.maps.services.Places(); 
        infowindow = new kakao.maps.InfoWindow({zIndex:1});

        if(!search_word.replace(/^\s+|\s+$/g, '')){
            alert("키워드를 입력하세요");
            return;
        }

        ps.keywordSearch(search_word, function(data, status, pagination){
            if(status === kakao.maps.services.Status.OK){
                displayPlaces(data);
                displayPagination(pagination);
            } else if(status === kakao.maps.services.Status.ZERO_RESULT){
                alert("검색 결과가 존재하지 않습니다");
                return;
            } else if(status === kakao.maps.services.Status.ERROR){
                alert('검색 결과 중 오류 발생');
                return;
            }
        });
    })
    */

    function displayPlaces(places){
        var listEl = document.querySelector('#placesList');
        menuEi = document.querySelector('#menu_wrap'),
        fragment = document.createDocumentFragment(),
        bounds = new kakao.mpas.LatLngBounds(),
        listStr = '';

        removeAllNodes(listEl);

        removeMarker();

        for(var i = 0 ; i < places.length ; i++){
            marker = addMarker(placePosition, i),
            itemEl = getListItem(i, places[i]);

            bounds.extend(placePosition);

            (function(marker, title) {
                kakao.maps.event.addListener(marker, 'mouseover', function() {
                    displayInfowindow(marker, title);
                });
    
                kakao.maps.event.addListener(marker, 'mouseout', function() {
                    infowindow.close();
                });
    
                itemEl.onmouseover =  function () {
                    displayInfowindow(marker, title);
                };
    
                itemEl.onmouseout =  function () {
                    infowindow.close();
                };
            })(marker, places[i].place_name);
            fragment.appendChild(itemEl);
        }

        listEl.appendChild(fragment);
        menuEl.scrollTop = 0;
        map.setBounds(bounds);
    }

    function getListItem(index, places) {

        var el = document.createElement('li'),
        itemStr = '<span class="markerbg marker_' + (index+1) + '"></span>' +
                    '<div class="info">' +
                    '   <h5>' + places.place_name + '</h5>';
    
        if (places.road_address_name) {
            itemStr += '    <span>' + places.road_address_name + '</span>' +
                        '   <span class="jibun gray">' +  places.address_name  + '</span>';
        } else {
            itemStr += '    <span>' +  places.address_name  + '</span>'; 
        }
                     
          itemStr += '  <span class="tel">' + places.phone  + '</span>' +
                    '</div>';           
    
        el.innerHTML = itemStr;
        el.className = 'item';
    
        return el;
    }

    function addMarker(position, idx, title) {
        var imageSrc = 'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker_number_blue.png', // 마커 이미지 url, 스프라이트 이미지를 씁니다
            imageSize = new kakao.maps.Size(36, 37),  
            imgOptions =  {
                spriteSize : new kakao.maps.Size(36, 691), 
                spriteOrigin : new kakao.maps.Point(0, (idx*46)+10), 
                offset: new kakao.maps.Point(13, 37) 
            },
            markerImage = new kakao.maps.MarkerImage(imageSrc, imageSize, imgOptions),
                marker = new kakao.maps.Marker({
                position: position, 
                image: markerImage 
            });
    
        marker.setMap(map); 
        markers.push(marker); 
    
        return marker;
    }

    function removeMarker() {
        for ( var i = 0; i < markers.length; i++ ) {
            markers[i].setMap(null);
        }   
        markers = [];
    }

    function displayPagination(pagination) {
        var paginationEl = document.getElementById('pagination'),
            fragment = document.createDocumentFragment(),
            i; 
    
        while (paginationEl.hasChildNodes()) {
            paginationEl.removeChild (paginationEl.lastChild);
        }
    
        for (i=1; i<=pagination.last; i++) {
            var el = document.createElement('a');
            el.href = "#";
            el.innerHTML = i;
    
            if (i===pagination.current) {
                el.className = 'on';
            } else {
                el.onclick = (function(i) {
                    return function() {
                        pagination.gotoPage(i);
                    }
                })(i);
            }
    
            fragment.appendChild(el);
        }
        paginationEl.appendChild(fragment);
    }

    function displayInfowindow(marker, title){
        var content = '<div style="padding:5px;z-index:1;">' + title + '</div>';
        infowindow.setContent(content);
        infowindow.open(map, marker);
    }

    function removeAllNodes(el){
        while(el.hasChildNodes()){
            el.removeChild(el.lastChild);
        }
    }

    function getData(){
        return new Promise(function(resolve, reject){
             var bus_num = document.querySelector("#bus_text").value;
             var xhr = new XMLHttpRequest();
             var queryParams = '?' + encodeURIComponent('serviceKey') + '=' + route_key;
             queryParams += '&' + encodeURIComponent('keyword') + '=' + encodeURIComponent(bus_num);
             xhr.open('GET', route_url + queryParams);
             xhr.onreadystatechange = function(){
                 if(this.readyState == 4){
                     resolve(xhr.responseXML);
                 }
             }
             xhr.send('');
        });
    }
 
    function processing(){
        list_for_route_id.length = 0;
        getData().then(function(data){
         document.querySelector("#result").innerHTML = "";
            var route_name = data.getElementsByTagName("regionName");
            var route_id = data.getElementsByTagName("routeId");
            var result = "";
            for(let i = 0 ; i < route_name.length ; i++){
                 result += '<div id = result' + i + ' style = "border:1px solid black">';
                 result += '<p style = "font-size:10px">' + route_name[i].childNodes[0].nodeValue + '</p>';
                 result += '</div>';  
                 list_for_route_id.push(route_id[i].childNodes[0].nodeValue);
            }
            document.querySelector("#result").innerHTML = result;
 
            for(let i = 0 ; i < route_name.length ; i++){
                 document.querySelector("#result" + i).addEventListener('click', function(){
                     get_bus_station(list_for_route_id[i]);
                 });
             }
        })
    }

    function get_bus_station(route_id){
        var pro = new Promise(function (resolve, reject){
            var xhr = new XMLHttpRequest();
            var queryParams = '?' + encodeURIComponent('serviceKey') + '=' + route_key;
            queryParams += '&' + encodeURIComponent('busRouteId') + '=' + encodeURIComponent(route_id);
            xhr.open('GET', bus_station + queryParams);
            xhr.onreadystatechange = function(){
                if(this.readyState == 4){
                    resolve(xhr.responseXML);
                }
            }
            xhr.send('');
        });
        pro.then(function(data){
            var arrMsg = data.getElementsByTagName("arrmsg1");
            var rtNm = data.getElementsByTagName("rtNm");
            var stId = data.getElementsByTagName("stId");
            var stNm = data.getElementsByTagName("stNm");

            var result = "";
            for(let i = 0 ; i < arrMsg.length ; i++){
                result += '<div id = result' + i + ' style = "border:1px solid black">';
                result += '<p style = "font-size:10px">' + 'arrMsg : ' + arrMsg[i].childNodes[0].nodeValue + '</br>' + 'rtNm : ' + rtNm[i].childNodes[0].nodeValue + '</br>' + 'stId : ' 
                + stId[i].childNodes[0].nodeValue + '</br>' + 'stNm : ' + stNm[i].childNodes[0].nodeValue + '</p>';
                result += '</div>';
            }
            document.querySelector("#result").innerHTML = result;

            for(let i = 0 ; i < arrMsg.length ; i++){
                document.querySelector("#result" + i).addEventListener('click', function(){
                    if(map == undefined) return;
                    var search_word = stNm[i].childNodes[0].nodeValue;
                    var ps = new kakao.maps.services.Places(); 
                    infowindow = new kakao.maps.InfoWindow({zIndex:1});

                    if(!search_word.replace(/^\s+|\s+$/g, '')){
                        alert("키워드를 입력하세요");
                        return;
                    }

                    ps.keywordSearch(search_word, function(data, status, pagination){
                    if(status === kakao.maps.services.Status.OK){
                        displayPlaces(data);
                        displayPagination(pagination);
                    } else if(status === kakao.maps.services.Status.ZERO_RESULT){
                        alert("검색 결과가 존재하지 않습니다");
                        return;
                    } else if(status === kakao.maps.services.Status.ERROR){
                        alert('검색 결과 중 오류 발생');
                        return;
                    }
                });
                });
            }
        })
    }

    document.querySelector("#bus_info").addEventListener('click', function(){
        processing();
    })
})