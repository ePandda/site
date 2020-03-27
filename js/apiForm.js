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

function renderEndpoints(endpointContainer, formContainer){
	$.ajax({
		url: api_url + '/',
		method: "GET",
		dataType: "json",
		crossDomain: "true",
		formContainer: formContainer,
		success: function(data){
		    for (var i = 0; i < data.routes.length; i++) {
				var optionInfo = data.routes[i];
				var endpoint = optionInfo.url.replace("/", "");
				var endpointRow = '';
				if(endpoint && (endpoint == "occurrences" || endpoint == "publications")){
				    endpointRow += '<div id="endpointRow_' + endpoint + '" class="row endpointHeader"><div class="col-12 col-3-m"><H2>' + optionInfo.name + '</H2></div>';
				    endpointRow += '<div class="col-9 col-7-m col-8-xl"><p>' + optionInfo.description + '</p></div>';
				    endpointRow += '<div class="col-3 col-2-m col-1-xl"><h3><button type="button" class="searchCollapse" id="searchCollapse_' + endpoint + '" onClick="toggleForm(\'' + endpoint + '\', \'#apiForm\');">[ &mdash; ]</button></h3></div></div>';
					$(endpointContainer).append(endpointRow);
					if(endpoint == "occurrences"){
						renderForm(endpoint, formContainer);
						$('#endpointRow_' + endpoint).addClass('activeSearch');
					} else {
						$('#searchCollapse_' + endpoint).html('[ + ]')
					}
				}
			}
		}
	});
}
function renderForm(endpoint, container){
	$('#apiFormElements').html('');
	$('#apiForm').data('endpoint', endpoint);
	$.ajax({
		url: api_url + '/' + endpoint,
		method: "GET",
		dataType: "json",
		crossDomain: "true",
		success: function(data){
			var groups = ['search', 'match', 'settings'];
			var groupInfo = {
				'search': {
					'title': 'Search parameters'
				},
				'match': {
					'title': 'Data matching options'
				},
				'settings': {
					'title': 'Additional settings'
				}
			};
			for(var gi in groups) {
				var g = groups[gi];
				
				var groupContent = '';
				for (var i = 0; i < data.params.length; i++) {
					var elementInfo = data.params[i];
					
					if(elementInfo.formGroup !== g) { continue; }
					if(elementInfo.display == false){ continue; }
					
					var formElement = "<div class='row form-group'><div class='col-12'><label><h4>" + elementInfo.label + "</h4></label>";
					formElement += "<small>" + elementInfo.description + "</small></div>"
					switch(elementInfo.type) {
						case "text":
							if(elementInfo['validOptions'] && Array.isArray(elementInfo['validOptions'])) {
								formElement += "<div class='col-4 offset-8'><select name='" + elementInfo.name + "' class='field'>";
								
								if (!elementInfo.mustBeSet) {
									formElement += "<option value=''>-</option>";
								}	
								for(var x in elementInfo['validOptions']) {
									var o = elementInfo['validOptions'][x];
									formElement += "<option value='" + o + "'>" + o + "</option>";	
								}
								
								formElement += "</select></div>";
							} else {
								formElement += "<div class='col-12'><input type='text' name='" + elementInfo.name + "' class='field'></div>";
							}
							break;
						case "boolean":
							formElement += "<div class='col-12'><input type='checkbox' name='" + elementInfo.name + "' class='epanddaCheckbox' value='true'></div>";
							break;
						case "integer":
							formElement += "<div class='col-12'><input type='number' name='" + elementInfo.name + "' class='field' value='true'></div>";
							break;
						default:
							break;
					}
					formElement += "</div>";
					
					groupContent += formElement;
				}
				
				$(container + ' #apiFormElements').append("<div class='row form-group'><div class='col-12'><label><h2>" + groupInfo[g].title + "</h2></label>" + groupContent + "</div></div>");
			}
			$('#apiButton').html('<button id="searchButton" class="button" onClick="processForm($(\'#apiForm\').serializeArray(), \'#apiResultsContainer\', 25, 1, null, null, false); toggleForm(\'' + endpoint + '\', \'#apiForm\'); return false;">Search</button>')
			$(container + ' #apiFormElements').append("<input type='hidden' name='endpoint' value='" + endpoint + "'>");
		}
	});
}

function toggleForm(endpoint, formID, forceOpen=false){
	if(($(formID).data("endpoint") && $(formID).data("endpoint") != endpoint) || forceOpen){
		$('#searchCollapse_' + endpoint).html('[ &mdash; ]');
		$('#endpointRow_' + endpoint).addClass('activeSearch');
		if(!forceOpen) renderForm(endpoint, '#apiFormContainer');
		if($(formID).is(":visible") == false){
			$(formID).toggle();
		}
		$('.searchCollapse').not($('#searchCollapse_' + endpoint)).each(function(){
			$(this).html('[ + ]');
		})
		$('.endpointHeader').not($('#endpointRow_' + endpoint)).each(function(){
			$(this).removeClass('activeSearch');
		})
	} else {
		if($(formID).is(":visible")){
			$('#searchCollapse_' + endpoint).html('[ + ]');
			$('#endpointRow_' + endpoint).removeClass('activeSearch');
		} else {
			$('#searchCollapse_' + endpoint).html('[ &mdash; ]');
			$('#endpointRow_' + endpoint).addClass('activeSearch');
		}
		$(formID).toggle();
	}
}

function processForm(formData, resultContainer, limit, page, idigbioSearchAfter, pbdbSearchAfter, append){
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
		if(idigbioSearchAfter && idigbioSearchAfter != 'none'){
			apiParams+= '&idigbioSearchAfter=[' + idigbioSearchAfter + ']';
		}
		if(pbdbSearchAfter && pbdbSearchAfter != 'none'){
			apiParams+= '&pbdbSearchAfter=[' + pbdbSearchAfter + ']';
		}
		if(limit){
			apiParams+= '&limit='+limit;
		}
		if(append == false){
			clearResults(resultContainer);
			$(resultContainer + ' #apiUIResultsContainer').html("<h1> <i class='fa fa-cog fa-spin fa-2x fa-fw'></i> Loading...</h1>");
		} else {
			$('#apiAdditionalLoading').html("<h1> <i class='fa fa-cog fa-spin fa-2x fa-fw'></i> Loading...</h1>");
		}


		window.history.pushState({'endpoint': endpoint}, "Search results", "#sandbox");
		
		$.ajax({

			url: api_url + '/' + endpoint + "?" + apiParams,
			method: "GET",
			dataType: "json",
			crossDomain: "true",
			success: function(data){
				$(resultContainer + ' #apiResultsLabel').html('Search Results');
				var totalResults = data.queryInfo.idigbioTotal + data.queryInfo.pbdbTotal
				$(resultContainer + ' #apiResultsCounts').html("Total Results: " + totalResults + "<br/>iDigBio Results: " + data.queryInfo.idigbioTotal + "<br/>PaleoBiology Database Results: " + data.queryInfo.pbdbTotal);
				$(resultContainer + ' #apiDownloadData').html(data.downloadData ? "Download data as ZIP: <a href='" + data.downloadData + "'>" + data.downloadData + "</a>" : "");
				
				$(resultContainer + ' #apiResultsURL').html("<b>URL:</b><br/><pre>https://api.epandda.org/" + endpoint + "?" + (apiParams) + "</pre>");
				$(resultContainer + ' #apiResultsJSONLabel').html('Full JSON Results');
				$(resultContainer + ' #apiResultsButtons').html('<div class="col-3 no-padding firstResultButton"><button class="resultDisplay" onClick="$(\'#apiUIResultsContainer\').show(); $(\'#apiResultsJSON\').hide();"><h4>List</h4></button></div><div class="col-3 no-padding"><button class="resultDisplay" onClick="$(\'#apiUIResultsContainer\').hide(); $(\'#apiResultsJSON\').show();"><h4>JSON</h4></button></div>');
				$(resultContainer + ' #apiResultsJSON').html("<pre style='margin-top:0'>" + JSON.stringify(data.results, null, 2) + "</pre>");
				if(append == false){
					listHTML = returnUIResults(data);
					$('#apiUIResultsContainer').html(listHTML);
				} else {
					appendUIResults(data);
				}
				$('#apiUIResultsContainer').css("border", "1px solid #d7d7d7");
				var nextPage = page + 1;
				var idbPageStart = page*25;
				var idbPageEnd = (page+1)*25;
				var idbNext = ''
				if(idbPageStart < data.queryInfo.idigbioTotal){
					idbNext += 'iDigBio Records: ' + idbPageStart + '-';
					if(idbPageEnd < data.queryInfo.idigbioTotal){
						idbNext += idbPageEnd;
					} else {
						idbNext += data.queryInfo.idigbioTotal
					}
				}
				var pbdbPageStart = page*25;
				var pbdbPageEnd = (page+1)*25;
				var pbdbNext = ''
				if(pbdbPageStart < data.queryInfo.pbdbTotal){
					pbdbNext += 'PBDB Records: ' + pbdbPageStart + '-';
					if(pbdbPageEnd < data.queryInfo.pbdbTotal){
						pbdbNext += pbdbPageEnd;
					} else {
						pbdbNext += data.queryInfo.pbdbTotal
					}
				}
				var idb_more = '\'none\'';
				var pbdb_more = '\'none\'';
				if(data.queryInfo.idigbioTotal > idbPageStart){
					idb_more = data.idigbio_search_after;
				}
				if(data.queryInfo.pbdbTotal > pbdbPageStart){
					pbdb_more = data.pbdb_search_after
				}

				if(pbdbNext || idbNext){
					var buttonText = "Load " + idbNext + ' ' + pbdbNext;
					$('#apiLoadAdditionalResult').html('<button class="button" id="appendMore" onClick="processForm($(\'#apiForm\').serializeArray(), \'#apiResultsContainer\', 25, '+nextPage+', '+idb_more+', '+pbdb_more+', true);">' + buttonText + '</button>');
				} else {
					$('#apiLoadAdditionalResult').html('');
				}
				$('#apiAdditionalLoading').html("");
			},
			error: function (jqXHR, exception) {
				var errorMsg = JSON.parse(jqXHR.responseText);
				for (var line in errorMsg.errors){
					var errorLine = errorMsg.errors[line];
					break;
				}
				var msg = '';
				if (jqXHR.status === 0) {
					msg = 'Not connect.\n Verify Network.<br/>' + errorLine;
				} else if (jqXHR.status == 404) {
					msg = 'Requested page not found. [404]';
				} else if (jqXHR.status == 500) {
					msg = 'Internal Server Error [500].<br/>' + errorLine;
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
		listHTML += '<div id="'+key+'" class="row"><div class="col-12">';
		listHTML += '<h3 class="matchHeader">Match ' + matchCount + "</h3><h5>Match Criteria</h5>";
		for(var fieldKey in match.fields){
			var criteria = match.fields[fieldKey]
			if(typeof(criteria) == 'object' && match.sourceType == 'idigbio'){
				var subCriteria = '';
				for(var subKey in criteria){
					subCriteria += subKey + ": " + criteria[subKey] + ' ';
				}
				criteria = subCriteria;
			}
			listHTML += "<strong>" + fieldKey.charAt(0).toUpperCase() + fieldKey.slice(1) + "</strong>: " + criteria + "<br/>";
		}
		listHTML += '</div></div><div class="row"><div class="col-6"><h5>' + match.sourceType + ' Sources</h5><div id="'+key+'Sources">';
		if(match.sources.length > 0){
			match.sources.forEach(function(src){
				listHTML += '<div id="' + src['url'] + '"class="row src_rcrd">';
				if(match.sourceType == 'idigbio'){
					listHTML += '<div class="col-6">';
					if(src['idigbio:hasImage'] == 'true'){
						listHTML += '<i class="fa fa-camera"></i> ';
					}
					if(src['idigbio:geoPoint']){
						listHTML += '<i class="fa fa-globe"></i> ';
					}
					listHTML += src['dwc:scientificName'] + '</div>';
					listHTML += '<div class="col-6"><a href="' + src['url'] + '" target="_blank">' + src['idigbio:uuid'] + "</a></div>";

				} else {
					listHTML += '<div class="col-6">';
					if(src['lat'] && src['lng']){
						listHTML += '<i class="fa fa-globe"></i> ';
					}
					listHTML += src['accepted_name'] + "</div>";

					var record_id = src['occurrence_no'];
					if(src['reference_no']){
						record_id = src['reference_no']
					}
					listHTML += '<div class="col-6"><a href="' + src['url'] + '" target="_blank">' + record_id + "</a></div>";
				}
				listHTML += '</div>';

			}); 
			listHTML += '</div><div class="row"><div class="col-12"><button class="searchMore" onClick=\'expandSearch("sourceQuery", ' + JSON.stringify(match.fullSourceQuery) + ', "#apiMoreContainer", "' + match.sourceType + '"); return false;\'>See All Source Records</button></div></div>';
		}
		listHTML += '</div><div class="col-6"><h5>'+ match.matchType + ' Matches</h5><div id="'+key+'Matches">';
		if(match.matches != null){
			if(match.matches.length > 0){
				match.matches.forEach(function(mtc){
					listHTML += '<div class="row">';
					if(match.matchType == 'idigbio'){
						listHTML += '<div class="col-6">';
						if(mtc['idigbio:hasImage'] == 'true'){
							listHTML += '<i class="fa fa-camera"></i> ';
						}
						if(mtc['idigbio:geoPoint']){
							listHTML += '<i class="fa fa-globe"></i> ';
						}
						listHTML += mtc['dwc:scientificName'] + '</div>';
						listHTML += '<div class="col-6"><a href="' + mtc['url'] + '" target="_blank">' + mtc['idigbio:uuid'] + "</a></div>";
					} else {
						listHTML += '<div class="col-6">';
						if(mtc['lat'] && mtc['lng']){
							listHTML += '<i class="fa fa-globe"></i> ';
						}
						listHTML += mtc['accepted_name'] + "</div>";
						var record_id = mtc['occurrence_no'];
						if(mtc['reference_no']){
							record_id = mtc['reference_no']
						}
						listHTML += '<div class="col-6"><a href="' + mtc['url'] + '" target="_blank">' + record_id + "</a></div>";
					}
					listHTML += '</div>';
				});
				listHTML += '</div><div class="row"><div class="col-12"><button class="searchMore" onClick=\'expandSearch("matchQuery", ' + JSON.stringify(match.fullMatchQuery)+ ', "#apiMoreContainer", "' + match.matchType + '"); return false;\'>See All Matching Records</button></div></div>';
			} else {
				listHTML += '<h6>No Matches Found</h6></div>';
			}
		} else {
			listHTML += '<h6>Not enough criteria found in these source records to create accurate matches</h6></div>';
		}
		listHTML += '</div></div>';
		matchCount += 1;
	}
	listHTML += '</div>';
	return listHTML;
}

function appendUIResults(data){
	var matchList = []
	$('#apiUIResultsList').children(':nth-child(odd)').each(function(group){
		var matchID = $(this).attr('id');
		matchList.push(matchID);
	});
	var matchCount = matchList.length + 1;
	for(var key in data.results){
		var match = data.results[key]
		if(matchList.indexOf(key) > -1){
			var srcList = []
			$('#' + key + 'Sources').children('.src_rcrd').each(function(src_chk){
				var srcID = $(this).attr('id');
				srcList.push(srcID);
			})
			var sourceText = $('#'+key+'Sources').html();
			if(match.sources.length > 0){
				match.sources.forEach(function(src){
					var newRow = '';
					if(srcList.indexOf(src['url']) > -1){ return; }
					newRow += '<div id="' + src['url'] + '"class="row src_rcrd">';
					if(match.sourceType == 'idigbio'){
						newRow += '<div class="col-6">';
						if(src['idigbio:hasImage'] == 'true'){
							newRow += '<i class="fa fa-camera"></i> ';
						}
						if(src['idigbio:geoPoint']){
							newRow += '<i class="fa fa-globe"></i> ';
						}
						newRow += src['dwc:scientificName'] + '</div>';
						newRow += '<div class="col-6"><a href="' + src['url'] + '" target="_blank">' + src['idigbio:uuid'] + "</a></div>";

					} else {
						newRow += '<div class="col-6">';
						if(src['lat'] && src['lng']){
							newRow += '<i class="fa fa-globe"></i> ';
						}
						newRow += src['accepted_name'] + "</div>";
						newRow += '<div class="col-6"><a href="' + src['url'] + '" target="_blank">' + src['occurrence_no'] + "</a></div>";
					}
					newRow += '</div>';
					sourceText += newRow;
				});
			}
			$('#'+key+'Sources').html(sourceText);
		} else {
			var newGroup = '';
			newGroup += '<div id="'+key+'" class="row"><div class="col-12">';
			newGroup += '<h3 class="matchHeader">Match ' + matchCount + "</h3><h5>Match Criteria</h5>";
			for(var key in match.fields){
				var criteria = match.fields[key]
				if(typeof(criteria) == 'object' && match.sourceType == 'idigbio'){
					var subCriteria = '';
					for(var subKey in criteria){
						subCriteria += subKey + ": " + criteria[subKey] + ' ';
					}
					criteria = subCriteria;
				}
				newGroup += "<strong>" + key.charAt(0).toUpperCase() + key.slice(1) + "</strong>: " + criteria + "<br/>";
			}
			newGroup += '</div></div><div class="row"><div class="col-6"><h5>' + match.sourceType + ' Sources</h5>';
			if(match.sources.length > 0){
				match.sources.forEach(function(src){
					newGroup += '<div id="' + src['url'] + '"class="row src_rcrd">';
					if(match.sourceType == 'idigbio'){
						newGroup += '<div class="col-6">';
						if(src['idigbio:hasImage'] == 'true'){
							newGroup += '<i class="fa fa-camera"></i> ';
						}
						if(src['idigbio:geoPoint']){
							listHTML += '<i class="fa fa-globe"></i> ';
						}
						newGroup += src['dwc:scientificName'] + '</div>';
						newGroup += '<div class="col-6"><a href="' + src['url'] + '" target="_blank">' + src['idigbio:uuid'] + "</a></div>";

					} else {
						newGroup += '<div class="col-6">';
						if(src['lat'] && src['lng']){
							listHTML += '<i class="fa fa-globe"></i> ';
						}
						newGroup += src['accepted_name'] + "</div>";
						newGroup += '<div class="col-6"><a href="' + src['url'] + '" target="_blank">' + src['occurrence_no'] + "</a></div>";
					}
					newGroup += '</div>';

				});
				newGroup += '<div class="row"><div class="col-12"><button class="searchMore" onClick=\'expandSearch("sourceQuery", ' + JSON.stringify(match.fullSourceQuery) + ', "#apiMoreContainer", "' + match.matchType + '"); return false;\'>See All Source Records</button></div></div>';
			}
			newGroup += '</div><div class="col-6"><h5>'+ match.matchType + ' Matches</h5>';
			if(match.matches != null){
				if(match.matches.length > 0){
					match.matches.forEach(function(mtc){
						newGroup += '<div class="row">';
						if(match.matchType == 'idigbio'){
							newGroup += '<div class="col-5">';
							if(mtc['idigbio:hasImage'] == 'true'){
								newGroup += '<i class="fa fa-camera"></i> ';
							}
							if(mtc['idigbio:geoPoint']){
								newGroup += '<i class="fa fa-globe"></i> ';
							}
							newGroup += mtc['dwc:scientificName'] + '</div>';
							newGroup += '<div class="col-6"><a href="' + mtc['url'] + '" target="_blank">' + mtc['idigbio:uuid'] + "</a></div>";
						} else {
							newGroup += '<div class="col-6">';
							if(mtc['lat'] && mtc['lng']){
								newGroup += '<i class="fa fa-globe"></i> ';
							}
							newGroup += mtc['accepted_name'] + "</div>";
							newGroup += '<div class="col-6"><a href="' + mtc['url'] + '" target="_blank">' + mtc['occurrence_no'] + "</a></div>";
						}
						newGroup += '</div>';
					});
					newGroup += '<div class="row"><div class="col-12"><button class="searchMore" onClick=\'expandSearch("matchQuery", ' + JSON.stringify(match.fullMatchQuery)+ ', "#apiMoreContainer", "' + match.matchType + '"); return false;\'>See All Matching Records</button></div></div>';
				} else {
					newGroup += '<h6>No Matches Found</h6>';
				}
			} else {
				newGroup += '<h6>Not enough criteria found in these source records to create accurate matches</h6>';
			}
			newGroup += '</div></div>';
			matchCount += 1;
			newGroup += '</div>';
			$('#apiUIResultsList').append(newGroup);
		}
	}
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
			$(moreContainer + ' #apiLoadAdditionalResult').html('<div class="col-3 no-padding firstResultButton"><button class="resultDisplay" onClick="$(\'#apiUIMoreContainer\').show(); $(\'#apiMoreJSON\').hide();"><h4>List</h4></button></div><div class="col-3 no-padding"><button class="resultDisplay" onClick="$(\'#apiUIMoreContainer\').hide(); $(\'#apiMoreJSON\').show();"><h4>JSON</h4></button></div>');
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

window.onpopstate = function(event) {
	if (document.location && document.location.href && document.location.href.match(/#sandbox$/) && event && event.state && (event.state['endpoint'])) {
		jQuery("#searchCollapse_" + event.state['endpoint']).click();
	}
};
