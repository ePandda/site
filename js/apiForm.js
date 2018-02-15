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

function renderFormDropdown(container, formContainer){
	$.ajax({
		url: api_url + '/es_occurrences',
		method: "GET",
		dataType: "json",
		crossDomain: "true",
		formContainer: formContainer,
		success: function(data){
			//var select = 'Choose a form to query the API: <select name="endpoint" id="endpoint" onChange="renderForm($(\'#endpoint\').val(), \'' + this.formContainer + '\');">';
			for (var i = 0; i < data.routes.length; i++) {
				var optionInfo = data.routes[i];
				var endpoint = optionInfo.url.replace("/", "");
				if(endpoint && (endpoint !== "query") && (endpoint !== "stats")){
					select += "<option value='" + endpoint + "'>" + optionInfo.name + "</option>\n";
					if(endpoint == 'occurrences'){
						// load the form for the occurrence Search
						// This is the most general and best introduction
						renderForm(endpoint, formContainer);
					}
				}
			}
			select += "</select>";
			$(container).html(select);
			$('#endpoint').val('occurrences');
		}
	});
}
function renderForm(endpoint, container){
	console.log(endpoint, container, api_url);
	$.ajax({
		url: api_url + endpoint,
		method: "GET",
		dataType: "json",
		crossDomain: "true",
		success: function(data){
			console.log(data);
			$(container + ' #apiFormLabel').text(data.name);
			$(container + ' #apiFormDescription').text(data.description);
			$(container + ' #apiFormElements').text("");
			for (var i = 0; i < data.params.length; i++) {
				var elementInfo = data.params[i];
				if(elementInfo.display == false){ continue; }
				var formElement = "<div class='form-group'><div class='form-bottom'><label><b>" + elementInfo.label + "</b><br/><small>" + elementInfo.description + "</small></label>\n";
				switch(elementInfo.type) {
					case "text":
						formElement += "<div><input type='text' name='" + elementInfo.name + "' class='form-element'></div>";
						break;
					case "boolean":
						formElement += "<div><input type='checkbox' name='" + elementInfo.name + "' class='form-element epanddaCheckbox' value='true'></div>";
						break;
					case "integer":
						formElement += "<div><input type='number' name='" + elementInfo.name + "' class='form-element' value='true'></div>";
						break;
					default:
						break;
				}
				formElement += "</div></div>";
				$(container + ' #apiFormElements').append(formElement);

			}

			$(container + ' #apiFormElements').append("<input type='hidden' name='endpoint' value='" + endpoint + "'>");
		}
	});
}

function toggleForm(formID){
	$(formID).toggle();
	if($(formID).is(":visible")){
		$('#searchCollapse').html('[ &mdash; ]');
	} else {
		$('#searchCollapse').html('[ + ]');
	}
}

function processForm(formData, resultContainer, limit, offset){
	var apiParams = "";
	for (var i = 0; i < formData.length; i++){
		if(formData[i]['name'] == 'endpoint'){
			var endpoint = formData[i]['value'];
		}else{
			if(formData[i]['value']){
				if(apiParams){
					apiParams += "&";
				}
				apiParams += formData[i]['name']  + "=" + encodeURIComponent(formData[i]['value']);
			}
		}
	}
	if(apiParams){
		//if geoPoint is passed, make sure there is a radius
		if (apiParams.indexOf("geoPoint") >= 0){
			if (apiParams.indexOf("geoRadius") < 0){
				apiParams += "&geoRadius=1000";
			}
		}

        clearResults(resultContainer);
        $(resultContainer + ' #apiUIResultsContainer').html("<h1> <i class='fa fa-cog fa-spin fa-2x fa-fw'></i> Loading...</h1>");
		$.ajax({

			url: api_url + endpoint + "?" + apiParams,
			method: "GET",
			dataType: "json",
			crossDomain: "true",
			success: function(data){
				console.log(data);
				$(resultContainer + ' #apiResultsLabel').html('Search Results');
				var totalResults = data.queryInfo.idigbioTotal + data.queryInfo.pbdbTotal
				$(resultContainer + ' #apiResultsCounts').html("Total Results: " + totalResults + "<br/>iDigBio Results: " + data.queryInfo.idigbioTotal + "<br/>PaleoBiology Database Results: " + data.queryInfo.pbdbTotal);
				$(resultContainer + ' #apiResultsURL').html("<b>URL:</b><br/><pre>https://localhost:5000/" + endpoint + "?" + decodeURIComponent(apiParams) + "</pre>");
				$(resultContainer + ' #apiResultsJSONLabel').html('Full JSON Results');
				$(resultContainer + ' #apiResultsButtons').html('<div class="col-3 no-padding firstResultButton"><button class="resultDisplay" onClick="$(\'#apiUIResultsContainer\').show(); $(\'#apiResultsJSON\').hide();"><h4>List</h4></button></div><div class="col-3 no-padding"><button class="resultDisplay" onClick="$(\'#apiUIResultsContainer\').hide(); $(\'#apiResultsJSON\').show();"><h4>JSON</h4></button></div>');
				$(resultContainer + ' #apiResultsJSON').html("<pre style='margin-top:0'>" + JSON.stringify(data.results, null, 2) + "</pre>");
				listHTML = returnUIResults(data);
				$('#apiUIResultsContainer').html(listHTML);
				$('#apiUIResultsContainer').css("border", "1px solid #d7d7d7");
				//if((data.counts.idbCount > limit && data.counts.idbCount > offset+100) || (data.counts.pbdbCount > limit && data.counts.pbdbCount > offset+100)){
				//	var newOffset = offset + 100;
				//	var idbResults = data.counts.idbCount;
				//	var pbdbResults = data.counts.pbdbCount;
				//	idbResults < newOffset ? idbLimit = idbResults : idbLimit = newOffset+100;
				//	pbdbResults < newOffset ? pbdbLimit = pbdbResults : pbdbLimit = newOffset+100;
				//	$('#apiLoadAdditionalResult').html('<button class="additionalResultButton" onClick="processForm($(\'#apiForm\').serializeArray(), \'#apiResultsContainer\', 100, ' + newOffset + '); return false;"><h4>Load Results<br/>IDB: ' + newOffset + '-' + idbLimit + '<br/>PBDB: ' + newOffset + '-' + pbdbLimit + '</h4></button>');
				//}
			},
			error: function (jqXHR, exception) {
				var msg = '';
				if (jqXHR.status === 0) {
					msg = 'Not connect.\n Verify Network.';
				} else if (jqXHR.status == 404) {
					msg = 'Requested page not found. [404]';
				} else if (jqXHR.status == 500) {
					msg = 'Internal Server Error [500].';
				} else if (exception === 'parsererror') {
					msg = 'Requested JSON parse failed.';
				} else if (exception === 'timeout') {
					msg = 'Time out error.';
				} else if (exception === 'abort') {
					msg = 'Ajax request aborted.';
				} else {
					msg = 'Uncaught Error.\n' + jqXHR.responseText;
				}
				$(resultContainer + ' #apiResultsCounts').html("");
				$(resultContainer + ' #apiResultsURL').html("");
				$(resultContainer + ' #apiResultsJSON').html("");
				$(resultContainer + ' #apiResultsLabel').html('There were errors: ' + msg);
			}
		});
	}else{
		alert("Please enter search terms");
	}
}
function clearResults(resultContainer){
	$(resultContainer + ' #apiResultsLabel').html('');
	$(resultContainer + ' #apiResultsCounts').html('');
	$(resultContainer + ' #apiResultsURL').html('');
	$(resultContainer + ' #apiResultsJSON').html('');
	$(resultContainer + ' #apiUIResultsContainer').html('');
	$('#apiUIResultsContainer').css("border", "none");
	$(resultContainer + ' #apiResultsButtons').html('');
	$('#apiLoadAdditionalResult').html('');
}

function returnUIResults(data){
	matches = []
	listHTML = '<div id="apiUIResultsList">';
	var matchCount = 1;
	for(var key in data.results){
		var match = data.results[key]
		listHTML += '<div class="row"><div class="col-12">';
		listHTML += '<h3 class="matchHeader">Match ' + matchCount + "</h3><h5>Match Criteria</h5>";
		for(var key in match.fields){
			var criteria = match.fields[key]
			if(typeof(criteria) == 'object' && match.sourceType == 'idigbio'){
				console.log(typeof(criteria));
				var subCriteria = '';
				for(var subKey in criteria){
					subCriteria += subKey + ": " + criteria[subKey] + ' ';
				}
				criteria = subCriteria;
			}
			listHTML += "<strong>" + key.charAt(0).toUpperCase() + key.slice(1) + "</strong>: " + criteria + "<br/>";
		}
		listHTML += '</div></div><div class="row"><div class="col-6"><h5>' + match.sourceType + ' Sources</h5>';
		if(match.sources.length > 0){
			match.sources.forEach(function(src){
				listHTML += '<div class="row">';
				if(match.sourceType == 'idigbio'){
					listHTML += '<div class="col-6">' + src['dwc:scientificName'] + "</div>";
					listHTML += '<div class="col-6"><a href="' + src['url'] + '" target="_blank">' + src['idigbio:uuid'] + "</a></div>";
				} else {
					listHTML += '<div class="col-6">' + src['accepted_name'] + "</div>";
					listHTML += '<div class="col-6"><a href="' + src['url'] + '" target="_blank">' + src['occurrence_no'] + "</a></div>";
				}
				listHTML += '</div>';

			});
			listHTML += '<div class="row"><div class="col-12"><button class="searchMore" onClick=\'expandSearch("sourceQuery", ' + JSON.stringify(match.fullSourceQuery) + ', "#apiMoreContainer", "' + match.matchType + '"); return false;\'>See All Source Records</button></div></div>';
		}
		listHTML += '</div><div class="col-6"><h5>'+ match.matchType + ' Matches</h5>';
		if(match.matches != null){
			if(match.matches.length > 0){
				match.matches.forEach(function(mtc){
					listHTML += '<div class="row">';
					if(match.matchType == 'idigbio'){
						listHTML += '<div class="col-6">' + mtc['dwc:scientificName'] + "</div>";
						listHTML += '<div class="col-6"><a href="' + mtc['url'] + '" target="_blank">' + mtc['idigbio:uuid'] + "</a></div>";
					} else {
						listHTML += '<div class="col-6">' + mtc['accepted_name'] + "</div>";
						listHTML += '<div class="col-6"><a href="' + mtc['url'] + '" target="_blank">' + mtc['occurrence_no'] + "</a></div>";
					}
					listHTML += '</div>';
				});
				listHTML += '<div class="row"><div class="col-12"><button class="searchMore" onClick=\'expandSearch("matchQuery", ' + JSON.stringify(match.fullMatchQuery)+ ', "#apiMoreContainer", "' + match.matchType + '"); return false;\'>See All Matching Records</button></div></div>';
			} else {
				listHTML += '<h6>No Matches Found</h6>';
			}
		} else {
			listHTML += '<h6>Not enough criteria found in these source records to create accurate matches</h6>';
		}
		listHTML += '</div></div>';
		matchCount += 1;
	}
	listHTML += '</div>';
	return listHTML;
}

function expandSearch(type, query, moreContainer, recordType){
	$(moreContainer + ' #apiUIMoreContainer').html("<h1> <i class='fa fa-cog fa-spin fa-2x fa-fw'></i> Loading...</h1>");
	var currentY = $(window).scrollTop();
	$(window).scrollTop(currentY+500);

	$.ajax({

		url: api_url + '/full_match_results?' + type + '=' + query,
		method: "GET",
		dataType: "json",
		crossDomain: "true",
		success: function(data){
			$(moreContainer + ' #apiMoreLabel').html('Expanded Search Results');
			$(moreContainer + ' #apiMoreCounts').html("Total Results: " + data.total);
			$(moreContainer + ' #apiResultsURL').html("<b>URL:</b><br/><pre>https://api.epandda.org/full_match_results?" + type + '=' + query + "</pre>");
			$(moreContainer + ' #apiMoreJSONLabel').html('Full JSON Results');
			$(moreContainer + ' #apiMoreButtons').html('<div class="col-3 no-padding firstResultButton"><button class="resultDisplay" onClick="$(\'#apiUIMoreContainer\').show(); $(\'#apiMoreJSON\').hide();"><h4>List</h4></button></div><div class="col-3 no-padding"><button class="resultDisplay" onClick="$(\'#apiUIMoreContainer\').hide(); $(\'#apiMoreJSON\').show();"><h4>JSON</h4></button></div>');
			$(moreContainer + ' #apiMoreJSON').html("<pre style='margin-top:0'>" + JSON.stringify(data.results, null, 2) + "</pre>");
			listHTML = returnMoreResults(data, recordType);
			$('#apiUIMoreContainer').html(listHTML);
			$('#apiUIMoreContainer').css("border", "1px solid #d7d7d7");
		},
		error: function (jqXHR, exception) {
			var msg = '';
			if (jqXHR.status === 0) {
				msg = 'Not connect.\n Verify Network.';
			} else if (jqXHR.status == 404) {
				msg = 'Requested page not found. [404]';
			} else if (jqXHR.status == 500) {
				msg = 'Internal Server Error [500].';
			} else if (exception === 'parsererror') {
				msg = 'Requested JSON parse failed.';
			} else if (exception === 'timeout') {
				msg = 'Time out error.';
			} else if (exception === 'abort') {
				msg = 'Ajax request aborted.';
			} else {
				msg = 'Uncaught Error.\n' + jqXHR.responseText;
			}
			$(moreContainer + ' #apiMoreCounts').html("");
			$(moreContainer + ' #apiMoreURL').html("");
			$(moreContainer + ' #apiMoreJSON').html("");
			$(moreContainer + ' #apiMoreLabel').html('There were errors: ' + msg);
		}
	});
}

function returnMoreResults(data, recordType){
	matches = []
	listHTML = '<div id="apiUIMoreList">';
	var matchCount = 1;
	console.log(data.total);
	data.results.forEach(function(res){
		listHTML += '<div class="row"><div class="col-12">';
		if(recordType == 'idigbio'){
				listHTML += '<div class="col-6">' + res['dwc:scientificName'] + "</div>";
				listHTML += '<div class="col-6"><a href="' + res['url'] + '" target="_blank">' + res['idigbio:uuid'] + "</a></div>";
		} else {
			listHTML += '<div class="col-6">' + res['accepted_name'] + "</div>";
			listHTML += '<div class="col-6"><a href="' + res['url'] + '" target="_blank">' + res['occurrence_no'] + "</a></div>";
		}
		listHTML += '</div></div>';
	});
	listHTML += '</div>';
	return listHTML;
}
