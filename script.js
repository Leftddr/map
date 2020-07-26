document.addEventListener('DOMContentLoaded', function(){

    let map;
    var currentTypeId;
    var markers = [];

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
        } else if (maptype === 'use_district') {
            changeMaptype = kakao.maps.MapTypeId.USE_DISTRICT;           
        }
        if(currentTypeId){
            map.removeOverlayMapTypeId(currentTypeId);
        }
        map.addOverlayMapTypeId(changeMaptype);
        currentTypeId = changeMapType;
    })

    let infowindow;
    document.querySelector("#map_search_btn").addEventListener('click', function(){
        var search_word = document.querySelector("#map_search").value;
        var ps = new kakao.maps.services.Places();
        infowindow = new kakao.maps.InfoWindow({zIndex:1});

        if(!search_word.replace(/^\s+|\s+$/g, '')){
            alert("키워드를 입력하세요");
            return;
        }

        ps.kewwordSearch(search_word, function(data, status, pagination){
            if(status === kako.maps.services.Status.OK){
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
})