function renderFormDropdown(container, formContainer){
	$.ajax({
		url: 'https://api.epandda.org/',
		method: "GET",
		dataType: "json",
		crossDomain: "true",
		formContainer: formContainer,
		success: function(data){
			var select = 'Choose a form to query the API: <select name="endpoint" id="endpoint" onChange="renderForm($(\'#endpoint\').val(), \'' + this.formContainer + '\');">';
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
	$.ajax({
		url: 'https://api.epandda.org/' + endpoint,
		method: "GET",
		dataType: "json",
		crossDomain: "true",
		success: function(data){
			$(container + ' #apiFormLabel').text('Search the ' + data.name);
			$(container + ' #apiFormDescription').text(data.description);
			$(container + ' #apiFormElements').text("");
			for (var i = 0; i < data.params.length; i++) {
				var elementInfo = data.params[i];
				var formElement = "<div class='form-group'><label><b>" + elementInfo.label + "</b><br/><small>" + elementInfo.description + "</small></label>\n";
				switch(elementInfo.type) {
					case "text":
						formElement += "<div><input type='text' name='" + elementInfo.name + "' class='form-element'></div>";
					break;
				}
				formElement += "</div>";
				$(container + ' #apiFormElements').append(formElement);

			}

			$(container + ' #apiFormElements').append("<input type='hidden' name='endpoint' value='" + endpoint + "'>");
		}
	});
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

        //$(resultContainer + ' #apiResultsCounts').html("");
        //$(resultContainer + ' #apiResultsURL').html("");
        clearResults(resultContainer);
        $(resultContainer + ' #apiUIResultsContainer').html("<h1> <i class='fa fa-cog fa-spin fa-2x fa-fw'></i> Loading...</h1>");
		var realLimit = limit+offset;
		$.ajax({
			
			url: 'https://api.epandda.org/' + endpoint + "?" + apiParams + '&limit=' + realLimit + '&offset=' + offset,
			method: "GET",
			dataType: "json",
			crossDomain: "true",
			success: function(data){
				console.log(data);
				$(resultContainer + ' #apiResultsLabel').html('Search Results');
				$(resultContainer + ' #apiResultsCounts').html("Total Results: " + data.counts.totalCount + "<br/>iDigBio Results: " + data.counts.idbCount + "<br/>PaleoBiology Database Results: " + data.counts.pbdbCount);
				$(resultContainer + ' #apiResultsURL').html("<b>URL:</b><br/><pre>https://api.epandda.org/" + endpoint + "?" + decodeURIComponent(apiParams) + "</pre>");
				$(resultContainer + ' #apiResultsJSONLabel').html('Full JSON Results');
				$(resultContainer + ' #apiResultsButtons').html('<div class="col-3 no-padding firstResultButton"><button class="resultDisplay" onClick="$(\'#apiUIResultsContainer\').show(); $(\'#apiResultsJSON\').hide();"><h4>List</h4></button></div><div class="col-3 no-padding"><button class="resultDisplay" onClick="$(\'#apiUIResultsContainer\').hide(); $(\'#apiResultsJSON\').show();"><h4>JSON</h4></button></div>');
				$(resultContainer + ' #apiResultsJSON').html("<pre style='margin-top:0'>" + JSON.stringify(data.results, null, 2) + "</pre>");
				listHTML = returnUIResults(data);
				$('#apiUIResultsContainer').html(listHTML);
				//if((data.counts.idbCount > limit && data.counts.idbCount > offset+100) || (data.counts.pbdbCount > limit && data.counts.pbdbCount > offset+100)){
				//	var newOffset = offset + 100;
				//	$('#apiLoadAdditionalResult').html('<button class="additionalResultButton" onClick="processForm($(\'#apiForm\').serializeArray(), \'#apiResultsContainer\', 100, ' + newOffset + '); return false;"><h4>Load Additional Results</h4></button>');
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
	$(resultContainer + ' #apiResultsButtons').html('');
	$('#apiLoadAdditionalResult').html('');
}

function returnUIResults(data){
	listResults = []
	data.results['idigbio_resolved'].forEach(function(specimen){
		listResults.push({"hasImage": specimen["idigbio:hasImage"], "coordinates": specimen["idigbio:geoPoint"], "institutionCode": specimen["dwc:institutionCode"], "collectionCode": specimen["dwc:collectionCode"], "catalogNumber": specimen["dwc:catalogNumber"], "genus": specimen["dwc:genus"], "species": specimen["dwc:specificEpithet"], "source": "IDB", "ref": specimen["idigbio:uuid"], "id": specimen["dwc:occurrenceID"]});
		//console.log(specimen);
	});
	
	data.results['pbdb_resolved'].forEach(function(specimen){
		listResults.push({"hasImage": null, "coordinates": [specimen["lat"], specimen["lng"]], "institutionCode": specimen["comments"], "collectionCode": null, "catalogNumber": specimen["comments"], "genus": specimen["genus_name"], "species": specimen["species_name"], "source": "PBDB", "ref": specimen["coll_reference_no"], "id": specimen["occurrence_no"]});
	});
	listResults.forEach(function(spec){
		var els = Object.entries(spec);
		els.forEach(function(el){
			if(typeof(el[1]) == 'string' && el[1] != ''){
				spec[el[0]] = el[1][0].toUpperCase() + el[1].slice(1);
			}
		});
		spec["displayName"] = (spec["genus"] != null ? spec["genus"] : '?') + ' ' + (spec["species"] != null ? spec["species"] : '?');
	});
	listResults.sort(function(a,b) { return (a.displayName > b.displayName) ? 1 : ((b.displayName > a.displayName) ? -1 : 0);} ); 
	listHTML = '<div id="apiUIResultsList"><div id="resultUIHeader" class="row"><div class="resultUIIconColumn">Icons</div><div class="col-4"><div class="resultUINumberColumn"></div>Scientific Name</div><div class="col-3">Occurrence ID</div><div class="col-1">Source</div><div class="col-2">Link</div></div>';
	for(var i = 0; i < listResults.length; i++){
		specimen = listResults[i];
		spec_no = i+1;
		listHTML += '<div class="row"><div class="resultUIIconColumn">';
		if(specimen['hasImage'] != null){
			listHTML += '<i class="fa fa-camera"></i> ';
		} 
		if(specimen['coordinates'] != null){
			listHTML += '<i class="fa fa-globe"></i>';
		}
		listHTML += '</div>';
		listHTML += '<div class="col-4"><div class="resultUINumberColumn">' + spec_no + '.</div>' + specimen["displayName"] + '</div>';
		
		
		listHTML += '<div class="col-3"><div class="occurrenceIDColumn">' + specimen['id'];
		if(specimen["source"] == 'PBDB'){
			listHTML += ' <small><a href="https://paleobiodb.org/data1.2/occs/single.json?id=' + specimen["id"] + '&show=full" target="_blank">JSON</a></small>';
		}
		listHTML += '</div></div>';
		listHTML += '<div class="col-1">' + specimen['source'] + '</div>';
		
		listHTML += '<div class="col-2">';
		if(specimen["source"] == 'IDB'){
			listHTML += '<a href="https://www.idigbio.org/portal/records/' + specimen["ref"] + '" target="_blank">DETAIL <i class="fa fa-arrow-right"></i></a>';
		} else {
			listHTML += '<a href="https://paleobiodb.org/classic?a=basicCollectionSearch&collection_no=' + specimen["ref"] + '&show=full" target="_blank">DETAIL <i class="fa fa-arrow-right"></i></a>';
		}
		listHTML += '</div></div>';
	}
	listHTML == '</div>';
	return listHTML;
}
