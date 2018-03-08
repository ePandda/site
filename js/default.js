// need to get full version of this code so we can modify
//function getPhyloPics(){var o=0,n=50,t=12;$.get("http://phylopic.org/api/a/image/count",function(e){o=e.result;var a=_.random(0,o-n);$.get("http://phylopic.org/api/a/image/list/"+a+"/"+n+"?options=uid+pngFiles+svgFile",function(o){var n=[],e=o.result,a=_.sampleSize(e,t);a.forEach(function(o){var t=o.pngFiles[0].url;n.push(t),$("#phylopics").append("<div class='col-4 col-3-s col-1-l col-2-m'><div class='phylo'><img src='http://phylopic.org"+t+"' /></div></div>").hide().fadeIn()})})})}function getApiStatus(){var o="OK";$("#status_APIstatus").text(o).hide().fadeIn();var n=moment(new Date).format("M/D/YYYY @ hh:MM a");$("#status_date").text(n).hide().fadeIn();var t={useEasing:!0,useGrouping:!0,separator:",",decimal:".",prefix:"",suffix:""},e=new CountUp("status_numRecords",0,numRecordsAll,0,1.5,t);e.start()}function demoQuery(){var o=["Paleozoic","Mesozoic","Cenozoic","Cambrian","Ordovician","Silurian","Devonian","Carboniferous","Permian","Triassic","Jurassic","Cretaceous","Paleogene","Holocene"],n=["Acanthocephala","Annelida","Arthropoda","Brachiopoda","Bryozoa","Chaetognatha","Chordata","Cnidaria","Ctenophora","Cycliophora","Echinodermata","Entoprocta","Gastrotricha","Gnathostomulida","Hemichordata","Kinorhyncha","Loricifera","Micrognathozoa","Mollusca","Nematoda","Nematomorpha","Nemertea","Onychophora","Orthonectida","Phoronida","Placozoa","Platyhelminthes","Porifera","Priapulida","Rhombozoa","Rotifera","Sipuncula","Tardigrada","Xenacoelomorpha"],t=_.sample(n),e=_.sample(o);$("#nowSearching_type").text(t),$("#nowSearching_era").text(e);var a=_.random(1,numRecordsAll),c={useEasing:!0,useGrouping:!0,separator:",",decimal:".",prefix:"",suffix:""},r=3.5,i=new CountUp("nowSearching_count",0,a,0,r,c);i.start();var d=new FlipWords("nowSearching_type",n,t,r);d.start();var p=new FlipWords("nowSearching_era",o,e,r);p.start()}var page="home",numRecordsAll=10865713,pageFunctions;

// original minified navigo script - navigo code is now in navigoScripts.js and was changed to always use hash
//$(document).ready(function(){var o,n=function(o){ return document.querySelector(o) },t=function(o){$("#"+o).empty()},e=function(o,n,t){$("#"+n).append(t||$("#"+o).html())},a=function(n){o=new Navigo(null,"hash"===n),o.on({home:function(){t("content-body"),e("component-headerlarge","content-body"),e("component-nav","content-body"),e("content-home","content-body"),e("component-nowsearching","content-body"),e("component-colorbars","content-body"),e("component-nsf","content-body"),e("component-footer","content-body"),getPhyloPics(),getApiStatus(),demoQuery()},examples:function(){t("content-body"),e("component-headerlarge","content-body"),e("component-nav","content-body"),e("content-examples","content-body"),e("component-footer","content-body")},reference:function(){t("content-body"),e("component-headerlarge","content-body"),e("component-nav","content-body"),e("content-reference","content-body"),e("component-footer","content-body")},sandbox:function(){t("content-body"),e("component-headerlarge","content-body"),e("component-nav","content-body"),e("content-sandbox","content-body"),e("component-footer","content-body")},about:function(){t("content-body"),e("component-headerlarge","content-body"),e("component-nav","content-body"),e("content-about","content-body"),e("component-footer","content-body")}}),o.on(function(){t("content-body"),e("component-headerlarge","content-body"),e("component-nav","content-body"),e("content-home","content-body"),e("component-nowsearching","content-body"),e("component-colorbars","content-body"),e("component-nsf","content-body"),e("component-footer","content-body"),getPhyloPics(),getApiStatus(),demoQuery()}),o.resolve()},c=function(){var t=n(".js-mode-trigger"),e="history-api",a=!!window.localStorage,c=function(o){t.querySelector("input").checked="hash"===o};return a&&(e=localStorage.getItem("navigo")||e),c(e),t.addEventListener("click",function(){e="history-api"===e?"hash":"history-api",a&&localStorage.setItem("navigo",e),window.location.href=(o.root||"").replace("#",""),setTimeout(function(){window.location.reload(!0)},200)}),e},r=function(){a(c())};window.onload=r});
var numRecordsAll;
var api_url;
$.ajax({
	url: "js/config.json",
	method: "GET",
	dataType: "json",
	async: false,
	success: function(json){
		api_url = json.api_url
	}
});

$(document).ready(function(){
	$.get('endpoint_doc.html', function(data){
		$('#content-documentation').text(data);
	});
	$.get('documentation.html', function(data){
		$('#content-documentation2').text(data);
	});
	$.get('examples.html', function(data){
		$('#content-examples').text(data);
	});
	$.get('bug_report.html', function(data){
		$('#sandboxContent').append(data);
	});
	//$.get('about_bug_report.html', function(data){
	//	$('#content-about').append(data);
	//});
	$.ajax({
		url: api_url + 'stats?totalRecords=1',
		method: "GET",
		dataType: "json",
		crossDomain: "true",
		success: function(data){
			numRecordsAll = data.results.totalRecords;
			getApiStatus(numRecordsAll);
		}
	});
});

// ====================================================================
// ======================================== google map for sandbox widget
// ====================================================================

  // Note: This example requires that you consent to location sharing when
  // prompted by your browser. If you see the error "The Geolocation service
  // failed.", it means you probably did not give permission for the browser to
  // locate you.
	var map, infoWindow;
	var geoRadius = 10;
	var markers = [];
	function initMap() {
		var initPos = {lat: 38.770792, lng: -104.320253 };
		map = new google.maps.Map(document.getElementById('map'), {
		  center: initPos,
		  zoom: 10
		});
		infoWindow = new google.maps.InfoWindow;
		infoWindow.setPosition(initPos);
		infoWindow.setContent('Please wait while we locate your position');
		infoWindow.open(map);
		map.setCenter(initPos);

		var input = document.getElementById('pac-input');
		var radius_input = document.getElementById('radius-input');
		var searchBox = new google.maps.places.SearchBox(input);
		map.controls[google.maps.ControlPosition.TOP_RIGHT].push(radius_input);
		map.controls[google.maps.ControlPosition.TOP_RIGHT].push(input);


        // Bias the SearchBox results towards current map's viewport.
        map.addListener('bounds_changed', function() {
          searchBox.setBounds(map.getBounds());
        });
       searchBox.addListener('places_changed', function() {
          var places = searchBox.getPlaces();
          if (places.length == 0) {
            return;
          }

          // For each place, get the icon, name and location.
          var bounds = new google.maps.LatLngBounds();
          places.forEach(function(place) {
            if (!place.geometry) {
              console.log("Returned place contains no geometry");
              return;
            }
            //plotSpecimen(map, infoWindow, place.geometry.location);
            var pos = {
			  lat: place.geometry.location.lat(),
			  lng: place.geometry.location.lng()
			};
            plotSpecimen(map, infoWindow, pos, geoRadius);

            if (place.geometry.viewport) {
              // Only geocodes have viewport.
              bounds.union(place.geometry.viewport);
            } else {
              bounds.extend(place.geometry.location);
            }
          });
          //map.fitBounds(bounds);
        });

		// Try HTML5 geolocation.
		if (navigator.geolocation) {
		  navigator.geolocation.getCurrentPosition(function(position) {
			var pos = {
			  lat: position.coords.latitude,
			  lng: position.coords.longitude
			};
			infoWindow.setPosition(pos);
			plotSpecimen(map, infoWindow, pos, geoRadius);
		  }, function() {
			handleLocationError(true, infoWindow, map.getCenter());
		  });
		} else {
		  // Browser doesn't support Geolocation
		  handleLocationError(false, infoWindow, map.getCenter());
		}
		map.addListener('dragend', function () {
			var idleListener = map.addListener('idle', function () {
				google.maps.event.removeListener(idleListener);
				var newpos = {
					  lat: map.getCenter().lat(),
					  lng: map.getCenter().lng()
					};
				plotSpecimen(map, infoWindow, newpos, geoRadius);
			});
		});
		// If radius changed, re-load markers
		jQuery('#radius-input').on('change', function(){

			var newGeoRadius = jQuery('#radius-input').val();
			if(newGeoRadius && newGeoRadius <= 100){
				for (var i = 0; i < markers.length; i++) {
					markers[i].setMap(null);
				}
				markers = [];

				var pos = {
					lat: map.getCenter().lat(),
					lng: map.getCenter().lng()
				};
				plotSpecimen(map, infoWindow, pos, newGeoRadius);
				geoRadius = newGeoRadius;
			} else {
				geoRadius = 10;
			}
		});
	}

	function handleLocationError(browserHasGeolocation, infoWindow, pos) {
		infoWindow.setPosition(pos);
		infoWindow.setContent(browserHasGeolocation ?
							  'Error: Please enable location sharing in your browser to use this tool.' :
							  'Error: Your browser doesn\'t support geolocation.');
		infoWindow.open(map);
	}

    function plotSpecimen(map, infoWindow, pos, geoRadius){
		var geoRadiusMeters = geoRadius * 1000;
		$.getJSON( api_url + 'es_occurrences?terms=geoPoint:' + pos.lat + ', ' + pos.lng + '&geoRadius=' + geoRadiusMeters +'&limit=500', function( data ) {
			var specimen_results = data;
			// add all the specimen points to the map
			for(var resKey in specimen_results.results){
				if(specimen_results.results[resKey]['matches'] !== null){
					placeSpecimenMarkers(specimen_results.results[resKey]['matches'], 	specimen_results.results[resKey]['matchType'], infoWindow);
				}
				placeSpecimenMarkers(specimen_results.results[resKey]['sources'], specimen_results.results[resKey]['sourceType'], infoWindow);
			}
			infoWindow.setPosition(pos);
			infoWindow.setContent(specimen_results.queryInfo.idigbioTotal + ' iDigBio specimens and ' + specimen_results.queryInfo.pbdbTotal + ' PBDB specimens found in this area');
			infoWindow.open(map);
			markers.push(infoWindow);
			map.setCenter(pos);

		});
	}
    function placeSpecimenMarkers(specimenResults, specimenType, infowindow) {
      var marker, i;
      var markerData = {};
	  for (var i = 0; i < specimenResults.length; i++) {
			var specimen = specimenResults[i];
			var scientificName = "";
			var spec_type = "";
			if(specimenType == 'idigbio'){
				var latlng = String(specimen["idigbio:geoPoint"]).split(',');

				var lat = latlng[0];
				var lng = latlng[1];
				if(specimen['dwc:scientificName']){
					scientificName = specimen['dwc:scientificName'];
				} else {
					if(specimen['dwc:genus']){
						scientificName = specimen['dwc:genus'];
						if(specimen["dwc:specificEpithet"]){
							scientificName = scientificName + ' ' + specimen['dwc:specificEpithet'];
						}
					}
				}
				if(specimen['dwc:basisOfRecord'] == "preservedspecimen"){
					spec_type = "(extant)";
				}else{
					spec_type = "(fossil)";
				}
				var hierTaxonomy = [];
				var hierTaxonomyDisplay = "";
				if (specimen["dwc:kingdom"]) {
					hierTaxonomy.push(specimen["dwc:kingdom"]);
				}
				if (specimen["dwc:phylum"]) {
					hierTaxonomy.push(specimen["dwc:phylum"]);
				}
				if (specimen["dwc:class"]) {
					hierTaxonomy.push(specimen["dwc:class"]);
				}
				if (specimen["dwc:order"]) {
					hierTaxonomy.push(specimen["dwc:order"]);
				}
				if (specimen["dwc:order"]) {
					hierTaxonomy.push(specimen["dwc:order"]);
				}
				if(hierTaxonomy.length){
					hierTaxonomyDisplay = "<div style='text-transform:capitalize;'>" + hierTaxonomy.join(" > ") + "</div>";
				}
			} else {
				var lat = specimen['lat'];
				var lng = specimen['lng'];
				if(specimen['accepted_name']){
					scientificName = specimen['accepted_name']
				}
				spec_type = "(fossil)"
			}
			var specimenLatLng = new google.maps.LatLng(lat,lng);
		 	scientificName = scientificName.toLowerCase();
			scientificName = scientificName.charAt(0).toUpperCase() + scientificName.slice(1);
			if(!markerData[specimenLatLng]){
				markerData[specimenLatLng] = {"coors" : specimenLatLng, "display" : []};
			}
			markerData[specimenLatLng]["display"].push("<div style='font-size:18px;'><b><i>" + scientificName + "</i></b> " + spec_type + "</div>" + hierTaxonomyDisplay + "<br/><a href='" + specimen["url"] + "' target='_blank'>" + specimen["url"] + "</a>");
			if(i == 500){
				break;
			}
		}
		var c = 0;
		for (var markerLatLng in markerData) {
			marker = new google.maps.Marker({
				position: markerData[markerLatLng]["coors"],
				map: map,
				title: c.toString()
			});
			markers.push(marker);
			var markerDisplay = markerData[markerLatLng]["display"].join("<br/><br/>");
			google.maps.event.addListener(marker, 'click', (function(marker, markerDisplay) {
				return function() {
					infowindow.setContent(markerDisplay);
				  	infowindow.open(map, marker);
				}
			})(marker, markerDisplay));
			c++;
		}
	}

// ====================================================================
// ======================================== PhyloPics - Home page
// ====================================================================

function getPhyloPics() {
    var numImgs = 0;
    var sampleSize = 50;
    var max = 12;

    $.get("http://phylopic.org/api/a/image/count", function(num) {

        numImgs = num.result;

        var start = _.random(0, numImgs - sampleSize);

        $.get("http://phylopic.org/api/a/image/list/" + start + "/" + sampleSize + "?options=uid+pngFiles+svgFile", function(data) {
            var urls = [];
            var dataset = data.result;
            // console.log(dataset);
            var data_reduced = _.sampleSize(dataset, max);

            data_reduced.forEach(function(i) {
                var url = i.pngFiles[0].url;
                urls.push(url);
                $("#phylopics").append("<div class='col-4 col-3-s col-1-l col-2-m'><div class='phylo'><img src='http://phylopic.org" + url + "' /></div></div>").hide().fadeIn();
            });

        });


    });
}

// ====================================================================
// ======================================== Get API status - Home page
// ====================================================================

function getApiStatus(numRecordsAll) {
	var status = "OK";
	$("#status_APIstatus").text(status).hide().fadeIn();

	var now = moment(new Date()).format("M/D/YYYY @ hh:MM a");
	$("#status_date").text(now).hide().fadeIn();

	var options = {  
		useEasing: true,
		  useGrouping: true,
		  separator: ',',
		  decimal: '.',
		  prefix: '',
		  suffix: ''
	};
	var numRecordsCount = new CountUp("status_numRecords", 0, numRecordsAll, 0, 1.5, options);
	numRecordsCount.start();
}
var hpLoaded = null;
function setHomePageStats() {
	var countUpOptions = {  
		useEasing: true,
		  useGrouping: true,
		  separator: ',',
		  decimal: '.',
		  prefix: '',
		  suffix: ''
	};


	$.ajax({
		url: api_url + 'stats?totalRecords=1',
		method: "GET",
		dataType: "json",
		crossDomain: "true",
		success: function(data){
			var totalRecords = data.results.totalRecords;
			var totalRecordsCount = new CountUp("nowSearching_count", 0, totalRecords, 0, 1.5, countUpOptions);
			totalRecordsCount.start();
		}
	});
	$.ajax({
		url: api_url + 'stats?taxonomies=1',
		method: "GET",
		dataType: "json",
		crossDomain: "true",
		success: function(data){
			var taxonomyRecords = data.results.taxonomies;
			var taxonomyRecordsCount = new CountUp("nowSearching_taxonomies", 0, taxonomyRecords, 0, 1.5, countUpOptions);
			taxonomyRecordsCount.start();
		}
	});
	$.ajax({
		url: api_url + 'stats?localities=1',
		method: "GET",
		dataType: "json",
		crossDomain: "true",
		success: function(data){
			var localityRecords = data.results.localities;
			var localityRecordsCount = new CountUp("nowSearching_localities", 0, localityRecords, 0, 1.5, countUpOptions);
			localityRecordsCount.start();
		}
	});
}

// ====================================================================
// ======================================== IDB Image Widget
// ====================================================================

function getTaxaImages(taxon, taxonRank, limit, page){

	var taxonURL = api_url + 'es_occurrences?terms=' + taxonRank + ':' + taxon + '&returnMedia=true&limit=500&taxonMatchLevel=' + taxonRank;
	var counter = 0;
	var rowCounter = 0;
	var offset = page * 12;
	var tempString = '';
	var pageString = '';
	var mediaURIs = [];
	$('#idbImages').html("<h1> <i class='fa fa-cog fa-spin fa-fw'></i><i class='fa fa-cog fa-spin fa-fw'></i><i class='fa fa-cog fa-spin fa-fw'></i> Loading...</h1>");
	$.ajax({
		url: taxonURL,
		method: "GET",
		dataType: "json",
		crossDomain: "true",
		success: function(data){
			$('#idbImages').html('');
			var results = data.results;
			for(group in results){
				var result = results[group];
				var mediaArray = null;
				if(result['sourceType'] == 'idigbio'){
					mediaArray = result.sources;
				} else {
					mediaArray = result.matches;
				}
				if(mediaArray){
					for(var j = 0; j < mediaArray.length; j++){
						var idigbio = mediaArray[j];
						if('mediaURLs' in idigbio){
							for(var k = 0; k < idigbio['mediaURLs'].length; k++){
								mediaURIs.push([idigbio['url'], idigbio['mediaURLs'][k]])
							}
						}
					}
				}
			}
			var mediaCount = mediaURIs.length;
			if(mediaCount == 0){
				$('#idbImages').html('<div class="coll-full"><h3>No Image Results for that term</h3></div>');
				$('#idbPagingPrev').html('');
				$('#idbPagingText').html('');
				$('#idbPagingNext').html('');
				return false;
			}
			var imageWidth = $('#idbImages').width();
			$('#idbImages').html('<div id="imageWrapper"><div id="imageCarousel"></div></div>');
			mediaURIs.forEach(function(uri){

				$('[src="'+ uri[1] + '"]').error(function(){
						var replaceDiv = $('[src="'+ uri[1] + '"]').parent();
						replaceDiv.html('<div class="imagePlaceholder"><i class="fa fa-image fa-5x"></i><br/>Unable to load image:<br/><a href="' + uri[1] + '">' + uri[1] + '</a></div><a href="' + uri[0] + '" target="_blank" ">iDigBio Record</a>');
				});
				tempString += '<div class="col-4 imageResult"><img src="' + uri[1] + '"/><a href="' + uri[0] + '" target="_blank" ">iDigBio Record</a></div>';
				rowCounter++;
				if(rowCounter % 3 == 0){
					pageString += '<div class="row">' + tempString + "</div>";
					tempString = '';
				}
				counter++;
				if(counter % 12 == 0){
					$('#imageCarousel').append('<div class="carouselPage" style="width:'+imageWidth+'px">' + pageString + '</div>');
					pageString = '';
				}

			});
			if(rowCounter % 3 != 0){
				pageString += '<div class="row">' + tempString + "</div>";
			}
			if(counter % 12 != 0){
				$('#imageCarousel').append('<div class="carouselPage" style="width:'+imageWidth+'px">' + pageString + '</div>');
			}
			var pages = Math.ceil(mediaCount/limit);
			$("#imageCarousel").width(pages*imageWidth);
			if($('#idbPagingPrev').html() == ''){
				$('#idbPagingPrev').html('<button class="button pagingButton disabled" onclick="scrollImages(-'+imageWidth+', '+pages+'); return false;">Prev</button>');
			}
			$('#idbPagingText').html('<h5>Page 1/' + pages + '</h5>');
			if($('#idbPagingNext').html() == ''){
				$('#idbPagingNext').html('<button class="button pagingButton" onclick="scrollImages('+imageWidth+', '+pages+'); return false;">Next</button>');
			}
		}
	});
}

function scrollImages(width, pages){
	var currentPos = $('#imageWrapper').scrollLeft();
	$('#imageWrapper').scrollLeft(currentPos+width);
	var movePos = $('#imageWrapper').scrollLeft();
	var page = (Math.ceil(movePos/Math.abs(width)))+1;
	$('#idbPagingText').html('<h5>Page ' + page + '/' + pages + '</h5>');
	$('#idbPagingNext .pagingButton').removeClass('disabled');
	$('#idbPagingPrev .pagingButton').removeClass('disabled');
	if(movePos+width >= pages*Math.abs(width)){
		$('#idbPagingNext .pagingButton').addClass('disabled');
	}
	if(movePos <= 0){
		$('#idbPagingPrev .pagingButton').addClass('disabled');
	}
	console.log(currentPos, currentPos+width, pages*width)
}

function urlChecker(url, callback) {
	$.ajax({
		url: url,
		dataType: 'jsonp',
		type: 'HEAD',
		crossDomain: true,
		complete: function(xhr){
			callback.apply(this, [xhr.status]);
		}
	});
  //var img = new Image();
  //img.onload = function() { callback(true); };
  //img.onerror = function() { callback(false); };
  //img.src = url;
}

// ====================================================================
// ======================================== Bug Report Email
// ====================================================================

function enabledBugButton(email, msg, subj){
	if(email == true && msg == true && subj == true){
		$('#bugReportButton').prop('disabled', false);
	} else {
		$('#bugReportButton').prop('disabled', true);
	}
}

function sendBugReport(){
	if($("#bugReport").serialize() == 'email=&subject=&message='){
		var sendData = $("#aboutBugReport").serialize();
	} else {
		var sendData = $("#BugReport").serialize();
	}
	$.ajax({
		url: api_url + 'bugReport',
		method: "POST",
		data: sendData,
		dataType: "json",
		crossDomain: "true",
		success: function(data){
			if(data.status == 'SENT'){
				$('#bugReportSent').html('<h3>Message Sent</h3>');
			} else {
				$('#bugReportSent').html('<h3 class="failure">Message Not Sent</h3>');
			}
			setTimeout(function(){
				var bugFields = document.querySelectorAll('.field');
				bugFields.forEach(function(field){
					field.value = '';
				});
				$('.field').removeClass('validElement');
				$('#bugReportButton').prop('disabled', true);
				$('#bugReportSent').text('');
			}, 10000);
		}
	});
}
